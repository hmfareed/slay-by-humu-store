const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'my-ecommerce-frontend');

console.log('Testing Root Layout PWA Metadata & Viewport...');

const layoutFile = path.join(FRONTEND, 'app', 'layout.tsx');
assert.ok(fs.existsSync(layoutFile), `layout.tsx not found: ${layoutFile}`);

const layoutSrc = fs.readFileSync(layoutFile, 'utf8');

// 1. Verify Viewport export with themeColor and viewportFit
assert.match(layoutSrc, /export\s+const\s+viewport:\s*Viewport/, 'layout.tsx missing Viewport export');
assert.match(layoutSrc, /themeColor:\s*['"]#0f0f11['"]/, 'viewport missing themeColor #0f0f11');
assert.match(layoutSrc, /viewportFit:\s*['"]cover['"]/, 'viewport missing viewportFit cover');

// 2. Verify Apple Web App metadata & manifest link
assert.match(layoutSrc, /manifest:\s*['"]\/manifest\.webmanifest['"]/, 'metadata missing manifest link');
assert.match(layoutSrc, /appleWebApp:\s*\{/, 'metadata missing appleWebApp configuration');
assert.match(layoutSrc, /capable:\s*true/, 'appleWebApp capable must be true');
assert.match(layoutSrc, /title:\s*['"]Slay by Humu['"]/, 'appleWebApp title must be Slay by Humu');
assert.match(layoutSrc, /apple:\s*['"]\/icons\/apple-touch-icon\.png['"]/, 'metadata missing apple touch icon');

console.log('PASS: Root Layout PWA Metadata & Viewport verified successfully.');
