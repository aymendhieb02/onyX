export enum TetrominoType {
  I = "I",
  O = "O",
  T = "T",
  S = "S",
  Z = "Z",
  J = "J",
  L = "L",
}

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  position: Position;
  rotation: number;
  color: string;
}

export enum GameState {
  MENU = "MENU",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  GAME_OVER = "GAME_OVER",
}

export enum GameMode {
  CLASSIC = "CLASSIC",
  SPRINT = "SPRINT",
  ULTRA = "ULTRA",
  CUSTOM = "CUSTOM",
}

export interface GameStats {
  score: number;
  level: number;
  lines: number;
  time: number;
}

