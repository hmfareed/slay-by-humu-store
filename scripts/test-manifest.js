const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'my-ecommerce-frontend');

console.log('Testing PWA Manifest & Icons...');

// 1. Verify manifest file exists
const manifestFile = path.join(FRONTEND, 'app', 'manifest.ts');
assert.ok(fs.existsSync(manifestFile), `Manifest file not found: ${manifestFile}`);

// 2. Read manifest source to confirm required PWA fields
const manifestSrc = fs.readFileSync(manifestFile, 'utf8');
assert.match(manifestSrc, /name:\s*['"]Slay by Humu - Luxury Storefront['"]/, 'Manifest missing full name');
assert.match(manifestSrc, /short_name:\s*['"]Slay by Humu['"]/, 'Manifest missing short_name');
assert.match(manifestSrc, /display:\s*['"]standalone['"]/, 'Manifest display must be standalone');
assert.match(manifestSrc, /background_color:\s*['"]#0f0f11['"]/, 'Manifest background_color must be #0f0f11');
assert.match(manifestSrc, /theme_color:\s*['"]#0f0f11['"]/, 'Manifest theme_color must be #0f0f11');

// 3. Verify all required icons exist on disk with valid PNG header
const expectedIcons = [
  'icon-192x192.png',
  'icon-512x512.png',
  'icon-maskable-512x512.png',
  'apple-touch-icon.png',
  'icon.svg'
];

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

for (const iconName of expectedIcons) {
  const iconPath = path.join(FRONTEND, 'public', 'icons', iconName);
  assert.ok(fs.existsSync(iconPath), `Expected icon file missing: ${iconPath}`);
  const stats = fs.statSync(iconPath);
  assert.ok(stats.size > 0, `Icon file is empty: ${iconName}`);

  if (iconName.endsWith('.png')) {
    const fd = fs.openSync(iconPath, 'r');
    const header = Buffer.alloc(8);
    fs.readSync(fd, header, 0, 8, 0);
    fs.closeSync(fd);
    assert.deepStrictEqual(header, PNG_HEADER, `Invalid PNG header for ${iconName}`);
  }
}

console.log('PASS: PWA Manifest & Icons verified successfully.');
