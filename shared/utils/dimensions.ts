import type { DeviceType } from '../types/preview-generator'
import { deviceSizes } from '../types/preview-generator'

export interface ExportDimensions {
  targetWidth: number
  targetHeight: number
  deviceName: string
}

export interface ElementRect {
  width: number
  height: number
  x?: number
  y?: number
}

/**
 * Get export dimensions for a specific device type
 * @param deviceType - The device type to get dimensions for
 * @returns Export dimensions including width, height, and name
 */
export const getExportDimensions = (deviceType: DeviceType): ExportDimensions => {
  const deviceSize = deviceSizes[deviceType]
  return {
    targetWidth: deviceSize.width,
    targetHeight: deviceSize.height,
    deviceName: deviceSize.name
  }
}

/**
 * Calculate scale factors for export (adapted for CLI)
 * @param elementRect - Bounding rectangle of the element to export
 * @param targetWidth - Target width for export
 * @param targetHeight - Target height for export
 * @returns Scale factor to achieve target dimensions
 */
export const calculateExportScale = (
  elementRect: ElementRect,
  targetWidth: number,
  targetHeight: number
): number => {
  const scaleX = targetWidth / elementRect.width
  const scaleY = targetHeight / elementRect.height
  // Use max to ensure we cover the full target size
  return Math.max(scaleX, scaleY)
}

/**
 * Calculate scale factors for fitting content within dimensions
 * @param sourceWidth - Source content width
 * @param sourceHeight - Source content height
 * @param targetWidth - Target width
 * @param targetHeight - Target height
 * @param fitMode - How to fit: 'contain', 'cover', or 'fill'
 * @returns Scale factor and positioning
 */
export const calculateScaleAndPosition = (
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  fitMode: 'contain' | 'cover' | 'fill' = 'contain'
): {
  scale: number
  x: number
  y: number
  width: number
  height: number
} => {
  let scale: number
  let width: number
  let height: number

  switch (fitMode) {
    case 'cover':
      scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
      break
    case 'fill':
      scale = 1
      break
    case 'contain':
    default:
      scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight)
      break
  }

  width = sourceWidth * scale
  height = sourceHeight * scale
  const x = (targetWidth - width) / 2
  const y = (targetHeight - height) / 2

  return { scale, x, y, width, height }
}

/**
 * Generate export filename with device name
 * @param deviceName - Name of the device
 * @param screenIndex - Index of the current screen (0-based)
 * @param extension - File extension (default: 'jpg')
 * @returns Formatted filename
 */
export const generateExportFilename = (
  deviceName: string,
  screenIndex: number,
  extension: string = 'jpg'
): string => {
  // Sanitize device name for filename
  const sanitizedName = deviceName.replace(/[^a-zA-Z0-9]/g, '-')
  return `app-preview-${sanitizedName}-${screenIndex + 1}.${extension}`
}

/**
 * Generate timestamped filename
 * @param prefix - Filename prefix
 * @param extension - File extension (default: 'jpg')
 * @returns Timestamped filename
 */
export const generateTimestampFilename = (
  prefix: string,
  extension: string = 'jpg'
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${prefix}-${timestamp}.${extension}`
}

/**
 * Validate device type
 * @param deviceType - Device type to validate
 * @returns True if valid device type
 */
export const isValidDeviceType = (deviceType: string): deviceType is DeviceType => {
  return deviceType in deviceSizes
}

/**
 * Get all available device types
 * @returns Array of available device types
 */
export const getAvailableDeviceTypes = (): DeviceType[] => {
  return Object.keys(deviceSizes) as DeviceType[]
}