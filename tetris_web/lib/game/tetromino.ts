import { TetrominoType, Position, Tetromino } from "./types";

const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  [TetrominoType.I]: [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
  ],
  [TetrominoType.O]: [
    [[1, 1], [1, 1]],
  ],
  [TetrominoType.T]: [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
  ],
  [TetrominoType.S]: [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
  ],
  [TetrominoType.Z]: [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
  ],
  [TetrominoType.J]: [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
  ],
  [TetrominoType.L]: [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
  ],
};

const TETROMINO_COLORS: Record<TetrominoType, string> = {
  [TetrominoType.I]: "#00f0f0",
  [TetrominoType.O]: "#f0f000",
  [TetrominoType.T]: "#a000f0",
  [TetrominoType.S]: "#00f000",
  [TetrominoType.Z]: "#f00000",
  [TetrominoType.J]: "#0000f0",
  [TetrominoType.L]: "#f0a000",
};

export class TetrominoPiece {
  type: TetrominoType;
  position: Position;
  rotation: number;
  color: string;

  constructor(type: TetrominoType, position: Position = { x: 0, y: 0 }, rotation: number = 0) {
    this.type = type;
    this.position = position;
    this.rotation = rotation;
    this.color = TETROMINO_COLORS[type];
  }

  getShape(): number[][] {
    const shapes = TETROMINO_SHAPES[this.type];
    return shapes[this.rotation % shapes.length];
  }

  rotate(): void {
    const shapes = TETROMINO_SHAPES[this.type];
    this.rotation = (this.rotation + 1) % shapes.length;
  }

  rotateBack(): void {
    const shapes = TETROMINO_SHAPES[this.type];
    this.rotation = (this.rotation - 1 + shapes.length) % shapes.length;
  }

  copy(): TetrominoPiece {
    return new TetrominoPiece(this.type, { ...this.position }, this.rotation);
  }

  static random(): TetrominoPiece {
    const types = Object.values(TetrominoType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new TetrominoPiece(randomType);
  }
}

