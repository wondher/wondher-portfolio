"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll/scroll-state";
import { conductorVertex, conductorFragment } from "@/lib/shaders/conductor";

export function ConductorLine() {
  const mat = useRef<THREE.ShaderMaterial>(null!);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.2, 0.4, -3.0),
      new THREE.Vector3(-3.5, -0.6, -2.2),
      new THREE.Vector3(0.0, -1.4, -3.2),
      new THREE.Vector3(0.0, -2.2, -2.5),
    ]);
    return new THREE.TubeGeometry(curve, 220, 0.035, 12, false);
  }, []);

  useFrame((state) => {
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uProgress.value = scrollState.lerped;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={conductorVertex}
        fragmentShader={conductorFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uColorA: { value: new THREE.Color("#00f5a0") },
          uColorB: { value: new THREE.Color("#6366f1") },
        }}
      />
    </mesh>
  );
}
