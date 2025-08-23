import React, { useRef } from 'react';
import { usePreview } from '../context/PreviewContext';
import { useVLM } from '../context/VLMContext';
import './ScreenshotUploader.css';

const ScreenshotUploader = () => {
  const fileInputRef = useRef(null);
  const { 
    screenshots, 
    currentScreenshot, 
    setCurrentScreenshot,
    addScreenshot, 
    removeScreenshot 
  } = usePreview();
  const { analyzeScreenshot, isAnalyzing } = useVLM();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      addScreenshot(file);
      
      // Analyze with VLM if available
      const reader = new FileReader();
      reader.onload = async (event) => {
        await analyzeScreenshot(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="screenshot-uploader panel-card">
      <h2 className="panel-title">Screenshots</h2>
      
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