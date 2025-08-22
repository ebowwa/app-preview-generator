import React, { useState } from 'react';
import PreviewCanvas from './components/PreviewCanvas';
import ConfigPanel from './components/ConfigPanel';
import ScreenshotUploader from './components/ScreenshotUploader';
import PresetManager from './components/PresetManager';
import { PreviewProvider } from './context/PreviewContext';
import { ClaudeProvider } from './context/ClaudeContext';
import './App.css';

function App() {
  return (
    <PreviewProvider>
      <ClaudeProvider>
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
            </div>
          </div>
        </div>
      </ClaudeProvider>
    </PreviewProvider>
  );
}

export default App;