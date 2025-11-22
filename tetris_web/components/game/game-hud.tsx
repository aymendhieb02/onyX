"use client";

import { useEffect, useState } from "react";
import { GameEngine } from "@/lib/game/engine";
import { GameStats } from "@/lib/game/types";
import { motion } from "framer-motion";
import { Trophy, Zap, Grid3x3, Clock } from "lucide-react";

interface GameHUDProps {
  engine: GameEngine;
}

export function GameHUD({ engine }: GameHUDProps) {
  const [stats, setStats] = useState<GameStats>(engine.stats);
  const [nextPiece, setNextPiece] = useState(engine.nextPiece);
  const [holdPiece, setHoldPiece] = useState(engine.holdPiece);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({ ...engine.stats });
      setNextPiece(engine.nextPiece);
      setHoldPiece(engine.holdPiece);
    }, 16);

    return () => clearInterval(interval);
  }, [engine]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Trophy}
          label="Score"
          value={stats.score.toLocaleString()}
          color="text-yellow-400"
        />
        <StatCard
          icon={Zap}
          label="Level"
          value={stats.level.toString()}
          color="text-blue-400"
        />
        <StatCard
          icon={Grid3x3}
          label="Lines"
          value={stats.lines.toString()}
          color="text-green-400"
        />
        <StatCard
          icon={Clock}
          label="Time"
          value={formatTime(stats.time)}
          color="text-purple-400"
        />
      </div>

      {/* Next Piece */}
      <div className="bg-slate-900/50 border border-blue-500/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Next</h3>
        {nextPiece && <PiecePreview piece={nextPiece} />}
      </div>

      {/* Hold Piece */}
      <div className="bg-slate-900/50 border border-blue-500/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Hold</h3>
        {holdPiece ? (
          <PiecePreview piece={holdPiece} />
        ) : (
          <div className="h-16 flex items-center justify-center text-slate-600 text-sm">
            Press C to hold
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-slate-900/50 border border-blue-500/30 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color} neon-text`}>{value}</p>
    </motion.div>
  );
}

function PiecePreview({ piece }: { piece: any }) {
  const shape = piece.getShape();
  const cellSize = 20;

  return (
    <div className="flex items-center justify-center h-16">
      <svg
        width={shape[0].length * cellSize}
        height={shape.length * cellSize}
        className="block"
      >
        {shape.map((row: number[], rowIdx: number) =>
          row.map((cell: number, colIdx: number) => {
            if (cell === 1) {
              return (
                <rect
                  key={`${rowIdx}-${colIdx}`}
                  x={colIdx * cellSize}
                  y={rowIdx * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={piece.color}
                  className="drop-shadow-lg"
                />
              );
            }
            return null;
          })
        )}
      </svg>
    </div>
  );
}

