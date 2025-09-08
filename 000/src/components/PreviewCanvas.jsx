import React, { useRef, useEffect, useState } from 'react';
import { usePreview } from '../context/PreviewContext';
import './PreviewCanvas.css';

const PreviewCanvas = () => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const { 
    screenshots, 
    currentScreenshot, 
    elements, 
    config, 
    platforms,
    updateElement 
  } = usePreview();

  const platform = platforms[config.platform];

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    // Don't set width/height here as they're set in the element attributes

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, config.colors.background);
    gradient.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    elements.forEach(element => {
      const x = element.x * canvas.width;
      const y = element.y * canvas.height;

      if (element.type === 'screenshot' && screenshots[currentScreenshot]) {
        const img = new Image();
        img.onload = () => {
          const containerWidth = element.width * canvas.width;
          const containerHeight = element.height * canvas.height;
          
          // Calculate aspect ratios
          const imgAspectRatio = img.width / img.height;
          const containerAspectRatio = containerWidth / containerHeight;
          
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          // Fit image within container maintaining aspect ratio
          if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container
            drawWidth = containerWidth;
            drawHeight = containerWidth / imgAspectRatio;
            offsetY = (containerHeight - drawHeight) / 2;
          } else {
            // Image is taller than container
            drawHeight = containerHeight;
            drawWidth = containerHeight * imgAspectRatio;
            offsetX = (containerWidth - drawWidth) / 2;
          }
          
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 20;
          
          // Rounded rectangle clip for the image
          ctx.beginPath();
          ctx.roundRect(
            x - containerWidth/2 + offsetX, 
            y - containerHeight/2 + offsetY, 
            drawWidth, 
            drawHeight, 
            20
          );
          ctx.clip();
          
          // Draw the image centered and scaled properly
          ctx.drawImage(
            img, 
            x - containerWidth/2 + offsetX, 
            y - containerHeight/2 + offsetY, 
            drawWidth, 
            drawHeight
          );
          ctx.restore();
        };
        img.src = screenshots[currentScreenshot].dataUrl;
      } else if (element.type === 'text') {
        // Use element text first, then fall back to config
        let text = element.text || '';
        if (!text && element.id === 'app-name') text = config.appName;
        else if (!text && element.id === 'headline') text = config.headline;
        else if (!text && element.id === 'subheadline') text = config.subheadline;
        else if (!text && element.id === 'benefit-1') text = `✓ ${config.benefits[0]}`;
        else if (!text && element.id === 'benefit-2') text = `✓ ${config.benefits[1]}`;
        else if (!text && element.id === 'benefit-3') text = `✓ ${config.benefits[2]}`;
        
        ctx.fillStyle = element.color || config.colors.text;
        ctx.font = `${element.bold ? 'bold ' : ''}${element.size * canvas.width}px Inter`;
        ctx.textAlign = element.align || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
      } else if (element.type === 'button') {
        const width = element.width * canvas.width;
        const height = element.height * canvas.height;
        
        // Button background
        ctx.fillStyle = config.colors.primary;
        ctx.beginPath();
        ctx.roundRect(x - width/2, y - height/2, width, height, height/2);
        ctx.fill();
        
        // Button text
        ctx.fillStyle = 'white';
        ctx.font = `bold ${height * 0.4}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const buttonText = element.text || config.ctaText;
        ctx.fillText(buttonText, x, y);
      }
    });
  };

  useEffect(() => {
    drawPreview();
  }, [screenshots, currentScreenshot, elements, config, platform]);

  // Get element at canvas position
  const getElementAt = (canvasX, canvasY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    // Convert to relative coordinates
    const x = canvasX / canvas.width;
    const y = canvasY / canvas.height;
    
    // Check elements in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      
      if (el.type === 'text' || el.type === 'button') {
        // Simple hit detection for text/button (within 5% of position)
        if (Math.abs(el.x - x) < 0.05 && Math.abs(el.y - y) < 0.05) {
          return el;
        }
      } else if (el.type === 'screenshot') {
        // Check if click is within screenshot bounds
        const halfWidth = (el.width || 0.7) / 2;
        const halfHeight = (el.height || 0.4) / 2;
        if (x >= el.x - halfWidth && x <= el.x + halfWidth &&
            y >= el.y - halfHeight && y <= el.y + halfHeight) {
          return el;
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    
    const element = getElementAt(canvasX, canvasY);
    if (element) {
      setIsDragging(true);
      setDraggedElement(element);
      setDragOffset({
        x: canvasX / canvas.width - element.x,
        y: canvasY / canvas.height - element.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedElement) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    
    const newX = canvasX / canvas.width - dragOffset.x;
    const newY = canvasY / canvas.height - dragOffset.y;
    
    // Update element position
    updateElement(draggedElement.id, {
      x: Math.max(0, Math.min(1, newX)),
      y: Math.max(0, Math.min(1, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedElement(null);
  };

  const downloadPreview = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `appstore_${platform.width}x${platform.height}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  // Calculate display size to maintain aspect ratio
  const scale = Math.min(500 / platform.width, 700 / platform.height);
  const displayWidth = platform.width * scale;
  const displayHeight = platform.height * scale;

  return (
    <div className="preview-canvas-container panel-card">
      <div className="preview-header">
        <h2 className="panel-title">Preview</h2>
        <button onClick={downloadPreview} className="download-btn">
          Download
        </button>
      </div>
      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef}
          className="preview-canvas"
          width={platform.width}
          height={platform.height}
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      <div className="platform-info">
        {platform.label} • {platform.width} × {platform.height}px
      </div>
    </div>
  );
};

export default PreviewCanvas;