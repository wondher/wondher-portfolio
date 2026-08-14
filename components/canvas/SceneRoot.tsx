"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { usePrefersReducedMotion } from "@/lib/a11y/use-prefers-reduced-motion";

function Lights() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} color="#dfe8ff" />
      <pointLight position={[-5, -2, -4]} intensity={9} color="#6366f1" distance={14} decay={2} />
      <pointLight position={[5, 2, -1]} intensity={5} color="#00f5a0" distance={10} decay={2} />
    </>
  );
}

export function SceneRoot({ children }: { children?: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[var(--z-canvas)]">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0, 6], fov: 32, near: 0.1, far: 40 }}
        frameloop={hidden ? "never" : "always"}
      >
        <Suspense fallback={null}>
          <Lights />
          {children}
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
