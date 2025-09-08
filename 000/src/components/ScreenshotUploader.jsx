import React, { useRef, useState } from 'react';
import { usePreview } from '../context/PreviewContext';
import { useVLM } from '../context/VLMContext';
import './ScreenshotUploader.css';

const ScreenshotUploader = () => {
  const fileInputRef = useRef(null);
  const [context, setContext] = useState('');
  const [appName, setAppName] = useState('');
  const { 
    screenshots, 
    currentScreenshot, 
    setCurrentScreenshot,
    addScreenshot, 
    removeScreenshot,
    updateConfig,
    updateElement
  } = usePreview();
  const { analyzeScreenshot, isAnalyzing } = useVLM();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      addScreenshot(file);
      
      // Analyze with VLM if available
      const reader = new FileReader();
      reader.onload = async (event) => {
        // Include app name in context if provided for better analysis
        const fullContext = appName ? `App name: ${appName}. ${context}` : context;
        await analyzeScreenshot(event.target.result, fullContext);
        // Don't force the app name into the preview - let Claude decide
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="screenshot-uploader panel-card">
      <h2 className="panel-title">Screenshots</h2>
      
      <div className="context-input-section">
        <label htmlFor="app-name-input">App Name (optional):</label>
        <input
          id="app-name-input"
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="Enter your app name if you want to preserve it"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />
        
        <label htmlFor="context-input">Context for Analysis:</label>
        <textarea
          id="context-input"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe your app, target audience, key features, or any specific marketing angle you want..."
          rows="3"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>
      
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      
      <button 
        className="upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Upload Screenshot'}
      </button>
      
      <div className="screenshot-list">
        {screenshots.map((screenshot, index) => (
          <div 
            key={screenshot.id}
            className={`screenshot-item ${index === currentScreenshot ? 'active' : ''}`}
            onClick={() => setCurrentScreenshot(index)}
          >
            <img src={screenshot.dataUrl} alt={screenshot.name} />
            <span>{screenshot.name}</span>
            <button 
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeScreenshot(screenshot.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreenshotUploader;