import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Generate favicon.svg (Scalable vector favicon for modern browsers)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="25%" stop-color="#FFF2A3"/>
      <stop offset="55%" stop-color="#E5C158"/>
      <stop offset="85%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#9A7B1C"/>
    </linearGradient>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE885"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#735509"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141418"/>
      <stop offset="100%" stop-color="#070709"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#D4AF37" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Luxury Background Card -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="url(#goldBorder)" stroke-width="7" opacity="0.9"/>

  <!-- Racing Checker Flag Emblem -->
  <g transform="translate(176, 85)" filter="url(#glow)">
    <rect width="160" height="114" rx="10" fill="#FFFFFF"/>
    <rect x="0" y="0" width="40" height="28.5" fill="#000000"/>
    <rect x="80" y="0" width="40" height="28.5" fill="#000000"/>
    <rect x="40" y="28.5" width="40" height="28.5" fill="#000000"/>
    <rect x="120" y="28.5" width="40" height="28.5" fill="#000000"/>
    <rect x="0" y="57" width="40" height="28.5" fill="#000000"/>
    <rect x="80" y="57" width="40" height="28.5" fill="#000000"/>
    <rect x="40" y="85.5" width="40" height="28.5" fill="#000000"/>
    <rect x="120" y="85.5" width="40" height="28.5" fill="#000000"/>
    <rect width="160" height="114" rx="10" fill="none" stroke="url(#goldBorder)" stroke-width="4.5"/>
  </g>

  <!-- AUTOLUX Brand Typography -->
  <text x="256" y="325" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Arial, sans-serif" font-weight="900" font-size="76" fill="url(#goldGrad)" letter-spacing="6" filter="url(#glow)">AUTOLUX</text>

  <!-- Subtitle DETAILING -->
  <text x="256" y="390" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Arial, sans-serif" font-weight="700" font-size="28" fill="#D4AF37" letter-spacing="14">DETAILING</text>
</svg>
`;

fs.writeFileSync(path.join(rootDir, 'favicon.svg'), faviconSvg, 'utf8');
console.log('Created favicon.svg');

// 2. Render PNG assets at exact target sizes using Playwright
async function buildPngIcons() {
  const browser = await chromium.launch();

  // A. 180x180 Apple Touch Icon
  const page180 = await browser.newPage({ viewport: { width: 180, height: 180 } });
  const html180 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #070709; width: 180px; height: 180px; overflow: hidden; }
      svg { width: 180px; height: 180px; display: block; }
    </style>
  </head>
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="25%" stop-color="#FFF2A3"/>
          <stop offset="55%" stop-color="#E5C158"/>
          <stop offset="85%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#9A7B1C"/>
        </linearGradient>
        <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE885"/>
          <stop offset="50%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#735509"/>
        </linearGradient>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#141418"/>
          <stop offset="100%" stop-color="#070709"/>
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="40" fill="url(#bgGrad)"/>
      <rect x="3" y="3" width="174" height="174" rx="37" fill="none" stroke="url(#goldStroke)" stroke-width="2.5" opacity="0.85"/>
      
      <!-- Flag -->
      <g transform="translate(62, 28)">
        <rect width="56" height="40" rx="3" fill="#FFFFFF"/>
        <rect x="0" y="0" width="14" height="10" fill="#000000"/>
        <rect x="28" y="0" width="14" height="10" fill="#000000"/>
        <rect x="14" y="10" width="14" height="10" fill="#000000"/>
        <rect x="42" y="10" width="14" height="10" fill="#000000"/>
        <rect x="0" y="20" width="14" height="10" fill="#000000"/>
        <rect x="28" y="20" width="14" height="10" fill="#000000"/>
        <rect x="14" y="30" width="14" height="10" fill="#000000"/>
        <rect x="42" y="30" width="14" height="10" fill="#000000"/>
        <rect width="56" height="40" rx="3" fill="none" stroke="url(#goldStroke)" stroke-width="1.5"/>
      </g>

      <!-- AUTOLUX -->
      <text x="90" y="116" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="900" font-size="27" fill="url(#gold)" letter-spacing="2">AUTOLUX</text>
      <!-- Subtitle -->
      <text x="90" y="139" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="700" font-size="10.5" fill="#D4AF37" letter-spacing="4.5">DETAIL STUDIO</text>
    </svg>
  </body>
  </html>
  `;
  await page180.setContent(html180);
  const buf180 = await page180.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(rootDir, 'apple-touch-icon.png'), buf180);
  console.log('Created apple-touch-icon.png (180x180)');
  await page180.close();

  // B. 64x64 favicon.png
  const page64 = await browser.newPage({ viewport: { width: 64, height: 64 } });
  const html64 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #070709; width: 64px; height: 64px; overflow: hidden; }
      svg { width: 64px; height: 64px; display: block; }
    </style>
  </head>
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
      <defs>
        <linearGradient id="gold64" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="40%" stop-color="#FFF2A3"/>
          <stop offset="80%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#AA820A"/>
        </linearGradient>
        <linearGradient id="border64" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE885"/>
          <stop offset="100%" stop-color="#805C06"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#0A0A0C"/>
      <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" fill="none" stroke="url(#border64)" stroke-width="1.8"/>
      
      <!-- Flag in top-right -->
      <g transform="translate(36, 7)">
        <rect width="21" height="15" rx="1.5" fill="#FFFFFF"/>
        <rect x="0" y="0" width="5.25" height="3.75" fill="#000000"/>
        <rect x="10.5" y="0" width="5.25" height="3.75" fill="#000000"/>
        <rect x="5.25" y="3.75" width="5.25" height="3.75" fill="#000000"/>
        <rect x="15.75" y="3.75" width="5.25" height="3.75" fill="#000000"/>
        <rect x="0" y="7.5" width="5.25" height="3.75" fill="#000000"/>
        <rect x="10.5" y="7.5" width="5.25" height="3.75" fill="#000000"/>
        <rect x="5.25" y="11.25" width="5.25" height="3.75" fill="#000000"/>
        <rect x="15.75" y="11.25" width="5.25" height="3.75" fill="#000000"/>
        <rect width="21" height="15" rx="1.5" fill="none" stroke="#D4AF37" stroke-width="0.8"/>
      </g>

      <!-- Bold AL Monogram -->
      <text x="6" y="50" font-family="-apple-system, BlinkMacSystemFont, Arial Black, Impact, sans-serif" font-weight="900" font-size="38" fill="url(#gold64)" letter-spacing="-2">AL</text>
    </svg>
  </body>
  </html>
  `;
  await page64.setContent(html64);
  const buf64 = await page64.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(rootDir, 'favicon.png'), buf64);
  console.log('Created favicon.png (64x64)');
  await page64.close();

  // C. 48x48 favicon-48x48.png
  const page48 = await browser.newPage({ viewport: { width: 48, height: 48 } });
  const html48 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #070709; width: 48px; height: 48px; overflow: hidden; }
      svg { width: 48px; height: 48px; display: block; }
    </style>
  </head>
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <defs>
        <linearGradient id="gold48" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="40%" stop-color="#FFF2A3"/>
          <stop offset="80%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#AA820A"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="#0A0A0C"/>
      <rect x="1.2" y="1.2" width="45.6" height="45.6" rx="9" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
      
      <!-- Flag in top-right -->
      <g transform="translate(27, 5)">
        <rect width="16" height="11" rx="1" fill="#FFFFFF"/>
        <rect x="0" y="0" width="4" height="2.75" fill="#000000"/>
        <rect x="8" y="0" width="4" height="2.75" fill="#000000"/>
        <rect x="4" y="2.75" width="4" height="2.75" fill="#000000"/>
        <rect x="12" y="2.75" width="4" height="2.75" fill="#000000"/>
        <rect x="0" y="5.5" width="4" height="2.75" fill="#000000"/>
        <rect x="8" y="5.5" width="4" height="2.75" fill="#000000"/>
        <rect x="4" y="8.25" width="4" height="2.75" fill="#000000"/>
        <rect x="12" y="8.25" width="4" height="2.75" fill="#000000"/>
        <rect width="16" height="11" rx="1" fill="none" stroke="#D4AF37" stroke-width="0.6"/>
      </g>

      <!-- Bold AL Monogram -->
      <text x="5" y="38" font-family="-apple-system, BlinkMacSystemFont, Arial Black, Impact, sans-serif" font-weight="900" font-size="28" fill="url(#gold48)" letter-spacing="-1.5">AL</text>
    </svg>
  </body>
  </html>
  `;
  await page48.setContent(html48);
  const buf48 = await page48.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(rootDir, 'favicon-48x48.png'), buf48);
  console.log('Created favicon-48x48.png (48x48)');
  await page48.close();

  // D. 32x32 favicon-32x32.png (Primary browser tab icon)
  const page32 = await browser.newPage({ viewport: { width: 32, height: 32 } });
  const html32 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #070709; width: 32px; height: 32px; overflow: hidden; }
      svg { width: 32px; height: 32px; display: block; }
    </style>
  </head>
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <defs>
        <linearGradient id="gold32" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="35%" stop-color="#FFF5B8"/>
          <stop offset="70%" stop-color="#E5C158"/>
          <stop offset="100%" stop-color="#B8860B"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="#0A0A0C"/>
      <rect x="0.8" y="0.8" width="30.4" height="30.4" rx="6.2" fill="none" stroke="#D4AF37" stroke-width="1.2"/>
      
      <!-- Flag top-right -->
      <g transform="translate(18, 3.5)">
        <rect width="10.5" height="7.5" fill="#FFFFFF" rx="0.5"/>
        <rect x="0" y="0" width="2.625" height="1.875" fill="#000000"/>
        <rect x="5.25" y="0" width="2.625" height="1.875" fill="#000000"/>
        <rect x="2.625" y="1.875" width="2.625" height="1.875" fill="#000000"/>
        <rect x="7.875" y="1.875" width="2.625" height="1.875" fill="#000000"/>
        <rect x="0" y="3.75" width="2.625" height="1.875" fill="#000000"/>
        <rect x="5.25" y="3.75" width="2.625" height="1.875" fill="#000000"/>
        <rect x="2.625" y="5.625" width="2.625" height="1.875" fill="#000000"/>
        <rect x="7.875" y="5.625" width="2.625" height="1.875" fill="#000000"/>
        <rect width="10.5" height="7.5" fill="none" stroke="rgba(212,175,55,0.7)" stroke-width="0.5" rx="0.5"/>
      </g>

      <!-- Bold AL Monogram filling the frame with clear margin -->
      <text x="3" y="25" font-family="-apple-system, BlinkMacSystemFont, Arial Black, Impact, sans-serif" font-weight="900" font-size="18.5" fill="url(#gold32)" letter-spacing="-1">AL</text>
    </svg>
  </body>
  </html>
  `;
  await page32.setContent(html32);
  const buf32 = await page32.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(rootDir, 'favicon-32x32.png'), buf32);
  console.log('Created favicon-32x32.png (32x32)');
  await page32.close();

  // E. 16x16 favicon-16x16.png (Standard low-res tab icon)
  const page16 = await browser.newPage({ viewport: { width: 16, height: 16 } });
  const html16 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #070709; width: 16px; height: 16px; overflow: hidden; }
      svg { width: 16px; height: 16px; display: block; }
    </style>
  </head>
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
      <defs>
        <linearGradient id="gold16" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="50%" stop-color="#FFE07A"/>
          <stop offset="100%" stop-color="#D4AF37"/>
        </linearGradient>
      </defs>
      <rect width="16" height="16" rx="3.5" fill="#0A0A0C"/>
      <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="none" stroke="#D4AF37" stroke-width="0.8"/>
      
      <!-- Flag top-right -->
      <g transform="translate(9.5, 1.5)">
        <rect width="5" height="4" fill="#FFFFFF"/>
        <rect x="0" y="0" width="2.5" height="2" fill="#000000"/>
        <rect x="2.5" y="2" width="2.5" height="2" fill="#000000"/>
      </g>

      <!-- Bold A lettermark for ultimate 16px clarity -->
      <text x="1.5" y="13" font-family="-apple-system, BlinkMacSystemFont, Arial Black, Impact, sans-serif" font-weight="900" font-size="10.5" fill="url(#gold16)" letter-spacing="-0.5">AL</text>
    </svg>
  </body>
  </html>
  `;
  await page16.setContent(html16);
  const buf16 = await page16.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(rootDir, 'favicon-16x16.png'), buf16);
  console.log('Created favicon-16x16.png (16x16)');
  await page16.close();

  await browser.close();

  // 3. Assemble favicon.ico using python
  const pythonScript = `
import struct

images = []
for filename in ["favicon-16x16.png", "favicon-32x32.png", "favicon-48x48.png", "favicon.png"]:
    with open("${rootDir}/" + filename, "rb") as f:
        data = f.read()
    w, h = struct.unpack(">II", data[16:24])
    images.append((w, h, data))

header = struct.pack("<HHH", 0, 1, len(images))
offset = 6 + 16 * len(images)
entries = []
for w, h, data in images:
    entry = struct.pack("<BBBBHHII",
        w if w < 256 else 0,
        h if h < 256 else 0,
        0, 0, 1, 32,
        len(data),
        offset
    )
    entries.append(entry)
    offset += len(data)

with open("${rootDir}/favicon.ico", "wb") as f:
    f.write(header)
    for e in entries:
        f.write(e)
    for _, _, data in images:
        f.write(data)

print("Created favicon.ico with 4 multi-resolution embedded PNGs (16x16, 32x32, 48x48, 64x64). Size:", offset)
`;
  execSync(`python3 -c '${pythonScript}'`);
}

buildPngIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
