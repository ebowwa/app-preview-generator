import type { Screen } from '../types/preview-generator'

/**
 * Background style configuration for web/React usage
 * @param screenData - Screen configuration data
 * @returns CSS style object for background rendering
 */
export const getBackgroundStyle = (screenData: Screen) => {
  if (screenData.bgStyle === 'gradient') {
    return {
      background: `linear-gradient(135deg, ${screenData.primaryColor || '#4F46E5'} 0%, ${screenData.secondaryColor || '#7C3AED'} 100%)`
    }
  }

  if (screenData.bgStyle === 'pattern') {
    // URL encode the pattern color for SVG
    const patternColor = (screenData.primaryColor || '#4F46E5').replace('#', '%23')
    return {
      backgroundColor: screenData.bgColor || '#F3F4F6',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${patternColor}' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }
  }

  // Default to solid color
  return {
    backgroundColor: screenData.bgColor || '#F3F4F6'
  }
}

/**
 * Generate SVG background for CLI/Sharp usage
 * @param screenData - Screen configuration data
 * @param width - Background width
 * @param height - Background height
 * @returns SVG string for background rendering
 */
export const generateBackgroundSVG = (
  screenData: Screen,
  width: number,
  height: number
): string => {
  if (screenData.bgStyle === 'gradient') {
    const color1 = screenData.primaryColor || '#4F46E5'
    const color2 = screenData.secondaryColor || '#7C3AED'

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color1}" />
            <stop offset="100%" style="stop-color:${color2}" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGradient)" />
      </svg>
    `
  }

  if (screenData.bgStyle === 'pattern') {
    const bgColor = screenData.bgColor || '#F3F4F6'
    const patternColor = screenData.primaryColor || '#4F46E5'

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${bgColor}" />
        <defs>
          <pattern id="bgPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'>
              <g fill='none' fill-rule='evenodd'>
                <g fill='${patternColor}' fill-opacity='0.1'>
                  <path d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/>
                </g>
              </g>
            </svg>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgPattern)" />
      </svg>
    `
  }

  // Default to solid color
  const bgColor = screenData.bgColor || '#F3F4F6'
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}" />
    </svg>
  `
}

/**
 * Get background color for CLI usage (simplified version)
 * @param screenData - Screen configuration data
 * @returns Color string or gradient definition
 */
export const getBackgroundColor = (screenData: Screen): string => {
  if (screenData.bgStyle === 'gradient') {
    return screenData.primaryColor || '#4F46E5' // Return primary color for CLI
  }

  return screenData.bgColor || '#F3F4F6'
}

/**
 * Get background colors array for gradient CLI usage
 * @param screenData - Screen configuration data
 * @returns Array of colors for gradient or single color
 */
export const getBackgroundColors = (screenData: Screen): string[] => {
  if (screenData.bgStyle === 'gradient') {
    return [
      screenData.primaryColor || '#4F46E5',
      screenData.secondaryColor || '#7C3AED'
    ]
  }

  return [screenData.bgColor || '#F3F4F6']
}