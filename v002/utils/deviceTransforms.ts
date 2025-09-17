import type { Screen } from '@/types/preview-generator'

/**
 * Get CSS transform string based on device position setting
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