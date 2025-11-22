"use client";

import { Keyboard, MousePointer2 } from "lucide-react";

export function GameControls() {
  const controls = [
    { key: "← →", action: "Move" },
    { key: "↓", action: "Soft Drop" },
    { key: "↑ / X", action: "Rotate CW" },
    { key: "Z", action: "Rotate CCW" },
    { key: "Space", action: "Hard Drop" },
    { key: "C", action: "Hold" },
    { key: "ESC", action: "Pause" },
  ];

  return (
    <div className="bg-slate-900/50 border border-blue-500/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-300">Controls</h3>
      </div>
      <div className="space-y-2">
        {controls.map((control, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-400">{control.action}</span>
            <kbd className="px-2 py-1 bg-slate-800 border border-blue-500/30 rounded text-xs text-blue-400 font-mono">
              {control.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

