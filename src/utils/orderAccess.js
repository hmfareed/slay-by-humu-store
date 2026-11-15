const crypto = require('crypto');

// Unambiguous alphabet (no 0/O, 1/I/L) for human-readable order numbers
const ORDER_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

const generateOrderNumber = () => {
  const bytes = crypto.randomBytes(8);
  let suffix = '';
  for (const b of bytes) suffix += ORDER_ALPHABET[b % ORDER_ALPHABET.length];
  return `SBH-${suffix}`;
};

// Raw token is handed to the guest once; only its hash is persisted
const generateAccessToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

// Constant-time comparison of a presented raw token against a stored hash
const tokenMatches = (rawToken, storedHash) => {
  if (!rawToken || !storedHash || typeof rawToken !== 'string') return false;
  const a = Buffer.from(hashToken(rawToken), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = { generateOrderNumber, generateAccessToken, hashToken, tokenMatches, EMAIL_REGEX };
