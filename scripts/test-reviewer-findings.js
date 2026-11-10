const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'my-ecommerce-frontend');

console.log('Testing Fixes for Reviewer Findings...');

// 1. Check pwaStore prompt cleanup (deferredPrompt cleared in finally)
const storeSrc = fs.readFileSync(path.join(FRONTEND, 'src', 'store', 'pwaStore.ts'), 'utf8');
assert.match(
  storeSrc,
  /finally\s*\{[\s\S]*deferredPrompt:\s*null[\s\S]*isInstallable:\s*false[\s\S]*\}/,
  'pwaStore must clear deferredPrompt and isInstallable in finally block to prevent DOMException'
);

// 2. Check PWARegistration iPadOS maxTouchPoints detection
const regSrc = fs.readFileSync(path.join(FRONTEND, 'components', 'PWARegistration.tsx'), 'utf8');
assert.match(
  regSrc,
  /maxTouchPoints/,
  'PWARegistration must check navigator.maxTouchPoints to detect modern iPadOS'
);

// 3. Check InstallModal accessibility & AnimatePresence
const modalSrc = fs.readFileSync(path.join(FRONTEND, 'components', 'InstallModal.tsx'), 'utf8');
assert.match(modalSrc, /role=["']dialog["']/, 'InstallModal must declare role="dialog"');
assert.match(modalSrc, /aria-modal=["']true["']/, 'InstallModal must declare aria-modal="true"');

console.log('PASS: Reviewer findings test verified.');
