export interface Mission {
  id: string;
  name: string;
  description: string;
  type: "lines" | "score" | "time" | "combo" | "tetris" | "level";
  target: number;
  reward: {
    coins: number;
    xp: number;
  };
  progress: number;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  type: "daily" | "weekly" | "achievement";
  target: number;
  current: number;
  reward: {
    coins: number;
    xp: number;
  };
  expiresAt?: Date;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  totalScore: number;
  totalLines: number;
  totalGames: number;
  wins: number;
  losses: number;
  highestLevel: number;
  coins: number;
  xp: number;
  level: number; // User level based on XP
  rank: string;
}

export const MISSIONS: Mission[] = [
  {
    id: "clear-100-lines",
    name: "Line Master",
    description: "Clear 100 lines in total",
    type: "lines",
    target: 100,
    reward: { coins: 100, xp: 200 },
    progress: 0,
    completed: false,
  },
  {
    id: "score-10000",
    name: "Score Champion",
    description: "Reach 10,000 points in a single game",
    type: "score",
    target: 10000,
    reward: { coins: 150, xp: 300 },
    progress: 0,
    completed: false,
  },
  {
    id: "clear-5-tetris",
    name: "Tetris Expert",
    description: "Clear 5 Tetris (4 lines) in one game",
    type: "tetris",
    target: 5,
    reward: { coins: 200, xp: 400 },
    progress: 0,
    completed: false,
  },
  {
    id: "reach-level-10",
    name: "Level Up",
    description: "Reach level 10 in a single game",
    type: "level",
    target: 10,
    reward: { coins: 250, xp: 500 },
    progress: 0,
    completed: false,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-game",
    name: "First Steps",
    description: "Complete your first game",
    icon: "🎮",
    unlocked: false,
  },
  {
    id: "first-tetris",
    name: "Tetris Novice",
    description: "Clear your first Tetris (4 lines)",
    icon: "🔥",
    unlocked: false,
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Complete Sprint mode in under 2 minutes",
    icon: "⚡",
    unlocked: false,
  },
  {
    id: "multiplayer-victory",
    name: "Champion",
    description: "Win your first multiplayer match",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "perfect-clear",
    name: "Perfect Clear",
    description: "Clear the entire board",
    icon: "✨",
    unlocked: false,
  },
];

export function calculateUserLevel(xp: number): number {
  // Level formula: XP needed = 100 * level^2
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getRank(level: number): string {
  if (level < 5) return "Beginner";
  if (level < 10) return "Amateur";
  if (level < 15) return "Intermediate";
  if (level < 20) return "Advanced";
  if (level < 25) return "Expert";
  if (level < 30) return "Master";
  return "Grandmaster";
}

export function calculateXPForLevel(level: number): number {
  return 100 * level * level;
}

