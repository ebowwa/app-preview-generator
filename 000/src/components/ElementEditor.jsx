import React, { useState } from 'react';
import { usePreview } from '../context/PreviewContext';
import './ElementEditor.css';

const ElementEditor = () => {
  const { elements, updateElement, addElement, removeElement, config } = usePreview();
  const [selectedElement, setSelectedElement] = useState(null);

  const handleElementUpdate = (id, field, value) => {
    updateElement(id, { [field]: value });
  };

  const addNewElement = (type) => {
    const newElement = {
      id: `${type}-${Date.now()}`,
      type: type,
      text: type === 'text' ? 'New Text' : '',
      x: 0.5,
      y: 0.5,
      size: type === 'text' ? 0.03 : undefined,
      color: config.colors.text,
      bold: false,
      align: 'center',
      width: type === 'button' ? 0.5 : type === 'screenshot' ? 0.7 : undefined,
      height: type === 'button' ? 0.05 : type === 'screenshot' ? 0.4 : undefined
    };
    addElement(newElement);
    setSelectedElement(newElement.id);
  };

  const selected = elements.find(el => el.id === selectedElement);

  return (
    <div className="element-editor panel-card">
      <h2 className="panel-title">Elements</h2>
      
      <div className="element-list">
        {elements.map(element => (
          <div 
            key={element.id}
            className={`element-item ${selectedElement === element.id ? 'selected' : ''}`}
            onClick={() => setSelectedElement(element.id)}
          >
            <span className="element-type">{element.type}</span>
            <span className="element-id">{element.id}</span>
            {element.id !== 'screenshot' && (
              <button 
                className="element-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeElement(element.id);
                  if (selectedElement === element.id) {
                    setSelectedElement(null);
                  }
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="add-element-buttons">
        <button onClick={() => addNewElement('text')} className="add-btn">+ Text</button>
        <button onClick={() => addNewElement('button')} className="add-btn">+ Button</button>
      </div>

      {selected && (
        <div className="element-properties">
          <h3>Properties</h3>
          
          {selected.type === 'text' && (
            <>
              <div className="property-group">
                <label>Text</label>
                <input
                  type="text"
                  value={selected.text || ''}
                  onChange={(e) => handleElementUpdate(selected.id, 'text', e.target.value)}
                />
              </div>
              
              <div className="property-row">
                <div className="property-group">
                  <label>Size</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.1"
                    step="0.001"
                    value={selected.size || 0.03}
                    onChange={(e) => handleElementUpdate(selected.id, 'size', parseFloat(e.target.value))}
                  />
                  <span>{((selected.size || 0.03) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="property-row">
                <div className="property-group">
                  <label>Bold</label>
                  <input
                    type="checkbox"
                    checked={selected.bold || false}
                    onChange={(e) => handleElementUpdate(selected.id, 'bold', e.target.checked)}
                  />
                </div>
                <div className="property-group">
                  <label>Align</label>
                  <select
                    value={selected.align || 'center'}
                    onChange={(e) => handleElementUpdate(selected.id, 'align', e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="property-group">
                <label>Color</label>
                <input
                  type="color"
                  value={selected.color || config.colors.text}
                  onChange={(e) => handleElementUpdate(selected.id, 'color', e.target.value)}
                />
              </div>
            </>
          )}

          {selected.type === 'button' && (
            <>
              <div className="property-group">
                <label>Button Text</label>
                <input
                  type="text"
                  value={selected.text || ''}
                  onChange={(e) => handleElementUpdate(selected.id, 'text', e.target.value)}
                />
              </div>
              
              <div className="property-row">
                <div className="property-group">
                  <label>Width</label>
                  <input
                    type="range"
                    min="0.2"
                    max="0.9"
                    step="0.05"
                    value={selected.width || 0.5}
                    onChange={(e) => handleElementUpdate(selected.id, 'width', parseFloat(e.target.value))}
                  />
                </div>
                <div className="property-group">
                  <label>Height</label>
                  <input
                    type="range"
                    min="0.03"
                    max="0.1"
                    step="0.005"
                    value={selected.height || 0.05}
                    onChange={(e) => handleElementUpdate(selected.id, 'height', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          <div className="property-row">
            <div className="property-group">
              <label>X Position</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selected.x || 0.5}
                onChange={(e) => handleElementUpdate(selected.id, 'x', parseFloat(e.target.value))}
              />
            </div>
            <div className="property-group">
              <label>Y Position</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selected.y || 0.5}
                onChange={(e) => handleElementUpdate(selected.id, 'y', parseFloat(e.target.value))}
              />
            </div>
          </div>

          {selected.type === 'screenshot' && (
            <div className="property-row">
              <div className="property-group">
                <label>Width</label>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={selected.width || 0.7}
                  onChange={(e) => handleElementUpdate(selected.id, 'width', parseFloat(e.target.value))}
                />
              </div>
              <div className="property-group">
                <label>Height</label>
                <input
                  type="range"
                  min="0.2"
                  max="0.7"
                  step="0.05"
                  value={selected.height || 0.4}
                  onChange={(e) => handleElementUpdate(selected.id, 'height', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ElementEditor;