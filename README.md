# Audio Visualizer

An iTunes-style audio visualizer that responds to microphone input in real-time.

## Features

- **3 Visualizations**: Frequency Bars, Particle System (3D), and Waveform
- **5 Color Schemes**: Classic iTunes, Sunset, Matrix, Rainbow, and Monochrome
- **Real-time Audio**: Uses Web Audio API to analyze microphone input
- **High Sensitivity**: Responds to quiet sounds with 3x gain amplification and optimized frequency analysis
- **60fps Performance**: Optimized rendering with Canvas 2D and WebGL (Three.js)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

**Note**: HTTPS is required for microphone access. The dev server uses localhost which is allowed.

## Keyboard Controls

### Visualizations
- `1` - Frequency Bars
- `2` - Particle System (3D)
- `3` - Waveform

### Color Schemes
- `Q` - Classic iTunes (Purple/Blue)
- `W` - Sunset (Orange/Pink)
- `E` - Matrix (Green)
- `R` - Rainbow
- `T` - Monochrome (Black/White)

### Other
- `H` - Toggle Help Overlay
- `ESC` - Close Help Overlay

## Technology Stack

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Web Audio API** - Audio capture and analysis
- **Meyda** - Audio feature extraction
- **Canvas 2D** - 2D visualizations (Frequency Bars, Waveform)
- **Three.js** - WebGL 3D visualizations (Particle System)

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari

All browsers must support Web Audio API and getUserMedia.

## Development

```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run type-check  # TypeScript type checking
```

## Project Structure

```
src/
├── audio/          # Audio engine and analyzer
├── visualizers/    # Visualization implementations
├── core/           # Core managers and color schemes
├── ui/             # UI components
└── main.ts         # Application entry point
```
