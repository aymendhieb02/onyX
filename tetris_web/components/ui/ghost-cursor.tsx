"use client";

import { useEffect, useState } from "react";

export function GhostCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    let trailId = 0;
    let animationFrame: number;

    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Add trail
      const newTrail = {
        id: trailId++,
        x: e.clientX,
        y: e.clientY,
      };
      
      setTrails((prev) => [...prev.slice(-5), newTrail]);
      
      // Remove old trails
      setTimeout(() => {
        setTrails((prev) => prev.filter((t) => t.id !== newTrail.id));
      }, 500);
    };

    window.addEventListener("mousemove", updateCursor);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <div
        className="ghost-cursor"
        style={{
          left: `${position.x - 10}px`,
          top: `${position.y - 10}px`,
          transform: "translate(-50%, -50%)",
        }}
      />
      
      {/* Trails */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="ghost-cursor-trail"
          style={{
            left: `${trail.x - 4}px`,
            top: `${trail.y - 4}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </>
  );
}

