# Tetris Game - Code Documentation

This document provides detailed technical documentation for the Tetris game codebase.

## Architecture Overview

The game follows a clean architecture pattern with separation of concerns:

- **Core**: Game logic and engine
- **Screens**: UI components and navigation
- **Providers**: State management (Riverpod)
- **Themes**: Theme system and styling
- **Animations**: Reusable animation components
- **Modes**: Game mode implementations
- **Features**: Additional game features

## Core Components

### Tetromino (`lib/core/tetromino.dart`)

Represents a Tetris piece with rotation logic.

**Key Classes**:
- `TetrominoType`: Enum for 7 piece types (I, O, T, S, Z, J, L)
- `Tetromino`: Main class representing a piece

**Key Methods**:
- `rotate()`: Rotate 90° clockwise
- `rotateCounterClockwise()`: Rotate 90° counter-clockwise
- `currentShape`: Get current rotation state
- `random()`: Generate random tetromino

**Rotation System**:
- Each tetromino has predefined rotation states
- O-piece has 1 state (no rotation needed)
- I-piece has 2 states
- Others have 4 states

### Game Board (`lib/core/game_board.dart`)

Manages the 10x20 game grid and block placement.

**Key Methods**:
- `isValidPosition()`: Check if piece can be placed at position
- `placeTetromino()`: Place piece on board
- `clearLines()`: Remove completed lines and return line numbers
- `isGameOver()`: Check if game should end
- `addGarbageLines()`: Add garbage lines (for multiplayer)

**Data Structure**:
- `grid`: 2D array of `Color?` (null = empty, Color = filled)
- `placedBlocks`: List of placed block positions

### Game Engine (`lib/core/game_engine.dart`)

Main game loop and logic controller.

**Key Properties**:
- `board`: Game board instance
- `currentPiece`: Currently falling piece
- `nextPiece`: Next piece in queue
- `nextPiecesQueue`: Queue of upcoming pieces
- `score`, `level`, `linesCleared`: Game statistics
- `fallSpeed`: Current falling speed in milliseconds

**Key Methods**:
- `start()`: Start the game
- `pause()` / `resume()`: Pause/resume gameplay
- `moveLeft()` / `moveRight()`: Move piece horizontally
- `rotate()`: Rotate current piece
- `softDrop()` / `hardDrop()`: Drop controls
- `_moveDown()`: Automatic downward movement
- `_placePiece()`: Place piece and check for line clears
- `_updateScore()`: Calculate and update score
- `_updateLevel()`: Check and update level

**Callbacks**:
- `onScoreChanged`: Called when score updates
- `onLevelChanged`: Called when level increases
- `onLinesCleared`: Called when lines are cleared
- `onLinesClearedAnimation`: Called with cleared line numbers
- `onGameOver`: Called when game ends
- `onPiecePlaced`: Called when piece is placed
- `onStateChanged`: Called when game state changes

**Game Loop**:
- Uses `Timer.periodic` for automatic falling
- Speed adjusts based on level and soft drop state
- Updates every frame based on `fallSpeed`

### Power-Up System (`lib/core/power_up_system.dart`)

Manages power-ups and their effects.

**Power-Up Types**:
- `slowMotion`: Slows falling speed for 10 seconds
- `clearLine`: Removes a random completed line
- `ghostPreview`: Shows landing position (15 seconds)
- `bomb`: Clears blocks in radius
- `freeze`: Pauses game for 5 seconds

**Key Classes**:
- `PowerUp`: Power-up data class
- `PowerUpManager`: Manages power-up activation and effects

## State Management

### Riverpod Providers

**Game Providers** (`lib/providers/game_provider.dart`):
- `gameBoardProvider`: Provides GameBoard instance
- `gameEngineProvider`: Provides GameEngine instance
- `powerUpManagerProvider`: Provides PowerUpManager instance

**Theme Provider** (`lib/providers/theme_provider.dart`):
- `themeProvider`: StateNotifier for current theme
- `ThemeNotifier`: Manages theme state and persistence

## UI Screens

### Splash Screen (`lib/screens/splash_screen.dart`)

First screen shown on app launch.

**Features**:
- Animated logo and title
- 3-second delay before navigation
- Smooth transitions

### Theme Selection Screen (`lib/screens/theme_selection_screen.dart`)

Allows users to choose game theme.

**Features**:
- Grid of 5 theme options
- Visual preview of each theme
- Selection indicator
- Theme persistence

### Mode Selection Screen (`lib/screens/mode_selection_screen.dart`)

Choose between Adventure and Classic modes.

**Features**:
- Two mode cards with descriptions
- Smooth animations
- Theme-aware styling

### Game Screen (`lib/screens/game_screen.dart`)

Main gameplay screen.

**Key Components**:
- HUD (score, level, lines)
- Game board with custom painter
- Next piece preview
- Gesture detection for controls
- Message overlay for feedback
- Level transition overlay

**Gesture Handling**:
- `onHorizontalDragUpdate`: Left/right movement
- `onVerticalDragUpdate`: Soft drop
- `onVerticalDragEnd`: Hard drop detection
- `onTapDown`: Rotation

**Custom Painters**:
- `_GameBoardPainter`: Renders game board and pieces
- `_TetrominoPainter`: Renders tetromino preview

### Adventure Mode Screen (`lib/screens/adventure_mode_screen.dart`)

Level selection for Adventure mode.

**Features**:
- Grid of 20 levels
- Lock/unlock system
- Level information display
- Navigation to game screen

### Classic Mode Screen (`lib/screens/classic_mode_screen.dart`)

Classic mode entry screen.

**Features**:
- High score display
- Play button
- Instructions
- Navigation to game screen

### Game Over Screen (`lib/screens/game_over_screen.dart`)

End game results screen.

**Features**:
- Score, level, lines display
- New high score detection
- Level completion detection
- Play again / Main menu options

## Animations

### Line Clear Animation (`lib/animations/line_clear_animation.dart`)

Particle explosion effect when lines are cleared.

**Features**:
- Particle system with physics
- Color-matched particles
- Fade-out effect
- 800ms duration

### Block Placement Effect (`lib/animations/block_placement_effect.dart`)

Visual feedback when block is placed.

**Features**:
- Scale animation
- Glow effect
- Quick feedback (500ms)

### Level Transition (`lib/animations/level_transition.dart`)

Celebration when leveling up.

**Features**:
- Large level number display
- Shake animation
- Fade in/out
- 2-second display

## Game Modes

### Adventure Mode (`lib/modes/adventure_mode.dart`)

Level-based gameplay with progression.

**Level Data Structure**:
- `levelNumber`: Level identifier
- `name`: Level name
- `description`: Level description
- `targetLines`: Lines to clear
- `timeLimit`: Optional time constraint
- `startingLevel`: Starting level for scoring
- `fallSpeed`: Initial fall speed
- `preFilledBlocks`: Optional pre-filled configuration

**Level Management**:
- `getLevel()`: Get level data by number
- `getHighestUnlockedLevel()`: Get progress
- `unlockLevel()`: Unlock next level
- `isLevelUnlocked()`: Check unlock status

**Persistence**:
- Uses `SharedPreferences` to save progress
- Key: `'highest_unlocked_level'`

### Classic Mode (`lib/modes/classic_mode.dart`)

Infinite play mode.

**Features**:
- High score tracking
- No level limits
- Progressive difficulty

**Persistence**:
- Uses `SharedPreferences` to save high score
- Key: `'classic_high_score'`

## Theme System

### Theme Data (`lib/themes/theme_data.dart`)

Defines theme properties.

**Theme Properties**:
- `name`: Theme name
- `primaryColor`: Main color
- `secondaryColor`: Secondary color
- `backgroundColor`: Background color
- `blockColors`: Color palette for blocks
- `backgroundGradient`: Background gradient
- `emoji`: Theme emoji

**Available Themes**:
- Space: Dark blues and purples
- Ocean: Ocean blues
- Forest: Green nature theme
- Neon: Vibrant purple neon
- Rainbow: Multi-color gradient

### Theme Manager (`lib/themes/theme_manager.dart`)

Manages theme selection and persistence.

**Methods**:
- `loadTheme()`: Load saved theme from storage
- `setTheme()`: Set and save theme
- `currentTheme`: Get current theme

**Persistence**:
- Uses `SharedPreferences`
- Key: `'selected_theme'`

## Features

### Motivational Messages (`lib/features/motivational_messages.dart`)

Kid-friendly encouragement messages.

**Message Categories**:
- General messages: Random encouragement
- Line clear messages: When lines are cleared
- Multi-line messages: Special messages for 2/3/4 lines
- Level up messages: When leveling up
- Power-up messages: When power-ups activate

**Usage**:
- `getRandomGeneral()`: Random general message
- `getMultiLine(lines)`: Message for multiple lines
- `getRandomLevelUp()`: Level up message
- `getRandomPowerUp()`: Power-up message

## Dependencies

### Main Dependencies

- **flutter_riverpod** (^2.4.9): State management
- **shared_preferences** (^2.2.2): Local storage
- **flutter_animate** (^4.3.0): Animation library
- **audioplayers** (^5.2.1): Sound effects (optional)

### Why These Dependencies?

- **Riverpod**: Modern, type-safe state management
- **SharedPreferences**: Simple key-value storage for progress
- **flutter_animate**: Declarative animation API
- **audioplayers**: For future sound implementation

## Performance Considerations

### Optimization Strategies

1. **Custom Painters**: Efficient rendering of game board
2. **State Management**: Minimal rebuilds with Riverpod
3. **Animation**: Hardware-accelerated animations
4. **Memory**: Proper disposal of timers and controllers
5. **Game Loop**: Efficient timer-based updates

### Best Practices

- Dispose resources in `dispose()` methods
- Use `const` constructors where possible
- Minimize widget rebuilds
- Efficient collision detection
- Optimized line clearing algorithm

## Future Enhancements

Potential improvements:

1. **Sound Effects**: Add audio feedback
2. **Music**: Background music per theme
3. **Multiplayer**: Local or online multiplayer
4. **Achievements**: Achievement system
5. **Leaderboards**: Global leaderboards
6. **More Themes**: Additional theme options
7. **Customization**: Custom color schemes
8. **Tutorial**: Interactive tutorial mode
9. **Statistics**: Detailed game statistics
10. **Accessibility**: Better accessibility features

## Code Style

- Follows Flutter/Dart style guide
- Uses meaningful variable names
- Comments for complex logic
- Consistent formatting
- Type safety with null safety

## Testing

To test the game:

1. Run on Android device/emulator
2. Test all game modes
3. Verify theme switching
4. Test gesture controls
5. Verify progress saving
6. Test level progression
7. Verify scoring system

## Troubleshooting

### Common Issues

1. **Game too fast**: Adjust `fallSpeed` in level data
2. **Controls not responsive**: Check gesture detection thresholds
3. **Memory leaks**: Ensure proper disposal of timers
4. **Performance issues**: Optimize custom painters
5. **State not updating**: Check Riverpod provider setup

## License

This project is for educational purposes.

