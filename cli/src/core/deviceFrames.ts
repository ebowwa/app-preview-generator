import sharp from 'sharp';
import type { DeviceType } from '../shared/types/preview-generator';

/**
 * Device frame dimensions and specifications
 */
const DEVICE_SPECS: Record<DeviceType, {
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  cornerRadius: number;
  notchWidth?: number;
  notchHeight?: number;
  homeButtonSize?: number;
}> = {
  'iphone-69': {
    width: 1242,
    height: 2688,
    frameWidth: 1290,
    frameHeight: 2796,
    cornerRadius: 160,
    notchWidth: 210,
    notchHeight: 30
  },
  'iphone-67': {
    width: 1242,
    height: 2688,
    frameWidth: 1290,
    frameHeight: 2796,
    cornerRadius: 160,
    notchWidth: 210,
    notchHeight: 30
  },
  'iphone-65': {
    width: 1242,
    height: 2688,
    frameWidth: 1290,
    frameHeight: 2796,
    cornerRadius: 160,
    notchWidth: 209,
    notchHeight: 30
  },
  'iphone-61': {
    width: 1284,
    height: 2778,
    frameWidth: 1334,
    frameHeight: 2884,
    cornerRadius: 200,
    notchWidth: 210,
    notchHeight: 30
  },
  'iphone-69-landscape': {
    width: 2688,
    height: 1242,
    frameWidth: 2796,
    frameHeight: 1290,
    cornerRadius: 160,
    notchWidth: 210,
    notchHeight: 30
  },
  'ipad-129': {
    width: 2048,
    height: 2732,
    frameWidth: 2150,
    frameHeight: 2850,
    cornerRadius: 180,
    homeButtonSize: 60
  },
  'ipad-11': {
    width: 2064,
    height: 2752,
    frameWidth: 2160,
    frameHeight: 2860,
    cornerRadius: 180,
    homeButtonSize: 60
  }
};

/**
 * Generate an iPhone frame SVG
 */
function generateiPhoneFrameSVG(spec: typeof DEVICE_SPECS[DeviceType]): string {
  const { frameWidth, frameHeight, cornerRadius, notchWidth, notchHeight } = spec;
  const screenX = (frameWidth - spec.width) / 2;
  const screenY = (frameHeight - spec.height) / 2;

  return `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Device frame with gradient -->
        <linearGradient id="deviceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2c2c2e"/>
          <stop offset="50%" style="stop-color:#1c1c1e"/>
          <stop offset="100%" style="stop-color:#000000"/>
        </linearGradient>

        <!-- Screen shadow -->
        <filter id="screenShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- Device frame -->
      <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}"
            rx="${cornerRadius}" ry="${cornerRadius}"
            fill="url(#deviceGradient)"/>

      <!-- Screen area (cutout) -->
      <rect x="${screenX}" y="${screenY}"
            width="${spec.width}" height="${spec.height}"
            rx="${cornerRadius - 20}" ry="${cornerRadius - 20}"
            fill="#000000" filter="url(#screenShadow)"/>

      ${notchWidth && notchHeight ? `
      <!-- Notch -->
      <rect x="${frameWidth/2 - notchWidth/2}" y="${screenY - 5}"
            width="${notchWidth}" height="${notchHeight + 10}"
            rx="${notchHeight/2}" ry="${notchHeight/2}"
            fill="#000000"/>
      ` : ''}

      <!-- Frame highlights -->
      <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}"
            rx="${cornerRadius}" ry="${cornerRadius}"
            fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    </svg>
  `;
}

/**
 * Generate an iPad frame SVG
 */
function generateiPadFrameSVG(spec: typeof DEVICE_SPECS[DeviceType]): string {
  const { frameWidth, frameHeight, cornerRadius, homeButtonSize } = spec;
  const screenX = (frameWidth - spec.width) / 2;
  const screenY = (frameHeight - spec.height) / 2;

  return `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="deviceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8ed"/>
          <stop offset="50%" style="stop-color:#c8c8d0"/>
          <stop offset="100%" style="stop-color:#a8a8b0"/>
        </linearGradient>

        <filter id="screenShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>

        <radialGradient id="homeButton">
          <stop offset="0%" style="stop-color:#4a4a4a"/>
          <stop offset="100%" style="stop-color:#2c2c2e"/>
        </radialGradient>
      </defs>

      <!-- Device frame -->
      <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}"
            rx="${cornerRadius}" ry="${cornerRadius}"
            fill="url(#deviceGradient)"/>

      <!-- Screen area -->
      <rect x="${screenX}" y="${screenY}"
            width="${spec.width}" height="${spec.height}"
            rx="${cornerRadius - 20}" ry="${cornerRadius - 20}"
            fill="#000000" filter="url(#screenShadow)"/>

      ${homeButtonSize ? `
      <!-- Home button -->
      <circle cx="${frameWidth/2}" cy="${frameHeight - 40}"
              r="${homeButtonSize/2}"
              fill="none" stroke="url(#homeButton)" stroke-width="2"/>
      ` : ''}

      <!-- Frame highlights -->
      <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}"
            rx="${cornerRadius}" ry="${cornerRadius}"
            fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    </svg>
  `;
}

/**
 * Generate a device frame buffer
 */
export async function generateDeviceFrame(deviceType: DeviceType): Promise<Buffer> {
  const spec = DEVICE_SPECS[deviceType];

  if (!spec) {
    throw new Error(`Unknown device type: ${deviceType}`);
  }

  let svgContent: string;

  if (deviceType.startsWith('ipad')) {
    svgContent = generateiPadFrameSVG(spec);
  } else {
    svgContent = generateiPhoneFrameSVG(spec);
  }

  return await sharp(Buffer.from(svgContent))
    .png()
    .toBuffer();
}

/**
 * Get screen positioning within device frame
 */
export function getScreenPosition(deviceType: DeviceType): { x: number; y: number } {
  const spec = DEVICE_SPECS[deviceType];
  const screenX = (spec.frameWidth - spec.width) / 2;
  const screenY = (spec.frameHeight - spec.height) / 2;

  return { x: screenX, y: screenY };
}

/**
 * Get full device frame dimensions
 */
export function getDeviceFrameSize(deviceType: DeviceType): { width: number; height: number } {
  const spec = DEVICE_SPECS[deviceType];
  return {
    width: spec.frameWidth,
    height: spec.frameHeight
  };
}