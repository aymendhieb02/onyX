"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Download } from "lucide-react";
import { generateQRCodeDataURL, generateRoomJoinURL } from "@/lib/utils/qr-code";

interface QRCodeDisplayProps {
  roomCode: string;
}

export function QRCodeDisplay({ roomCode }: QRCodeDisplayProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [joinUrl, setJoinUrl] = useState<string>("");

  useEffect(() => {
    const url = generateRoomJoinURL(roomCode);
    setJoinUrl(url);
    setQrUrl(generateQRCodeDataURL(roomCode));
  }, [roomCode]);

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `room-${roomCode}-qr.png`;
    link.click();
  };

  return (
    <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">QR Code</h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        {qrUrl && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white p-4 rounded-lg"
          >
            <img
              src={qrUrl}
              alt={`QR Code for room ${roomCode}`}
              className="w-48 h-48"
            />
          </motion.div>
        )}

        <div className="w-full">
          <p className="text-xs text-slate-400 mb-2 text-center">
            Share this QR code or link:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={joinUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(joinUrl);
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        <button
          onClick={downloadQR}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>
      </div>
    </div>
  );
}

