import type { DeviceType } from '@/types/preview-generator'
import { deviceSizes } from '@/types/preview-generator'

export interface ExportDimensions {
  targetWidth: number
  targetHeight: number
  deviceName: string
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
 * Calculate scale factors for canvas export
 * @param elementRect - Bounding rectangle of the element to export
 * @param targetWidth - Target width for export
 * @param targetHeight - Target height for export
 * @returns Scale factor to achieve target dimensions
 */
export const calculateExportScale = (
  elementRect: DOMRect,
  targetWidth: number,
  targetHeight: number
): number => {
  const scaleX = targetWidth / elementRect.width
  const scaleY = targetHeight / elementRect.height
  // Use max to ensure we cover the full target size
  return Math.max(scaleX, scaleY)
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