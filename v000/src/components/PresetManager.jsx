import React from 'react';
import { usePreview } from '../context/PreviewContext';
import { presets } from '../presets';
import './PresetManager.css';

const PresetManager = () => {
  const { applyPreset } = usePreview();

  return (
    <div className="preset-manager panel-card">
      <h2 className="panel-title">Presets</h2>
      
      <div className="preset-list">
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            className="preset-btn"
            onClick={() => applyPreset(preset)}
          >
            <span className="preset-name">{preset.name}</span>
            <span className="preset-desc">{preset.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PresetManager;