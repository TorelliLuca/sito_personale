"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";

function Agent() {
  const ref = useRef<Mesh>(null);
  const path = useMemo(
    () => [
      [-2, 0.5, -2],
      [2, 0.5, -2],
      [2, 0.5, 2],
      [-2, 0.5, 2],
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.35;
    const segment = Math.floor(t) % path.length;
    const next = (segment + 1) % path.length;
    const progress = t - Math.floor(t);
    const [x1, y1, z1] = path[segment];
    const [x2, y2, z2] = path[next];

    ref.current.position.set(
      x1 + (x2 - x1) * progress,
      y1 + (y2 - y1) * progress,
      z1 + (z2 - z1) * progress
    );
    ref.current.rotation.y += 0.02;
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#2563EB" metalness={0.2} roughness={0.35} />
    </mesh>
  );
}

function Goal() {
  return (
    <mesh position={[2, 0.25, 2]} receiveShadow>
      <cylinderGeometry args={[0.5, 0.5, 0.5, 24]} />
      <meshStandardMaterial color="#22c55e" emissive="#14532d" emissiveIntensity={0.35} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <Grid
        args={[12, 12]}
        cellSize={1}
        sectionSize={4}
        fadeDistance={16}
        fadeStrength={1}
        infiniteGrid
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#e4e4e7" />
      </mesh>
      <Agent />
      <Goal />
      <OrbitControls makeDefault enablePan={false} minDistance={4} maxDistance={14} />
    </>
  );
}

export function RlVisualizationDemo() {
  return (
    <Canvas
      shadows
      camera={{ position: [6, 5, 6], fov: 45 }}
      className="h-[calc(100vh-73px)] w-full"
    >
      <Scene />
    </Canvas>
  );
}
