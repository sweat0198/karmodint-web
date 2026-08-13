import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Assemble multi-size ICO buffer (16x16, 32x32, 48x48) from PNG buffers
function createIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const headerAndDirSize = headerSize + numImages * dirEntrySize;

  let offset = headerAndDirSize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Palette colors
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Image data length
    entry.writeUInt32LE(offset, 12); // Image data offset
    dirEntries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

// Crisp bold "K" with brand red underline
// Suitable for browser tabs, app icons, and bookmarks
function getFaviconSvg({ onWhiteTile = false } = {}) {
  const blueColor = '#23408F';
  const redColor = '#E31E24';

  const tileBg = onWhiteTile
    ? `<rect width="512" height="512" rx="112" fill="#FFFFFF"/>
       <rect x="6" y="6" width="500" height="500" rx="106" fill="none" stroke="#E2E8F0" stroke-width="8"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  ${tileBg}
  <!-- Bold Karmod 'K' -->
  <g fill="${blueColor}">
    <!-- Vertical Left Stem -->
    <rect x="104" y="64" width="76" height="328" rx="6"/>
    <!-- Top-Right Diagonal Arm -->
    <path d="M 180 252 L 316 64 L 408 64 L 244 274 Z"/>
    <!-- Bottom-Right Diagonal Leg -->
    <path d="M 230 256 L 408 392 L 316 392 L 180 286 Z"/>
  </g>
  <!-- Karmod Red Underline -->
  <rect x="92" y="420" width="328" height="28" rx="6" fill="${redColor}"/>
</svg>`;
}

// White tile version for Apple Touch Icon & Android Chrome to guarantee contrast on dark OS themes
function getAppIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Rounded White Canvas Tile -->
  <rect width="512" height="512" rx="112" fill="#FFFFFF"/>
  <rect x="6" y="6" width="500" height="500" rx="106" fill="none" stroke="#EEF2F6" stroke-width="8"/>
  
  <!-- Bold Karmod 'K' in Corporate Blue -->
  <g fill="#23408F">
    <!-- Vertical Left Stem -->
    <rect x="114" y="74" width="72" height="312" rx="6"/>
    <!-- Top-Right Diagonal Arm -->
    <path d="M 186 252 L 314 74 L 398 74 L 244 272 Z"/>
    <!-- Bottom-Right Diagonal Leg -->
    <path d="M 232 254 L 398 386 L 312 386 L 186 284 Z"/>
  </g>
  <!-- Karmod Red Underline -->
  <rect x="104" y="412" width="304" height="26" rx="6" fill="#E31E24"/>
</svg>`;
}

async function buildAllFavicons() {
  const publicDir = path.resolve('public');

  // 1. Standard SVG Favicon (supports light/dark browser tabs)
  const svgFavicon = getFaviconSvg({ onWhiteTile: false });
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
  console.log('✔ Generated favicon.svg');

  // 2. App Icon SVG (with white background tile)
  const svgAppIcon = getAppIconSvg();

  // 3. Generate PNGs
  const standardBuffer = Buffer.from(svgFavicon);
  const appIconBuffer = Buffer.from(svgAppIcon);

  // Favicon PNGs for browser tabs
  const faviconSizes = [
    { name: 'favicon-16x16.png', size: 16, src: standardBuffer },
    { name: 'favicon-32x32.png', size: 32, src: standardBuffer },
    { name: 'favicon-48x48.png', size: 48, src: standardBuffer },
    { name: 'apple-touch-icon.png', size: 180, src: appIconBuffer },
    { name: 'android-chrome-192x192.png', size: 192, src: appIconBuffer },
    { name: 'android-chrome-512x512.png', size: 512, src: appIconBuffer },
  ];

  const icoBuffers = [];

  for (const item of faviconSizes) {
    const pngBuf = await sharp(item.src)
      .resize(item.size, item.size)
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, item.name), pngBuf);
    console.log(`✔ Generated ${item.name} (${item.size}x${item.size})`);

    if ([16, 32, 48].includes(item.size)) {
      icoBuffers.push({ size: item.size, buffer: pngBuf });
    }
  }

  // 4. Multi-resolution favicon.ico
  const icoData = createIco(icoBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);
  console.log(`✔ Generated multi-size favicon.ico (${icoData.length} bytes)`);

  // 5. site.webmanifest
  const manifest = {
    name: "Karmod International",
    short_name: "Karmod",
    description: "Specialist manufacturer of portable cabins, modular buildings, and kiosks.",
    start_url: "/",
    display: "standalone",
    background_color: "#121C2A",
    theme_color: "#23408F",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✔ Generated site.webmanifest');
}

buildAllFavicons().catch(console.error);
