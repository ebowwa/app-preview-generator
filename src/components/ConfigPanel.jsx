import React from 'react';
import { usePreview } from '../context/PreviewContext';
import './ConfigPanel.css';

const ConfigPanel = () => {
  const { config, updateConfig, elements, updateElement } = usePreview();

  return (
    <div className="config-panel panel-card">
      <h2 className="panel-title">Configuration</h2>
      
      <div className="config-section">
        <h3>App Details</h3>
        <input
          type="text"
          placeholder="App Name"
          value={config.appName}
          onChange={(e) => updateConfig({ appName: e.target.value })}
          className="config-input"
        />
        <input
          type="text"
          placeholder="Headline"
          value={config.headline}
          onChange={(e) => updateConfig({ headline: e.target.value })}
          className="config-input"
        />
        <textarea
          placeholder="Subheadline"
          value={config.subheadline}
          onChange={(e) => updateConfig({ subheadline: e.target.value })}
          className="config-textarea"
        />
      </div>

      <div className="config-section">
        <h3>Benefits</h3>
        {config.benefits.map((benefit, index) => (
          <input
            key={index}
            type="text"
            value={benefit}
            onChange={(e) => {
              const newBenefits = [...config.benefits];
              newBenefits[index] = e.target.value;
              updateConfig({ benefits: newBenefits });
            }}
            className="config-input"
          />
        ))}
      </div>

      <div className="config-section">
        <h3>Colors</h3>
        <div className="color-grid">
          <div className="color-input-group">
            <label>Primary</label>
            <input
              type="color"
              value={config.colors.primary}
              onChange={(e) => updateConfig({ 
                colors: { ...config.colors, primary: e.target.value }
              })}
            />
          </div>
          <div className="color-input-group">
            <label>Background</label>
            <input
              type="color"
              value={config.colors.background}
              onChange={(e) => updateConfig({ 
                colors: { ...config.colors, background: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      <div className="config-section">
        <h3>Platform</h3>
        <select 
          value={config.platform}
          onChange={(e) => updateConfig({ platform: e.target.value })}
          className="config-select"
        >
          <option value="ios-6.7">iPhone 6.7" (15 Pro Max)</option>
          <option value="ios-6.5">iPhone 6.5" (14 Plus)</option>
          <option value="ios-tablet">iPad Pro 12.9"</option>
        </select>
      </div>

      <div className="config-section">
        <h3>CTA Button</h3>
        <input
          type="text"
          placeholder="Button Text"
          value={config.ctaText}
          onChange={(e) => updateConfig({ ctaText: e.target.value })}
          className="config-input"
        />
      </div>
    </div>
  );
};

export default ConfigPanel;