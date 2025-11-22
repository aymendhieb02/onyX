# Component Documentation

Detailed documentation for all UI components in Tetris Pro.

## Game Components

### GameBoard

**Location**: `components/game/game-board.tsx`

Renders the main game board using HTML5 Canvas.

**Props**:
- `engine: GameEngine` - The game engine instance

**Features**:
- Canvas-based rendering for smooth performance
- Ghost piece preview (semi-transparent)
- Glow effects on placed blocks
- Grid overlay for visual clarity
- Real-time updates via requestAnimationFrame

**Usage**:
```tsx
<GameBoard engine={gameEngine} />
```

### GameHUD

**Location**: `components/game/game-hud.tsx`

Displays game statistics and piece previews.

**Props**:
- `engine: GameEngine` - The game engine instance

**Displays**:
- Score (with Trophy icon)
- Level (with Zap icon)
- Lines cleared (with Grid icon)
- Time played (with Clock icon)
- Next piece preview
- Hold piece preview

**Usage**:
```tsx
<GameHUD engine={gameEngine} />
```

### GameControls

**Location**: `components/game/game-controls.tsx`

Shows keyboard control reference.

**Features**:
- Visual keyboard shortcuts
- Organized by action type
- Styled key indicators

**Usage**:
```tsx
<GameControls />
```

### LineClearAnimation

**Location**: `components/game/line-clear-animation.tsx`

Animated message when lines are cleared.

**Props**:
- `lines: number[]` - Array of cleared line numbers
- `onComplete: () => void` - Callback when animation completes

**Animations**:
- Scale and rotate entrance
- Fade out exit
- Shows "SINGLE!", "DOUBLE!", "TRIPLE!", or "TETRIS!"

**Usage**:
```tsx
<LineClearAnimation 
  lines={[5, 6, 7]} 
  onComplete={() => console.log("Animation done")} 
/>
```

## Menu Components

### MainMenu

**Location**: `components/menu/main-menu.tsx`

Main menu screen with game mode selection.

**Props**:
- `onStartGame: (mode: GameMode) => void` - Callback when mode is selected

**Features**:
- Animated title
- Four game mode cards
- Hover effects
- Color-coded modes

**Game Modes**:
- Classic (Blue)
- Sprint (Yellow)
- Ultra (Purple)
- Custom (Green)

**Usage**:
```tsx
<MainMenu onStartGame={(mode) => startGame(mode)} />
```

### GameOverScreen

**Location**: `components/menu/game-over-screen.tsx`

Displays game over screen with final statistics.

**Props**:
- `engine: GameEngine` - The game engine instance
- `onRestart: () => void` - Callback to restart game

**Displays**:
- Final score
- Level reached
- Lines cleared
- Time played
- Action buttons (Play Again, Main Menu)

**Usage**:
```tsx
<GameOverScreen 
  engine={gameEngine} 
  onRestart={() => resetGame()} 
/>
```

## Chat Components

### ChatAssistant

**Location**: `components/chat/chat-assistant.tsx`

Interactive chat assistant for game help.

**Props**:
- `onClose: () => void` - Callback to close chat

**Features**:
- Predefined questions
- Keyword-based responses
- Quick question buttons
- Message history
- Smooth animations

**Predefined Questions**:
- "How do I play?"
- "What are the controls?"
- "What is Sprint mode?"
- "What is Ultra mode?"
- "How does scoring work?"
- "What is the hold feature?"
- "How do I rotate pieces?"
- "What is a hard drop?"

**Usage**:
```tsx
<ChatAssistant onClose={() => setShowChat(false)} />
```

## UI Components

### GhostCursor

**Location**: `components/ui/ghost-cursor.tsx`

Custom cursor effect with trailing particles.

**Features**:
- Follows mouse movement
- Trailing particle effects
- Blend mode for visibility
- Smooth animations

**Usage**:
```tsx
<GhostCursor />
```

## Page Components

### HomePage

**Location**: `components/pages/home-page.tsx`

Main page component that orchestrates the entire game.

**Features**:
- Game state management
- Keyboard event handling
- Game loop integration
- Screen transitions
- Chat assistant toggle

**State Management**:
- Uses React hooks for state
- Manages game engine instance
- Handles game state transitions

**Usage**:
```tsx
// Automatically used as the main page
export default function Home() {
  return <HomePage />;
}
```

## Styling

### CSS Classes

**Glow Effects**:
- `.glow-effect` - Blue glow
- `.glow-effect-green` - Green glow
- `.glow-effect-purple` - Purple glow

**Text Effects**:
- `.neon-text` - Glowing text with shadow

**Background**:
- `.animated-bg` - Animated gradient background
- `.grid-pattern` - Grid overlay pattern

**Cursor**:
- `.ghost-cursor` - Main cursor element
- `.ghost-cursor-trail` - Cursor trail particles

## Animation Patterns

All components use Framer Motion for animations:

```tsx
import { motion } from "framer-motion";

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
/>

// Scale
<motion.div
  initial={{ scale: 0.9 }}
  animate={{ scale: 1 }}
/>

// Hover
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

## Best Practices

1. **Performance**: Use `useMemo` and `useCallback` for expensive operations
2. **Accessibility**: Include ARIA labels and keyboard navigation
3. **Responsive**: Design for mobile, tablet, and desktop
4. **Animations**: Keep animations smooth (60fps target)
5. **State**: Minimize re-renders with proper state management

## Extending Components

To add new components:

1. Create component file in appropriate directory
2. Use TypeScript for type safety
3. Follow existing naming conventions
4. Add to this documentation
5. Include JSDoc comments
6. Test in multiple browsers

