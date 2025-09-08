import React, { createContext, useContext, useState, useCallback } from 'react';

const PreviewContext = createContext();

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within PreviewProvider');
  }
  return context;
};

export const PreviewProvider = ({ children }) => {
  const [screenshots, setScreenshots] = useState([]);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [config, setConfig] = useState({
    appName: 'Your App',
    headline: 'Amazing Features',
    subheadline: 'Transform your workflow',
    benefits: ['Benefit 1', 'Benefit 2', 'Benefit 3'],
    ctaText: 'Download Now',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      background: '#F8FAFC',
      text: '#1F2937'
    },
    platform: 'ios-6.7'
  });
  
  // Elements are now derived from config
  const [elements, setElements] = useState([
    { id: 'app-name', type: 'text', x: 0.5, y: 0.08, size: 0.04, bold: true, align: 'center' },
    { id: 'headline', type: 'text', x: 0.5, y: 0.14, size: 0.045, bold: true, align: 'center' },
    { id: 'subheadline', type: 'text', x: 0.5, y: 0.20, size: 0.026, align: 'center' },
    { id: 'screenshot', type: 'screenshot', x: 0.5, y: 0.5, width: 0.7, height: 0.4 },
    { id: 'benefit-1', type: 'text', x: 0.5, y: 0.74, size: 0.022, align: 'center' },
    { id: 'benefit-2', type: 'text', x: 0.5, y: 0.78, size: 0.022, align: 'center' },
    { id: 'benefit-3', type: 'text', x: 0.5, y: 0.82, size: 0.022, align: 'center' },
    { id: 'cta', type: 'button', x: 0.5, y: 0.92, width: 0.6, height: 0.055 }
  ]);

  const platforms = {
    'ios-6.7': { width: 1320, height: 2868, label: 'iPhone 6.7" (15 Pro Max)' },
    'ios-6.5': { width: 1290, height: 2796, label: 'iPhone 6.5" (14 Plus)' },
    'ios-tablet': { width: 2048, height: 2732, label: 'iPad Pro 12.9"' }
  };

  const addScreenshot = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newScreenshot = {
        id: Date.now(),
        name: file.name,
        dataUrl: e.target.result
      };
      setScreenshots(prev => [...prev, newScreenshot]);
      setCurrentScreenshot(screenshots.length);
    };
    reader.readAsDataURL(file);
  }, [screenshots.length]);

  const removeScreenshot = useCallback((id) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
    if (currentScreenshot >= screenshots.length - 1) {
      setCurrentScreenshot(Math.max(0, screenshots.length - 2));
    }
  }, [currentScreenshot, screenshots.length]);

  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateElement = useCallback((id, updates) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  const addElement = useCallback((element) => {
    setElements(prev => [...prev, element]);
  }, []);

  const removeElement = useCallback((id) => {
    setElements(prev => prev.filter(el => el.id !== id));
  }, []);

  const applyPreset = useCallback((preset) => {
    setConfig(preset.config);
    setElements(preset.elements);
  }, []);

  const value = {
    screenshots,
    currentScreenshot,
    setCurrentScreenshot,
    addScreenshot,
    removeScreenshot,
    elements,
    updateElement,
    addElement,
    removeElement,
    config,
    updateConfig,
    platforms,
    applyPreset
  };

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
};