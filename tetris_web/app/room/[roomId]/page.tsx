"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { MultiplayerLobby } from "@/components/multiplayer/multiplayer-lobby";
import { Room } from "@/lib/types/user";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestPlayerId, setGuestPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const roomId = params.roomId as string;
    if (!roomId) {
      setError("Invalid room ID");
      setLoading(false);
      return;
    }

    // Check if user is logged in
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          // Check if we have guest info in sessionStorage
          const storedGuestId = sessionStorage.getItem("guestPlayerId");
          const storedGuestName = sessionStorage.getItem("guestName");
          const storedRoomId = sessionStorage.getItem("currentRoomId");
          
          if (storedGuestId && storedRoomId === roomId) {
            setIsGuest(true);
            setGuestPlayerId(storedGuestId);
            setUser({
              id: storedGuestId,
              username: storedGuestName || "Guest",
              isGuest: true,
            });
          }
        }
      })
      .catch(() => {});

    // Fetch room data
    const loadRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Room not found");
          } else {
            setError("Failed to load room");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setRoom(data.room);
      } catch (err) {
        console.error("Failed to fetch room:", err);
        setError("Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [params]);

  const fetchRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Room not found");
        } else {
          setError("Failed to load room");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setRoom(data.room);
    } catch (err) {
      console.error("Failed to fetch room:", err);
      setError("Failed to load room");
    } finally {
      setLoading(false);
    }
  };

  // Refresh room data periodically
  useEffect(() => {
    if (!room) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${room.id}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setRoom(data.room);
        }
      } catch (err) {
        console.error("Failed to refresh room:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [room?.id]);

  const handleStartGame = async () => {
    if (!room) return;

    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "playing" }),
      });

      if (response.ok) {
        // Redirect to game screen
        router.push(`/game/${room.id}`);
      }
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  const handleLeaveRoom = () => {
    if (isGuest) {
      sessionStorage.removeItem("guestPlayerId");
      sessionStorage.removeItem("guestName");
      sessionStorage.removeItem("currentRoomId");
    }
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/90 border-2 border-red-500/50 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-6">{error || "Room not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  // Check if user is in the room
  const currentPlayer = room.players.find(
    (p) =>
      (user && !isGuest && p.userId === user.id) ||
      (isGuest && guestPlayerId && p.id === guestPlayerId)
  );

  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/90 border-2 border-yellow-500/50 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Not in Room
          </h2>
          <p className="text-yellow-400 mb-6">
            You need to join this room first.
          </p>
          <button
            onClick={() => router.push(`/join/${room.roomCode}`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
          >
            Join Room
          </button>
        </motion.div>
      </div>
    );
  }

  const handleToggleReady = async () => {
    try {
      const endpoint = isGuest 
        ? `/api/rooms/${room.id}/ready-guest`
        : `/api/rooms/${room.id}/ready`;
      
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(isGuest ? { playerId: guestPlayerId } : {}),
      });
      
      // Refresh room data
      if (room) {
        try {
          const response = await fetch(`/api/rooms/${room.id}`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setRoom(data.room);
          }
        } catch (err) {
          console.error("Failed to refresh room:", err);
        }
      }
    } catch (error) {
      console.error("Failed to toggle ready:", error);
    }
  };

  // For host detection: pass user.id for authenticated users (matches room.hostId)
  // For guests: pass their player's userId if available, otherwise player ID (won't match host but that's OK)
  const lobbyUserId = user?.id || currentPlayer?.userId || (isGuest && guestPlayerId ? guestPlayerId : "");

  return (
    <div className="min-h-screen animated-bg grid-pattern">
      <MultiplayerLobby
        room={room}
        currentUserId={lobbyUserId}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
        onToggleReady={handleToggleReady}
      />
    </div>
  );
}

