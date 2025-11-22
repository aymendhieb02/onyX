"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Users, LogIn, User } from "lucide-react";

export default function JoinRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [guestName, setGuestName] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const roomCodeParam = params.roomCode as string;
    if (roomCodeParam) {
      setRoomCode(roomCodeParam.toUpperCase());
    }

    // Check if user is logged in
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params]);

  const handleJoinAsGuest = async () => {
    if (!guestName.trim() || guestName.trim().length < 2) {
      setError("Please enter a name (at least 2 characters)");
      return;
    }

    setJoining(true);
    setError("");

    try {
      const response = await fetch("/api/rooms/guest-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roomCode: roomCode.toUpperCase(),
          guestName: guestName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join room");
      }

      // Store guest info in sessionStorage
      if (data.guestPlayerId) {
        sessionStorage.setItem("guestPlayerId", data.guestPlayerId);
        sessionStorage.setItem("guestName", guestName.trim());
        sessionStorage.setItem("currentRoomId", data.room.id);
      }

      // Redirect to game (you'll need to create a guest lobby component)
      router.push(`/room/${data.room.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleJoinAsUser = async () => {
    setJoining(true);
    setError("");

    try {
      const response = await fetch("/api/rooms/join-by-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roomCode: roomCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join room");
      }

      router.push(`/room/${data.room.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="text-white">Invalid room code</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg grid-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/90 border-2 border-blue-500/50 rounded-lg p-8 glow-effect">
          <div className="text-center mb-6">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Join Room
            </h2>
            <p className="text-slate-400">
              Room Code: <span className="font-bold text-blue-400 text-xl">{roomCode}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {!showGuestForm ? (
            <div className="space-y-4">
              {user ? (
                <button
                  onClick={handleJoinAsUser}
                  disabled={joining}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg text-white font-semibold transition-colors"
                >
                  {joining ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Join as {user.username}
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowGuestForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Join as Guest
                  </button>
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-sm">or</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                  </div>
                  <button
                    onClick={() => router.push(`/login?redirect=/join/${roomCode}`)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In to Join
                  </button>
                  <button
                    onClick={() => router.push(`/signup?redirect=/join/${roomCode}`)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>
              <button
                onClick={handleJoinAsGuest}
                disabled={joining || !guestName.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-lg text-white font-semibold transition-colors"
              >
                {joining ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Join as Guest
                  </>
                )}
              </button>
              <button
                onClick={() => setShowGuestForm(false)}
                className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
