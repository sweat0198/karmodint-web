import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Official Karmod 'K' vector path from master brand SVG
const KARMOD_K_PATH = 'M71,111.5h-12.2c-5.4,0-10.2-1.6-14.3-4.7-4.1-3.1-6.2-7-6.2-11.7v-22.3c0-5.1-.8-8.6-2.4-10.4-1.6-1.9-4.7-2.8-9.3-2.8h-4v51.9H0V0H22.5V47.3h5.7c1.9,.2,3.4-.4,4.6-1.5,1.2-1.2,1.9-4.3,2.2-9.4L36.5,0h21l-1.6,33.1c-.3,5.4-1.6,9.3-3.8,11.6-2.2,2.3-5.5,3.9-9.9,5,5.7,.7,10.1,2.7,13,5.9,3,3.2,4.4,7.4,4.4,12.7v16.5c0,6.7,.8,10.7,2.4,12.1,1.6,1.4,4.6,2.1,8.9,2.1v12.6';

// Multi-size ICO builder
function createIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const headerAndDirSize = headerSize + numImages * dirEntrySize;

  let offset = headerAndDirSize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
}

// Generate pure standalone SVG with flawless vector edges
function getVectorFaviconSvg({ brandColor = '#1E3C87' } = {}) {
  // Path bbox: 0..71 x 0..111.5
  // Centered in 512x512 with scale = 3.65 (height ~ 407, width ~ 259)
  const scale = 3.65;
  const tx = (512 - 71 * scale) / 2; // ~ 126.4
  const ty = (512 - 111.5 * scale) / 2; // ~ 52.5

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <style>
    path {
      fill: ${brandColor};
    }
  </style>
  <g transform="translate(${tx.toFixed(1)}, ${ty.toFixed(1)}) scale(${scale})">
    <path d="${KARMOD_K_PATH}" />
  </g>
</svg>`;
}

// Generate white rounded tile for Apple Touch Icon & Android Chrome
function getAppIconSvg({ brandColor = '#1E3C87' } = {}) {
  const scale = 3.0;
  const tx = (512 - 71 * scale) / 2;
  const ty = (512 - 111.5 * scale) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Rounded Apple/Android Tile Canvas -->
  <rect width="512" height="512" rx="112" fill="#FFFFFF"/>
  <rect x="6" y="6" width="500" height="500" rx="106" fill="none" stroke="#E2E8F0" stroke-width="8"/>
  
  <g transform="translate(${tx.toFixed(1)}, ${ty.toFixed(1)}) scale(${scale})">
    <path d="${KARMOD_K_PATH}" fill="${brandColor}"/>
  </g>
</svg>`;
}

async function buildAllFavicons() {
  const publicDir = path.resolve('public');
  const brandColor = '#1E3C87';

  // 1. Pure Vector SVG Favicon (Infinite resolution, no compression, crisp edges)
  const vectorSvg = getVectorFaviconSvg({ brandColor });
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), vectorSvg);
  console.log('✔ Generated 100% vector favicon.svg');

  // 2. Vector App Icon SVG
  const appIconSvg = getAppIconSvg({ brandColor });

  // 3. Render Crisp PNGs directly from Vector SVG
  const vectorBuffer = Buffer.from(vectorSvg);
  const appIconBuffer = Buffer.from(appIconSvg);

  const faviconSizes = [
    { name: 'favicon-16x16.png', size: 16, src: vectorBuffer },
    { name: 'favicon-32x32.png', size: 32, src: vectorBuffer },
    { name: 'favicon-48x48.png', size: 48, src: vectorBuffer },
    { name: 'apple-touch-icon.png', size: 180, src: appIconBuffer },
    { name: 'android-chrome-192x192.png', size: 192, src: appIconBuffer },
    { name: 'android-chrome-512x512.png', size: 512, src: appIconBuffer },
  ];

  const icoBuffers = [];

  for (const item of faviconSizes) {
    const pngBuf = await sharp(item.src)
      .resize(item.size, item.size, { kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, item.name), pngBuf);
    console.log(`✔ Generated ${item.name} (${item.size}x${item.size})`);

    if ([16, 32, 48].includes(item.size)) {
      icoBuffers.push({ size: item.size, buffer: pngBuf });
    }
  }

  // 4. Multi-size favicon.ico
  const icoData = createIco(icoBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);
  console.log(`✔ Generated multi-size favicon.ico (${icoData.length} bytes)`);

  // 5. Clean site.webmanifest
  const manifest = {
    name: 'Karmod International',
    short_name: 'Karmod',
    description: 'Specialist manufacturer of portable cabins, modular buildings, and kiosks.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121C2A',
    theme_color: '#1E3C87',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✔ Generated site.webmanifest');
}

buildAllFavicons().catch(console.error);
