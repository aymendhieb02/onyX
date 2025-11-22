# Quick Start Guide

Get up and running with Tetris Pro in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

```bash
# Navigate to the project directory
cd tetris_web

# Install dependencies
npm install
```

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## First Steps

1. **Start the game**: Click on any game mode from the main menu
2. **Learn controls**: Check the controls panel on the right side
3. **Get help**: Click the chat button (bottom-right) for assistance
4. **Play**: Use arrow keys to move and rotate pieces

## Game Modes

- **Classic**: Endless gameplay, perfect for beginners
- **Sprint**: Clear 40 lines as fast as possible
- **Ultra**: Score maximum points in 2 minutes
- **Custom**: Create your own challenges (coming soon)

## Controls

- **← →**: Move left/right
- **↓**: Soft drop
- **↑ / X**: Rotate clockwise
- **Z**: Rotate counter-clockwise
- **Space**: Hard drop
- **C**: Hold piece
- **ESC**: Pause

## Troubleshooting

### Port already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript errors
```bash
# Check types
npx tsc --noEmit
```

## Next Steps

- Read the [User Guide](./USER_GUIDE.md) for detailed gameplay instructions
- Check [API Documentation](./API_DOCS.md) for development details
- Review [Component Documentation](./COMPONENT_DOCS.md) for UI components

Enjoy playing Tetris Pro! 🎮

