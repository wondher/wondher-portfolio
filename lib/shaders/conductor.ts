// TubeGeometry: uv.x = ao longo do duto, uv.y = circunferência
export const conductorVertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  float energized = step(uv.x, uProgress);
  pos += normal * sin(uv.x * 24.0 - uTime * 2.0) * 0.02 * energized;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const conductorFragment = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uProgress;
uniform vec3  uColorA;
uniform vec3  uColorB;
varying vec2 vUv;

void main() {
  float along = vUv.x;
  float seam = abs(vUv.y - 0.5) * 2.0;
  float core = 1.0 - smoothstep(0.2, 1.0, seam);
  float filled = 1.0 - smoothstep(uProgress - 0.06, uProgress, along);
  float pulse = 0.5 + 0.5 * sin(along * 40.0 - uTime * 3.0);
  vec3 base = mix(uColorB, uColorA, along);
  vec3 color = base * (0.22 + 0.78 * filled) + base * pulse * 0.15 * filled;
  float head = 1.0 - smoothstep(0.0, 0.045, abs(along - uProgress));
  color += uColorA * head * 1.4;
  float alpha = core * (0.10 + 0.90 * max(filled, head * 0.9));
  gl_FragColor = vec4(color, alpha);
}
`;
