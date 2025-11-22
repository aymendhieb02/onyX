"use client";

import { motion } from "framer-motion";
import { GameMode } from "@/lib/game/types";
import { Play, Trophy, Zap, Target, Settings, Users } from "lucide-react";

interface MainMenuProps {
  onStartGame: (mode: GameMode) => void;
  onMultiplayer: () => void;
  onCreateRoom?: () => void;
  user?: any;
}

export function MainMenu({ onStartGame, onMultiplayer, onCreateRoom, user }: MainMenuProps) {
  const modes = [
    {
      mode: GameMode.CLASSIC,
      title: "Classic",
      description: "Endless gameplay with increasing difficulty",
      icon: Play,
      color: "blue",
    },
    {
      mode: GameMode.SPRINT,
      title: "Sprint",
      description: "Clear 40 lines as fast as possible",
      icon: Zap,
      color: "yellow",
    },
    {
      mode: GameMode.ULTRA,
      title: "Ultra",
      description: "Score as many points as possible in 2 minutes",
      icon: Trophy,
      color: "purple",
    },
    {
      mode: GameMode.CUSTOM,
      title: "Custom",
      description: "Create your own challenge",
      icon: Target,
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Title */}
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-6xl md:text-8xl font-bold text-center mb-4 neon-text text-blue-400"
        >
          TETRIS
        </motion.h1>
        <p className="text-center text-slate-400 mb-12 text-lg">
          Futuristic Puzzle Experience
        </p>

        {/* Multiplayer Buttons */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateRoom}
              className="bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-green-500/50 rounded-lg p-6 text-left hover:border-green-500 transition-all glow-effect-green group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Create Room
                  </h3>
                  <p className="text-sm text-green-100">
                    Start a new game room
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMultiplayer}
              className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-500/50 rounded-lg p-6 text-left hover:border-purple-500 transition-all glow-effect-purple group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Join Room
                  </h3>
                  <p className="text-sm text-purple-100">
                    Enter a room code
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        )}

        {/* Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {modes.map((mode, idx) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.mode}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStartGame(mode.mode)}
                className={`bg-slate-900/80 border-2 rounded-lg p-6 text-left transition-all group ${
                  mode.color === "blue" ? "border-blue-500/50 hover:border-blue-500" :
                  mode.color === "yellow" ? "border-yellow-500/50 hover:border-yellow-500" :
                  mode.color === "purple" ? "border-purple-500/50 hover:border-purple-500" :
                  "border-green-500/50 hover:border-green-500"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg transition-colors ${
                    mode.color === "blue" ? "bg-blue-500/20 group-hover:bg-blue-500/30" :
                    mode.color === "yellow" ? "bg-yellow-500/20 group-hover:bg-yellow-500/30" :
                    mode.color === "purple" ? "bg-purple-500/20 group-hover:bg-purple-500/30" :
                    "bg-green-500/20 group-hover:bg-green-500/30"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      mode.color === "blue" ? "text-blue-400" :
                      mode.color === "yellow" ? "text-yellow-400" :
                      mode.color === "purple" ? "text-purple-400" :
                      "text-green-400"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {mode.title}
                    </h3>
                    <p className="text-sm text-slate-400">{mode.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 text-sm"
        >
          Use arrow keys to play • Press ESC to pause
        </motion.div>
      </motion.div>
    </div>
  );
}

