const path = require('path');
const assert = require('assert');
const Product = require('../src/models/Product');
const { toggleSoldOut } = require('../src/controllers/productController');

async function runTests() {
  console.log('--- Testing Product Model & isSoldOut Schema ---');
  
  // Test 1: Model Schema Definition
  const isSoldOutPath = Product.schema.path('isSoldOut');
  assert(isSoldOutPath, 'isSoldOut should be defined on Product schema');
  assert.strictEqual(isSoldOutPath.instance, 'Boolean', 'isSoldOut should be a Boolean');
  assert.strictEqual(isSoldOutPath.defaultValue, false, 'isSoldOut should default to false');
  console.log('✔ Test 1 Passed: Product schema definition correct.');

  // Test 2: In-memory document instantiation defaults
  const sampleProduct = new Product({
    name: '30" Raw Vietnamese Wave',
    description: 'High luxury raw human hair',
    price: 450,
    category: 'Wavy'
  });
  assert.strictEqual(sampleProduct.isSoldOut, false, 'New product instance should have isSoldOut = false by default');
  console.log('✔ Test 2 Passed: Document instantiation defaults to isSoldOut = false.');

  // Test 3: Toggle logic simulation
  const mockProduct = {
    _id: 'mock-123',
    name: 'Sample Wig',
    isSoldOut: false,
    save: async function() {
      return this;
    }
  };

  // Mock Product.findById
  const originalFindById = Product.findById;
  Product.findById = async (id) => {
    if (id === 'mock-123') return mockProduct;
    return null;
  };

  const mockRes = {
    statusCode: 200,
    data: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(payload) {
      this.data = payload;
      return this;
    }
  };

  await toggleSoldOut({ params: { id: 'mock-123' } }, mockRes);
  assert.strictEqual(mockProduct.isSoldOut, true, 'isSoldOut should toggle from false to true');
  assert.strictEqual(mockRes.data.isSoldOut, true, 'Response JSON should return updated isSoldOut = true');

  await toggleSoldOut({ params: { id: 'mock-123' } }, mockRes);
  assert.strictEqual(mockProduct.isSoldOut, false, 'isSoldOut should toggle from true to false');
  assert.strictEqual(mockRes.data.isSoldOut, false, 'Response JSON should return updated isSoldOut = false');

  // Test 4: Not found scenario
  await toggleSoldOut({ params: { id: 'non-existent' } }, mockRes);
  assert.strictEqual(mockRes.statusCode, 404, 'Response should return 404 when product is not found');
  console.log('✔ Test 3 & 4 Passed: toggleSoldOut flips state and handles 404 correctly.');

  // Restore Product.findById
  Product.findById = originalFindById;

  console.log('\nAll backend isSoldOut tests passed successfully! 🎉');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
