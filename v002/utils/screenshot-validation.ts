import { deviceSizes, DeviceType } from '@/types/preview-generator'

export interface ValidationError {
  type: 'file_type' | 'dimensions' | 'file_size'
  message: string
  details?: {
    actual?: string | number
    expected?: string | number | string[]
    minWidth?: number
    minHeight?: number
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: string[]
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_FILE_SIZE_MB = 50  // Increased to 50MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function validateFileType(file: File): ValidationError | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown'
    return {
      type: 'file_type',
      message: `Invalid file type. Supported formats: JPG, PNG, GIF, WebP, SVG.`,
      details: {
        actual: extension.toUpperCase(),
        expected: ['JPG', 'PNG', 'GIF', 'WEBP', 'SVG']
      }
    }
  }
  return null
}

export function validateFileSize(file: File): ValidationError | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      type: 'file_size',
      message: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
      details: {
        actual: Math.round(file.size / (1024 * 1024) * 10) / 10,
        expected: MAX_FILE_SIZE_MB
      }
    }
  }
  return null
}

export async function validateImageDimensions(
  file: File,
  deviceType: DeviceType
): Promise<ValidationError | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const device = deviceSizes[deviceType]
      // Relaxed minimum dimensions - just require reasonable size
      const minWidth = 200  // Much more lenient minimum
      const minHeight = 200 // Much more lenient minimum

      // Check if image meets minimum requirements
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          type: 'dimensions',
          message: `Image dimensions are too small.`,
          details: {
            actual: `${img.width}×${img.height}`,
            expected: `At least ${minWidth}×${minHeight}`,
            minWidth,
            minHeight
          }
        })
      } else {
        resolve(null)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        type: 'dimensions',
        message: 'Failed to load image for dimension validation.',
        details: {}
      })
    }

    img.src = url
  })
}

export async function validateScreenshot(
  file: File,
  deviceType: DeviceType
): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // Check file type
  const fileTypeError = validateFileType(file)
  if (fileTypeError) {
    errors.push(fileTypeError)
  }

  // Check file size
  const fileSizeError = validateFileSize(file)
  if (fileSizeError) {
    errors.push(fileSizeError)
  }

  // Only check dimensions if file type is valid
  if (!fileTypeError) {
    const dimensionError = await validateImageDimensions(file, deviceType)
    if (dimensionError) {
      errors.push(dimensionError)
    }
  }

  // Add warnings for optimal dimensions (optional, not blocking)
  const device = deviceSizes[deviceType]
  const img = new Image()
  const url = URL.createObjectURL(file)

  await new Promise<void>((resolve) => {
    img.onload = () => {
      URL.revokeObjectURL(url)

      // Only warn if image is much smaller than App Store dimensions
      if (img.width < device.width * 0.5 || img.height < device.height * 0.5) {
        warnings.push(
          `For App Store screenshots, consider using dimensions closer to: ${device.width}×${device.height}px`
        )
      }

      resolve()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve()
    }

    img.src = url
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => {
    let message = error.message
    if (error.details) {
      if (error.type === 'file_type' && error.details.actual && error.details.expected) {
        message += ` (Got: ${error.details.actual}, Expected: ${Array.isArray(error.details.expected) ? error.details.expected.join(' or ') : error.details.expected})`
      } else if (error.type === 'dimensions' && error.details.actual && error.details.expected) {
        message += ` (Got: ${error.details.actual}px, Expected: ${error.details.expected}px)`
      } else if (error.type === 'file_size' && error.details.actual && error.details.expected) {
        message += ` (Got: ${error.details.actual}MB, Max: ${error.details.expected}MB)`
      }
    }
    return message
  }).join('\n')
}