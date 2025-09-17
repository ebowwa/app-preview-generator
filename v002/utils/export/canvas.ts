import html2canvas from 'html2canvas'

export interface CanvasExportOptions {
  backgroundColor?: string | null
  scale?: number
  useCORS?: boolean
}

/**
 * Export an HTML element to canvas with specific dimensions
 * @param element - HTML element to export
 * @param targetWidth - Target width for the export
 * @param targetHeight - Target height for the export
 * @param options - Additional html2canvas options
 * @returns Promise resolving to the final canvas element
 */
export const exportElementToCanvas = async (
  element: HTMLElement,
  targetWidth: number,
  targetHeight: number,
  options: CanvasExportOptions = {}
): Promise<HTMLCanvasElement> => {
  // Calculate scale to achieve target dimensions
  const rect = element.getBoundingClientRect()
  const scaleX = targetWidth / rect.width
  const scaleY = targetHeight / rect.height
  const scale = Math.max(scaleX, scaleY)

  // Capture the element with calculated scale
  const canvas = await html2canvas(element, {
    backgroundColor: options.backgroundColor ?? null,
    scale: options.scale ?? scale,
    useCORS: options.useCORS ?? true,
  })

  // Create a new canvas with exact App Store dimensions
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = targetWidth
  finalCanvas.height = targetHeight
  const ctx = finalCanvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Fill with white background to remove alpha channel (App Store requirement)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, targetWidth, targetHeight)

  // Center the captured image on the final canvas
  const offsetX = (targetWidth - canvas.width) / 2
  const offsetY = (targetHeight - canvas.height) / 2
  ctx.drawImage(canvas, offsetX, offsetY)

  return finalCanvas
}

/**
 * Convert canvas to JPEG data URL
 * @param canvas - Canvas element to convert
 * @param quality - JPEG quality (0-1)
 * @returns JPEG data URL string
 */
export const canvasToJpegDataUrl = (canvas: HTMLCanvasElement, quality: number = 1.0): string => {
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Export element and trigger download as JPEG
 * @param element - Element to export
 * @param filename - Name for the downloaded file
 * @param targetWidth - Target width
 * @param targetHeight - Target height
 */
export const exportAndDownload = async (
  element: HTMLElement,
  filename: string,
  targetWidth: number,
  targetHeight: number
): Promise<void> => {
  const canvas = await exportElementToCanvas(element, targetWidth, targetHeight)
  const dataUrl = canvasToJpegDataUrl(canvas)

  // Trigger download
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}