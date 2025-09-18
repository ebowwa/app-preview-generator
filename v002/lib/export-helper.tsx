import html2canvas from 'html2canvas'
import type { Screen, DeviceType } from '@/types/preview-generator'
import { deviceSizes } from '@/types/preview-generator'

export async function exportPreviewAsImage(
  screen: Screen,
  deviceType: DeviceType,
  screenIndex: number
): Promise<void> {
  const deviceSize = deviceSizes[deviceType]
  const targetWidth = deviceSize.width
  const targetHeight = deviceSize.height

  // Create a temporary container off-screen
  const tempContainer = document.createElement('div')
  tempContainer.style.position = 'fixed'
  tempContainer.style.left = '-99999px'
  tempContainer.style.top = '0'
  tempContainer.style.zIndex = '99999'

  document.body.appendChild(tempContainer)

  // Calculate scale factor for the device mockup
  // Device mockup is 300x650, we need to scale it to fit target dimensions
  const deviceWidth = 300
  const deviceHeight = 650
  const scaleX = targetWidth / deviceWidth
  const scaleY = targetHeight / deviceHeight
  const scale = Math.min(scaleX, scaleY) // Use min to fit within bounds

  // Calculate actual device dimensions after scaling
  const scaledDeviceWidth = deviceWidth * scale
  const scaledDeviceHeight = deviceHeight * scale

  // Create device mockup container at scaled size
  const deviceContainer = document.createElement('div')
  deviceContainer.style.width = `${scaledDeviceWidth}px`
  deviceContainer.style.height = `${scaledDeviceHeight}px`
  deviceContainer.style.position = 'relative'

  tempContainer.appendChild(deviceContainer)

  // Build the device mockup structure
  const deviceMockup = document.createElement('div')
  deviceMockup.className = 'bg-black rounded-[3rem] p-2 shadow-2xl'
  deviceMockup.style.cssText = `
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: #000000;
    border-radius: ${48 * scale}px;
    padding: ${8 * scale}px;
  `

  deviceContainer.appendChild(deviceMockup)

  // Create content container
  const contentContainer = document.createElement('div')
  contentContainer.className = 'w-full h-full relative overflow-hidden'
  contentContainer.style.cssText = `
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: ${40 * scale}px;
  `

  // Apply background style
  if (screen.bgStyle === 'gradient') {
    contentContainer.style.background = `linear-gradient(135deg, ${screen.primaryColor || '#4F46E5'} 0%, ${screen.secondaryColor || '#7C3AED'} 100%)`
  } else if (screen.bgStyle === 'pattern') {
    const patternColor = (screen.primaryColor || '#4F46E5').replace('#', '%23')
    contentContainer.style.backgroundColor = screen.bgColor || '#F3F4F6'
    contentContainer.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${patternColor}' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  } else {
    contentContainer.style.backgroundColor = screen.bgColor || '#F3F4F6'
  }

  deviceMockup.appendChild(contentContainer)

  // Helper function to add text overlay
  const addTextOverlay = (layerOrder: 'front' | 'back') => {
    if (screen.layerOrder !== layerOrder) return
    if (!screen.title && !screen.subtitle && !screen.description) return

    if (screen.overlayStyle !== 'none') {
      const overlayBg = document.createElement('div')
      overlayBg.style.cssText = `
        position: absolute;
        left: 0;
        right: 0;
        padding: ${6 * scale}px;
        background: ${screen.overlayStyle === 'gradient'
          ? `linear-gradient(to ${screen.textPosition === 'top' ? 'bottom' : 'top'}, rgba(0,0,0,0.8), transparent)`
          : screen.overlayStyle === 'minimal' ? 'rgba(255,255,255,0.9)'
          : screen.overlayStyle === 'bold' ? 'rgba(0,0,0,0.95)'
          : 'rgba(0,0,0,0.8)'};
        opacity: ${(screen.opacity?.overlay ?? 90) / 100};
        height: ${screen.textPosition === 'center' ? 120 * scale : 80 * scale}px;
        z-index: ${layerOrder === 'front' ? 5 : 25};
        ${screen.textPosition === 'top' ? 'top: 0;' :
          screen.textPosition === 'center' ? 'top: 50%; transform: translateY(-50%);' :
          'bottom: 0;'}
      `
      contentContainer.appendChild(overlayBg)
    }

    const textContainer = document.createElement('div')
    textContainer.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      padding: ${6 * scale}px;
      color: ${screen.overlayStyle === 'minimal' ? '#000' : '#fff'};
      transform: translate(${(screen.textOverlayPosition?.x ?? 0) * scale}px, ${(screen.textOverlayPosition?.y ?? 0) * scale}px);
      z-index: ${layerOrder === 'front' ? 10 : 30};
      ${screen.textPosition === 'top' ? 'top: 0;' :
        screen.textPosition === 'center' ? 'top: 50%; transform: translateY(-50%);' :
        'bottom: 0;'}
    `

    if (screen.title) {
      const title = document.createElement('h2')
      title.style.cssText = `font-size: ${24 * scale}px; font-weight: bold; margin: 0; line-height: ${28 * scale}px;`
      title.textContent = screen.title
      textContainer.appendChild(title)
    }

    if (screen.subtitle) {
      const subtitle = document.createElement('p')
      subtitle.style.cssText = `font-size: ${14 * scale}px; opacity: 0.9; margin: ${4 * scale}px 0 0 0; line-height: ${18 * scale}px;`
      subtitle.textContent = screen.subtitle
      textContainer.appendChild(subtitle)
    }

    if (screen.description) {
      const desc = document.createElement('p')
      desc.style.cssText = `font-size: ${12 * scale}px; opacity: 0.8; margin: ${8 * scale}px 0 0 0; line-height: ${16 * scale}px;`
      desc.textContent = screen.description
      textContainer.appendChild(desc)
    }

    contentContainer.appendChild(textContainer)
  }

  // Add front layer text/overlay
  addTextOverlay('front')

  // Add screenshots
  if (screen.screenshots && screen.screenshots.length > 0) {
    for (const screenshot of screen.screenshots) {
      const img = document.createElement('img')
      img.src = screenshot.url
      img.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: translate(${screenshot.position.x}%, ${screenshot.position.y}%) scale(${screenshot.position.scale / 100}) rotate(${screenshot.position.rotation}deg);
        opacity: ${screenshot.opacity / 100};
        z-index: ${screenshot.zIndex};
      `
      contentContainer.appendChild(img)
    }
  } else if (screen.screenshot) {
    const img = document.createElement('img')
    img.src = screen.screenshot
    img.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: translate(${screen.position?.x ?? 0}%, ${screen.position?.y ?? 0}%) scale(${(screen.position?.scale ?? 100) / 100}) rotate(${screen.position?.rotation ?? 0}deg);
      opacity: ${(screen.opacity?.screenshot ?? 100) / 100};
      z-index: ${screen.layerOrder === 'front' ? 20 : 0};
    `
    contentContainer.appendChild(img)
  }

  // Add image assets
  if (screen.imageAssets && screen.imageAssets.length > 0) {
    for (const asset of screen.imageAssets) {
      const img = document.createElement('img')
      img.src = asset.url
      img.style.cssText = `
        position: absolute;
        left: ${asset.position.x * scale}px;
        top: ${asset.position.y * scale}px;
        width: ${asset.size.width * scale}px;
        height: ${asset.size.height * scale}px;
        transform: rotate(${asset.rotation}deg);
        opacity: ${asset.opacity / 100};
        z-index: ${asset.zIndex};
      `
      contentContainer.appendChild(img)
    }
  }

  // Add back layer text/overlay
  addTextOverlay('back')

  // Wait for all images to load
  const images = contentContainer.querySelectorAll('img')
  await Promise.all(Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve(null)
      } else {
        img.onload = () => resolve(null)
        img.onerror = () => resolve(null)
      }
    })
  }))

  // Add a small delay to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 100))

  // Capture only the device container with transparent background
  const canvas = await html2canvas(deviceContainer, {
    backgroundColor: null,  // Transparent background
    scale: 1,  // We already scaled the content
    useCORS: true,
    logging: false
  })

  // Create final canvas with exact App Store dimensions and white background
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = targetWidth
  finalCanvas.height = targetHeight
  const ctx = finalCanvas.getContext('2d')

  if (ctx) {
    // Fill with white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, targetWidth, targetHeight)

    // Center the device mockup on the canvas
    const offsetX = (targetWidth - scaledDeviceWidth) / 2
    const offsetY = (targetHeight - scaledDeviceHeight) / 2

    // Draw the captured device
    ctx.drawImage(canvas, offsetX, offsetY)
  }

  // Clean up
  document.body.removeChild(tempContainer)

  // Export as JPEG
  finalCanvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `app-preview-${deviceSize.name.replace(/[^a-zA-Z0-9]/g, '-')}-${screenIndex + 1}.jpg`
      link.href = url
      link.click()

      // Clean up the object URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 100)
    }
  }, 'image/jpeg', 1.0)
}