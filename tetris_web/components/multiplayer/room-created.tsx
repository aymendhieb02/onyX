"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Users, ArrowLeft, Play } from "lucide-react";
import { QRCodeDisplay } from "./qr-code-display";
import { useRouter } from "next/navigation";

interface RoomCreatedProps {
  roomCode: string;
  roomName: string;
  roomId: string;
  onBack: () => void;
}

export function RoomCreated({ roomCode, roomName, roomId, onBack }: RoomCreatedProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToLobby = () => {
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen animated-bg grid-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/90 border-2 border-green-500/50 rounded-lg p-8 glow-effect-green">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Room Created!</h2>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-slate-400 mb-2">Room Name:</p>
            <p className="text-xl font-semibold text-white">{roomName}</p>
          </div>

          <div className="mb-6">
            <p className="text-slate-400 mb-4">Share this code with your friends:</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-800 border-2 border-green-500/50 rounded-lg p-4">
                <p className="text-4xl font-bold text-center text-green-400 tracking-widest neon-text">
                  {roomCode}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Copy className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-400 mt-2 text-center">
                Code copied to clipboard!
              </p>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-300">
              <strong>Waiting for players...</strong>
              <br />
              Share the room code above with your friends so they can join!
            </p>
          </div>

          {/* QR Code */}
          <QRCodeDisplay roomCode={roomCode} />

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={goToLobby}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors"
            >
              <Play className="w-5 h-5" />
              Go to Lobby
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

