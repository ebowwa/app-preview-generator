export interface Screen {
  id: string
  screenshot: string | null
  title: string
  subtitle: string
  description: string
  overlayStyle: 'none' | 'gradient' | 'minimal' | 'bold' | 'dark'
  textPosition: 'top' | 'center' | 'bottom'
  devicePosition: 'center' | 'left' | 'right' | 'angled-left' | 'angled-right'
  bgStyle: 'solid' | 'gradient' | 'pattern'
  layoutStyle: 'standard' | 'floating' | 'split'
  position: {
    x: number
    y: number
    scale: number
    rotation: number
  }
  textOverlayPosition: {
    x: number
    y: number
  }
  opacity: {
    screenshot: number
    overlay: number
  }
  primaryColor: string
  secondaryColor: string
  bgColor: string
  layerOrder: 'front' | 'back'
}

export interface DeviceSize {
  width: number
  height: number
  name: string
}

export type DeviceType = 
  | 'iphone-69'
  | 'iphone-67' 
  | 'iphone-65'
  | 'iphone-61'
  | 'iphone-69-landscape'
  | 'ipad-129'
  | 'ipad-11'

export const deviceSizes: Record<DeviceType, DeviceSize> = {
  'iphone-69': { width: 1320, height: 2868, name: '6.9" iPhone' },
  'iphone-67': { width: 1290, height: 2796, name: '6.7" iPhone' },
  'iphone-65': { width: 1179, height: 2556, name: '6.5" iPhone' },
  'iphone-61': { width: 1284, height: 2778, name: '6.1" iPhone' },
  'iphone-69-landscape': { width: 2868, height: 1320, name: '6.9" Landscape' },
  'ipad-129': { width: 2048, height: 2732, name: '12.9" iPad' },
  'ipad-11': { width: 2064, height: 2752, name: '11" iPad' },
}