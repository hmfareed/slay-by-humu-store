const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'my-ecommerce-frontend');

console.log('Testing Offline Fallback & Service Worker...');

// 1. Verify offline.html exists
const offlineFile = path.join(FRONTEND, 'public', 'offline.html');
assert.ok(fs.existsSync(offlineFile), `offline.html not found: ${offlineFile}`);

const offlineHtml = fs.readFileSync(offlineFile, 'utf8');
assert.ok(offlineHtml.length > 200, 'offline.html is too short or empty');
assert.match(offlineHtml, /You are currently offline/i, 'offline.html missing headline');
assert.match(offlineHtml, /location\.reload\(\)/, 'offline.html missing reload action');
assert.match(offlineHtml, /#0f0f11/, 'offline.html missing brand onyx background color');
assert.doesNotMatch(offlineHtml, /<link[^>]+rel=["']stylesheet["']/i, 'offline.html must not depend on external stylesheets');
assert.doesNotMatch(offlineHtml, /<script[^>]+src=/i, 'offline.html must not depend on external scripts');

// 2. Verify sw.js exists
const swFile = path.join(FRONTEND, 'public', 'sw.js');
assert.ok(fs.existsSync(swFile), `sw.js not found: ${swFile}`);

const swSrc = fs.readFileSync(swFile, 'utf8');
assert.match(swSrc, /CACHE_NAME\s*=\s*['"]slay-pwa-v\d+['"]/, 'sw.js missing CACHE_NAME');
assert.match(swSrc, /['"]\/offline\.html['"]/, 'sw.js pre-cache missing /offline.html');
assert.match(swSrc, /['"]\/icons\/icon-192x192\.png['"]/, 'sw.js pre-cache missing icon-192x192.png');
assert.match(swSrc, /['"]\/icons\/icon-512x512\.png['"]/, 'sw.js pre-cache missing icon-512x512.png');
assert.match(swSrc, /addEventListener\(['"]install['"]/, 'sw.js missing install listener');
assert.match(swSrc, /addEventListener\(['"]activate['"]/, 'sw.js missing activate listener');
assert.match(swSrc, /addEventListener\(['"]fetch['"]/, 'sw.js missing fetch listener');
assert.match(swSrc, /navigate/, 'sw.js fetch handler missing navigation check');

console.log('PASS: Offline Fallback & Service Worker verified successfully.');
