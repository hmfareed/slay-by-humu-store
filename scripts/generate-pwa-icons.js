const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each row
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  // Maskable requires safe zone within 80% circle
  const maxRadius = (Math.min(width, height) / 2) * (isMaskable ? 0.72 : 0.88);
  const innerRadius = maxRadius * 0.94;

  // Colors: Onyx black background (#0f0f11), Gold (#D4AF37), Light Gold (#F5E6AB)
  const bgR = 15, bgG = 15, bgB = 17;
  const goldR = 212, goldG = 175, goldB = 55;
  const goldLightR = 245, goldLightG = 230, goldLightB = 171;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = bgR;
      let g = bgG;
      let b = bgB;
      let a = 255;

      // Circular badge outline
      if (dist <= maxRadius && dist >= innerRadius) {
        // Outer gold ring
        r = goldR;
        g = goldG;
        b = goldB;
      } else if (dist < innerRadius) {
        // Center crown / monogram diamond motif
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Center diamond
        if (absDx * 1.2 + absDy * 1.2 < maxRadius * 0.45 && absDx * 1.2 + absDy * 1.2 > maxRadius * 0.38) {
          r = goldLightR;
          g = goldLightG;
          b = goldLightB;
        } else if (absDx < maxRadius * 0.22 && dy > -maxRadius * 0.15 && dy < maxRadius * 0.15) {
          // Center gold emblem
          r = goldR;
          g = goldG;
          b = goldB;
        } else {
          // Dark onyx fill
          r = bgR;
          g = bgG;
          b = bgB;
        }
      } else if (!isMaskable) {
        // Transparent outside circular badge if not maskable
        if (dist > maxRadius + 1) {
          r = bgR;
          g = bgG;
          b = bgB;
          a = 255; // solid dark background keeps modern PWA framing crisp
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5E6AB" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#AA7C11" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="#0f0f11" rx="96" />
  <circle cx="256" cy="256" r="210" fill="none" stroke="url(#goldGrad)" stroke-width="6" opacity="0.8" />
  <circle cx="256" cy="256" r="198" fill="#141418" stroke="url(#goldGrad)" stroke-width="2" opacity="0.4" />
  
  <!-- Crown / Diamond Emblem -->
  <g filter="url(#shadow)">
    <path d="M 256 120 L 280 180 L 335 150 L 310 220 L 202 220 L 177 150 L 232 180 Z" fill="url(#goldGrad)" />
    <!-- Monogram Text -->
    <text x="256" y="320" font-family="'Playfair Display', Georgia, serif" font-size="92" font-weight="bold" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4">SLAY</text>
    <text x="256" y="365" font-family="'Inter', sans-serif" font-size="22" font-weight="500" fill="#E8D5A3" text-anchor="middle" letter-spacing="12">BY HUMU</text>
  </g>
</svg>`;
}

const outDir = path.join(__dirname, '..', 'my-ecommerce-frontend', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

console.log('Generating PWA icons...');
fs.writeFileSync(path.join(outDir, 'icon-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(outDir, 'icon-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(outDir, 'icon.svg'), createSvg());

console.log('Icons successfully generated in:', outDir);
