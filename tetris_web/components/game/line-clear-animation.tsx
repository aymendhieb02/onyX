"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LineClearAnimationProps {
  lines: number[];
  onComplete: () => void;
}

export function LineClearAnimation({ lines, onComplete }: LineClearAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-6xl font-bold neon-text text-blue-400"
          >
            {lines.length === 1 && "SINGLE!"}
            {lines.length === 2 && "DOUBLE!"}
            {lines.length === 3 && "TRIPLE!"}
            {lines.length === 4 && "TETRIS!"}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

