import { TetrominoPiece } from "./tetromino";
import { Position } from "./types";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export class GameBoard {
  grid: (string | null)[][];

  constructor() {
    this.grid = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null));
  }

  isValidPosition(piece: TetrominoPiece, offsetX: number = 0, offsetY: number = 0): boolean {
    const shape = piece.getShape();
    const x = piece.position.x + offsetX;
    const y = piece.position.y + offsetY;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const newX = x + col;
          const newY = y + row;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }

          if (newY >= 0 && this.grid[newY][newX] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placePiece(piece: TetrominoPiece): boolean {
    if (!this.isValidPosition(piece)) {
      return false;
    }

    const shape = piece.getShape();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const x = piece.position.x + col;
          const y = piece.position.y + row;
          if (y >= 0) {
            this.grid[y][x] = piece.color;
          }
        }
      }
    }
    return true;
  }

  clearLines(): number[] {
    const clearedLines: number[] = [];

    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (this.grid[row].every((cell) => cell !== null)) {
        clearedLines.push(row);
        this.grid.splice(row, 1);
        this.grid.unshift(Array(BOARD_WIDTH).fill(null));
        row++; // Check the same row again
      }
    }

    return clearedLines;
  }

  isGameOver(): boolean {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        if (this.grid[row][col] !== null) {
          return true;
        }
      }
    }
    return false;
  }

  reset(): void {
    this.grid = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null));
  }

  getGhostPosition(piece: TetrominoPiece): Position {
    let ghostY = piece.position.y;
    while (this.isValidPosition(piece, 0, ghostY + 1 - piece.position.y)) {
      ghostY++;
    }
    return { x: piece.position.x, y: ghostY };
  }
}

