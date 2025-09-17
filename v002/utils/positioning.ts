import type { Screen } from '@/types/preview-generator'

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