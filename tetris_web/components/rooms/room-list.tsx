"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Play, Plus, Search, ArrowLeft } from "lucide-react";
import { Room } from "@/lib/types/user";

interface RoomListProps {
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  userId: string;
  onBack?: () => void;
}

export function RoomList({ onJoinRoom, onCreateRoom, userId, onBack }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.status === "waiting" &&
      room.players.length < room.maxPlayers &&
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </button>
          )}
          <h2 className="text-3xl font-bold text-white neon-text text-blue-400">
            Multiplayer Rooms
          </h2>
        </div>
        <button
          onClick={onCreateRoom}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Room
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search rooms..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Room List */}
      {loading ? (
        <div className="text-center text-slate-400 py-12">Loading rooms...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center text-slate-400 py-12">
          No available rooms. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={() => onJoinRoom(room.id)}
              isHost={room.hostId === userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomCard({
  room,
  onJoin,
  isHost,
}: {
  room: Room;
  onJoin: () => void;
  isHost: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-slate-900/80 border-2 border-blue-500/50 rounded-lg p-6 hover:border-blue-500 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
          <p className="text-sm text-slate-400">
            Host: {room.hostUsername}
            {isHost && <span className="ml-2 text-blue-400">(You)</span>}
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
          {room.gameMode}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>
            {room.players.length}/{room.maxPlayers} players
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onJoin}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
        >
          <Play className="w-4 h-4" />
          Join
        </button>
      </div>
    </motion.div>
  );
}

