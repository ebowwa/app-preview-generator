# App Store Preview Generator

A composable, modular React application for generating stunning App Store screenshots with AI assistance from Claude.

## Features

- 🎨 **Composable Architecture** - Modular components with clean separation of concerns
- 🤖 **Claude AI Integration** - Automatic screenshot analysis and content generation
- 📱 **Multiple Platforms** - Support for iPhone and iPad dimensions
- 🎯 **Presets** - Built-in presets including CleanShot configuration
- 💾 **State Management** - React Context for clean state management
- 🎨 **Real-time Preview** - Canvas-based preview with instant updates

## Project Structure

```
app-preview-generator/
├── src/
│   ├── api/              # Claude API server
│   ├── components/       # React components
│   │   ├── PreviewCanvas.jsx
│   │   ├── ConfigPanel.jsx
│   │   ├── ScreenshotUploader.jsx
│   │   └── PresetManager.jsx
│   ├── context/          # React Context providers
│   │   ├── PreviewContext.jsx
│   │   └── ClaudeContext.jsx
│   ├── presets/          # App presets (CleanShot, etc.)
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── package.json
└── vite.config.js
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Claude API (optional):
```bash
export ANTHROPIC_API_KEY='your-api-key'
```

3. Start the development server:
```bash
npm run dev
```

4. Start the Claude API server (in another terminal):
```bash
npm run api
```

## Usage

1. **Upload Screenshot**: Click "Upload Screenshot" to add your app screenshots
2. **Choose Preset**: Select a preset (like CleanShot) or customize manually
3. **Configure**: Adjust text, colors, and layout in the config panel
4. **Download**: Click "Download" to save your App Store screenshot

## Presets

### CleanShot
Privacy-focused metadata removal app with teal color scheme:
- Primary: #14B8A6
- Background: #F0FDFA
- Headline: "Strip Metadata Instantly"
- CTA: "Protect Your Privacy"

## Technologies

- React 18 with hooks
- Vite for fast development
- Canvas API for rendering
- Claude AI for content generation
- Express.js for API server

## License

MIT