const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'my-ecommerce-frontend');

console.log('Testing Cross-Platform Install UI Components...');

// 1. Verify InstallModal.tsx
const modalFile = path.join(FRONTEND, 'components', 'InstallModal.tsx');
assert.ok(fs.existsSync(modalFile), `InstallModal.tsx not found: ${modalFile}`);

const modalSrc = fs.readFileSync(modalFile, 'utf8');
assert.match(modalSrc, /['"]use client['"]/, 'InstallModal must be a client component');
assert.match(modalSrc, /usePWAStore/, 'InstallModal must consume usePWAStore');
assert.match(modalSrc, /Add to Home Screen/i, 'InstallModal must guide iOS Safari users with Add to Home Screen');
assert.match(modalSrc, /Add to Dock/i, 'InstallModal must guide macOS Safari users with Add to Dock');

// 2. Verify InstallBanner.tsx
const bannerFile = path.join(FRONTEND, 'components', 'InstallBanner.tsx');
assert.ok(fs.existsSync(bannerFile), `InstallBanner.tsx not found: ${bannerFile}`);

const bannerSrc = fs.readFileSync(bannerFile, 'utf8');
assert.match(bannerSrc, /['"]use client['"]/, 'InstallBanner must be a client component');
assert.match(bannerSrc, /dismissBanner/, 'InstallBanner must allow dismissal');
assert.match(bannerSrc, /promptInstall/, 'InstallBanner must trigger promptInstall');

// 3. Verify Account page has persistent install option
const accountFile = path.join(FRONTEND, 'app', 'account', 'page.tsx');
const accountSrc = fs.readFileSync(accountFile, 'utf8');
assert.match(accountSrc, /Install App/i, 'Account page must include an Install App option');

// 4. Verify SlideOutNav has install option
const navFile = path.join(FRONTEND, 'components', 'SlideOutNav.tsx');
const navSrc = fs.readFileSync(navFile, 'utf8');
assert.match(navSrc, /Install App/i, 'SlideOutNav must include an Install App option');

// 5. Verify layout.tsx mounts InstallBanner and InstallModal
const layoutFile = path.join(FRONTEND, 'app', 'layout.tsx');
const layoutSrc = fs.readFileSync(layoutFile, 'utf8');
assert.match(layoutSrc, /<InstallBanner\s*\/>/, 'layout.tsx must render <InstallBanner />');
assert.match(layoutSrc, /<InstallModal\s*\/>/, 'layout.tsx must render <InstallModal />');

console.log('PASS: Cross-Platform Install UI Components verified successfully.');
