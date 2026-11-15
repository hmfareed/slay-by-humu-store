// Guest checkout + price-tampering regression tests.
// Runs without a database: Mongoose model methods and axios are stubbed.
// Usage: node scripts/test-guest-checkout.js
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_dummy';

const assert = require('assert');
const axios = require('axios');
const Order = require('../src/models/Order');
const Cart = require('../src/models/Cart');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const { createOrder, claimGuestOrder, lookupGuestOrder } = require('../src/controllers/orderController');
const { initializePayment } = require('../src/controllers/paystackController');
const { hashToken, tokenMatches, generateOrderNumber } = require('../src/utils/orderAccess');

const PID = '64b000000000000000000001';
const SOLD_OUT_PID = '64b000000000000000000002';
const products = {
  [PID]: { _id: PID, name: 'Bone Straight Wig', price: 1500, isSoldOut: false },
  [SOLD_OUT_PID]: { _id: SOLD_OUT_PID, name: 'Sold Wig', price: 900, isSoldOut: true },
};

// ---- stubs -----------------------------------------------------------------
let created = null;
Product.find = (q) => ({ select: async () => q._id.$in.map((id) => products[id]).filter(Boolean) });
Cart.findOne = async () => null;
Cart.findOneAndUpdate = async () => null;
Order.create = async (doc) => {
  const order = new Order(doc);
  await order.validate();
  created = order;
  return order;
};

const mockRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};

const address = { address: '1 Oxford St', city: 'Accra', country: 'Ghana', postalCode: 'GA-1', phoneNumber: '0240000000' };
const guest = { name: 'Ama Mensah', email: 'Ama@Example.com', phone: '0240000000' };

let passed = 0;
const test = async (name, fn) => {
  try { await fn(); passed++; console.log(`  ✔ ${name}`); }
  catch (e) { console.error(`  ✘ ${name}\n    ${e.message}`); process.exitCode = 1; }
};

(async () => {
  console.log('orderAccess utils');
  await test('token hash round-trips and rejects wrong tokens', () => {
    const h = hashToken('a'.repeat(64));
    assert.ok(tokenMatches('a'.repeat(64), h));
    assert.ok(!tokenMatches('b'.repeat(64), h));
    assert.ok(!tokenMatches(undefined, h));
    assert.ok(!tokenMatches({ $ne: null }, h));
  });
  await test('order numbers look like SBH-XXXXXXXX', () => {
    assert.match(generateOrderNumber(), /^SBH-[2-9A-HJKMNP-Z]{8}$/);
  });

  console.log('createOrder');
  await test('ignores client-supplied price (price tampering)', async () => {
    const res = mockRes();
    await createOrder({ user: null, body: { shippingAddress: address, guest, items: [{ product: PID, quantity: 2, price: 0.01 }] } }, res);
    assert.strictEqual(res.statusCode, 201, JSON.stringify(res.body));
    assert.strictEqual(created.totalAmount, 3000);
    assert.strictEqual(created.items[0].price, 1500);
  });
  await test('guest order stores guest info, hashed token, order number; returns raw token once', async () => {
    const res = mockRes();
    await createOrder({ user: null, body: { shippingAddress: address, guest, items: [{ product: PID, quantity: 1 }] } }, res);
    assert.strictEqual(res.statusCode, 201);
    assert.match(res.body.guestToken, /^[a-f\d]{64}$/);
    assert.strictEqual(created.accessTokenHash, hashToken(res.body.guestToken));
    assert.strictEqual(res.body.order.accessTokenHash, undefined, 'hash must not be returned');
    assert.strictEqual(created.guest.email, 'ama@example.com');
    assert.strictEqual(created.isGuest, true);
    assert.ok(created.orderNumber);
  });
  await test('guest without valid email is rejected', async () => {
    const res = mockRes();
    await createOrder({ user: null, body: { shippingAddress: address, guest: { name: 'X', email: 'nope' }, items: [{ product: PID, quantity: 1 }] } }, res);
    assert.strictEqual(res.statusCode, 400);
  });
  await test('sold-out product is rejected', async () => {
    const res = mockRes();
    await createOrder({ user: null, body: { shippingAddress: address, guest, items: [{ product: SOLD_OUT_PID, quantity: 1 }] } }, res);
    assert.strictEqual(res.statusCode, 400);
  });
  await test('invalid quantities are rejected', async () => {
    for (const quantity of [0, -1, 1.5, 999, 'abc']) {
      const res = mockRes();
      await createOrder({ user: null, body: { shippingAddress: address, guest, items: [{ product: PID, quantity }] } }, res);
      assert.strictEqual(res.statusCode, 400, `quantity ${quantity}`);
    }
  });
  await test('unknown / malformed product id is rejected', async () => {
    for (const product of ['64b0000000000000000000ff', { $gt: '' }]) {
      const res = mockRes();
      await createOrder({ user: null, body: { shippingAddress: address, guest, items: [{ product, quantity: 1 }] } }, res);
      assert.strictEqual(res.statusCode, 400);
    }
  });
  await test('logged-in order needs no guest info and returns no guest token', async () => {
    const res = mockRes();
    await createOrder({ user: { id: '64b0000000000000000000aa' }, body: { shippingAddress: address, items: [{ product: PID, quantity: 1 }] } }, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.guestToken, undefined);
    assert.strictEqual(created.isGuest, false);
  });

  console.log('initializePayment authorization');
  const rawToken = 'c'.repeat(64);
  const guestOrder = () => {
    const o = new Order({ guest, isGuest: true, accessTokenHash: hashToken(rawToken), orderNumber: 'SBH-TEST2345',
      items: [{ product: PID, quantity: 1, price: 1500 }], totalAmount: 1500, shippingAddress: address });
    o.save = async () => o;
    return o;
  };
  let paystackPayload = null;
  axios.post = async (_url, payload) => { paystackPayload = payload; return { data: { data: { authorization_url: 'https://pay', access_code: 'x', reference: payload.reference } } }; };
  let current;
  Order.findById = () => ({ select: async () => current });

  await test('guest with correct token can pay; Paystack gets guest email', async () => {
    current = guestOrder();
    const res = mockRes();
    await initializePayment({ user: null, body: { orderId: current._id.toString(), guestToken: rawToken } }, res);
    assert.strictEqual(res.statusCode, 200, JSON.stringify(res.body));
    assert.strictEqual(paystackPayload.email, 'ama@example.com');
    assert.strictEqual(paystackPayload.amount, Math.round((1500 / (1 - 0.0195)) * 100));
  });
  await test('guest with wrong / missing token is forbidden', async () => {
    for (const guestToken of ['d'.repeat(64), undefined]) {
      current = guestOrder();
      const res = mockRes();
      await initializePayment({ user: null, body: { orderId: current._id.toString(), guestToken } }, res);
      assert.strictEqual(res.statusCode, 403);
    }
  });
  await test('a different logged-in user cannot pay for a guest order', async () => {
    current = guestOrder();
    const res = mockRes();
    await initializePayment({ user: { id: '64b0000000000000000000bb' }, body: { orderId: current._id.toString() } }, res);
    assert.strictEqual(res.statusCode, 403);
  });
  await test('account owner can pay for own order', async () => {
    const ownerId = '64b0000000000000000000cc';
    current = new Order({ user: ownerId, items: [{ product: PID, quantity: 1, price: 1500 }], totalAmount: 1500, shippingAddress: address });
    current.save = async () => current;
    User.findById = () => ({ select: async () => ({ email: 'owner@example.com', name: 'Owner' }) });
    const res = mockRes();
    await initializePayment({ user: { id: ownerId }, body: { orderId: current._id.toString() } }, res);
    assert.strictEqual(res.statusCode, 200, JSON.stringify(res.body));
    assert.strictEqual(paystackPayload.email, 'owner@example.com');
  });

  console.log('claim / lookup');
  await test('claim only matches unclaimed orders by token hash', async () => {
    let filter;
    Order.findOneAndUpdate = async (f) => { filter = f; return { _id: 'x', orderNumber: 'SBH-1' }; };
    const res = mockRes();
    await claimGuestOrder({ user: { id: 'u1' }, body: { token: rawToken } }, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(filter.accessTokenHash, hashToken(rawToken));
    assert.strictEqual(filter.user, null);
  });
  await test('claim rejects malformed token', async () => {
    const res = mockRes();
    await claimGuestOrder({ user: { id: 'u1' }, body: { token: { $ne: null } } }, res);
    assert.strictEqual(res.statusCode, 400);
  });
  await test('lookup normalizes inputs and uses guest-only filter', async () => {
    let filter;
    Order.findOne = (f) => { filter = f; return { populate: async () => null }; };
    const res = mockRes();
    await lookupGuestOrder({ body: { orderNumber: ' sbh-abc ', email: ' A@B.COM ' } }, res);
    assert.strictEqual(res.statusCode, 404);
    assert.deepStrictEqual(filter, { orderNumber: 'SBH-ABC', isGuest: true, 'guest.email': 'a@b.com' });
  });

  console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
})();
