import type { Screen } from '@/types/preview-generator'
import type { CSSProperties } from 'react'

/**
 * Generate background style object based on screen settings
 * @param screenData - Screen configuration data
 * @returns CSS style object for background rendering
 */
export const getBackgroundStyle = (screenData: Screen): CSSProperties => {
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