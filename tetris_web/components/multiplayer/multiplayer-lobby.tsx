"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Play, X, UserCheck, Crown, Copy, Check, QrCode } from "lucide-react";
import { QRCodeDisplay } from "./qr-code-display";
import { Room, RoomPlayer } from "@/lib/types/user";

interface MultiplayerLobbyProps {
  room: Room;
  currentUserId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onToggleReady: () => void;
}

export function MultiplayerLobby({
  room,
  currentUserId,
  onStartGame,
  onLeaveRoom,
  onToggleReady,
}: MultiplayerLobbyProps) {
  const [players, setPlayers] = useState<RoomPlayer[]>(room.players || []);
  const [copied, setCopied] = useState(false);
  
  // For guests, match by player ID; for authenticated users, match by userId
  const currentPlayer = players.find(
    (p) => p.userId === currentUserId || p.id === currentUserId
  );
  
  // Check if current user is host
  // room.hostId is the user ID of the host
  // currentUserId should be the user ID for authenticated users, or player ID for guests
  // For authenticated users: room.hostId === currentUserId
  // For guests who are host: need to check if currentPlayer's userId matches room.hostId
  const isHost = 
    room.hostId === currentUserId || 
    (currentPlayer && currentPlayer.userId === room.hostId && currentPlayer.userId !== null);
  
  // At least one non-host player must be ready to start
  const nonHostPlayers = players.filter((p) => p.userId !== room.hostId && p.userId !== null);
  const atLeastOneReady = nonHostPlayers.length > 0 && nonHostPlayers.some((p) => p.ready);
  const allReady = players.length >= 2 && players.every((p) => p.ready);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Poll for room updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${room.id}`);
        const data = await response.json();
        if (data.room) {
          setPlayers(data.room.players || []);
        }
      } catch (error) {
        console.error("Failed to fetch room updates:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [room.id]);

  const handleReady = async () => {
    try {
      await fetch(`/api/rooms/${room.id}/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      onToggleReady();
    } catch (error) {
      console.error("Failed to toggle ready:", error);
    }
  };

  return (
    <div className="min-h-screen animated-bg grid-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-slate-900/90 border-2 border-blue-500/50 rounded-lg p-8 glow-effect">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 neon-text text-blue-400">
                {room.name}
              </h2>
              <p className="text-slate-400 mb-3">
                {room.gameMode} • {players.length}/{room.maxPlayers} players
              </p>
              {/* Room Code */}
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 border border-blue-500/50 rounded-lg px-4 py-2">
                  <p className="text-xs text-slate-400 mb-1">Room Code</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-blue-400 tracking-widest">
                      {room.roomCode}
                    </p>
                    <button
                      onClick={copyRoomCode}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
                {copied && (
                  <span className="text-sm text-green-400">Copied!</span>
                )}
              </div>
            </div>
            <button
              onClick={onLeaveRoom}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Players List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {players.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                isHost={player.userId === room.hostId}
                isCurrentUser={
                  player.userId === currentUserId || player.id === currentUserId
                }
                index={index}
              />
            ))}

            {/* Empty slots */}
            {Array.from({ length: room.maxPlayers - players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-6 flex items-center justify-center"
              >
                <div className="text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">Waiting for player...</p>
                </div>
              </div>
            ))}
          </div>

          {/* QR Code Section */}
          <div className="mb-6">
            <QRCodeDisplay roomCode={room.roomCode} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              {allReady && (
                <span className="text-green-400 font-semibold">
                  All players ready!
                </span>
              )}
              {atLeastOneReady && !allReady && (
                <span className="text-yellow-400 font-semibold">
                  {nonHostPlayers.filter((p) => p.ready).length} player(s) ready
                </span>
              )}
              {!atLeastOneReady && nonHostPlayers.length > 0 && (
                <span className="text-slate-500">
                  Waiting for players to be ready...
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {!isHost && (
                <button
                  onClick={handleReady}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    currentPlayer?.ready
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  {currentPlayer?.ready ? "Ready!" : "Ready Up"}
                </button>
              )}

              {isHost ? (
                <button
                  onClick={onStartGame}
                  disabled={!atLeastOneReady}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    atLeastOneReady
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  }`}
                  title={
                    !atLeastOneReady
                      ? "At least one player must be ready to start"
                      : "Start the game"
                  }
                >
                  <Play className="w-5 h-5" />
                  Start Game
                </button>
              ) : (
                <div className="text-slate-500 text-sm">
                  Waiting for host to start...
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PlayerCard({
  player,
  isHost,
  isCurrentUser,
  index,
}: {
  player: RoomPlayer;
  isHost: boolean;
  isCurrentUser: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-slate-800/80 border-2 rounded-lg p-6 ${
        isCurrentUser
          ? "border-blue-500 glow-effect"
          : player.ready
          ? "border-green-500/50"
          : "border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{player.username}</h3>
              {isHost && <Crown className="w-4 h-4 text-yellow-400" />}
              {isCurrentUser && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">Player {index + 1}</p>
          </div>
        </div>

        {player.ready && (
          <div className="flex items-center gap-2 text-green-400">
            <UserCheck className="w-5 h-5" />
            <span className="text-sm font-semibold">Ready</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

