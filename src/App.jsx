import React, { useState } from 'react';
import PreviewCanvas from './components/PreviewCanvas';
import ConfigPanel from './components/ConfigPanel';
import ElementEditor from './components/ElementEditor';
import ScreenshotUploader from './components/ScreenshotUploader';
import PresetManager from './components/PresetManager';
import { PreviewProvider } from './context/PreviewContext';
import { VLMProvider } from './context/VLMContext';
import './App.css';

function App() {
  return (
    <PreviewProvider>
      <VLMProvider>
        <div className="app">
          <header className="app-header">
            <h1>App Store Preview Generator</h1>
            <p>Create stunning App Store screenshots with AI assistance</p>
          </header>
          
          <div className="app-container">
            <div className="left-panel">
              <ScreenshotUploader />
              <PresetManager />
            </div>
            
            <div className="center-panel">
              <PreviewCanvas />
            </div>
            
            <div className="right-panel">
              <ConfigPanel />
              <ElementEditor />
            </div>
          </div>
        </div>
      </VLMProvider>
    </PreviewProvider>
  );
}

export default App;