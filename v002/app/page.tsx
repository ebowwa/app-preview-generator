'use client'

import React, { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload, Download, Plus, Image, Type,
  Palette, Move, Save, Grid, RefreshCcw, Layers
} from "lucide-react"
import type { Screen, DeviceType, ImageAsset, Screenshot } from '@/types/preview-generator'
import { deviceSizes } from '@/types/preview-generator'

export default function Home() {
  const [screens, setScreens] = useState<Screen[]>([{
    id: '1',
    screenshot: null,
    title: '',
    subtitle: '',
    description: '',
    overlayStyle: 'gradient',
    textPosition: 'bottom',
    devicePosition: 'center',
    bgStyle: 'gradient',
    layoutStyle: 'standard',
    position: {
      x: 0,
      y: 0,
      scale: 100,
      rotation: 0
    },
    textOverlayPosition: {
      x: 0,
      y: 0
    },
    opacity: {
      screenshot: 100,
      overlay: 90
    },
    primaryColor: '#4F46E5',
    secondaryColor: '#7C3AED',
    bgColor: '#F3F4F6',
    layerOrder: 'front',
    imageAssets: [],
    screenshots: []
  }])

  const [currentScreen, setCurrentScreen] = useState(0)
  const [deviceType, setDeviceType] = useState<DeviceType>('iphone-69')
  const [showGrid, setShowGrid] = useState(false)
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 50,
    initialY: 50
  })
  const [textDragState, setTextDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  })
  const [assetDragState, setAssetDragState] = useState<{
    isDragging: boolean
    assetId: string | null
    startX: number
    startY: number
    initialX: number
    initialY: number
  }>({
    isDragging: false,
    assetId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const assetInputRef = useRef<HTMLInputElement>(null)
  const presetInputRef = useRef<HTMLInputElement>(null)

  // Auto-load saved project on mount (disabled by default)
  // Uncomment and update the URL to enable auto-loading
  // useEffect(() => {
  //   const loadSavedProject = async () => {
  //     try {
  //       const response = await fetch('/your-project.json')
  //       if (response.ok) {
  //         const data = await response.json()
  //         if (data.screens && data.screens.length > 0) {
  //           const mappedScreens = data.screens.map((screen: any, index: number) => ({
  //             id: String(index + 1),
  //             screenshot: screen.screenshot || null,
  //             title: screen.overlayTitle || screen.title || '',
  //             subtitle: screen.overlaySubtitle || screen.subtitle || '',
  //             description: screen.overlayDescription || screen.description || '',
  //             overlayStyle: screen.overlayStyle || 'gradient',
  //             textPosition: screen.textPosition || 'bottom',
  //             devicePosition: screen.devicePosition || 'center',
  //             bgStyle: screen.bgStyle || 'gradient',
  //             layoutStyle: screen.layoutStyle || 'standard',
  //             position: {
  //               x: screen.imagePosition?.x ?? screen.position?.x ?? 0,
  //               y: screen.imagePosition?.y ?? screen.position?.y ?? 0,
  //               scale: screen.imagePosition?.scale ?? screen.position?.scale ?? 100,
  //               rotation: screen.imagePosition?.rotation ?? screen.position?.rotation ?? 0
  //             },
  //             opacity: {
  //               screenshot: screen.screenshotOpacity ?? screen.opacity?.screenshot ?? 100,
  //               overlay: screen.overlayOpacity ?? screen.opacity?.overlay ?? 90
  //             },
  //             primaryColor: screen.primaryColor || '#4F46E5',
  //             secondaryColor: screen.secondaryColor || '#7C3AED',
  //             bgColor: screen.bgColor || '#F3F4F6',
  //             layerOrder: screen.layerOrder || 'front'
  //           }))
  //           setScreens(mappedScreens)
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error loading project:', error)
  //     }
  //   }
  //   loadSavedProject()
  // }, [])

  // Screenshot Drag handlers (for multiple screenshots)
  const [screenshotDragState, setScreenshotDragState] = useState<{
    isDragging: boolean
    screenshotId: string | null
    startX: number
    startY: number
    initialX: number
    initialY: number
  }>({
    isDragging: false,
    screenshotId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  })

  const handleScreenshotMouseDown = (screenshotId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const screenshot = screen.screenshots.find(s => s.id === screenshotId)
    if (!screenshot) return

    setScreenshotDragState({
      isDragging: true,
      screenshotId: screenshotId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: screenshot.position.x,
      initialY: screenshot.position.y
    })
  }

  // Legacy single screenshot drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const currentPos = screens[currentScreen].position || { x: 0, y: 0, scale: 100, rotation: 0 }

    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y
    })
  }

  // Text Drag handlers
  const handleTextMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent image drag when dragging text
    const currentPos = screens[currentScreen].textOverlayPosition || { x: 0, y: 0 }

    setTextDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y
    })
  }

  // Asset Drag handlers
  const handleAssetMouseDown = (assetId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const asset = screen.imageAssets.find(a => a.id === assetId)
    if (!asset) return

    setAssetDragState({
      isDragging: true,
      assetId: assetId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: asset.position.x,
      initialY: asset.position.y
    })
  }

  const updateScreen = React.useCallback((updates: Partial<Screen>) => {
    setScreens(prevScreens => {
      const newScreens = [...prevScreens]
      newScreens[currentScreen] = { ...newScreens[currentScreen], ...updates }
      return newScreens
    })
  }, [currentScreen])

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return

    // Calculate movement delta (divided by 3 for smoother movement)
    const deltaX = (e.clientX - dragState.startX) / 3
    const deltaY = (e.clientY - dragState.startY) / 3

    // Add delta to initial position (like v001)
    const newX = dragState.initialX + deltaX
    const newY = dragState.initialY + deltaY

    setScreens(prevScreens => {
      const newScreens = [...prevScreens]
      const currentPos = newScreens[currentScreen].position || { x: 0, y: 0, scale: 100, rotation: 0 }
      newScreens[currentScreen] = {
        ...newScreens[currentScreen],
        position: {
          ...currentPos,
          x: newX,
          y: newY
        }
      }
      return newScreens
    })
  }, [dragState.isDragging, dragState.startX, dragState.startY, dragState.initialX, dragState.initialY, currentScreen])

  const handleTextMouseMove = React.useCallback((e: MouseEvent) => {
    if (!textDragState.isDragging) return

    // Calculate movement delta (divided by 5 for finer text movement)
    const deltaX = (e.clientX - textDragState.startX) / 5
    const deltaY = (e.clientY - textDragState.startY) / 5

    // Add delta to initial position
    const newX = textDragState.initialX + deltaX
    const newY = textDragState.initialY + deltaY

    setScreens(prevScreens => {
      const newScreens = [...prevScreens]
      newScreens[currentScreen] = {
        ...newScreens[currentScreen],
        textOverlayPosition: {
          x: newX,
          y: newY
        }
      }
      return newScreens
    })
  }, [textDragState.isDragging, textDragState.startX, textDragState.startY, textDragState.initialX, textDragState.initialY, currentScreen])

  const handleMouseUp = React.useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }))
  }, [])

  const handleTextMouseUp = React.useCallback(() => {
    setTextDragState(prev => ({ ...prev, isDragging: false }))
  }, [])

  const handleAssetMouseMove = React.useCallback((e: MouseEvent) => {
    if (!assetDragState.isDragging || !assetDragState.assetId) return

    const deltaX = e.clientX - assetDragState.startX
    const deltaY = e.clientY - assetDragState.startY

    const newX = assetDragState.initialX + deltaX
    const newY = assetDragState.initialY + deltaY

    updateAsset(assetDragState.assetId, {
      position: { x: newX, y: newY }
    })
  }, [assetDragState])

  const handleAssetMouseUp = React.useCallback(() => {
    setAssetDragState(prev => ({ ...prev, isDragging: false, assetId: null }))
  }, [])

  const handleScreenshotMouseMove = React.useCallback((e: MouseEvent) => {
    if (!screenshotDragState.isDragging || !screenshotDragState.screenshotId) return

    const deltaX = (e.clientX - screenshotDragState.startX) / 3
    const deltaY = (e.clientY - screenshotDragState.startY) / 3

    const newX = screenshotDragState.initialX + deltaX
    const newY = screenshotDragState.initialY + deltaY

    setScreens(prevScreens => {
      const newScreens = [...prevScreens]
      const currentScreenData = newScreens[currentScreen]
      const screenshot = currentScreenData.screenshots.find(s => s.id === screenshotDragState.screenshotId)

      if (screenshot) {
        newScreens[currentScreen] = {
          ...currentScreenData,
          screenshots: currentScreenData.screenshots.map(s =>
            s.id === screenshotDragState.screenshotId
              ? { ...s, position: { ...s.position, x: newX, y: newY } }
              : s
          )
        }
      }
      return newScreens
    })
  }, [screenshotDragState, currentScreen])

  const handleScreenshotMouseUp = React.useCallback(() => {
    setScreenshotDragState(prev => ({ ...prev, isDragging: false, screenshotId: null }))
  }, [])

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (textDragState.isDragging) {
      document.addEventListener('mousemove', handleTextMouseMove)
      document.addEventListener('mouseup', handleTextMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleTextMouseMove)
        document.removeEventListener('mouseup', handleTextMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [textDragState.isDragging, handleTextMouseMove, handleTextMouseUp])

  useEffect(() => {
    if (assetDragState.isDragging) {
      document.addEventListener('mousemove', handleAssetMouseMove)
      document.addEventListener('mouseup', handleAssetMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleAssetMouseMove)
        document.removeEventListener('mouseup', handleAssetMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [assetDragState.isDragging, handleAssetMouseMove, handleAssetMouseUp])

  useEffect(() => {
    if (screenshotDragState.isDragging) {
      document.addEventListener('mousemove', handleScreenshotMouseMove)
      document.addEventListener('mouseup', handleScreenshotMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleScreenshotMouseMove)
        document.removeEventListener('mouseup', handleScreenshotMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [screenshotDragState.isDragging, handleScreenshotMouseMove, handleScreenshotMouseUp])

  const screen = screens[currentScreen]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        const newScreenshot: Screenshot = {
          id: `screenshot-${Date.now()}`,
          url: result,
          position: {
            x: 0,
            y: 0,
            scale: 100,
            rotation: 0
          },
          opacity: 100,
          zIndex: screen.screenshots.length
        }
        updateScreen({
          screenshots: [...(screen.screenshots || []), newScreenshot],
          // Also update legacy screenshot field for backward compatibility
          screenshot: result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeScreenshot = (screenshotId: string) => {
    const updatedScreenshots = screen.screenshots.filter(s => s.id !== screenshotId)
    updateScreen({
      screenshots: updatedScreenshots,
      // Clear legacy screenshot if no screenshots left
      screenshot: updatedScreenshots.length > 0 ? updatedScreenshots[0].url : null
    })
  }

  const updateScreenshot = (screenshotId: string, updates: Partial<Screenshot>) => {
    updateScreen({
      screenshots: screen.screenshots.map(s =>
        s.id === screenshotId ? { ...s, ...updates } : s
      )
    })
  }

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        const newAsset: ImageAsset = {
          id: `asset-${Date.now()}`,
          url: result,
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          rotation: 0,
          opacity: 100,
          zIndex: 10
        }
        updateScreen({
          imageAssets: [...(screen.imageAssets || []), newAsset]
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAsset = (assetId: string) => {
    updateScreen({
      imageAssets: screen.imageAssets.filter(asset => asset.id !== assetId)
    })
  }

  const updateAsset = (assetId: string, updates: Partial<ImageAsset>) => {
    updateScreen({
      imageAssets: screen.imageAssets.map(asset =>
        asset.id === assetId ? { ...asset, ...updates } : asset
      )
    })
  }

  const addScreen = () => {
    setScreens([...screens, {
      id: String(screens.length + 1),
      screenshot: null,
      title: '',
      subtitle: '',
      description: '',
      overlayStyle: 'gradient',
      textPosition: 'bottom',
      devicePosition: 'center',
      bgStyle: 'gradient',
      layoutStyle: 'standard',
      position: { x: 0, y: 0, scale: 100, rotation: 0 },
      textOverlayPosition: { x: 0, y: 0 },
      opacity: { screenshot: 100, overlay: 90 },
      primaryColor: '#4F46E5',
      secondaryColor: '#7C3AED',
      bgColor: '#F3F4F6',
      layerOrder: 'front',
      imageAssets: [],
      screenshots: []
    }])
    setCurrentScreen(screens.length)
  }

  const removeScreen = (index: number) => {
    if (screens.length > 1) {
      const newScreens = screens.filter((_, i) => i !== index)
      setScreens(newScreens)
      if (currentScreen >= newScreens.length) {
        setCurrentScreen(newScreens.length - 1)
      }
    }
  }

  const exportCurrentPreview = async () => {
    const element = document.getElementById('device-mockup')
    if (element) {
      const deviceSize = deviceSizes[deviceType]
      const targetWidth = deviceSize.width
      const targetHeight = deviceSize.height

      // Calculate scale to achieve target dimensions
      const rect = element.getBoundingClientRect()
      const scaleX = targetWidth / rect.width
      const scaleY = targetHeight / rect.height
      const scale = Math.max(scaleX, scaleY) // Use max to ensure we cover the full target size

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: scale,
        useCORS: true,
      })

      // Create a new canvas with exact App Store dimensions
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = targetWidth
      finalCanvas.height = targetHeight
      const ctx = finalCanvas.getContext('2d')

      if (ctx) {
        // Center the captured image on the final canvas
        const offsetX = (targetWidth - canvas.width) / 2
        const offsetY = (targetHeight - canvas.height) / 2
        ctx.drawImage(canvas, offsetX, offsetY)
      }

      const link = document.createElement('a')
      link.download = `app-preview-${deviceSize.name.replace(/[^a-zA-Z0-9]/g, '-')}-${currentScreen + 1}.png`
      link.href = finalCanvas.toDataURL('image/png')
      link.click()
    }
  }

  const exportAllPreviews = async () => {
    for (let i = 0; i < screens.length; i++) {
      setCurrentScreen(i)
      await new Promise(resolve => setTimeout(resolve, 500))
      await exportCurrentPreview()
    }
  }

  const saveProject = () => {
    const data = JSON.stringify({ screens, deviceType }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `app-screenshots-${Date.now()}.json`
    link.href = url
    link.click()
  }

  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.screens) {
            const mappedScreens = data.screens.map((s: any, index: number) => ({
              ...s,
              id: s.id || String(index + 1),
              // Map v001 fields to v002 if needed
              title: s.overlayTitle || s.title || '',
              subtitle: s.overlaySubtitle || s.subtitle || '',
              description: s.overlayDescription || s.description || '',
              position: {
                x: s.imagePosition?.x ?? s.position?.x ?? 0,
                y: s.imagePosition?.y ?? s.position?.y ?? 0,
                scale: s.imagePosition?.scale ?? s.position?.scale ?? 100,
                rotation: s.imagePosition?.rotation ?? s.position?.rotation ?? 0
              },
              textOverlayPosition: s.textOverlayPosition || { x: 0, y: 0 },
              opacity: {
                screenshot: s.screenshotOpacity ?? s.opacity?.screenshot ?? 100,
                overlay: s.overlayOpacity ?? s.opacity?.overlay ?? 90
              },
              layerOrder: s.layerOrder || 'front',
              imageAssets: s.imageAssets || [],
              screenshots: s.screenshots || []
            }))
            setScreens(mappedScreens)
          }
          if (data.deviceType) {
            setDeviceType(data.deviceType)
          }
          setCurrentScreen(0)
        } catch (error) {
          console.error('Error loading project:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const resetPosition = () => {
    updateScreen({
      position: { x: 0, y: 0, scale: 100, rotation: 0 }
    })
  }

  const fitToFrame = () => {
    updateScreen({
      position: { x: 0, y: 0, scale: 85, rotation: 0 }
    })
  }

  const fillFrame = () => {
    updateScreen({
      position: { x: 0, y: 0, scale: 120, rotation: 0 }
    })
  }

  const centerImage = () => {
    updateScreen({
      position: { ...screen.position, x: 0, y: 0 }
    })
  }

  const getDeviceTransform = () => {
    switch (screen.devicePosition) {
      case 'left': return 'translateX(-20px) rotateY(25deg)'
      case 'right': return 'translateX(20px) rotateY(-25deg)'
      case 'angled-left': return 'rotateY(35deg) rotateX(5deg)'
      case 'angled-right': return 'rotateY(-35deg) rotateX(5deg)'
      default: return 'none'
    }
  }

  const getBackgroundStyle = (screenData: Screen) => {
    if (screenData.bgStyle === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${screenData.primaryColor || '#4F46E5'} 0%, ${screenData.secondaryColor || '#7C3AED'} 100%)`
      }
    } else if (screenData.bgStyle === 'pattern') {
      return {
        backgroundColor: screenData.bgColor || '#F3F4F6',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${(screenData.primaryColor || '#4F46E5').slice(1)}' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }
    }
    return { backgroundColor: screenData.bgColor || '#F3F4F6' }
  }


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">App Preview Generator</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowGrid(!showGrid)} variant="outline" size="sm">
              <Grid className="h-4 w-4 mr-2" />
              {showGrid ? 'Hide' : 'Show'} Grid
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {/* Preview Canvas */}
            <Card>
              <CardContent className="p-0">
                <div
                  id="preview-content"
                  className="rounded-lg p-8 min-h-[600px] flex items-center justify-center relative bg-gray-100"
                >
                  {showGrid && (
                    <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border border-white/10" />
                      ))}
                    </div>
                  )}
                  
                  {/* Device Preview */}
                  <div
                    id="device-mockup"
                    className="bg-black rounded-[3rem] p-2 shadow-2xl transition-transform duration-300"
                    style={{
                      transform: getDeviceTransform(),
                      perspective: '1000px',
                      width: '300px',
                      height: '650px'
                    }}
                  >
                    <div
                      className="w-full h-full relative overflow-hidden rounded-[2.5rem]"
                      style={getBackgroundStyle(screen)}
                    >
                      {/* Static Overlay Background (front layer) */}
                      {(screen.layerOrder === 'front') && screen.overlayStyle !== 'none' && (screen.title || screen.subtitle || screen.description) && (
                        <div
                          className={`absolute left-0 right-0 z-5 pointer-events-none ${
                            screen.textPosition === 'top' ? 'top-0' :
                            screen.textPosition === 'center' ? 'top-1/2 -translate-y-1/2' :
                            'bottom-0'
                          }`}
                          style={{
                            padding: '6px',
                            background: screen.overlayStyle === 'gradient'
                              ? `linear-gradient(to ${screen.textPosition === 'top' ? 'bottom' : 'top'}, rgba(0,0,0,0.8), transparent)`
                              : screen.overlayStyle === 'minimal' ? 'rgba(255,255,255,0.9)'
                              : screen.overlayStyle === 'bold' ? 'rgba(0,0,0,0.95)'
                              : 'rgba(0,0,0,0.8)',
                            opacity: (screen.opacity?.overlay ?? 90) / 100,
                            height: screen.textPosition === 'center' ? '120px' : '80px'
                          }}
                        />
                      )}

                      {/* Draggable Text Content (front layer) */}
                      {(screen.layerOrder === 'front') && (screen.title || screen.subtitle || screen.description) && (
                        <div
                          className={`absolute left-0 right-0 text-white z-10 cursor-move ${
                            screen.textPosition === 'top' ? 'top-0' :
                            screen.textPosition === 'center' ? 'top-1/2 -translate-y-1/2' :
                            'bottom-0'
                          }`}
                          style={{
                            padding: '6px',
                            color: screen.overlayStyle === 'minimal' ? '#000' : '#fff',
                            transform: `translate(${(screen.textOverlayPosition?.x ?? 0)}px, ${(screen.textOverlayPosition?.y ?? 0)}px)`
                          }}
                          onMouseDown={handleTextMouseDown}
                        >
                          {screen.title && (
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{screen.title}</h2>
                          )}
                          {screen.subtitle && (
                            <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0' }}>{screen.subtitle}</p>
                          )}
                          {screen.description && (
                            <p style={{ fontSize: '12px', opacity: 0.8, margin: '8px 0 0 0' }}>{screen.description}</p>
                          )}
                        </div>
                      )}

                      {/* Multiple Screenshots */}
                      {screen.screenshots && screen.screenshots.length > 0 ? (
                        screen.screenshots.map((screenshot) => (
                          <img
                            key={screenshot.id}
                            src={screenshot.url}
                            alt={`Screenshot ${screenshot.id}`}
                            className="w-full h-full object-cover absolute cursor-move"
                            style={{
                              transform: `translate(${screenshot.position.x}%, ${screenshot.position.y}%) scale(${screenshot.position.scale / 100}) rotate(${screenshot.position.rotation}deg)`,
                              opacity: screenshot.opacity / 100,
                              zIndex: screenshot.zIndex
                            }}
                            onMouseDown={(e) => handleScreenshotMouseDown(screenshot.id, e)}
                          />
                        ))
                      ) : screen.screenshot ? (
                        // Fallback for legacy single screenshot
                        <img
                          src={screen.screenshot}
                          alt="Preview"
                          className="w-full h-full object-cover absolute cursor-move"
                          style={{
                            transform: `translate(${(screen.position?.x ?? 0)}%, ${(screen.position?.y ?? 0)}%) scale(${(screen.position?.scale ?? 100) / 100}) rotate(${screen.position?.rotation ?? 0}deg)`,
                            opacity: (screen.opacity?.screenshot ?? 100) / 100,
                            zIndex: (screen.layerOrder === 'front') ? 20 : 0
                          }}
                          onMouseDown={handleMouseDown}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <Image className="mx-auto mb-2 h-12 w-12" />
                            <p>Upload screenshots</p>
                          </div>
                        </div>
                      )}

                      {/* Additional Image Assets */}
                      {screen.imageAssets && screen.imageAssets.map((asset) => (
                        <img
                          key={asset.id}
                          src={asset.url}
                          alt={`Asset ${asset.id}`}
                          className="absolute cursor-move"
                          style={{
                            left: `${asset.position.x}px`,
                            top: `${asset.position.y}px`,
                            width: `${asset.size.width}px`,
                            height: `${asset.size.height}px`,
                            transform: `rotate(${asset.rotation}deg)`,
                            opacity: asset.opacity / 100,
                            zIndex: asset.zIndex
                          }}
                          onMouseDown={(e) => handleAssetMouseDown(asset.id, e)}
                        />
                      ))}

                      {/* Static Overlay Background (back layer) */}
                      {(screen.layerOrder === 'back') && screen.overlayStyle !== 'none' && (screen.title || screen.subtitle || screen.description) && (
                        <div
                          className={`absolute left-0 right-0 z-25 pointer-events-none ${
                            screen.textPosition === 'top' ? 'top-0' :
                            screen.textPosition === 'center' ? 'top-1/2 -translate-y-1/2' :
                            'bottom-0'
                          }`}
                          style={{
                            padding: '6px',
                            background: screen.overlayStyle === 'gradient'
                              ? `linear-gradient(to ${screen.textPosition === 'top' ? 'bottom' : 'top'}, rgba(0,0,0,0.8), transparent)`
                              : screen.overlayStyle === 'minimal' ? 'rgba(255,255,255,0.9)'
                              : screen.overlayStyle === 'bold' ? 'rgba(0,0,0,0.95)'
                              : 'rgba(0,0,0,0.8)',
                            opacity: (screen.opacity?.overlay ?? 90) / 100,
                            height: screen.textPosition === 'center' ? '120px' : '80px'
                          }}
                        />
                      )}

                      {/* Draggable Text Content (back layer) */}
                      {(screen.layerOrder === 'back') && (screen.title || screen.subtitle || screen.description) && (
                        <div
                          className={`absolute left-0 right-0 text-white z-30 cursor-move ${
                            screen.textPosition === 'top' ? 'top-0' :
                            screen.textPosition === 'center' ? 'top-1/2 -translate-y-1/2' :
                            'bottom-0'
                          }`}
                          style={{
                            padding: '6px',
                            color: screen.overlayStyle === 'minimal' ? '#000' : '#fff',
                            transform: `translate(${(screen.textOverlayPosition?.x ?? 0)}px, ${(screen.textOverlayPosition?.y ?? 0)}px)`
                          }}
                          onMouseDown={handleTextMouseDown}
                        >
                          {screen.title && (
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{screen.title}</h2>
                          )}
                          {screen.subtitle && (
                            <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0' }}>{screen.subtitle}</p>
                          )}
                          {screen.description && (
                            <p style={{ fontSize: '12px', opacity: 0.8, margin: '8px 0 0 0' }}>{screen.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screen Selector with Thumbnails */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Screens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {screens.map((screenItem, index) => (
                    <div key={index} className="relative group">
                      <div
                        className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
                          currentScreen === index 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setCurrentScreen(index)}
                      >
                        {/* Thumbnail Preview */}
                        <div className="flex items-center justify-center">
                          {/* Thumbnail Device Preview */}
                          <div
                            className="bg-black rounded-lg p-0.5 shadow-lg"
                            style={{
                              width: '60px',
                              height: '130px'
                            }}
                          >
                            <div
                              className="w-full h-full relative overflow-hidden rounded-md"
                              style={getBackgroundStyle(screenItem)}
                            >
                              {/* Thumbnail Overlay */}
                              {screenItem.overlayStyle !== 'none' && (screenItem.title || screenItem.subtitle || screenItem.description) && (
                                <div
                                  className={`absolute left-0 right-0 text-white z-10 ${
                                    screenItem.textPosition === 'top' ? 'top-0' :
                                    screenItem.textPosition === 'center' ? 'top-1/2 -translate-y-1/2' :
                                    'bottom-0'
                                  }`}
                                  style={{
                                    padding: '1px',
                                    background: screenItem.overlayStyle === 'gradient'
                                      ? `linear-gradient(to ${screenItem.textPosition === 'top' ? 'bottom' : 'top'}, rgba(0,0,0,0.8), transparent)`
                                      : screenItem.overlayStyle === 'minimal' ? 'rgba(255,255,255,0.9)'
                                      : screenItem.overlayStyle === 'bold' ? 'rgba(0,0,0,0.95)'
                                      : 'rgba(0,0,0,0.8)',
                                    opacity: (screenItem.opacity?.overlay ?? 90) / 100,
                                    color: screenItem.overlayStyle === 'minimal' ? '#000' : '#fff'
                                  }}
                                >
                                  {screenItem.title && (
                                    <div style={{ fontSize: '4px', fontWeight: 'bold', lineHeight: '5px' }}>{screenItem.title}</div>
                                  )}
                                  {screenItem.subtitle && (
                                    <div style={{ fontSize: '3px', opacity: 0.9, lineHeight: '4px' }}>{screenItem.subtitle}</div>
                                  )}
                                  {screenItem.description && (
                                    <div style={{ fontSize: '2px', opacity: 0.8, lineHeight: '3px' }}>{screenItem.description}</div>
                                  )}
                                </div>
                              )}

                              {/* Thumbnail Screenshot */}
                              {screenItem.screenshot ? (
                                <img
                                  src={screenItem.screenshot}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover absolute"
                                  style={{
                                    transform: `translate(${(screenItem.position?.x ?? 0)}%, ${(screenItem.position?.y ?? 0)}%) scale(${(screenItem.position?.scale ?? 100) / 100}) rotate(${screenItem.position?.rotation ?? 0}deg)`,
                                    opacity: (screenItem.opacity?.screenshot ?? 100) / 100,
                                    zIndex: (screenItem.layerOrder === 'front') ? 20 : 0
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                  <Image style={{ width: '12px', height: '12px' }} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Screen Label */}
                        <div className="text-center mt-2">
                          <span className="text-xs font-medium">Screen {index + 1}</span>
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      {screens.length > 1 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeScreen(index)
                          }}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Screen Button */}
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={addScreen}
                  >
                    <div className="aspect-[9/19.5] flex items-center justify-center">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500">Add Screen</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Controls */}
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="position">Position</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Screenshots</Label>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Add Screenshot
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {/* List of screenshots */}
                      {screen.screenshots && screen.screenshots.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {screen.screenshots.map((screenshot, index) => (
                            <div key={screenshot.id} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Screenshot {index + 1}</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 w-6 p-0"
                                  onClick={() => removeScreenshot(screenshot.id)}
                                >
                                  ×
                                </Button>
                              </div>

                              {/* Position controls */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs w-12">X:</Label>
                                  <Slider
                                    min={-50}
                                    max={50}
                                    value={[screenshot.position.x]}
                                    onValueChange={(value) => updateScreenshot(screenshot.id, {
                                      position: { ...screenshot.position, x: value[0] }
                                    })}
                                    className="flex-1"
                                  />
                                  <span className="text-xs w-12">{screenshot.position.x}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs w-12">Y:</Label>
                                  <Slider
                                    min={-50}
                                    max={50}
                                    value={[screenshot.position.y]}
                                    onValueChange={(value) => updateScreenshot(screenshot.id, {
                                      position: { ...screenshot.position, y: value[0] }
                                    })}
                                    className="flex-1"
                                  />
                                  <span className="text-xs w-12">{screenshot.position.y}%</span>
                                </div>
                              </div>

                              {/* Scale control */}
                              <div className="flex items-center gap-2">
                                <Label className="text-xs w-12">Scale:</Label>
                                <Slider
                                  min={50}
                                  max={200}
                                  value={[screenshot.position.scale]}
                                  onValueChange={(value) => updateScreenshot(screenshot.id, {
                                    position: { ...screenshot.position, scale: value[0] }
                                  })}
                                  className="flex-1"
                                />
                                <span className="text-xs w-12">{screenshot.position.scale}%</span>
                              </div>

                              {/* Opacity control */}
                              <div className="flex items-center gap-2">
                                <Label className="text-xs w-12">Opacity:</Label>
                                <Slider
                                  min={0}
                                  max={100}
                                  value={[screenshot.opacity]}
                                  onValueChange={(value) => updateScreenshot(screenshot.id, {
                                    opacity: value[0]
                                  })}
                                  className="flex-1"
                                />
                                <span className="text-xs w-12">{screenshot.opacity}%</span>
                              </div>

                              {/* Layer control */}
                              <div className="flex items-center gap-2">
                                <Label className="text-xs w-12">Layer:</Label>
                                <Slider
                                  min={0}
                                  max={50}
                                  value={[screenshot.zIndex]}
                                  onValueChange={(value) => updateScreenshot(screenshot.id, {
                                    zIndex: value[0]
                                  })}
                                  className="flex-1"
                                />
                                <span className="text-xs w-12">{screenshot.zIndex}</span>
                              </div>

                              {/* Rotation control */}
                              <div className="flex items-center gap-2">
                                <Label className="text-xs w-12">Rotate:</Label>
                                <Slider
                                  min={-180}
                                  max={180}
                                  value={[screenshot.position.rotation]}
                                  onValueChange={(value) => updateScreenshot(screenshot.id, {
                                    position: { ...screenshot.position, rotation: value[0] }
                                  })}
                                  className="flex-1"
                                />
                                <span className="text-xs w-12">{screenshot.position.rotation}°</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Image Assets</Label>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => assetInputRef.current?.click()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image Asset
                      </Button>
                      <input
                        ref={assetInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAssetUpload}
                        className="hidden"
                      />

                      {/* List of image assets */}
                      {screen.imageAssets && screen.imageAssets.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {screen.imageAssets.map((asset, index) => (
                            <div key={asset.id} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Asset {index + 1}</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 w-6 p-0"
                                  onClick={() => removeAsset(asset.id)}
                                >
                                  ×
                                </Button>
                              </div>

                              {/* Size controls */}
                              <div className="flex items-center gap-2">
                                <Label className="text-xs w-12">Size:</Label>
                                <Input
                                  type="number"
                                  value={asset.size.width}
                                  onChange={(e) => updateAsset(asset.id, {
                                    size: { ...asset.size, width: Number(e.target.value) }
                                  })}
                                  className="w-16 h-7 text-xs"
                                  placeholder="W"
                                />
                                <span className="text-xs">×</span>
                                <Input
                                  type="number"
                                  value={asset.size.height}
                                  onChange={(e) => updateAsset(asset.id, {
                                    size: { ...asset.size, height: Number(e.target.value) }
                                  })}
                                  className="w-16 h-7 text-xs"
                                  placeholder="H"
                                />
                              </div>

                              {/* Position controls */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs w-12">X:</Label>
                                  <Slider
                                    min={-200}
                                    max={500}
                                    value={[asset.position.x]}
                                    onValueChange={(value) => updateAsset(asset.id, {
                                      position: { ...asset.position, x: value[0] }
                                    })}
                                    className="flex-1"
                                  />
                                  <span className="text-xs w-12">{asset.position.x}px</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs w-12">Y:</Label>
                                  <Slider
                                    min={-200}
                                    max={800}
                                    value={[asset.position.y]}
                                    onValueChange={(value) => updateAsset(asset.id, {
                                      position: { ...asset.position, y: value[0] }
                                    })}
                                    className="flex-1"
                                  />
                                  <span className="text-xs w-12">{asset.position.y}px</span>
                                </div>
                              </div>

                              {/* Opacity control */}
                              <div className="flex items-center gap-2">
                                <Label className="text-xs w-12">Opacity:</Label>
                                <Slider
                                  min={0}
                                  max={100}
                                  value={[asset.opacity]}
                                  onValueChange={(value) => updateAsset(asset.id, {
                                    opacity: value[0]
                                  })}
                                  className="flex-1"
                                />
                                <span className="text-xs w-12">{asset.opacity}%</span>
                              </div>

                              {/* Layer control */}
                              <div className="flex items-center gap-2">
                                <Label className="text-xs w-12">Layer:</Label>
                                <Slider
                                  min={0}
                                  max={100}
                                  value={[asset.zIndex]}
                                  onValueChange={(value) => updateAsset(asset.id, {
                                    zIndex: value[0]
                                  })}
                                  className="flex-1"
                                />
                                <span className="text-xs w-12">{asset.zIndex}</span>
                              </div>

                              {/* Rotation control */}
                              <div className="flex items-center gap-2">
                                <Label className="text-xs w-12">Rotate:</Label>
                                <Slider
                                  min={-180}
                                  max={180}
                                  value={[asset.rotation]}
                                  onValueChange={(value) => updateAsset(asset.id, {
                                    rotation: value[0]
                                  })}
                                  className="flex-1"
                                />
                                <span className="text-xs w-12">{asset.rotation}°</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={screen.title}
                        onChange={(e) => updateScreen({ title: e.target.value })}
                        placeholder="Enter title text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={screen.subtitle}
                        onChange={(e) => updateScreen({ subtitle: e.target.value })}
                        placeholder="Enter subtitle text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={screen.description}
                        onChange={(e) => updateScreen({ description: e.target.value })}
                        placeholder="Enter description text"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text Position</Label>
                      <RadioGroup 
                        value={screen.textPosition} 
                        onValueChange={(value: 'top' | 'center' | 'bottom') => 
                          updateScreen({ textPosition: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="top" id="text-top" />
                          <Label htmlFor="text-top">Top</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="center" id="text-center" />
                          <Label htmlFor="text-center">Center</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottom" id="text-bottom" />
                          <Label htmlFor="text-bottom">Bottom</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Overlay Style</Label>
                      <RadioGroup 
                        value={screen.overlayStyle} 
                        onValueChange={(value: Screen['overlayStyle']) => 
                          updateScreen({ overlayStyle: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="overlay-none" />
                          <Label htmlFor="overlay-none">No Overlay</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gradient" id="overlay-gradient" />
                          <Label htmlFor="overlay-gradient">Gradient</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="minimal" id="overlay-minimal" />
                          <Label htmlFor="overlay-minimal">Minimal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bold" id="overlay-bold" />
                          <Label htmlFor="overlay-bold">Bold</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="overlay-dark" />
                          <Label htmlFor="overlay-dark">Dark</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="style">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Visual Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Background Style</Label>
                      <RadioGroup 
                        value={screen.bgStyle} 
                        onValueChange={(value: 'solid' | 'gradient' | 'pattern') => 
                          updateScreen({ bgStyle: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="solid" id="bg-solid" />
                          <Label htmlFor="bg-solid">Solid Color</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gradient" id="bg-gradient" />
                          <Label htmlFor="bg-gradient">Gradient</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pattern" id="bg-pattern" />
                          <Label htmlFor="bg-pattern">Pattern</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {screen.bgStyle === 'gradient' && (
                      <>
                        <div>
                          <Label htmlFor="primary-color">Primary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="primary-color"
                              type="color"
                              value={screen.primaryColor}
                              onChange={(e) => updateScreen({ primaryColor: e.target.value })}
                              className="w-16 h-10"
                            />
                            <Input
                              value={screen.primaryColor}
                              onChange={(e) => updateScreen({ primaryColor: e.target.value })}
                              placeholder="#4F46E5"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondary-color">Secondary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="secondary-color"
                              type="color"
                              value={screen.secondaryColor}
                              onChange={(e) => updateScreen({ secondaryColor: e.target.value })}
                              className="w-16 h-10"
                            />
                            <Input
                              value={screen.secondaryColor}
                              onChange={(e) => updateScreen({ secondaryColor: e.target.value })}
                              placeholder="#7C3AED"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {(screen.bgStyle === 'solid' || screen.bgStyle === 'pattern') && (
                      <div>
                        <Label htmlFor="bg-color">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="bg-color"
                            type="color"
                            value={screen.bgColor}
                            onChange={(e) => updateScreen({ bgColor: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={screen.bgColor}
                            onChange={(e) => updateScreen({ bgColor: e.target.value })}
                            placeholder="#F3F4F6"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Device Position</Label>
                      <RadioGroup 
                        value={screen.devicePosition} 
                        onValueChange={(value: Screen['devicePosition']) => 
                          updateScreen({ devicePosition: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="center" id="device-center" />
                          <Label htmlFor="device-center">Center</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="left" id="device-left" />
                          <Label htmlFor="device-left">Tilted Left</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="right" id="device-right" />
                          <Label htmlFor="device-right">Tilted Right</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="angled-left" id="device-angled-left" />
                          <Label htmlFor="device-angled-left">Angled Left</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="angled-right" id="device-angled-right" />
                          <Label htmlFor="device-angled-right">Angled Right</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Layer Order</Label>
                      <RadioGroup 
                        value={screen.layerOrder || 'front'} 
                        onValueChange={(value: 'front' | 'back') => 
                          updateScreen({ layerOrder: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="front" id="layer-front" />
                          <Label htmlFor="layer-front">Screenshot in Front</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="back" id="layer-back" />
                          <Label htmlFor="layer-back">Screenshot Behind Text</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="overlay-opacity">Overlay Opacity: {screen.opacity?.overlay ?? 90}%</Label>
                      <Slider
                        id="overlay-opacity"
                        min={0}
                        max={100}
                        value={[screen.opacity?.overlay ?? 90]}
                        onValueChange={(value) => updateScreen({ 
                          opacity: { ...screen.opacity, overlay: value[0] }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="position">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Move className="h-5 w-5" />
                      Screenshot Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={resetPosition} variant="outline" size="sm">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button onClick={fitToFrame} variant="outline" size="sm">
                        Fit to Frame
                      </Button>
                      <Button onClick={fillFrame} variant="outline" size="sm">
                        Fill Frame
                      </Button>
                      <Button onClick={centerImage} variant="outline" size="sm">
                        Center
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="x-position">X Position: {screen.position?.x ?? 0}%</Label>
                      <Slider
                        id="x-position"
                        min={-50}
                        max={50}
                        value={[screen.position?.x ?? 0]}
                        onValueChange={(value) => updateScreen({ 
                          position: { ...screen.position, x: value[0] }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="y-position">Y Position: {screen.position?.y ?? 0}%</Label>
                      <Slider
                        id="y-position"
                        min={-50}
                        max={50}
                        value={[screen.position?.y ?? 0]}
                        onValueChange={(value) => updateScreen({ 
                          position: { ...screen.position, y: value[0] }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="scale">Scale: {screen.position?.scale ?? 100}%</Label>
                      <Slider
                        id="scale"
                        min={50}
                        max={200}
                        value={[screen.position?.scale ?? 100]}
                        onValueChange={(value) => updateScreen({ 
                          position: { ...screen.position, scale: value[0] }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="rotation">Rotation: {screen.position?.rotation ?? 0}°</Label>
                      <Slider
                        id="rotation"
                        min={-180}
                        max={180}
                        value={[screen.position?.rotation ?? 0]}
                        onValueChange={(value) => updateScreen({ 
                          position: { ...screen.position, rotation: value[0] }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="screenshot-opacity">Screenshot Opacity: {screen.opacity?.screenshot ?? 100}%</Label>
                      <Slider
                        id="screenshot-opacity"
                        min={0}
                        max={100}
                        value={[screen.opacity?.screenshot ?? 100]}
                        onValueChange={(value) => updateScreen({
                          opacity: { ...screen.opacity, screenshot: value[0] }
                        })}
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Text Position
                      </Label>

                      <div>
                        <Label htmlFor="text-x-position">Text X Position: {screen.textOverlayPosition?.x ?? 0}px</Label>
                        <Slider
                          id="text-x-position"
                          min={-100}
                          max={100}
                          value={[screen.textOverlayPosition?.x ?? 0]}
                          onValueChange={(value) => updateScreen({
                            textOverlayPosition: { ...screen.textOverlayPosition, x: value[0], y: screen.textOverlayPosition?.y ?? 0 }
                          })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="text-y-position">Text Y Position: {screen.textOverlayPosition?.y ?? 0}px</Label>
                        <Slider
                          id="text-y-position"
                          min={-100}
                          max={100}
                          value={[screen.textOverlayPosition?.y ?? 0]}
                          onValueChange={(value) => updateScreen({
                            textOverlayPosition: { x: screen.textOverlayPosition?.x ?? 0, y: value[0] }
                          })}
                        />
                      </div>

                      <Button
                        onClick={() => updateScreen({ textOverlayPosition: { x: 0, y: 0 } })}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Reset Text Position
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Export & Save
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Device Type (App Store Format)</Label>
                      <RadioGroup
                        value={deviceType}
                        onValueChange={(value: DeviceType) => setDeviceType(value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="iphone-69" id="device-69" />
                          <Label htmlFor="device-69">iPhone 6.9" (1242×2688px)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="iphone-67" id="device-67" />
                          <Label htmlFor="device-67">iPhone 6.7" (1242×2688px)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="iphone-65" id="device-65" />
                          <Label htmlFor="device-65">iPhone 6.5" (1242×2688px)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="iphone-61" id="device-61" />
                          <Label htmlFor="device-61">iPhone 6.1" (1284×2778px)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="iphone-69-landscape" id="device-69-landscape" />
                          <Label htmlFor="device-69-landscape">iPhone Landscape (2688×1242px)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={exportCurrentPreview} variant="outline" size="sm">
                        Export Current
                      </Button>
                      <Button onClick={exportAllPreviews} variant="outline" size="sm">
                        Export All
                      </Button>
                      <Button onClick={saveProject} variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Project
                      </Button>
                      <Button 
                        onClick={() => presetInputRef.current?.click()} 
                        variant="outline" 
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Load Project
                      </Button>
                      <input
                        ref={presetInputRef}
                        type="file"
                        accept=".json"
                        onChange={loadProject}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}