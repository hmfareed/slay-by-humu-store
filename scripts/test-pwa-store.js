const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'my-ecommerce-frontend');

console.log('Testing PWA State Store & Registration...');

// 1. Verify pwaStore.ts
const storeFile = path.join(FRONTEND, 'src', 'store', 'pwaStore.ts');
assert.ok(fs.existsSync(storeFile), `pwaStore.ts not found: ${storeFile}`);

const storeSrc = fs.readFileSync(storeFile, 'utf8');
assert.match(storeSrc, /export\s+const\s+usePWAStore/, 'pwaStore missing usePWAStore export');
assert.match(storeSrc, /promptInstall/, 'pwaStore missing promptInstall action');
assert.match(storeSrc, /openModal/, 'pwaStore missing openModal action');
assert.match(storeSrc, /closeModal/, 'pwaStore missing closeModal action');
assert.match(storeSrc, /dismissBanner/, 'pwaStore missing dismissBanner action');

// 2. Verify PWARegistration.tsx
const regFile = path.join(FRONTEND, 'components', 'PWARegistration.tsx');
assert.ok(fs.existsSync(regFile), `PWARegistration.tsx not found: ${regFile}`);

const regSrc = fs.readFileSync(regFile, 'utf8');
assert.match(regSrc, /['"]use client['"]/, 'PWARegistration must be a client component');
assert.match(regSrc, /navigator\.serviceWorker[\s\S]*?\.register\(['"]\/sw\.js['"]\)/, 'PWARegistration missing /sw.js registration');
assert.match(regSrc, /beforeinstallprompt/, 'PWARegistration missing beforeinstallprompt listener');
assert.match(regSrc, /display-mode:\s*standalone/, 'PWARegistration missing standalone media check');
assert.match(regSrc, /addEventListener\(['"]offline['"]/, 'PWARegistration missing offline event listener');
assert.match(regSrc, /addEventListener\(['"]online['"]/, 'PWARegistration missing online event listener');

// 3. Verify PWARegistration mounted in layout.tsx
const layoutFile = path.join(FRONTEND, 'app', 'layout.tsx');
const layoutSrc = fs.readFileSync(layoutFile, 'utf8');
assert.match(layoutSrc, /<PWARegistration\s*\/>/, 'layout.tsx must render <PWARegistration />');

console.log('PASS: PWA State Store & Registration verified successfully.');
