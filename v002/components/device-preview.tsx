'use client'

import React from 'react'
import { Image } from 'lucide-react'
import type { Screen } from '@/types/preview-generator'

interface DevicePreviewProps {
  screen: Screen
  width?: number | string
  height?: number | string
  className?: string
  showDeviceFrame?: boolean
  scale?: number
  onScreenshotMouseDown?: (screenshotId: string, e: React.MouseEvent) => void
  onTextMouseDown?: (e: React.MouseEvent) => void
  onAssetMouseDown?: (assetId: string, e: React.MouseEvent) => void
  onLegacyMouseDown?: (e: React.MouseEvent) => void
}

export function DevicePreview({
  screen,
  width = '300px',
  height = '650px',
  className = '',
  showDeviceFrame = true,
  scale = 1,
  onScreenshotMouseDown,
  onTextMouseDown,
  onAssetMouseDown,
  onLegacyMouseDown
}: DevicePreviewProps) {
  const getDeviceTransform = () => {
    switch (screen.devicePosition) {
      case 'left': return 'translateX(-20px) rotateY(25deg)'
      case 'right': return 'translateX(20px) rotateY(-25deg)'
      case 'angled-left': return 'rotateY(35deg) rotateX(5deg)'
      case 'angled-right': return 'rotateY(-35deg) rotateX(5deg)'
      default: return 'none'
    }
  }

  const getBackgroundStyle = () => {
    if (screen.bgStyle === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${screen.primaryColor || '#4F46E5'} 0%, ${screen.secondaryColor || '#7C3AED'} 100%)`
      }
    } else if (screen.bgStyle === 'pattern') {
      const patternColor = (screen.primaryColor || '#4F46E5').replace('#', '%23')
      return {
        backgroundColor: screen.bgColor || '#F3F4F6',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${patternColor}' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }
    }
    return { backgroundColor: screen.bgColor || '#F3F4F6' }
  }

  const frameStyle = showDeviceFrame ? {
    transform: getDeviceTransform(),
    perspective: '1000px',
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    transformOrigin: 'center center'
  } : {}

  const contentStyle = {
    ...getBackgroundStyle(),
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    overflow: 'hidden'
  }

  const renderTextOverlay = (layerOrder: 'front' | 'back') => {
    if (screen.layerOrder !== layerOrder) return null
    if (!screen.title && !screen.subtitle && !screen.description) return null

    const isInteractive = Boolean(onTextMouseDown)
    const textScale = scale < 0.5 ? scale * 2 : 1 // Scale up text for tiny previews

    return (
      <>
        {/* Static Overlay Background */}
        {screen.overlayStyle !== 'none' && (
          <div
            className={`absolute left-0 right-0 pointer-events-none ${
              screen.textPosition === 'top' ? 'top-0' :
              screen.textPosition === 'center' ? 'top-1/2 -translate-y-1/2' :
              'bottom-0'
            }`}
            style={{
              padding: `${6 * scale}px`,
              background: screen.overlayStyle === 'gradient'
                ? `linear-gradient(to ${screen.textPosition === 'top' ? 'bottom' : 'top'}, rgba(0,0,0,0.8), transparent)`
                : screen.overlayStyle === 'minimal' ? 'rgba(255,255,255,0.9)'
                : screen.overlayStyle === 'bold' ? 'rgba(0,0,0,0.95)'
                : 'rgba(0,0,0,0.8)',
              opacity: (screen.opacity?.overlay ?? 90) / 100,
              height: screen.textPosition === 'center' ? `${120 * scale}px` : `${80 * scale}px`,
              zIndex: layerOrder === 'front' ? 5 : 25
            }}
          />
        )}

        {/* Draggable Text Content */}
        <div
          className={`absolute left-0 right-0 text-white ${isInteractive ? 'cursor-move' : ''} ${
            screen.textPosition === 'top' ? 'top-0' :
            screen.textPosition === 'center' ? 'top-1/2 -translate-y-1/2' :
            'bottom-0'
          }`}
          style={{
            padding: `${6 * scale}px`,
            color: screen.overlayStyle === 'minimal' ? '#000' : '#fff',
            transform: `translate(${(screen.textOverlayPosition?.x ?? 0) * scale}px, ${(screen.textOverlayPosition?.y ?? 0) * scale}px)`,
            zIndex: layerOrder === 'front' ? 10 : 30
          }}
          onMouseDown={isInteractive ? onTextMouseDown : undefined}
        >
          {screen.title && (
            <h2 style={{
              fontSize: `${24 * textScale}px`,
              fontWeight: 'bold',
              margin: 0,
              lineHeight: `${28 * textScale}px`
            }}>{screen.title}</h2>
          )}
          {screen.subtitle && (
            <p style={{
              fontSize: `${14 * textScale}px`,
              opacity: 0.9,
              margin: `${4 * scale}px 0 0 0`,
              lineHeight: `${18 * textScale}px`
            }}>{screen.subtitle}</p>
          )}
          {screen.description && (
            <p style={{
              fontSize: `${12 * textScale}px`,
              opacity: 0.8,
              margin: `${8 * scale}px 0 0 0`,
              lineHeight: `${16 * textScale}px`
            }}>{screen.description}</p>
          )}
        </div>
      </>
    )
  }

  const renderScreenshots = () => {
    const isInteractive = Boolean(onScreenshotMouseDown || onLegacyMouseDown)

    // Render multiple screenshots if available
    if (screen.screenshots && screen.screenshots.length > 0) {
      return screen.screenshots.map((screenshot) => (
        <img
          key={screenshot.id}
          src={screenshot.url}
          alt={`Screenshot ${screenshot.id}`}
          className={`w-full h-full object-cover absolute ${isInteractive ? 'cursor-move' : ''}`}
          style={{
            transform: `translate(${screenshot.position.x}%, ${screenshot.position.y}%) scale(${screenshot.position.scale / 100}) rotate(${screenshot.position.rotation}deg)`,
            opacity: screenshot.opacity / 100,
            zIndex: screenshot.zIndex
          }}
          onMouseDown={isInteractive && onScreenshotMouseDown ? (e) => onScreenshotMouseDown(screenshot.id, e) : undefined}
        />
      ))
    }

    // Fallback for legacy single screenshot
    if (screen.screenshot) {
      return (
        <img
          src={screen.screenshot}
          alt="Preview"
          className={`w-full h-full object-cover absolute ${isInteractive && onLegacyMouseDown ? 'cursor-move' : ''}`}
          style={{
            transform: `translate(${(screen.position?.x ?? 0)}%, ${(screen.position?.y ?? 0)}%) scale(${(screen.position?.scale ?? 100) / 100}) rotate(${screen.position?.rotation ?? 0}deg)`,
            opacity: (screen.opacity?.screenshot ?? 100) / 100,
            zIndex: (screen.layerOrder === 'front') ? 20 : 0
          }}
          onMouseDown={isInteractive ? onLegacyMouseDown : undefined}
        />
      )
    }

    // Empty state
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Image className="mx-auto mb-2" style={{ width: `${48 * scale}px`, height: `${48 * scale}px` }} />
          <p style={{ fontSize: `${14 * scale}px` }}>Upload screenshots</p>
        </div>
      </div>
    )
  }

  const renderImageAssets = () => {
    if (!screen.imageAssets || screen.imageAssets.length === 0) return null
    const isInteractive = Boolean(onAssetMouseDown)

    return screen.imageAssets.map((asset) => (
      <img
        key={asset.id}
        src={asset.url}
        alt={`Asset ${asset.id}`}
        className={`absolute ${isInteractive ? 'cursor-move' : ''}`}
        style={{
          left: `${asset.position.x * scale}px`,
          top: `${asset.position.y * scale}px`,
          width: `${asset.size.width * scale}px`,
          height: `${asset.size.height * scale}px`,
          transform: `rotate(${asset.rotation}deg)`,
          opacity: asset.opacity / 100,
          zIndex: asset.zIndex
        }}
        onMouseDown={isInteractive && onAssetMouseDown ? (e) => onAssetMouseDown(asset.id, e) : undefined}
      />
    ))
  }

  const content = (
    <div style={contentStyle} className={showDeviceFrame ? "rounded-[2.5rem]" : ""}>
      {/* Render back layer text */}
      {renderTextOverlay('front')}

      {/* Render screenshots */}
      {renderScreenshots()}

      {/* Render image assets */}
      {renderImageAssets()}

      {/* Render front layer text */}
      {renderTextOverlay('back')}
    </div>
  )

  if (!showDeviceFrame) {
    return content
  }

  return (
    <div
      id="device-mockup"
      className={`bg-black rounded-[3rem] p-2 shadow-2xl transition-transform duration-300 ${className}`}
      style={frameStyle}
    >
      {content}
    </div>
  )
}