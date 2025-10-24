# App Preview Generator CLI

A command-line tool for generating App Store screenshots with device frames, text overlays, and styling. This is the CLI version of the App Preview Generator web application.

## Installation

```bash
# From the app-preview-generator directory
cd cli
npm install
npm run build

# Make the CLI executable (if needed)
chmod +x bin/app-preview-gen.js

# Add to PATH (optional)
export PATH="$PWD/bin:$PATH"
```

## Usage

### Generate a Single Screenshot

```bash
app-preview-gen generate \
  --screenshot ./app-screen.png \
  --device "iphone-67" \
  --title "My App" \
  --subtitle "Amazing Features" \
  --description "Build beautiful apps" \
  --output ./preview.jpg \
  --style gradient
```

### Batch Process Multiple Screenshots

1. Create a configuration file:
```json
{
  "project": {
    "name": "My App",
    "device": "iphone-67",
    "defaultStyle": "gradient",
    "defaultPosition": "top"
  },
  "screens": [
    {
      "screenshot": "./screen1.png",
      "title": "Main Screen",
      "subtitle": "Welcome to our app",
      "description": "Get started with amazing features",
      "outputName": "screen-1.jpg"
    },
    {
      "screenshot": "./screen2.png",
      "title": "Features",
      "subtitle": "Powerful tools",
      "description": "Everything you need",
      "style": "bold",
      "outputName": "screen-2.jpg"
    }
  ],
  "output": {
    "directory": "./previews",
    "format": "jpg",
    "quality": 90
  }
}
```

2. Run batch processing:
```bash
app-preview-gen batch --config ./my-config.json --output-dir ./previews
```

### Initialize a New Project

```bash
# Interactive mode
app-preview-gen init

# Or with options
app-preview-gen init \
  --name "My App" \
  --screenshots "./screenshots/*.png"
```

## Device Types

Supported device types (use these exact values):

- `iphone-69` - 6.9" iPhone (App Store)
- `iphone-67` - 6.7" iPhone (App Store)
- `iphone-65` - 6.5" iPhone (App Store)
- `iphone-61` - 6.1" iPhone (App Store)
- `iphone-69-landscape` - 6.9" Landscape (App Store)
- `ipad-129` - 12.9" iPad
- `ipad-11` - 11" iPad

## Overlay Styles

- `gradient` - Blue gradient background
- `minimal` - Light background with subtle styling
- `bold` - Bold blue background
- `dark` - Dark background

## Text Position

- `top` - Text positioned at the top
- `center` - Text positioned in the center
- `bottom` - Text positioned at the bottom

## Configuration Format

The CLI uses JSON configuration files with the following structure:

```json
{
  "project": {
    "name": "App name",
    "device": "device-type",
    "defaultStyle": "gradient",
    "defaultPosition": "top"
  },
  "screens": [
    {
      "screenshot": "path/to/image.png",
      "title": "Screen Title",
      "subtitle": "Optional subtitle",
      "description": "Optional description",
      "style": "gradient",
      "position": "top",
      "outputName": "custom-filename.jpg"
    }
  ],
  "output": {
    "directory": "./previews",
    "format": "jpg",
    "quality": 90
  }
}
```

## Output

The CLI generates App Store compliant screenshots:
- **iPhones**: 1242×2688px (or 1284×2778px for iPhone 6.1")
- **iPads**: Various dimensions based on device type
- **Format**: JPEG (App Store requirement)
- **Quality**: 90% by default

## Examples

### Quick Single Preview
```bash
app-preview-gen generate -s ./screen.png -d iphone-67 -t "My App" -o ./preview.jpg
```

### Multiple Screens with Different Styles
```bash
app-preview-gen batch --config ./multi-screens.json
```

### Automated Workflow
```bash
# Initialize project
app-preview-gen init --name "Weather App" --screenshots "./exports/*.png"

# Edit the generated app-previews.json file

# Generate all previews
app-preview-gen batch --config app-previews.json
```

## Dependencies

- **sharp** - High-performance image processing
- **commander** - Command-line interface framework
- **inquirer** - Interactive prompts
- **chalk** - Colored terminal output

## Error Handling

The CLI provides clear error messages for:
- Invalid device types
- Missing screenshot files
- Unsupported file formats
- Invalid configuration files

## Contributing

This CLI was added to enhance the original App Preview Generator web application with programmatic capabilities. The core rendering logic is shared between the web and CLI versions.