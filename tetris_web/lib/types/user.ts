export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  stats: {
    totalScore: number;
    totalLines: number;
    totalGames: number;
    wins: number;
    losses: number;
    highestLevel: number;
    coins: number;
    xp: number;
    level: number;
    rank: string;
  };
  completedLevels: number[];
  unlockedThemes: string[];
  achievements: string[];
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  hostUsername: string;
  players: RoomPlayer[];
  maxPlayers: number;
  status: "waiting" | "playing" | "finished";
  gameMode: "classic" | "sprint" | "ultra";
  settings: {
    speed: number;
    garbageLines: boolean;
    powerUps: boolean;
  };
  createdAt: Date;
}

export interface RoomPlayer {
  userId: string;
  username: string;
  avatar?: string;
  ready: boolean;
  score: number;
  lines: number;
  status: "alive" | "eliminated";
}

export interface GameSession {
  id: string;
  roomId: string;
  players: RoomPlayer[];
  startTime: Date;
  endTime?: Date;
  winner?: string;
}

