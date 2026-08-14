"use client";

import dynamic from "next/dynamic";

// Boundary client para permitir ssr:false (chunk 3D fora do JS inicial)
const Scene = dynamic(() => import("./SceneStage").then((m) => m.SceneStage), { ssr: false });

export function CanvasLoader() {
  return <Scene />;
}
