import React, { createContext, useContext, useState, useCallback } from 'react';
import { usePreview } from './PreviewContext';

const VLMContext = createContext();

export const useVLM = () => {
  const context = useContext(VLMContext);
  if (!context) {
    throw new Error('useVLM must be used within VLMProvider');
  }
  return context;
};

// Renamed from ClaudeProvider to VLMProvider (Vision Language Model)
export const VLMProvider = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const { updateConfig, updateElement, elements } = usePreview();

  const analyzeScreenshot = useCallback(async (imageDataUrl) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl })
      });
      
      if (!response.ok) throw new Error('API request failed');
      
      const analysis = await response.json();
      setApiConnected(true);
      
      // Apply the analysis to the preview
      applyAnalysis(analysis);
      
      return analysis;
    } catch (error) {
      console.error('VLM analysis failed:', error);
      setApiConnected(false);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const applyAnalysis = useCallback((analysis) => {
    // Update config with analyzed data
    updateConfig({
      appName: analysis.appName,
      headline: analysis.headline,
      subheadline: analysis.subheadline,
      benefits: analysis.benefits,
      ctaText: analysis.ctaText,
      colors: analysis.colors
    });

    // Update text elements
    const elementUpdates = [
      { id: 'app-name', text: analysis.appName },
      { id: 'headline', text: analysis.headline },
      { id: 'subheadline', text: analysis.subheadline },
      { id: 'cta', text: analysis.ctaText }
    ];

    elementUpdates.forEach(update => {
      const element = elements.find(el => el.id === update.id);
      if (element) {
        updateElement(update.id, { text: update.text });
      }
    });

    // Update benefit elements
    analysis.benefits.forEach((benefit, index) => {
      const benefitId = `benefit-${index + 1}`;
      const element = elements.find(el => el.id === benefitId);
      if (element) {
        updateElement(benefitId, { text: benefit });
      }
    });
  }, [updateConfig, updateElement, elements]);

  const value = {
    isAnalyzing,
    apiConnected,
    analyzeScreenshot
  };

  return (
    <VLMContext.Provider value={value}>
      {children}
    </VLMContext.Provider>
  );
};