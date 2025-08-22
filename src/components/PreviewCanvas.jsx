import React, { useRef, useEffect } from 'react';
import { usePreview } from '../context/PreviewContext';
import './PreviewCanvas.css';

const PreviewCanvas = () => {
  const canvasRef = useRef(null);
  const { 
    screenshots, 
    currentScreenshot, 
    elements, 
    config, 
    platforms 
  } = usePreview();

  const platform = platforms[config.platform];

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = platform.width;
    canvas.height = platform.height;

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
          const width = element.width * canvas.width;
          const height = element.height * canvas.height;
          
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 20;
          
          // Rounded rectangle clip
          ctx.beginPath();
          ctx.roundRect(x - width/2, y - height/2, width, height, 20);
          ctx.clip();
          ctx.drawImage(img, x - width/2, y - height/2, width, height);
          ctx.restore();
        };
        img.src = screenshots[currentScreenshot].dataUrl;
      } else if (element.type === 'text') {
        ctx.fillStyle = element.color || config.colors.text;
        ctx.font = `${element.bold ? 'bold ' : ''}${element.size * canvas.width}px Inter`;
        ctx.textAlign = element.align || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.text, x, y);
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
        ctx.fillText(element.text, x, y);
      }
    });
  };

  useEffect(() => {
    drawPreview();
  }, [screenshots, currentScreenshot, elements, config, platform]);

  const downloadPreview = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `appstore_${platform.width}x${platform.height}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

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
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>
      <div className="platform-info">
        {platform.label} • {platform.width} × {platform.height}px
      </div>
    </div>
  );
};

export default PreviewCanvas;