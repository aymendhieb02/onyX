export interface Level {
  id: number;
  name: string;
  description: string;
  targetLines: number;
  timeLimit?: number; // in seconds
  startingLevel: number;
  fallSpeed: number;
  unlockScore?: number; // Score needed to unlock
  rewards: {
    coins?: number;
    xp?: number;
    unlockTheme?: string;
  };
  preFilledBlocks?: number[][]; // Optional pre-filled configuration
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Getting Started",
    description: "Clear 5 lines to complete your first level!",
    targetLines: 5,
    startingLevel: 1,
    fallSpeed: 1000,
    rewards: { coins: 10, xp: 50 },
  },
  {
    id: 2,
    name: "Speed Up",
    description: "Clear 10 lines as the game speeds up!",
    targetLines: 10,
    startingLevel: 1,
    fallSpeed: 900,
    rewards: { coins: 20, xp: 100 },
  },
  {
    id: 3,
    name: "Time Challenge",
    description: "Clear 8 lines in 60 seconds!",
    targetLines: 8,
    timeLimit: 60,
    startingLevel: 2,
    fallSpeed: 800,
    rewards: { coins: 30, xp: 150 },
  },
  {
    id: 4,
    name: "Double Trouble",
    description: "Clear 15 lines to advance!",
    targetLines: 15,
    startingLevel: 2,
    fallSpeed: 700,
    rewards: { coins: 40, xp: 200 },
  },
  {
    id: 5,
    name: "Rush Hour",
    description: "Clear 12 lines in 45 seconds!",
    targetLines: 12,
    timeLimit: 45,
    startingLevel: 3,
    fallSpeed: 600,
    rewards: { coins: 50, xp: 250 },
  },
  {
    id: 6,
    name: "Tower Challenge",
    description: "Clear 20 lines with increasing difficulty!",
    targetLines: 20,
    startingLevel: 3,
    fallSpeed: 500,
    rewards: { coins: 60, xp: 300 },
  },
  {
    id: 7,
    name: "Tetris Master",
    description: "Clear 25 lines and achieve at least 2 Tetris clears!",
    targetLines: 25,
    startingLevel: 4,
    fallSpeed: 400,
    rewards: { coins: 75, xp: 400 },
  },
  {
    id: 8,
    name: "Lightning Round",
    description: "Clear 10 lines in 30 seconds!",
    targetLines: 10,
    timeLimit: 30,
    startingLevel: 4,
    fallSpeed: 350,
    rewards: { coins: 80, xp: 450 },
  },
  {
    id: 9,
    name: "Endurance Test",
    description: "Clear 30 lines without failing!",
    targetLines: 30,
    startingLevel: 5,
    fallSpeed: 300,
    rewards: { coins: 100, xp: 500 },
  },
  {
    id: 10,
    name: "Ultimate Challenge",
    description: "Clear 40 lines at maximum speed!",
    targetLines: 40,
    startingLevel: 6,
    fallSpeed: 200,
    rewards: { coins: 150, xp: 750, unlockTheme: "neon" },
  },
];

export function getLevelById(id: number): Level | undefined {
  return LEVELS.find((level) => level.id === id);
}

export function getUnlockedLevels(completedLevelIds: number[]): Level[] {
  return LEVELS.filter((level) => {
    if (level.id === 1) return true; // First level always unlocked
    const previousLevel = LEVELS.find((l) => l.id === level.id - 1);
    return previousLevel && completedLevelIds.includes(previousLevel.id);
  });
}

