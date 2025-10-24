const sharp = require('sharp');

// Create a simple test screenshot
async function createTestScreenshot() {
  const svg = `
    <svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#5856D6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="390" height="844" fill="url(#grad)"/>
      <text x="195" y="422" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
        Test App Screen
      </text>
      <circle cx="195" cy="500" r="40" fill="white" opacity="0.8"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile('./test-screenshot.png');

  console.log('✅ Test screenshot created: test-screenshot.png');
}

createTestScreenshot().catch(console.error);