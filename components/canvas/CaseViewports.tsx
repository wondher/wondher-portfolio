"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll/scroll-state";

const PLANES: Array<{ z: number; speed: number; opacity: number }> = [
  { z: 0.5, speed: 1.6, opacity: 0.16 },
  { z: 0.0, speed: 1.0, opacity: 0.12 },
  { z: -1.0, speed: 0.55, opacity: 0.08 },
];

export function CaseViewports() {
  const group = useRef<THREE.Group>(null!);

  useFrame(() => {
    const local = THREE.MathUtils.clamp((scrollState.lerped - 0.55) / 0.2, 0, 1);
    group.current.children.forEach((child, i) => {
      child.position.x = THREE.MathUtils.lerp(2.2, -2.2, local) * PLANES[i].speed;
    });
    group.current.visible = local > 0 && local < 1;
  });

  return (
    <group ref={group} position={[0, -1.2, -3]} rotation={[THREE.MathUtils.degToRad(12), THREE.MathUtils.degToRad(-8), 0]}>
      {PLANES.map((p, i) => (
        <mesh key={i} position={[0, 0, p.z]}>
          <planeGeometry args={[3.2, 2]} />
          <meshBasicMaterial color={i === 1 ? "#6366f1" : "#00f5a0"} transparent opacity={p.opacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
