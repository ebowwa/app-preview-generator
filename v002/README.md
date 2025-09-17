# App Preview Generator v002

A modern React/TypeScript app built with Next.js and shadcn/ui components for creating beautiful app store screenshots.

## Features

- 🎨 Modern shadcn/ui design system
- 📱 Real-time preview
- 🖼️ Drag and drop image upload
- 🎯 Position and scale controls
- ✨ Multiple background styles
- 📝 Text overlays
- 💾 TypeScript for type safety

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the v002 directory:
```bash
cd /workspaces/app-preview-generator/v002
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
v002/
├── app/              # Next.js app directory
│   ├── page.tsx     # Main app page
│   ├── layout.tsx   # Root layout
│   └── globals.css  # Global styles
├── components/      # React components
│   └── ui/         # shadcn/ui components
├── lib/            # Utility functions
└── public/         # Static assets
```

## Usage

1. **Upload Screenshot:** Click the upload area or drag & drop an image
2. **Adjust Position:** Use the sliders to position and scale your screenshot
3. **Style Background:** Choose from solid, gradient, or mesh backgrounds
4. **Add Text:** Enter title, subtitle, and description for overlays
5. **Export:** Click export to download your generated preview

## Note

This is a complete rewrite of v001 using modern React patterns and TypeScript. The UI components need to be installed via shadcn/ui CLI or manually created.

To add shadcn/ui components:
```bash
npx shadcn-ui@latest add button card tabs label input slider textarea radio-group separator
```