"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll/scroll-state";

const COUNT = 64;

function formations(): Float32Array[] {
  const a = new Float32Array(COUNT * 3); // A: cubo 4×4×4 (wireframe)
  const b = new Float32Array(COUNT * 3); // B: 4 dutos horizontais de 16
  const c = new Float32Array(COUNT * 3); // C: grafo neural 16/32/16 em anéis
  const d = new Float32Array(COUNT * 3); // D: die 8×8 plano
  for (let i = 0; i < COUNT; i++) {
    const x = i % 4, y = Math.floor(i / 4) % 4, z = Math.floor(i / 16);
    a.set([(x - 1.5) * 0.5, (y - 1.5) * 0.5, (z - 1.5) * 0.5], i * 3);

    const lane = i % 4, t = Math.floor(i / 4) / 15;
    b.set([THREE.MathUtils.lerp(-1.4, 1.4, t), (lane - 1.5) * 0.42, 0], i * 3);

    const layer = i < 16 ? 0 : i < 48 ? 1 : 2;
    const idxIn = layer === 0 ? i : layer === 1 ? i - 16 : i - 48;
    const per = layer === 1 ? 32 : 16;
    const ang = (idxIn / per) * Math.PI * 2;
    const rad = layer === 1 ? 1.1 : 0.55;
    c.set([Math.cos(ang) * rad, Math.sin(ang) * rad, (layer - 1) * 0.7], i * 3);

    d.set([((i % 8) - 3.5) * 0.34, (Math.floor(i / 8) - 3.5) * 0.34, 0], i * 3);
  }
  return [a, b, c, d];
}

export function CapabilityMatrix() {
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const forms = useMemo(formations, []);

  useFrame((state) => {
    const visible = scrollState.lerped > 0.1 && scrollState.lerped < 0.62;
    if (group.current.visible !== visible) group.current.visible = visible;
    if (!visible) return;

    const cluster = THREE.MathUtils.clamp(scrollState.cluster, 0, 3);
    const from = forms[Math.floor(cluster)];
    const to = forms[Math.min(Math.floor(cluster) + 1, 3)];
    const f = cluster - Math.floor(cluster);
    const wobble = state.clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(
        THREE.MathUtils.lerp(from[i * 3], to[i * 3], f),
        THREE.MathUtils.lerp(from[i * 3 + 1], to[i * 3 + 1], f) + Math.sin(wobble + i) * 0.015,
        THREE.MathUtils.lerp(from[i * 3 + 2], to[i * 3 + 2], f)
      );
      dummy.rotation.set(0, wobble * 0.1, 0);
      dummy.scale.setScalar(0.9);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} position={[-3.5, 0, -1.5]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.09, 0.09, 0.09]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.85} roughness={0.3} emissive="#6366f1" emissiveIntensity={0.15} />
      </instancedMesh>
    </group>
  );
}
