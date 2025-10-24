import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import type { DeviceType, GenerateOptions, Screen, RenderLayer } from '../shared/types/preview-generator';
import { deviceSizes } from '../shared/types/preview-generator';
import { getExportDimensions, calculateScaleAndPosition } from '../shared/utils/dimensions';
import { applyPositionTransform } from '../shared/utils/positioning';
import { applyDeviceTransform } from '../shared/utils/deviceTransforms';
import { generateBackgroundSVG } from '../shared/utils/backgroundStyles';
import { BaseRenderer } from '../shared/renderer/base-renderer';
import { generateDeviceFrame, getScreenPosition, getDeviceFrameSize } from './deviceFrames';

export class PreviewRenderer extends BaseRenderer {
  constructor(deviceType: DeviceType) {
    super(deviceType);
  }

  // CLI-specific method to generate preview from options
  async generatePreviewFromOptions(options: GenerateOptions): Promise<Buffer> {
    // Convert CLI options to Screen format for shared renderer
    const screen: Screen = {
      id: 'cli-screen',
      screenshot: options.screenshot,
      screenshots: [{
        id: 'main-screenshot',
        url: options.screenshot,
        position: { x: 0, y: 0, scale: 100, rotation: 0 },
        opacity: 100,
        zIndex: 1
      }],
      title: options.title || '',
      subtitle: options.subtitle || '',
      description: options.description || '',
      overlayStyle: options.style as any || 'gradient',
      textPosition: options.titlePosition as any || 'top',
      devicePosition: options.devicePosition as any || 'center',
      bgStyle: options.style === 'gradient' ? 'gradient' : 'solid',
      layoutStyle: 'standard',
      position: { x: 0, y: 0, scale: 100, rotation: 0 },
      textOverlayPosition: { x: 0, y: 0 },
      opacity: { screenshot: 100, overlay: 90 },
      primaryColor: options.primaryColor || '#4F46E5',
      secondaryColor: options.secondaryColor || '#7C3AED',
      bgColor: options.bgColor || '#F3F4F6',
      layerOrder: 'front',
      imageAssets: []
    };

    // Validate inputs
    await this.validateInputs(options);

    // Use shared renderer pipeline
    const result = await super.generatePreview(screen, this.deviceType as DeviceType);

    // Convert Uint8Array back to Buffer for CLI
    return Buffer.from(result);
  }

  // CLI-specific input validation
  private async validateInputs(options: GenerateOptions): Promise<void> {
    // Check if screenshot file exists
    try {
      await fs.access(options.screenshot);
    } catch (error) {
      throw new Error(`Screenshot file not found: ${options.screenshot}`);
    }

    // Validate file type
    const fileExtension = path.extname(options.screenshot).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!validExtensions.includes(fileExtension)) {
      throw new Error(`Invalid file type: ${fileExtension}. Supported types: ${validExtensions.join(', ')}`);
    }
  }

  // Implement abstract methods from BaseRenderer

  protected async generateBackground(screen: Screen, dimensions: { targetWidth: number; targetHeight: number }): Promise<any> {
    // Use shared background generation
    const backgroundSVG = generateBackgroundSVG(screen, dimensions.targetWidth, dimensions.targetHeight);
    return Buffer.from(backgroundSVG);
  }

  protected async processScreenshots(screen: Screen, dimensions: { targetWidth: number; targetHeight: number }): Promise<any[]> {
    const screenshots: any[] = [];

    // Process main screenshot if available
    if (screen.screenshot) {
      const screenshotBuffer = await fs.readFile(screen.screenshot);
      const deviceFrameSize = getDeviceFrameSize(this.deviceType as DeviceType);
      const screenPos = getScreenPosition(this.deviceType as DeviceType);

      screenshots.push(await this.processScreenshot(
        screenshotBuffer,
        deviceFrameSize,
        screenPos,
        screen
      ));
    }

    // Process additional screenshots if available
    for (const screenshotData of screen.screenshots || []) {
      if (screenshotData.url && screenshotData.url !== screen.screenshot) {
        const screenshotBuffer = await fs.readFile(screenshotData.url);
        screenshots.push({
          buffer: screenshotBuffer,
          position: screenshotData.position,
          opacity: screenshotData.opacity,
          zIndex: screenshotData.zIndex
        });
      }
    }

    return screenshots;
  }

  private async processScreenshot(
    screenshotBuffer: Buffer,
    deviceFrameSize: { width: number; height: number },
    screenPos: { x: number; y: number },
    screen: Screen
  ): Promise<any> {
    // Generate device frame
    const deviceFrameBuffer = await generateDeviceFrame(this.deviceType as DeviceType);

    // Get the actual screen dimensions from deviceSizes
    const screenDimensions = deviceSizes[this.deviceType as DeviceType];

    // Process screenshot to fit screen area
    const screenshot = sharp(screenshotBuffer);
    const metadata = await screenshot.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Could not read screenshot dimensions');
    }

    // Calculate scaling to fit screen area perfectly
    const scaleX = screenDimensions.width / metadata.width;
    const scaleY = screenDimensions.height / metadata.height;
    const scale = Math.min(scaleX, scaleY);

    const newWidth = Math.floor(metadata.width * scale);
    const newHeight = Math.floor(metadata.height * scale);

    // Resize screenshot to fit screen
    const resizedScreenshot = await screenshot
      .resize(newWidth, newHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .toBuffer();

    // Calculate position to center screenshot within screen area
    const screenOffsetX = screenPos.x + Math.floor((screenDimensions.width - newWidth) / 2);
    const screenOffsetY = screenPos.y + Math.floor((screenDimensions.height - newHeight) / 2);

    // Composite screenshot onto device frame
    const compositeImage = await sharp(deviceFrameBuffer)
      .composite([{
        input: resizedScreenshot,
        left: screenOffsetX,
        top: screenOffsetY
      }])
      .png()
      .toBuffer();

    return {
      buffer: compositeImage,
      position: { x: 0, y: 0, width: deviceFrameSize.width, height: deviceFrameSize.height },
      opacity: screen.opacity.screenshot,
      zIndex: 1
    };
  }

  protected async addTextOverlays(layers: any[], screen: Screen, dimensions: { targetWidth: number; targetHeight: number }): Promise<any> {
    if (!screen.title && !screen.subtitle && !screen.description) {
      return layers;
    }

    // Create text overlay SVG
    const svgTexts: string[] = [];
    let yOffset = this.calculateTextYOffset(screen.textPosition, dimensions.targetHeight);

    if (screen.title) {
      svgTexts.push(this.createTextSVG(screen.title, 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif', '#000000', dimensions.targetWidth / 2, yOffset));
      yOffset += 60;
    }

    if (screen.subtitle) {
      svgTexts.push(this.createTextSVG(screen.subtitle, '32px -apple-system, BlinkMacSystemFont, sans-serif', '#333333', dimensions.targetWidth / 2, yOffset));
      yOffset += 45;
    }

    if (screen.description) {
      svgTexts.push(this.createTextSVG(screen.description, '24px -apple-system, BlinkMacSystemFont, sans-serif', '#666666', dimensions.targetWidth / 2, yOffset));
    }

    if (svgTexts.length > 0) {
      const svgBuffer = Buffer.from(`
        <svg width="${dimensions.targetWidth}" height="${dimensions.targetHeight}" xmlns="http://www.w3.org/2000/svg">
          ${svgTexts.join('\n          ')}
        </svg>
      `);

      layers.push({
        buffer: svgBuffer,
        position: { x: 0, y: 0, width: dimensions.targetWidth, height: dimensions.targetHeight },
        opacity: screen.opacity.overlay,
        zIndex: 10
      });
    }

    return layers;
  }

  protected async compositeLayers(background: any, layers: any[], screen: Screen, dimensions: { targetWidth: number; targetHeight: number }): Promise<any> {
    // Sort layers by zIndex
    const sortedLayers = layers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Start with background
    let composite = sharp(background);

    // Composite each layer
    for (const layer of sortedLayers) {
      composite = composite.composite([{
        input: layer.buffer,
        left: layer.position.x,
        top: layer.position.y,
        blend: 'over'
      }]);
    }

    return composite;
  }

  protected async exportFormat(composite: any, screen: Screen): Promise<Uint8Array> {
    const format = this.getOutputFormat(screen);
    const quality = 90; // Default quality

    if (format === 'png') {
      return await composite.png().toBuffer();
    } else {
      return await composite.jpeg({ quality }).toBuffer();
    }
  }

  // Helper methods

  private calculateTextYOffset(position: string, imageHeight: number): number {
    switch (position) {
      case 'top':
        return 100;
      case 'center':
        return Math.floor(imageHeight / 2);
      case 'bottom':
      default:
        return imageHeight - 200;
    }
  }

  private createTextSVG(text: string, font: string, color: string, x: number, y: number): string {
    return `
      <text x="${x}" y="${y}"
            font-family="${font}"
            fill="${color}"
            text-anchor="middle"
            dominant-baseline="middle">
        ${this.sanitizeText(text)}
      </text>
    `;
  }
}