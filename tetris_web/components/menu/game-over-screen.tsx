"use client";

import { motion } from "framer-motion";
import { GameEngine } from "@/lib/game/engine";
import { Trophy, RotateCcw, Home } from "lucide-react";

interface GameOverScreenProps {
  engine: GameEngine;
  onRestart: () => void;
}

export function GameOverScreen({ engine, onRestart }: GameOverScreenProps) {
  const stats = engine.stats;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="bg-slate-900/95 border-2 border-blue-500/50 rounded-lg p-8 max-w-md w-full glow-effect">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-white mb-2 neon-text text-blue-400">
            Game Over
          </h2>

          <div className="mt-8 space-y-4">
            <StatRow label="Final Score" value={stats.score.toLocaleString()} />
            <StatRow label="Level Reached" value={stats.level.toString()} />
            <StatRow label="Lines Cleared" value={stats.lines.toString()} />
            <StatRow
              label="Time Played"
              value={`${Math.floor(stats.time / 1000)}s`}
            />
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-colors"
            >
              <Home className="w-4 h-4" />
              Main Menu
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-700">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-bold text-lg">{value}</span>
    </div>
  );
}

