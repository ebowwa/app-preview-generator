import type { Screen } from '../types/preview-generator'

/**
 * CSS transform for device positioning (Web/React usage)
 * @param devicePosition - The position setting for the device
 * @returns CSS transform string for 3D positioning
 */
export const getDeviceTransform = (devicePosition: Screen['devicePosition']): string => {
  switch (devicePosition) {
    case 'left':
      return 'translateX(-20px) rotateY(25deg)'
    case 'right':
      return 'translateX(20px) rotateY(-25deg)'
    case 'angled-left':
      return 'rotateY(35deg) rotateX(5deg)'
    case 'angled-right':
      return 'rotateY(-35deg) rotateX(5deg)'
    case 'center':
    default:
      return 'none'
  }
}

/**
 * Numeric transform values for CLI/Sharp usage
 * Convert CSS transforms to numeric positioning values
 * @param devicePosition - The position setting for the device
 * @returns Numeric transform values for CLI rendering
 */
export const getDeviceTransformValues = (devicePosition: Screen['devicePosition']): {
  translateX: number;
  translateY: number;
  rotateY: number;
  rotateX: number;
  scale: number;
} => {
  switch (devicePosition) {
    case 'left':
      return {
        translateX: -20,
        translateY: 0,
        rotateY: 25,
        rotateX: 0,
        scale: 1
      }
    case 'right':
      return {
        translateX: 20,
        translateY: 0,
        rotateY: -25,
        rotateX: 0,
        scale: 1
      }
    case 'angled-left':
      return {
        translateX: 0,
        translateY: -10,
        rotateY: 35,
        rotateX: 5,
        scale: 0.95
      }
    case 'angled-right':
      return {
        translateX: 0,
        translateY: -10,
        rotateY: -35,
        rotateX: 5,
        scale: 0.95
      }
    case 'center':
    default:
      return {
        translateX: 0,
        translateY: 0,
        rotateY: 0,
        rotateX: 0,
        scale: 1
      }
  }
}

/**
 * Apply device transform to image positioning for CLI
 * @param basePosition - Base x, y coordinates
 * @param devicePosition - Device position setting
 * @param canvasSize - Canvas dimensions for perspective calculation
 * @returns Transformed position and scale values
 */
export const applyDeviceTransform = (
  basePosition: { x: number; y: number },
  devicePosition: Screen['devicePosition'],
  canvasSize: { width: number; height: number }
): {
  x: number;
  y: number;
  scale: number;
  perspective?: {
    skewX: number;
    skewY: number;
  };
} => {
  const transforms = getDeviceTransformValues(devicePosition)

  // Apply translations
  let x = basePosition.x + transforms.translateX
  let y = basePosition.y + transforms.translateY
  let scale = transforms.scale

  // For rotated positions, simulate 3D perspective effect
  if (devicePosition === 'angled-left' || devicePosition === 'angled-right') {
    // Simulate perspective by adjusting position and adding subtle skew
    const perspectiveAmount = Math.abs(transforms.rotateY) / 100
    return {
      x: x + (transforms.rotateY > 0 ? -canvasSize.width * 0.05 : canvasSize.width * 0.05),
      y: y,
      scale: scale,
      perspective: {
        skewX: transforms.rotateY * 0.1,
        skewY: transforms.rotateX * 0.1
      }
    }
  }

  // For left/right positions, add slight depth effect
  if (devicePosition === 'left' || devicePosition === 'right') {
    scale *= 0.98 // Slightly smaller to simulate depth
  }

  return { x, y, scale }
}