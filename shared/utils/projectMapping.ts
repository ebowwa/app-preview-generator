import type { Screen } from '../types/preview-generator'

/**
 * Map legacy v001 screen data format to v002 format
 * Ensures backward compatibility with older project files
 * @param screen - Legacy screen data (potentially from v001)
 * @param index - Screen index for ID generation
 * @returns Mapped screen data in v002 format
 */
export const mapLegacyScreenData = (screen: any, index: number): Screen => {
  return {
    id: screen.id || String(index + 1),
    screenshot: screen.screenshot || null,
    // Map title fields - check both v001 and v002 field names
    title: screen.overlayTitle || screen.title || '',
    subtitle: screen.overlaySubtitle || screen.subtitle || '',
    description: screen.overlayDescription || screen.description || '',
    overlayStyle: screen.overlayStyle || 'gradient',
    textPosition: screen.textPosition || 'bottom',
    devicePosition: screen.devicePosition || 'center',
    bgStyle: screen.bgStyle || 'gradient',
    layoutStyle: screen.layoutStyle || 'standard',
    // Map position fields - handle both imagePosition and position
    position: {
      x: screen.imagePosition?.x ?? screen.position?.x ?? 0,
      y: screen.imagePosition?.y ?? screen.position?.y ?? 0,
      scale: screen.imagePosition?.scale ?? screen.position?.scale ?? 100,
      rotation: screen.imagePosition?.rotation ?? screen.position?.rotation ?? 0
    },
    textOverlayPosition: screen.textOverlayPosition || { x: 0, y: 0 },
    // Map opacity fields - handle both individual and grouped opacity
    opacity: {
      screenshot: screen.screenshotOpacity ?? screen.opacity?.screenshot ?? 100,
      overlay: screen.overlayOpacity ?? screen.opacity?.overlay ?? 90
    },
    primaryColor: screen.primaryColor || '#4F46E5',
    secondaryColor: screen.secondaryColor || '#7C3AED',
    bgColor: screen.bgColor || '#F3F4F6',
    layerOrder: screen.layerOrder || 'front',
    imageAssets: screen.imageAssets || [],
    screenshots: screen.screenshots || []
  }
}

/**
 * Parse and validate project JSON data
 * @param jsonString - JSON string from file
 * @returns Parsed project data or null if invalid
 */
export const parseProjectData = (jsonString: string): { screens: Screen[], deviceType?: string } | null => {
  try {
    const data = JSON.parse(jsonString)
    if (!data.screens || !Array.isArray(data.screens)) {
      console.error('Invalid project data: missing or invalid screens array')
      return null
    }
    return data
  } catch (error) {
    console.error('Error parsing project data:', error)
    return null
  }
}

/**
 * Serialize project data for saving
 * @param screens - Array of screen configurations
 * @param deviceType - Selected device type
 * @returns Formatted JSON string
 */
export const serializeProjectData = (screens: Screen[], deviceType: string): string => {
  return JSON.stringify({ screens, deviceType }, null, 2)
}