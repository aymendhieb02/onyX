"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Zap } from "lucide-react";
import { GameBoard } from "@/components/game/game-board";
import { GameEngine } from "@/lib/game/engine";
import { GameState } from "@/lib/game/types";
import { Room, RoomPlayer } from "@/lib/types/user";

interface MultiplayerGameScreenProps {
  room: Room;
  currentUserId: string;
  onGameEnd: (results: any) => void;
  onLeave: () => void;
}

export function MultiplayerGameScreen({
  room,
  currentUserId,
  onGameEnd,
  onLeave,
}: MultiplayerGameScreenProps) {
  const [engine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [players, setPlayers] = useState<RoomPlayer[]>(room.players || []);
  const [gameStartTime] = useState(Date.now());
  const gameLoopRef = useRef<number>();

  useEffect(() => {
    engine.onStateChange = (state) => setGameState(state);
    engine.onStatsChange = () => {
      // Update local player stats
      updatePlayerStats();
    };
    engine.onGameOver = () => {
      handleGameOver();
    };

    // Start game
    engine.start();

    // Game loop
    let lastTime = Date.now();
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      if (engine.state === GameState.PLAYING) {
        engine.update(deltaTime);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    // Keyboard controls
    const handleKeyPress = (e: KeyboardEvent) => {
      if (engine.state !== GameState.PLAYING) return;

      switch (e.key) {
        case "ArrowLeft":
          engine.moveLeft();
          break;
        case "ArrowRight":
          engine.moveRight();
          break;
        case "ArrowDown":
          engine.isSoftDropping = true;
          break;
        case "ArrowUp":
        case "x":
        case "X":
          engine.rotate();
          break;
        case "z":
        case "Z":
          engine.rotateBack();
          break;
        case " ":
          e.preventDefault();
          engine.hardDrop();
          break;
        case "c":
        case "C":
          engine.hold();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        engine.isSoftDropping = false;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    // Poll for opponent updates
    const pollInterval = setInterval(() => {
      fetchRoomState();
    }, 1000);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      clearInterval(pollInterval);
    };
  }, [engine]);

  const fetchRoomState = async () => {
    try {
      const response = await fetch(`/api/rooms/${room.id}`);
      const data = await response.json();
      if (data.room) {
        setPlayers(data.room.players || []);
      }
    } catch (error) {
      console.error("Failed to fetch room state:", error);
    }
  };

  const updatePlayerStats = async () => {
    try {
      await fetch(`/api/rooms/${room.id}/update-stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: engine.stats.score,
          lines: engine.stats.lines,
        }),
      });
    } catch (error) {
      console.error("Failed to update stats:", error);
    }
  };

  const handleGameOver = async () => {
    try {
      await fetch(`/api/rooms/${room.id}/game-over`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: engine.stats.score,
          lines: engine.stats.lines,
        }),
      });
      onGameEnd({ score: engine.stats.score, lines: engine.stats.lines });
    } catch (error) {
      console.error("Failed to report game over:", error);
    }
  };

  const currentPlayer = players.find((p) => p.userId === currentUserId);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen animated-bg grid-pattern p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white neon-text text-blue-400">
            {room.name}
          </h2>
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors"
          >
            Leave Game
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/80 border-2 border-blue-500/50 rounded-lg p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Leaderboard</h3>
              </div>

              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <PlayerScoreCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                    isCurrentUser={player.userId === currentUserId}
                    isEliminated={player.status === "eliminated"}
                  />
                ))}
              </div>

              {/* Current Player Stats */}
              {currentPlayer && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="space-y-2">
                    <StatRow label="Score" value={engine.stats.score.toLocaleString()} />
                    <StatRow label="Lines" value={engine.stats.lines.toString()} />
                    <StatRow label="Level" value={engine.stats.level.toString()} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/80 border-2 border-blue-500/50 rounded-lg p-6">
              <div className="flex flex-col items-center">
                <GameBoard engine={engine} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerScoreCard({
  player,
  rank,
  isCurrentUser,
  isEliminated,
}: {
  player: RoomPlayer;
  rank: number;
  isCurrentUser: boolean;
  isEliminated: boolean;
}) {
  const medalColors = {
    1: "text-yellow-400",
    2: "text-slate-300",
    3: "text-orange-400",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-3 rounded-lg border-2 ${
        isCurrentUser
          ? "bg-blue-500/20 border-blue-500"
          : isEliminated
          ? "bg-red-500/10 border-red-500/50 opacity-50"
          : "bg-slate-800/50 border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`text-lg font-bold ${
              rank <= 3 ? medalColors[rank as keyof typeof medalColors] : "text-slate-400"
            }`}
          >
            #{rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{player.username}</span>
              {isCurrentUser && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                  You
                </span>
              )}
            </div>
            {isEliminated && (
              <span className="text-xs text-red-400">Eliminated</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-white">{player.score.toLocaleString()}</div>
          <div className="text-xs text-slate-400">{player.lines} lines</div>
        </div>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

