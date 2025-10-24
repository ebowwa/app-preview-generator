export interface Screenshot {
  id: string
  url: string
  position: {
    x: number
    y: number
    scale: number
    rotation: number
  }
  opacity: number
  zIndex: number
}

export interface ImageAsset {
  id: string
  url: string
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  rotation: number
  opacity: number
  zIndex: number
}

export interface Screen {
  id: string
  screenshot: string | null  // Keep for backward compatibility
  screenshots: Screenshot[]   // New: multiple screenshots
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
  imageAssets: ImageAsset[]
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
  'iphone-69': { width: 1242, height: 2688, name: '6.9" iPhone (App Store)' },
  'iphone-67': { width: 1242, height: 2688, name: '6.7" iPhone (App Store)' },
  'iphone-65': { width: 1242, height: 2688, name: '6.5" iPhone (App Store)' },
  'iphone-61': { width: 1284, height: 2778, name: '6.1" iPhone (App Store)' },
  'iphone-69-landscape': { width: 2688, height: 1242, name: '6.9" Landscape (App Store)' },
  'ipad-129': { width: 2048, height: 2732, name: '12.9" iPad' },
  'ipad-11': { width: 2064, height: 2752, name: '11" iPad' },
}

// Enhanced CLI interfaces
export interface CLIConfig {
  project: {
    name: string
    device: string
    defaultStyle?: string
    defaultPosition?: string
    defaultDevicePosition?: string
  }
  screens: CLIScreen[]
  output: {
    directory: string
    format: 'jpg' | 'png'
    quality?: number
  }
}

export interface CLIScreen {
  screenshot: string
  title?: string
  subtitle?: string
  description?: string
  style?: string
  position?: string
  devicePosition?: string
  outputName?: string
  primaryColor?: string
  secondaryColor?: string
  bgColor?: string
  opacity?: {
    screenshot?: number
    overlay?: number
  }
}

export interface GenerateOptions {
  screenshot: string
  device: string
  title?: string
  subtitle?: string
  description?: string
  output: string
  outputDir: string
  style: string
  titlePosition: string
  devicePosition?: string
  primaryColor?: string
  secondaryColor?: string
  bgColor?: string
}

export interface BatchOptions {
  config: string
  outputDir: string
}

export interface InitOptions {
  name?: string
  screenshots?: string
}

// Enhanced rendering types
export interface RenderLayer {
  type: 'background' | 'screenshot' | 'text' | 'device-frame' | 'image-asset'
  content: Uint8Array | string
  position: {
    x: number
    y: number
    width?: number
    height?: number
  }
  transform?: {
    scale: number
    rotation: number
    translateX?: number
    translateY?: number
  }
  opacity?: number
  zIndex?: number
}

export interface TextLayer extends RenderLayer {
  type: 'text'
  content: string
  style: {
    fontSize: number
    fontFamily: string
    color: string
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right'
  }
}

export interface ScreenshotLayer extends RenderLayer {
  type: 'screenshot'
  content: Uint8Array
  sourceDimensions: {
    width: number
    height: number
  }
}

// Device frame specifications
export interface DeviceFrameSpec {
  width: number
  height: number
  frameWidth: number
  frameHeight: number
  cornerRadius: number
  notchWidth?: number
  notchHeight?: number
  homeButtonSize?: number
  frameColor?: string
  frameStyle?: 'iphone' | 'ipad'
}