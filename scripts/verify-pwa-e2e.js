const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'my-ecommerce-frontend');

console.log('--- Starting Comprehensive PWA E2E Verification ---');

let checksPassed = 0;

function check(title, fn) {
  try {
    fn();
    console.log(`[PASS] ${title}`);
    checksPassed++;
  } catch (err) {
    console.error(`[FAIL] ${title}: ${err.message}`);
    process.exit(1);
  }
}

// 1. Icons audit
check('Brand PNG and SVG Icon Assets Integrity', () => {
  const icons = [
    { name: 'icon-192x192.png', minSize: 1000 },
    { name: 'icon-512x512.png', minSize: 2000 },
    { name: 'icon-maskable-512x512.png', minSize: 2000 },
    { name: 'apple-touch-icon.png', minSize: 1000 },
    { name: 'icon.svg', minSize: 500 }
  ];

  const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  for (const { name, minSize } of icons) {
    const p = path.join(FRONTEND, 'public', 'icons', name);
    assert.ok(fs.existsSync(p), `Missing icon: ${name}`);
    const size = fs.statSync(p).size;
    assert.ok(size >= minSize, `Icon ${name} size is ${size}B, expected >= ${minSize}B`);

    if (name.endsWith('.png')) {
      const fd = fs.openSync(p, 'r');
      const header = Buffer.alloc(8);
      fs.readSync(fd, header, 0, 8, 0);
      fs.closeSync(fd);
      assert.deepStrictEqual(header, PNG_HEADER, `Invalid PNG magic bytes for ${name}`);
    }
  }
});

// 2. Offline page audit
check('Offline Fallback HTML Self-Containment', () => {
  const p = path.join(FRONTEND, 'public', 'offline.html');
  assert.ok(fs.existsSync(p), 'offline.html must exist');
  const content = fs.readFileSync(p, 'utf8');
  assert.match(content, /<!DOCTYPE html>/i, 'Must have valid HTML doctype');
  assert.match(content, /viewport-fit=cover/, 'Must include viewport-fit=cover');
  assert.match(content, /theme-color.*#0f0f11/, 'Must match theme color');
  assert.match(content, /location\.reload\(\)/, 'Must have working retry mechanism');
  assert.doesNotMatch(content, /<link[^>]+rel=["']stylesheet["']/i, 'Must be 100% self-contained');
  assert.doesNotMatch(content, /<script[^>]+src=/i, 'Must have no external script tags');
});

// 3. Service Worker audit
check('Service Worker Cache & Fallback Routing', () => {
  const p = path.join(FRONTEND, 'public', 'sw.js');
  assert.ok(fs.existsSync(p), 'sw.js must exist');
  const content = fs.readFileSync(p, 'utf8');
  assert.match(content, /CACHE_NAME\s*=/, 'Must define CACHE_NAME');
  assert.match(content, /PRECACHE_ASSETS\s*=/, 'Must define PRECACHE_ASSETS');
  assert.match(content, /skipWaiting\(\)/, 'Must skip waiting on install');
  assert.match(content, /clients\.claim\(\)/, 'Must claim clients on activate');
  assert.match(content, /request\.mode\s*===\s*['"]navigate['"]/, 'Must intercept navigation requests');
  assert.match(content, /match\(['"]\/offline\.html['"]\)/, 'Must fallback to /offline.html on network failure');
});

// 4. Manifest route audit
check('Web App Manifest Configuration', () => {
  const p = path.join(FRONTEND, 'app', 'manifest.ts');
  assert.ok(fs.existsSync(p), 'manifest.ts must exist');
  const content = fs.readFileSync(p, 'utf8');
  assert.match(content, /export\s+default\s+function\s+manifest/, 'Must export default manifest function');
  assert.match(content, /display:\s*['"]standalone['"]/, 'Must request standalone display mode');
  assert.match(content, /background_color:\s*['"]#0f0f11['"]/, 'Must define dark background');
  assert.match(content, /theme_color:\s*['"]#0f0f11['"]/, 'Must define dark theme color');
  assert.match(content, /purpose:\s*['"]maskable['"]/, 'Must include maskable icon');
});

// 5. Layout & Root Metadata audit
check('Root Layout PWA & Apple Metadata', () => {
  const p = path.join(FRONTEND, 'app', 'layout.tsx');
  const content = fs.readFileSync(p, 'utf8');
  assert.match(content, /export\s+const\s+viewport:\s*Viewport/, 'Must export viewport config');
  assert.match(content, /viewportFit:\s*['"]cover['"]/, 'Viewport must include viewportFit: cover');
  assert.match(content, /appleWebApp:\s*\{[\s\S]*capable:\s*true/, 'Must configure appleWebApp.capable');
  assert.match(content, /manifest:\s*['"]\/manifest\.webmanifest['"]/, 'Must link manifest route');
  assert.match(content, /<PWARegistration\s*\/>/, 'Must mount PWARegistration');
  assert.match(content, /<InstallBanner\s*\/>/, 'Must mount InstallBanner');
  assert.match(content, /<InstallModal\s*\/>/, 'Must mount InstallModal');
});

// 6. Navigation Touchpoints audit
check('Persistent Installation Entrypoints', () => {
  const accountP = path.join(FRONTEND, 'app', 'account', 'page.tsx');
  const accountContent = fs.readFileSync(accountP, 'utf8');
  assert.match(accountContent, /Install App/, 'Account page must offer Install App');

  const navP = path.join(FRONTEND, 'components', 'SlideOutNav.tsx');
  const navContent = fs.readFileSync(navP, 'utf8');
  assert.match(navContent, /Install App/, 'SlideOutNav must offer Install App');
});

console.log(`\n--- ALL ${checksPassed} PWA CHECKS PASSED SUCCESSFULLY ---`);
