# Tetris Pro - API Documentation

Technical documentation for developers working with the Tetris Pro codebase.

## Architecture Overview

The game is built with a modular architecture:

```
tetris_web/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with ghost cursor
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── game/             # Game-specific components
│   ├── menu/             # Menu screens
│   ├── chat/             # Chat assistant
│   └── ui/               # Reusable UI components
├── lib/                   # Core logic
│   ├── game/             # Game engine
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Core Game Engine

### GameEngine Class

Main game controller managing all game state and logic.

**Location**: `lib/game/engine.ts`

**Properties**:
```typescript
board: GameBoard              // Game board instance
currentPiece: TetrominoPiece  // Currently falling piece
nextPiece: TetrominoPiece     // Next piece in queue
holdPiece: TetrominoPiece     // Held piece
stats: GameStats              // Game statistics
state: GameState              // Current game state
mode: GameMode                // Current game mode
```

**Methods**:
- `start(mode: GameMode)`: Start a new game
- `pause()`: Pause the game
- `resume()`: Resume paused game
- `update(deltaTime: number)`: Update game loop
- `moveLeft()`: Move piece left
- `moveRight()`: Move piece right
- `moveDown()`: Move piece down
- `hardDrop()`: Instant drop
- `rotate()`: Rotate clockwise
- `rotateBack()`: Rotate counter-clockwise
- `hold()`: Hold/swap piece
- `reset()`: Reset game to initial state

**Callbacks**:
- `onStateChange?: (state: GameState) => void`
- `onStatsChange?: (stats: GameStats) => void`
- `onLinesClear?: (lines: number[]) => void`
- `onGameOver?: () => void`

### GameBoard Class

Manages the 10x20 game grid.

**Location**: `lib/game/board.ts`

**Methods**:
- `isValidPosition(piece, offsetX?, offsetY?)`: Check if piece can be placed
- `placePiece(piece)`: Place piece on board
- `clearLines()`: Clear completed lines, returns line numbers
- `isGameOver()`: Check if game should end
- `getGhostPosition(piece)`: Get ghost piece position
- `reset()`: Clear the board

### TetrominoPiece Class

Represents a Tetris piece.

**Location**: `lib/game/tetromino.ts`

**Properties**:
- `type: TetrominoType`: Piece type (I, O, T, S, Z, J, L)
- `position: Position`: Current position {x, y}
- `rotation: number`: Current rotation state
- `color: string`: Piece color (hex)

**Methods**:
- `getShape()`: Get current rotation shape
- `rotate()`: Rotate clockwise
- `rotateBack()`: Rotate counter-clockwise
- `copy()`: Create a copy
- `static random()`: Generate random piece

## Components

### GameBoard Component

Renders the game board using HTML5 Canvas.

**Props**:
```typescript
interface GameBoardProps {
  engine: GameEngine;
}
```

**Features**:
- Canvas-based rendering
- Ghost piece preview
- Glow effects on blocks
- Smooth animations

### GameHUD Component

Displays game statistics and next/hold pieces.

**Props**:
```typescript
interface GameHUDProps {
  engine: GameEngine;
}
```

**Displays**:
- Score, Level, Lines, Time
- Next piece preview
- Hold piece preview

### ChatAssistant Component

Interactive chat assistant for game help.

**Props**:
```typescript
interface ChatAssistantProps {
  onClose: () => void;
}
```

**Features**:
- Predefined questions
- Keyword-based responses
- Quick question buttons
- Message history

## State Management

Currently using React state and callbacks. Can be extended with Zustand if needed.

## Styling

### Tailwind CSS

Custom theme with CSS variables:
- `--background`: Main background color
- `--foreground`: Text color
- `--primary`: Primary accent color
- `--border`: Border color

### Custom Classes

- `.ghost-cursor`: Custom cursor effect
- `.glow-effect`: Neon glow on elements
- `.neon-text`: Glowing text effect
- `.animated-bg`: Animated gradient background
- `.grid-pattern`: Grid overlay pattern

## Animation System

Using Framer Motion for component animations:
- Page transitions
- Button hover effects
- Menu animations
- Message animations

## Performance Optimization

1. **Canvas Rendering**: Efficient canvas updates
2. **RequestAnimationFrame**: Smooth game loop
3. **State Updates**: Minimal re-renders
4. **Memoization**: React.memo for expensive components

## Extending the Game

### Adding New Game Modes

1. Add mode to `GameMode` enum in `lib/game/types.ts`
2. Implement mode logic in `GameEngine.start()`
3. Add UI option in `MainMenu` component

### Adding New Features

1. Extend `GameEngine` class with new methods
2. Add UI components as needed
3. Update state management
4. Add to documentation

## Type Definitions

See `lib/game/types.ts` for all type definitions:
- `TetrominoType`: Piece types
- `GameState`: Game states
- `GameMode`: Game modes
- `GameStats`: Statistics structure
- `Position`: Coordinate type

## Browser Compatibility

- Modern browsers with ES2020 support
- Canvas API support required
- CSS Grid and Flexbox support
- requestAnimationFrame support

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## Contributing

When adding features:
1. Follow TypeScript strict mode
2. Use existing component patterns
3. Add JSDoc comments
4. Update documentation
5. Test in multiple browsers

