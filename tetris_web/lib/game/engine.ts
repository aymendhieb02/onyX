import { GameState, GameMode, GameStats } from "./types";
import { GameBoard, BOARD_WIDTH } from "./board";
import { TetrominoPiece, TetrominoType } from "./tetromino";

export class GameEngine {
  board: GameBoard;
  currentPiece: TetrominoPiece | null = null;
  nextPiece: TetrominoPiece | null = null;
  holdPiece: TetrominoPiece | null = null;
  canHold = true;
  
  stats: GameStats = {
    score: 0,
    level: 1,
    lines: 0,
    time: 0,
  };
  
  state: GameState = GameState.MENU;
  mode: GameMode = GameMode.CLASSIC;
  
  fallSpeed = 1000; // milliseconds
  lastFallTime = 0;
  isSoftDropping = false;
  
  // Callbacks
  onStateChange?: (state: GameState) => void;
  onStatsChange?: (stats: GameStats) => void;
  onLinesClear?: (lines: number[]) => void;
  onGameOver?: () => void;

  constructor() {
    this.board = new GameBoard();
    this.nextPiece = TetrominoPiece.random();
  }

  start(mode: GameMode = GameMode.CLASSIC): void {
    this.mode = mode;
    this.board.reset();
    this.stats = {
      score: 0,
      level: 1,
      lines: 0,
      time: 0,
    };
    this.state = GameState.PLAYING;
    this.fallSpeed = 1000;
    this.canHold = true;
    this.spawnPiece();
    this.onStateChange?.(this.state);
  }

  pause(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.onStateChange?.(this.state);
    }
  }

  resume(): void {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.onStateChange?.(this.state);
    }
  }

  spawnPiece(): void {
    if (this.nextPiece) {
      this.currentPiece = this.nextPiece;
      this.nextPiece = TetrominoPiece.random();
      this.currentPiece.position = {
        x: Math.floor((BOARD_WIDTH - this.currentPiece.getShape()[0].length) / 2),
        y: 0,
      };
      this.canHold = true;

      if (!this.board.isValidPosition(this.currentPiece)) {
        this.gameOver();
      }
    }
  }

  update(deltaTime: number): void {
    if (this.state !== GameState.PLAYING || !this.currentPiece) return;

    this.stats.time += deltaTime;
    
    // Check mode-specific win conditions
    if (this.mode === GameMode.SPRINT && this.stats.lines >= 40) {
      // Sprint completed
      this.gameOver();
      return;
    }
    
    if (this.mode === GameMode.ULTRA && this.stats.time >= 120000) {
      // Ultra mode: 2 minutes elapsed
      this.gameOver();
      return;
    }
    
    const speed = this.isSoftDropping ? this.fallSpeed / 10 : this.fallSpeed;

    if (this.stats.time - this.lastFallTime >= speed) {
      this.moveDown();
      this.lastFallTime = this.stats.time;
    }

    this.onStatsChange?.(this.stats);
  }

  moveLeft(): void {
    if (this.currentPiece && this.board.isValidPosition(this.currentPiece, -1, 0)) {
      this.currentPiece.position.x--;
    }
  }

  moveRight(): void {
    if (this.currentPiece && this.board.isValidPosition(this.currentPiece, 1, 0)) {
      this.currentPiece.position.x++;
    }
  }

  moveDown(): boolean {
    if (!this.currentPiece) return false;

    if (this.board.isValidPosition(this.currentPiece, 0, 1)) {
      this.currentPiece.position.y++;
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  hardDrop(): void {
    if (!this.currentPiece) return;

    let dropDistance = 0;
    while (this.board.isValidPosition(this.currentPiece, 0, 1)) {
      this.currentPiece.position.y++;
      dropDistance++;
    }

    this.stats.score += dropDistance * 2;
    this.lockPiece();
  }

  rotate(): void {
    if (!this.currentPiece) return;

    const testPiece = this.currentPiece.copy();
    testPiece.rotate();

    if (this.board.isValidPosition(testPiece)) {
      this.currentPiece.rotate();
    } else {
      // Try wall kicks
      for (const offset of [-1, 1, -2, 2]) {
        if (this.board.isValidPosition(testPiece, offset, 0)) {
          this.currentPiece.rotate();
          this.currentPiece.position.x += offset;
          return;
        }
      }
    }
  }

  rotateBack(): void {
    if (!this.currentPiece) return;

    const testPiece = this.currentPiece.copy();
    testPiece.rotateBack();

    if (this.board.isValidPosition(testPiece)) {
      this.currentPiece.rotateBack();
    }
  }

  hold(): void {
    if (!this.currentPiece || !this.canHold) return;

    if (this.holdPiece) {
      const temp = this.currentPiece;
      this.currentPiece = new TetrominoPiece(
        this.holdPiece.type,
        {
          x: Math.floor((BOARD_WIDTH - this.holdPiece.getShape()[0].length) / 2),
          y: 0,
        },
        0
      );
      this.holdPiece = new TetrominoPiece(temp.type, { x: 0, y: 0 }, 0);
    } else {
      this.holdPiece = new TetrominoPiece(this.currentPiece.type, { x: 0, y: 0 }, 0);
      this.spawnPiece();
    }

    this.canHold = false;
  }

  lockPiece(): void {
    if (!this.currentPiece) return;

    this.board.placePiece(this.currentPiece);
    const clearedLines = this.board.clearLines();

    if (clearedLines.length > 0) {
      this.clearLines(clearedLines.length);
      this.onLinesClear?.(clearedLines);
    }

    if (this.board.isGameOver()) {
      this.gameOver();
    } else {
      this.spawnPiece();
    }
  }

  clearLines(count: number): void {
    this.stats.lines += count;
    
    // Scoring
    const lineScores = [0, 100, 300, 500, 800];
    this.stats.score += lineScores[count] * this.stats.level;

    // Level up every 10 lines
    const newLevel = Math.floor(this.stats.lines / 10) + 1;
    if (newLevel > this.stats.level) {
      this.stats.level = newLevel;
      this.fallSpeed = Math.max(50, 1000 - (this.stats.level - 1) * 50);
    }
  }

  gameOver(): void {
    this.state = GameState.GAME_OVER;
    this.onStateChange?.(this.state);
    this.onGameOver?.();
  }

  reset(): void {
    this.board.reset();
    this.currentPiece = null;
    this.nextPiece = TetrominoPiece.random();
    this.holdPiece = null;
    this.state = GameState.MENU;
    this.stats = {
      score: 0,
      level: 1,
      lines: 0,
      time: 0,
    };
  }
}

