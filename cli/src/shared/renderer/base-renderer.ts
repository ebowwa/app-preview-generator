import type { Screen, DeviceType, RenderLayer } from '../types/preview-generator'
import { getExportDimensions, calculateScaleAndPosition } from '../utils/dimensions'
import { applyPositionTransform } from '../utils/positioning'
import { applyDeviceTransform } from '../utils/deviceTransforms'
import { generateBackgroundSVG } from '../utils/backgroundStyles'

// Union type for different environment outputs
export type RenderOutput = Uint8Array | string

/**
 * Base renderer interface - common operations for all renderers
 */
export interface IBaseRenderer {
  /**
   * Generate preview for a single screen
   */
  generatePreview(screen: Screen, deviceType: DeviceType): Promise<RenderOutput>

  /**
   * Generate multiple previews
   */
  generateBatchPreviews(screens: Screen[], deviceType: DeviceType): Promise<RenderOutput[]>

  /**
   * Validate configuration
   */
  validateConfiguration(screen: Screen, deviceType: DeviceType): boolean
}

/**
 * Base rendering pipeline shared between web and CLI
 */
export abstract class BaseRenderer implements IBaseRenderer {
  protected deviceType: DeviceType

  constructor(deviceType: DeviceType) {
    this.deviceType = deviceType
  }

  /**
   * Main rendering pipeline - override specific steps in subclasses
   */
  async generatePreview(screen: Screen, deviceType: DeviceType): Promise<RenderOutput> {
    // 1. Validate configuration
    if (!this.validateConfiguration(screen, deviceType)) {
      throw new Error('Invalid screen configuration')
    }

    // 2. Get export dimensions
    const dimensions = getExportDimensions(deviceType)

    // 3. Generate background
    const background = await this.generateBackground(screen, dimensions)

    // 4. Process screenshots
    const processedScreenshots = await this.processScreenshots(screen, dimensions)

    // 5. Apply device transforms
    const transformedScreenshots = this.applyDeviceTransforms(processedScreenshots, screen, dimensions)

    // 6. Add text overlays
    const withText = await this.addTextOverlays(transformedScreenshots, screen, dimensions)

    // 7. Composite final image
    const final = await this.compositeLayers(background, withText, screen, dimensions)

    // 8. Export to final format
    return this.exportFormat(final, screen)
  }

  async generateBatchPreviews(screens: Screen[], deviceType: DeviceType): Promise<RenderOutput[]> {
    const results: RenderOutput[] = []

    for (const screen of screens) {
      try {
        const result = await this.generatePreview(screen, deviceType)
        results.push(result)
      } catch (error) {
        console.error(`Error generating preview for screen ${screen.id}:`, error)
        results.push('') // Empty string for failed screens
      }
    }

    return results
  }

  validateConfiguration(screen: Screen, deviceType: DeviceType): boolean {
    // Basic validation - override in subclasses for specific requirements
    return !!(
      screen &&
      screen.id &&
      deviceType &&
      (screen.screenshot || screen.screenshots?.length)
    )
  }

  // Abstract methods to be implemented by platform-specific renderers

  protected abstract generateBackground(screen: Screen, dimensions: { targetWidth: number; targetHeight: number }): Promise<any>

  protected abstract processScreenshots(screen: Screen, dimensions: { targetWidth: number; targetHeight: number }): Promise<any[]>

  protected abstract addTextOverlays(layers: any[], screen: Screen, dimensions: { targetWidth: number; targetHeight: number }): Promise<any>

  protected abstract compositeLayers(background: any, layers: any[], screen: Screen, dimensions: { targetWidth: number; targetHeight: number }): Promise<any>

  protected abstract exportFormat(composite: any, screen: Screen): Promise<RenderOutput>

  // Shared helper methods

  protected applyDeviceTransforms(
    screenshots: any[],
    screen: Screen,
    dimensions: { targetWidth: number; targetHeight: number }
  ): any[] {
    const deviceTransform = applyDeviceTransform(
      { x: 0, y: 0 },
      screen.devicePosition,
      { width: dimensions.targetWidth, height: dimensions.targetHeight }
    )

    return screenshots.map(screenshot => ({
      ...screenshot,
      transform: deviceTransform,
      position: applyPositionTransform(
        screen.position,
        dimensions.targetWidth,
        dimensions.targetHeight
      )
    }))
  }

  protected createBackgroundSVG(screen: Screen, width: number, height: number): string {
    return generateBackgroundSVG(screen, width, height)
  }

  protected calculateScreenshotFit(
    screenshotWidth: number,
    screenshotHeight: number,
    deviceWidth: number,
    deviceHeight: number
  ) {
    return calculateScaleAndPosition(
      screenshotWidth,
      screenshotHeight,
      deviceWidth,
      deviceHeight,
      'contain'
    )
  }

  protected sanitizeText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  protected getOutputFormat(_screen: Screen): 'jpg' | 'png' {
    // CLI can override this via configuration, web app uses different logic
    return 'jpg' // Default to JPEG for App Store compliance
  }
}

/**
 * Rendering configuration options
 */
export interface RenderOptions {
  quality?: number
  format?: 'jpg' | 'png'
  backgroundColor?: string
  enableDeviceFrames?: boolean
  enableShadows?: boolean
  outputPath?: string
}