# App Preview Generator

Advanced App Store screenshot generator with drag-and-drop positioning, multi-screen support, and professional overlay controls.

## Features

### Core Functionality
- **Multi-Screen Support**: Create and manage multiple screenshots in a single session
- **Drag & Drop Positioning**: Intuitive mouse/touch controls for precise screenshot placement
- **Real-time Preview**: See changes instantly across multiple device frames
- **Layer Control**: Choose whether screenshot or text overlay appears on top
- **Advanced Positioning**: Scale, rotate, and position screenshots with pixel-perfect precision

### Design Options
- **Multiple Overlay Styles**: None, Gradient, Light, Bold, and Dark themes
- **Text Positioning**: Top, center, or bottom text placement
- **Custom Colors**: Full color customization for gradient overlays
- **Multi-Language Support**: 10+ languages including English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, and Arabic

### Device Support
- **iPhone**: Optimized for latest iPhone screen sizes (1290x2796)
- **Android**: Standard Android phone dimensions
- **iPad**: Tablet-optimized layouts

### Export Options
- **Individual Export**: Export current screen as PNG
- **Batch Export**: Export all screens at once
- **Multi-Language Export**: Generate screenshots for all languages automatically
- **Project Management**: Save and load complete projects as JSON files

## Quick Start

### Option 1: Direct Browser Opening
Simply open `index.html` in your web browser.

### Option 2: Using npm (recommended for development)
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Option 3: Using any HTTP server
```bash
# Python
python -m http.server 8000

# PHP
php -S localhost:8000

# Node.js http-server
npx http-server
```

## Usage Guide

### 1. Upload Screenshots
- Click the upload area or drag & drop your app screenshots
- Supported formats: PNG, JPG, JPEG
- Recommended resolution: 1290x2796 for iPhone

### 2. Position & Scale
- **Drag**: Click and drag the screenshot to reposition
- **Scale**: Use the scale slider (50% - 200%)
- **Rotate**: Adjust rotation (-45° to +45°)
- **Quick Actions**:
  - Fit to Frame: Auto-fit screenshot to device frame
  - Fill Frame: Expand to fill with 120% scale
  - Reset: Return to default position
  - Center: Center the screenshot

### 3. Add Text Overlays
- **Title**: Main headline (e.g., "DISCOVER", "SHARE")
- **Subtitle**: Secondary text line
- **Description**: Detailed feature description
- **Position**: Choose top, center, or bottom placement

### 4. Customize Appearance
- Select overlay style (None, Gradient, Light, Bold, Dark)
- Customize gradient colors
- Adjust layer order (screenshot on top or text on top)
- Control opacity for both screenshot and overlay

### 5. Manage Multiple Screens
- Click "+ Add Screen" to create new screens
- Click on tabs to switch between screens
- Delete screens with the × button (minimum 1 screen required)

### 6. Export
- **Export Current**: Save the active screen
- **Export All**: Batch export all screens
- **All Languages**: Generate for all language variants
- **Save Project**: Save your work as a JSON file
- **Load Project**: Resume from a saved project

## Advanced Features

### Grid & Snap
- Toggle grid overlay for precise alignment
- Enable snap-to-grid for consistent positioning

### Layer Management
- Control whether screenshot appears above or below text overlay
- Adjust opacity independently for screenshot and overlay
- Customize background color

### Project Files
Projects are saved as JSON files containing:
- All screen configurations
- Text content and positioning
- Color settings
- Language preferences
- Image data (base64 encoded)

## Browser Compatibility
- Chrome (recommended)
- Safari
- Firefox
- Edge
- Mobile browsers (touch support included)

## Tips & Best Practices

1. **High-Quality Screenshots**: Use actual app screenshots at native resolution
2. **Consistent Styling**: Maintain the same overlay style across all screens
3. **Clear Hierarchy**: Use title for main feature, subtitle for benefit
4. **Language Testing**: Preview in multiple languages before final export
5. **Save Frequently**: Use the Save Project feature to preserve your work

## Troubleshooting

**Images not exporting properly?**
- Ensure you're using a modern browser
- Check that html2canvas library is loaded
- Try using Chrome for best compatibility

**Drag not working?**
- Click directly on the screenshot image
- Ensure the screenshot is uploaded
- Check browser console for errors

**Project won't load?**
- Verify JSON file integrity
- Check file size (large images may cause issues)
- Ensure browser has sufficient memory

## Development

### Project Structure
```
app-preview-generator/
├── index.html          # Main HTML file
├── src/
│   ├── styles.css      # All styles
│   └── app.js          # Application logic
├── package.json        # Project configuration
├── .gitignore          # Git ignore rules
└── README.md           # Documentation
```

### Technologies Used
- HTML5 & CSS3
- Vanilla JavaScript (ES6+)
- html2canvas for screenshot export
- No framework dependencies

## Contributing
Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT License - feel free to use this project for personal or commercial purposes.

## Credits
Built with web technologies and html2canvas library.