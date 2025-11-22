"use client";

import { useEffect, useRef } from "react";
import { GameEngine } from "@/lib/game/engine";
import { BOARD_WIDTH, BOARD_HEIGHT } from "@/lib/game/board";
import { motion } from "framer-motion";

interface GameBoardProps {
  engine: GameEngine;
}

export function GameBoard({ engine }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = 30;
    canvas.width = BOARD_WIDTH * cellSize;
    canvas.height = BOARD_HEIGHT * cellSize;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
      ctx.lineWidth = 1;
      for (let row = 0; row <= BOARD_HEIGHT; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * cellSize);
        ctx.lineTo(canvas.width, row * cellSize);
        ctx.stroke();
      }
      for (let col = 0; col <= BOARD_WIDTH; col++) {
        ctx.beginPath();
        ctx.moveTo(col * cellSize, 0);
        ctx.lineTo(col * cellSize, canvas.height);
        ctx.stroke();
      }

      // Draw placed blocks
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          const cell = engine.board.grid[row][col];
          if (cell) {
            ctx.fillStyle = cell;
            ctx.fillRect(
              col * cellSize + 1,
              row * cellSize + 1,
              cellSize - 2,
              cellSize - 2
            );

            // Glow effect
            ctx.shadowColor = cell;
            ctx.shadowBlur = 10;
            ctx.fillRect(
              col * cellSize + 1,
              row * cellSize + 1,
              cellSize - 2,
              cellSize - 2
            );
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw ghost piece
      if (engine.currentPiece) {
        const ghostY = engine.board.getGhostPosition(engine.currentPiece).y;
        const shape = engine.currentPiece.getShape();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = engine.currentPiece.color;
        for (let row = 0; row < shape.length; row++) {
          for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] === 1) {
              ctx.fillRect(
                (engine.currentPiece.position.x + col) * cellSize + 1,
                (ghostY + row) * cellSize + 1,
                cellSize - 2,
                cellSize - 2
              );
            }
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Draw current piece
      if (engine.currentPiece) {
        const shape = engine.currentPiece.getShape();
        ctx.fillStyle = engine.currentPiece.color;
        ctx.shadowColor = engine.currentPiece.color;
        ctx.shadowBlur = 15;
        
        for (let row = 0; row < shape.length; row++) {
          for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] === 1) {
              const x = (engine.currentPiece!.position.x + col) * cellSize + 1;
              const y = (engine.currentPiece!.position.y + row) * cellSize + 1;
              
              // Main block
              ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
              
              // Highlight
              const gradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
              gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
              gradient.addColorStop(1, "transparent");
              ctx.fillStyle = gradient;
              ctx.fillRect(x, y, cellSize * 0.5, cellSize * 0.5);
              ctx.fillStyle = engine.currentPiece.color;
            }
          }
        }
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [engine]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <div className="bg-slate-900/50 border-2 border-blue-500/50 rounded-lg p-4 glow-effect">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </motion.div>
  );
}

