"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key, ArrowLeft, Users } from "lucide-react";

interface RoomCodeJoinProps {
  onJoinRoom: (roomCode: string) => void;
  onBack: () => void;
}

export function RoomCodeJoin({ onJoinRoom, onBack }: RoomCodeJoinProps) {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!roomCode || roomCode.length !== 6) {
      setError("Please enter a valid 6-character room code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/rooms/join-by-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: roomCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join room");
      }

      onJoinRoom(data.room.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg grid-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/90 border-2 border-blue-500/50 rounded-lg p-8 glow-effect">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              <Key className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Join Room</h2>
            </div>
          </div>

          <p className="text-slate-400 mb-6">
            Enter the 6-character room code to join a friend's game
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                  if (value.length <= 6) {
                    setRoomCode(value);
                    setError("");
                  }
                }}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || roomCode.length !== 6}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
            >
              {loading ? (
                "Joining..."
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Join Room
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

