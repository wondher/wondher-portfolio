"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/lib/a11y/use-prefers-reduced-motion";

// Boundary client para permitir ssr:false (chunk 3D fora do JS inicial)
const Scene = dynamic(() => import("./SceneStage").then((m) => m.SceneStage), { ssr: false });

export function CanvasLoader() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return <Scene />;
}
