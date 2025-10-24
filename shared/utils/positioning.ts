import type { Screen } from '../types/preview-generator'

type Position = NonNullable<Screen['position']>

/**
 * Reset position to default values
 * @returns Default position object
 */
export const getResetPosition = (): Position => ({
  x: 0,
  y: 0,
  scale: 100,
  rotation: 0
})

/**
 * Get position values to fit screenshot within frame
 * @returns Position object for fit-to-frame
 */
export const getFitToFramePosition = (): Position => ({
  x: 0,
  y: 0,
  scale: 85,
  rotation: 0
})

/**
 * Get position values to fill the entire frame
 * @returns Position object for fill-frame
 */
export const getFillFramePosition = (): Position => ({
  x: 0,
  y: 0,
  scale: 120,
  rotation: 0
})

/**
 * Center the image while preserving scale and rotation
 * @param currentPosition - Current position to preserve scale/rotation from
 * @returns Centered position object
 */
export const getCenterPosition = (currentPosition: Position): Position => ({
  ...currentPosition,
  x: 0,
  y: 0
})

/**
 * Apply position transformation for rendering
 * @param position - Position object with x, y, scale, rotation
 * @param containerWidth - Container width for calculations
 * @param containerHeight - Container height for calculations
 * @returns Transformed position and dimensions
 */
export const applyPositionTransform = (
  position: Position,
  containerWidth: number,
  containerHeight: number
): {
  x: number
  y: number
  scale: number
  rotation: number
  transformedWidth: number
  transformedHeight: number
} => {
  const scale = position.scale / 100 // Convert percentage to decimal
  const centerX = containerWidth / 2
  const centerY = containerHeight / 2

  // Calculate transformed position (centered + offset)
  const x = centerX + (position.x * scale)
  const y = centerY + (position.y * scale)

  return {
    x,
    y,
    scale,
    rotation: position.rotation,
    transformedWidth: containerWidth * scale,
    transformedHeight: containerHeight * scale
  }
}

/**
 * Calculate position to fit content within container
 * @param contentWidth - Content width
 * @param contentHeight - Content height
 * @param containerWidth - Container width
 * @param containerHeight - Container height
 * @param fitMode - How to fit: 'contain', 'cover', 'fill'
 * @returns Position object for fitting
 */
export const calculateFitPosition = (
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number,
  fitMode: 'contain' | 'cover' | 'fill' = 'contain'
): Position => {
  let scale: number

  switch (fitMode) {
    case 'cover':
      scale = Math.max(containerWidth / contentWidth, containerHeight / contentHeight) * 100
      break
    case 'fill':
      scale = Math.max(containerWidth / contentWidth, containerHeight / contentHeight) * 100
      break
    case 'contain':
    default:
      scale = Math.min(containerWidth / contentWidth, containerHeight / contentHeight) * 100
      break
  }

  return {
    x: 0,
    y: 0,
    scale: Math.round(scale),
    rotation: 0
  }
}

/**
 * Validate position object
 * @param position - Position to validate
 * @returns True if valid position
 */
export const isValidPosition = (position: any): position is Position => {
  return (
    typeof position === 'object' &&
    typeof position.x === 'number' &&
    typeof position.y === 'number' &&
    typeof position.scale === 'number' &&
    typeof position.rotation === 'number' &&
    !isNaN(position.x) &&
    !isNaN(position.y) &&
    !isNaN(position.scale) &&
    !isNaN(position.rotation)
  )
}