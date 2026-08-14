"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll/scroll-state";

const HERO_RANGE = 0.18; // hero ocupa progress global [0, 0.18]

export function HeroMonolith() {
  const group = useRef<THREE.Group>(null!);
  const shards = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  // 24 fragmentos: posição montada → dispersa (pré-computado, zero alocação no loop)
  const scatter = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        from: new THREE.Vector3((i % 4) * 0.36 - 0.54, Math.floor(i / 4) * 0.46 - 1.15, 0),
        to: new THREE.Vector3(
          (Math.sin(i * 12.9898) * 43758.5453 % 1) * 6 - 3,
          (Math.sin(i * 78.233) * 12543.21 % 1) * 4 - 2,
          -6 - (i % 5)
        ),
        spin: 0.4 + (i % 7) * 0.12,
      })),
    []
  );

  useFrame((state, delta) => {
    const { progress, pointer } = scrollState;
    const t = state.clock.elapsedTime;
    const p = THREE.MathUtils.clamp(progress / HERO_RANGE, 0, 1); // fase local do hero
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic

    // Flutuação senoidal contínua
    group.current.position.y = Math.sin(t * 0.6) * 0.12;
    // Tilt 3D suave com damp (≈ lerp 0.05 @60fps, estável em qualquer fps)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.18, 4, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.24 + 0.35, 4, delta);
    // Recuo ao scroll: z -2 → -10
    group.current.position.z = THREE.MathUtils.lerp(-2, -10, eased);
    group.current.position.x = THREE.MathUtils.lerp(3.8, 0.6, eased);

    // Fragmentação: shards interpolam montado → disperso
    for (let i = 0; i < scatter.length; i++) {
      const s = scatter[i];
      dummy.position.lerpVectors(s.from, s.to, eased);
      dummy.rotation.set(t * s.spin * eased, i + t * 0.2 * eased, 0);
      const k = 1 - eased * 0.65;
      dummy.scale.setScalar(k);
      dummy.updateMatrix();
      shards.current.setMatrixAt(i, dummy.matrix);
    }
    shards.current.instanceMatrix.needsUpdate = true;
    (shards.current.material as THREE.MeshStandardMaterial).opacity = eased * 0.9;
  });

  return (
    <group ref={group} position={[3.8, 0, -2]}>
      {/* Monólito translúcido — MeshPhysicalMaterial com Transmission */}
      <mesh castShadow>
        <boxGeometry args={[1.4, 2.9, 0.55]} />
        {isMobile ? (
          <meshPhysicalMaterial transparent opacity={0.28} roughness={0.05} envMapIntensity={1.6} />
        ) : (
          <meshPhysicalMaterial
            transmission={1}
            thickness={1.6}
            roughness={0.12}
            ior={1.45}
            attenuationColor="#0f1115"
            attenuationDistance={2.5}
            iridescence={0.35}
            iridescenceIOR={1.3}
            clearcoat={0.6}
            envMapIntensity={1.2}
          />
        )}
      </mesh>
      {/* Core metálico interno */}
      <mesh scale={0.42} position={[0, 0.1, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial metalness={1} roughness={0.18} color="#c9ced6" envMapIntensity={2.2} />
      </mesh>
      {/* Fragmentos instanciados (1 draw call) */}
      <instancedMesh ref={shards} args={[undefined, undefined, 24]} frustumCulled={false}>
        <boxGeometry args={[0.3, 0.42, 0.14]} />
        <meshStandardMaterial metalness={0.9} roughness={0.25} color="#9aa3ad" transparent opacity={0} />
      </instancedMesh>
    </group>
  );
}
