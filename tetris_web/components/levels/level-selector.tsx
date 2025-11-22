"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, Trophy, Star } from "lucide-react";
import { LEVELS, getUnlockedLevels } from "@/lib/game/levels";
import { Level } from "@/lib/game/levels";

interface LevelSelectorProps {
  completedLevelIds: number[];
  onSelectLevel: (level: Level) => void;
  userLevel: number;
}

export function LevelSelector({
  completedLevelIds,
  onSelectLevel,
  userLevel,
}: LevelSelectorProps) {
  const unlockedLevels = getUnlockedLevels(completedLevelIds);

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-2 neon-text text-blue-400">
          Adventure Mode
        </h2>
        <p className="text-slate-400">
          Complete levels to unlock new challenges and rewards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEVELS.map((level, index) => {
          const isUnlocked = unlockedLevels.some((l) => l.id === level.id);
          const isCompleted = completedLevelIds.includes(level.id);
          const isLocked = !isUnlocked;

          return (
            <LevelCard
              key={level.id}
              level={level}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              isLocked={isLocked}
              onSelect={() => !isLocked && onSelectLevel(level)}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}

function LevelCard({
  level,
  isUnlocked,
  isCompleted,
  isLocked,
  onSelect,
  index,
}: {
  level: Level;
  isUnlocked: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
      onClick={!isLocked ? onSelect : undefined}
      className={`relative bg-slate-900/80 border-2 rounded-lg p-6 cursor-pointer transition-all ${
        isLocked
          ? "border-slate-700 opacity-50 cursor-not-allowed"
          : isCompleted
          ? "border-yellow-500/50 hover:border-yellow-500"
          : "border-blue-500/50 hover:border-blue-500"
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
          <Lock className="w-12 h-12 text-slate-600" />
        </div>
      )}

      {isCompleted && (
        <div className="absolute top-4 right-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{level.name}</h3>
          <p className="text-sm text-slate-400">{level.description}</p>
        </div>
        <div className="text-2xl font-bold text-blue-400">#{level.id}</div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Target className="w-4 h-4" />
          <span>Clear {level.targetLines} lines</span>
        </div>
        {level.timeLimit && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Star className="w-4 h-4" />
            <span>Time limit: {level.timeLimit}s</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Trophy className="w-4 h-4" />
          <span>
            Reward: {level.rewards.coins} coins, {level.rewards.xp} XP
          </span>
        </div>
      </div>

      {!isLocked && (
        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors">
          {isCompleted ? "Play Again" : "Start Level"}
        </button>
      )}
    </motion.div>
  );
}

