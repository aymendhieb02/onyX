"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Avatar3DProps {
  show: boolean;
  linesCleared: number;
  onComplete: () => void;
}

export function Avatar3D({ show, linesCleared, onComplete }: Avatar3DProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} />
        
        <CelebrationAvatar linesCleared={linesCleared} onComplete={onComplete} />
      </Canvas>
    </div>
  );
}

function CelebrationAvatar({ linesCleared, onComplete }: { linesCleared: number; onComplete: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);

  const particleCount = 50;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      ] as [number, number, number],
      velocity: [
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.02 + 0.01,
        (Math.random() - 0.5) * 0.02,
      ] as [number, number, number],
    }));
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }

    if (particlesRef.current) {
      particles.forEach((particle, i) => {
        const matrix = new THREE.Matrix4();
        particle.position[0] += particle.velocity[0];
        particle.position[1] += particle.velocity[1];
        particle.position[2] += particle.velocity[2];
        
        if (particle.position[1] > 5) {
          particle.position[1] = -5;
        }
        
        matrix.setPosition(...particle.position);
        particlesRef.current!.setMatrixAt(i, matrix);
      });
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Auto-hide after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const message = linesCleared >= 4 ? "TETRIS!" : linesCleared >= 3 ? "TRIPLE!" : "AMAZING!";

  return (
    <group ref={groupRef}>
      {/* Avatar Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" emissive="#1e40af" emissiveIntensity={0.5} />
      </mesh>

      {/* Avatar Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.6]} />
        <meshStandardMaterial color="#2563eb" emissive="#1e40af" emissiveIntensity={0.3} />
      </mesh>

      {/* Celebration Message - Simple text plane */}
      <mesh position={[0, 3, 0]} rotation={[-Math.PI / 6, 0, 0]}>
        <planeGeometry args={[3, 0.8]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Particles */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1} />
      </instancedMesh>
    </group>
  );
}
