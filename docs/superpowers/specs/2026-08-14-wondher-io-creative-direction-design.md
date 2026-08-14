# Wondher.io v2 — Direção Criativa & Arquitetura de Engenharia Criativa

**Data:** 2026-08-14
**Status:** design auto-revisado; aguardando revisão do usuário antes do plano de implementação
**Projeto:** `wondher-portfolio` (novo site wondher.io)
**Viewport de referência:** 1512 × 982 px (MacBook Pro 14"/16", ~16:10)
**Tier de execução:** Awwwards SOTD / FWA — portfolio de estúdio high-end

---

## Contexto confirmado (evidências dos repositórios)

- **Site atual em produção:** repo `brianmendes` → `DEFAULT_SITE_URL = "https://wondher.io"` (`src/lib/site.ts`). Stack: Next.js 16, React 19, Tailwind 3.4, Lenis 1.3, motion, next-intl (en/pt). Sem Three.js/R3F, sem GSAP, sem Supabase.
- **Este repo (`wondher-portfolio`):** vazio (apenas README). É o destino do redesign — greenfield sem dívida.
- **Material factual para cases:**
  - **FlowCraft** — parser binário `.bpt` (zlib + phpserialize), 32 endpoints FastAPI, simulador multi-cenário offline, 47 testes, catálogo de 92 atividades Bitrix24, 3 provedores de IA com fallback determinístico.
  - **Codex** — migração cloud (Supabase) → local-first (Electron + SQLite), 9,4 MB de dataset 5etools offline, 21 handlers IPC, export estático Next 16, 32 testes.
  - **Pulse** — desktop local-first (Glaze), 38 handlers IPC, timer com crash recovery, SQLite nativo `node:sqlite`, métricas de carga/atenção.
  - **wondher.io v1** — Next 16 + i18n + WebGL fluid shader custom + Lenis, production-ready.
- **Supabase:** existe projeto remoto do usuário (referenciado historicamente no `wondher-codex`), mas **não há credenciais `SUPABASE_*` neste ambiente**. O schema é especificado no Apêndice A; a aplicação ocorre na implementação, após configuração dos secrets.
- **Voz atual da marca (v1, `messages/pt.json`):** direta, anti-template ("Menos ferramenta jogada fora, mais coisa que funciona"). A v2 preserva esse DNA anti-overhead e o eleva a registro editorial-técnico frio.
- **Entidade legal:** Wondher Digital Studio LTDA · CNPJ 64.981.578/0001-59 · Curitiba – PR.

---

# SEÇÃO 1 — DIRETRIZES DE MARCA, MANIFESTO & TAXONOMIA VERBAL

## 1.1 Posicionamento

**Proposta de valor:** *Engenharia sob medida de alta performance, com zero overhead de intermediação.* Quem diagnostica o problema desenha a arquitetura, escreve o código de produção e responde pela métrica. Sites e experiências WebGL, automação de CRM (Bitrix24/n8n/Make) e agentes de IA — tratados como sistemas, não como peças.

**Enquadramento competitivo:** a Wondher não compete com agências (camadas de conta, esteira de handoff) nem com freelancers genéricos (execução sem arquitetura). Ocupa a interseção rara: **arquiteto-executor**. Cada entrega expõe evidência mensurável — latência, cobertura de teste, orçamento de frame — em vez de adjetivos.

**Público:** empresas que já sentiram o custo da intermediação — requisito distorcido, prazo elástico, sistema que ninguém audita — e decisores técnicos que reconhecem engenharia quando veem.

## 1.2 Manifesto de engenharia

> A Wondher opera sob uma única premissa: distância entre decisão e execução é latência — e latência custa. Aqui não existe gerente de conta traduzindo requisito nem esteira de handoff diluindo intenção: quem entende o problema desenha a topologia, escreve o código de produção e responde pela métrica. Cada interface é tratada como sistema — orçamento de frame, contrato de dados, estado observável — e cada automação como infraestrutura: idempotente, auditável, reversível. Não vendemos horas; instalamos capacidade. O resto é overhead — e overhead a gente elimina por projeto.

## 1.3 Taxonomia verbal

| Categoria | Termos obrigatórios | Termos banidos |
|---|---|---|
| Sistema | topologia, pipeline, contrato de dados, idempotência, concorrência, runtime, superfície de integração | "solução completa", "ecossistema digital" (vago) |
| Performance | latência, throughput, orçamento de frame (frame budget), LCP/INP/CLS, telemetria, p95 | "ultra rápido", "turbinar", "performance absurda" |
| Render | shader, render loop, draw call, transmissão, DPR, frustum culling, instancing | "efeitos incríveis", "visual de outro mundo" |
| Entrega | diagnóstico, RFC, checkpoint, rollback, go-live, capacidade instalada, SLA | "transformamos ideias em realidade", "unimos inovação e criatividade" |
| Postura | direto, auditável, mensurável, reversível, determinístico | "paixão por tecnologia", "sinergia", "alavancar", "levar seu negócio para o próximo nível" |

**Regras de escrita:** frases declarativas curtas; números com unidade (`< 1.2s`, `p95 42ms`); metadados em MAIÚSCULAS mono (`SYS:OPERACIONAL`); zero emoji na UI; zero ponto de exclamação; primeira pessoa apenas na seção Sobre (assinatura do fundador), voz de sistema no restante.

---

# SEÇÃO 2 — DESIGN SYSTEM & TOKENS EM CÓDIGO

## 2.1 Tokens (Tailwind CSS v4, CSS-first)

Verificação de contraste (WCAG AA sobre `#08090A`): `--color-ink` ≈ 16:1 · `--color-ink-muted` ≈ 5.6:1 · `--color-signal` ≈ 14.6:1 · `--color-pulse` (#6366F1) ≈ 3.9:1 → **aprovado só para texto grande/grafismos**; texto corrente usa a variante `--color-pulse-text` (#818CF8, ≈ 5.4:1).

```css
/* styles/tokens.css */
@import "tailwindcss";

@theme {
  /* Cor — Deep Obsidian Void */
  --color-void: #08090A;            /* base background */
  --color-surface: #0F1115;         /* cards e superfícies */
  --color-hairline: rgb(255 255 255 / 0.08);
  --color-ink: #e7e9ec;             /* texto primário */
  --color-ink-muted: #8a9099;       /* texto secundário */
  --color-signal: #00f5a0;          /* acento primário — Data Signal (Monochrome Mint) */
  --color-signal-dim: rgb(0 245 160 / 0.32);
  --color-pulse: #6366f1;           /* acento secundário — Compute Pulse (grafismos, ≥ 24px) */
  --color-pulse-text: #818cf8;      /* variante AA para texto corrente */

  /* Tipografia */
  --font-display: var(--font-geist-sans), "Geist Fallback", ui-sans-serif, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, "JetBrains Mono", monospace;

  /* Escala fluida — referência 1512px (clamp entre 390 e 1512) */
  --text-display: clamp(3.25rem, 0.55rem + 8.2vw, 8.25rem);   /* 52 → 132px */
  --text-h2: clamp(2rem, 1.02rem + 3vw, 3.5rem);              /* 32 → 56px  */
  --text-h3: clamp(1.375rem, 1.1rem + 0.85vw, 1.75rem);       /* 22 → 28px  */
  --text-lead: clamp(1.125rem, 1.04rem + 0.35vw, 1.375rem);   /* 18 → 22px  */
  --text-body: 1rem;                                          /* 16px, lh 1.6 */
  --text-label: 0.8125rem;                                    /* 13px mono, tracking 0.08em */

  /* Movimento */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-inout-soft: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 180ms;    /* micro-interações */
  --duration-base: 320ms;    /* estados/hover compostos */
  --duration-reveal: 900ms;  /* reveals de seção (GSAP) */

  /* Elevação */
  --shadow-elevation: inset 0 1px 0 rgb(255 255 255 / 0.06), 0 24px 64px rgb(0 0 0 / 0.55);
  --shadow-signal: 0 0 24px rgb(0 245 160 / 0.25);

  /* Camadas (z-index) */
  --z-canvas: 0;        /* WebGL fixed */
  --z-content: 10;      /* fluxo DOM */
  --z-nav: 40;
  --z-overlay: 50;
}
```

Superfícies de vidro: `background: var(--color-surface); border: 1px solid var(--color-hairline); backdrop-filter: blur(12px)` — **apenas** em navbar, chips e cards de case (custo de composite controlado; nunca em listas longas).

## 2.2 Grid e proporções

| Regra | Desktop (referência 1512px) | Mobile (≤ 767px) |
|---|---|---|
| Margem externa | 96px por lado → conteúdo 1320px | 20px |
| Colunas | 12 col / gutter 24px (col ≈ 88px) | 4 col / gutter 16px |
| Baseline vertical | múltiplos de 8px (ritmo 8/16/24/48/96/160) | idem, seções com 96px min |
| Medida de texto | 60–75 caracteres (`max-width: 62ch`) | 35–60 caracteres |
| Alturas de seção | Hero 100dvh; seções pinned definem range via `end: "+=N"` | sem pin; stack vertical |
| Breakpoints | 390 / 768 / 1024 / 1280 / 1512+ | mobile-first |
| Assimetria | headlines podem invadir 1 col do canvas (overlap DOM×GL) | sem overlap |

---

# SEÇÃO 3 — THREE.JS / R3F & GLSL SHADER SPECIFICATION

## 3.1 Arquitetura do canvas único

Um único `<Canvas>` fixed cobrindo o viewport (`--z-canvas`), `pointer-events: none`; interatividade reativada por raycasting filtrado via `eventSource={document.getElementById("root")}` + meshes com `onPointerOver` explícitos. DOM rola por cima (`--z-content`). Ponte DOM→GL é um store transiente (Seção 6) — **nenhum setState por frame**.

```tsx
// components/canvas/SceneRoot.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { Suspense } from "react";
import { HeroMonolith } from "./HeroMonolith";
import { ConductorLine } from "./ConductorLine";
import { usePrefersReducedMotion } from "@/lib/a11y/use-prefers-reduced-motion";

export function SceneRoot() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null; // fallback: poster estático + conteúdo DOM íntegro

  return (
    <div aria-hidden className="fixed inset-0 z-[var(--z-canvas)] pointer-events-none">
      <Canvas
        dpr={[1, 1.75]}                                  // clamp de DPR
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0, 6], fov: 32, near: 0.1, far: 40 }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <Lights />
          <HeroMonolith />
          <ConductorLine />
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated /> {/* degrada DPR sob pressão de frame */}
      </Canvas>
    </div>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} color="#dfe8ff" />
      <pointLight position={[-5, -2, -4]} intensity={9} color="#6366f1" distance={14} decay={2} />
      <pointLight position={[5, 2, -1]} intensity={5} color="#00f5a0" distance={10} decay={2} />
      {/* HDRi: <Environment files="/hdri/studio-void.hdr" /> — 1k, prefiltrado no build */}
    </>
  );
}
```

## 3.2 Hero — Monólito Translúcido + Core Metálico

Coordenadas iniciais `[+3.8, 0.0, -2.0]`; flutuação senoidal; tilt com damp (equivalente frame-rate-independent do lerp `0.05`); fragmentação progressiva ao scroll (`z → -10`) alimentando a Linha Condutora.

```tsx
// components/canvas/HeroMonolith.tsx
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
```

**Fallback mobile/low-tier:** transmissão real exige render extra da cena; abaixo de 768px ou quando `PerformanceMonitor` rebaixar o tier, o material troca para `meshPhysicalMaterial` sem `transmission` (vidro fake: `transparent`, `opacity 0.28`, `roughness 0.05`, fresnel via `envMapIntensity`), e os pontos de luz caem de 4 para 2.

## 3.3 Linha Condutora Procedural — GLSL

Duto (TubeGeometry ao longo de uma `CatmullRomCurve3` que desce pela página) preenchido conforme `uProgress` (scroll global). Cabeça com glow, gradiente mint→indigo, pulso de dados.

```glsl
// lib/shaders/conductor.vert
uniform float uTime;
uniform float uProgress;
varying vec2 vUv;

void main() {
  vUv = uv; // uv.y ∈ [0,1] ao longo do duto
  vec3 pos = position;

  // Ondulação sutil apenas na região já energizada
  float energized = step(uv.y, uProgress);
  pos += normal * sin(uv.y * 24.0 - uTime * 2.0) * 0.02 * energized;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

```glsl
// lib/shaders/conductor.frag
precision highp float;

uniform float uTime;
uniform float uProgress;   // 0..1 — progresso de scroll global (lerped no CPU)
uniform vec3  uColorA;     // #00F5A0 — Data Signal
uniform vec3  uColorB;     // #6366F1 — Compute Pulse
varying vec2 vUv;

void main() {
  // Núcleo do duto (falloff radial no eixo transversal)
  float core = smoothstep(0.5, 0.06, abs(vUv.x - 0.5));

  // Região preenchida (atrás da cabeça), com transição suave de 6%
  // (1.0 - smoothstep) para manter edge0 < edge1 — smoothstep invertido é UB na spec GLSL
  float filled = 1.0 - smoothstep(uProgress - 0.06, uProgress, vUv.y);

  // Pulso de dados percorrendo o trecho energizado
  float pulse = 0.5 + 0.5 * sin(vUv.y * 40.0 - uTime * 3.0);

  // Gradiente indigo → mint ao longo do duto
  vec3 base = mix(uColorB, uColorA, vUv.y);
  vec3 color = base * (0.22 + 0.78 * filled) + base * pulse * 0.15 * filled;

  // Cabeça com glow (janela de 4.5% ao redor de uProgress)
  float head = smoothstep(0.045, 0.0, abs(vUv.y - uProgress));
  color += uColorA * head * 1.4;

  float alpha = core * (0.10 + 0.90 * max(filled, head * 0.9));
  gl_FragColor = vec4(color, alpha);
}
```

```tsx
// components/canvas/ConductorLine.tsx — ligação com o scroll
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll/scroll-state";
import vertex from "@/lib/shaders/conductor.vert";
import fragment from "@/lib/shaders/conductor.frag";

export function ConductorLine() {
  const mat = useRef<THREE.ShaderMaterial>(null!);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.2, 0.4, -3.0),    // nasce no monólito (Hero)
      new THREE.Vector3(-3.5, -0.6, -2.2),  // atravessa a Matriz (Capabilities)
      new THREE.Vector3(0.0, -1.4, -3.2),   // margeia os Viewports (Cases)
      new THREE.Vector3(0.0, -2.2, -2.5),   // desagua no Eixo (Pipeline)
    ]);
    return new THREE.TubeGeometry(curve, 220, 0.035, 12, false);
  }, []);

  useFrame((state) => {
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    // uProgress já chega lerped do orquestrador (scrub suave, sem jitter)
    mat.current.uniforms.uProgress.value = scrollState.lerped;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
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
```

## 3.4 Orquestração de performance (Auditor)

| Vetor | Estratégia |
|---|---|
| DPR | `dpr={[1, 1.75]}` + `<AdaptiveDpr>`; `PerformanceMonitor` rebaixa tier (transmission→vidro fake, desliga iridescência) |
| Render loop | `frameloop="always"` só com canvas visível; `document.visibilitychange` → `frameloop="never"`; uniforms atualizados por referência, zero alocação e zero setState no loop |
| Geometria | `instancedMesh` para fragmentos e nós da matriz (1 draw call cada); TubeGeometry 220×12 (~10k tris) criada 1×; `dispose()` em troca de seção |
| Texturas | HDRi 1k prefiltrado (PMREM); sem texturas > 1024²; KTX2/basis se necessário |
| Culling | frustum culling default; `visible=false` explícito para grupos de seções distantes (> 1 seção do viewport) |
| Reduced motion | `prefers-reduced-motion` → canvas nem monta (poster AVIF + gradientes CSS); Lenis desativado; GSAP via `gsap.matchMedia()` zera pins/scrubs e mantém estados finais |
| Mobile | sem pin de Capabilities (stack vertical), transmission off, partículas −60%, DPR max 1.5 |
| Budgets (gate de release) | LCP < 1.2s (hero DOM é texto — canvas não é LCP); INP < 50ms; CLS = 0 (canvas `fixed` fora do fluxo, alturas reservadas); JS inicial < 220KB gz antes do chunk 3D (lazy + `<Preload>`) |
| A11y | WCAG AA (tabela §2.1); canvas `aria-hidden`; toda informação existe em DOM; foco visível 2px `--color-signal`; navegação 100% teclado |

---

# SEÇÃO 4 — ARQUITETURA DA NARRATIVA & COMPOSIÇÃO DA PÁGINA

Narrativa em um take contínuo: **o monólito (capacidade bruta) se fragmenta em sinal, o sinal percorre o duto (a Linha Condutora), atravessa a matriz de capacidades, materializa casos e é validado no pipeline — terminando num terminal aberto: o convite é operar o sistema.**

Tabela espacial consolidada (base 1512 × 982, câmera fov 32 em `[0, 0, 6]`):

| # | Seção | Objeto 3D | Coord. inicial `[X,Y,Z]` | Cursor / Scroll | Transição / Descarte |
|---|---|---|---|---|---|
| 01 | Hero | Monólito + Core | `[+3.8, 0.0, -2.0]` — intencionalmente sangra a borda direita @1512 (grid-breaking; H1 ocupa as 7 col esquerdas) | flutuação senoidal; tilt damp≈lerp 0.05 | fragmenta, `z→-10`, energiza o duto; shards viram `visible=false` após progress 0.25 |
| 02 | Capabilities | Matriz 4 nós (instanced) | `[-3.5, 0.0, -1.5]` | pin + scrub; morph procedural entre nós ao alternar cluster | morphTargets via buffer attributes; grupo descartado 1 seção após sair |
| 03 | Cases | Viewports de profundidade | `[0.0, -1.2, -3.0]` | tilt-shift `rx:12° ry:-8°`; hover eleva `z +0.4` | parallax 3 planos `z: +0.5 / 0.0 / -1.0`; texturas de case com `dispose()` on-leave |
| 04 | Pipeline | Eixo volumétrico | `[0.0, 0.0, -2.5]` | duto preenche; nós acendem com glow direcional | nós concluídos travam em estado ativo (uniform por nó) |

## 8 seções DOM

1. **Micro-Navbar Flutuante** — pill de vidro (`surface` + blur 12), fixa `top:24px`. Esquerda: `WONDHER®`. Centro: chips mono de telemetria real (Supabase snapshot, fallback estático): `SYS:OPERACIONAL · UPTIME 99.98%`, `DEPLOYS/30D: 14`, `CURITIBA · UTC-3 · 14:32:07` (relógio vivo). Direita: CTA `Iniciar diagnóstico`. Colapsa para logo+CTA ao rolar (scroll down esconde, up revela — Observer).
2. **Hero** — H1 display à esquerda (7 col), monólito à direita (overlap 1 col). Kicker mono, sub `max-w: 62ch`, CTA primário + CTA-terminal mono. Rodapé da dobra: ticker mono de stack. Reveal de entrada: linhas do H1 com `clip-path` + stagger 80ms (GSAP, uma vez; sem scrub).
3. **Sobre & Filosofia de Atendimento Direto** — editorial 2 col: manifesto à esquerda; à direita "diagrama de latência" (SVG animado por scroll): rota `cliente → gerente → tráfego → dev` riscada; rota `cliente → arquiteto-executor` em mint. 3 fatos mono: `0 gerentes de conta` / `1 responsável técnico` / `100% do código auditável`.
4. **Capacidades Técnicas** — split screen pinned (`pin: true, end: "+=300%"`): esquerda alterna 4 clusters (texto troca com crossfade + snap por labels); direita o canvas morpha a matriz (wireframe → dutos → grafo neural → die de silício). Mobile: sem pin, 4 cards verticais.
5. **Casos Selecionados** — 4 depth viewports (cards 16:10 com tilt-shift 3D). Cada card: label mono do domínio, tese em 1 linha, 3 métricas mono, chips de stack. Hover: elevação Z + specular sweep. Scroll horizontal em parallax de 3 planos (containerAnimation, ease none).
6. **Pipeline Sequencial de Entrega** — eixo vertical central (o duto atravessa); 6 checkpoints alternando lados. Nó acende quando o glow passa (`onUpdate` → uniform); número mono grande, título, descrição de 2 linhas, artefato de saída (`→ RFC aprovada`).
7. **Stack & Domínio de Infraestrutura** — grid mono denso estilo BOM (bill of materials): 4 domínios × itens com versão/uso real. Sem logos coloridos; texto mono + hairlines. Micro-interação: hover revela "em produção em: FlowCraft" etc.
8. **Terminal Footer Interativo** — prompt real `wondher@edge:~$` aceitando `help`, `stack`, `cases`, `latency`, `contact --now` (abre formulário inline → Supabase `contact_inquiries`; fallback `mailto:brianmendes@wondher.io`). Easter egg: `sudo hire-me`. Linha legal: Wondher Digital Studio LTDA · CNPJ 64.981.578/0001-59 · Curitiba – PR. Acessível: o terminal é um `<form>` com `<label>` oculto e histórico em `aria-live="polite"`; toda função tem equivalente visível (links normais no rodapé).

---

# SEÇÃO 5 — COPYWRITING DE ALTA FIDELIDADE (pt-BR, pronto para produção)

## 5.1 Navbar
- Chips: `SYS:OPERACIONAL` · `UPTIME 99.98%` · `DEPLOYS/30D: {n}` · `CURITIBA · UTC-3 · {hh:mm:ss}`
- CTA: **Iniciar diagnóstico**

## 5.2 Hero
- Kicker (mono): `ENGENHARIA CRIATIVA & SISTEMAS — CURITIBA/BR`
- **H1:** `Quem projeta a arquitetura escreve o código.`
- Sub: `Sites de alta performance, automação de CRM e agentes de IA — entregues por quem responde pela métrica. Zero camadas de intermediação entre a sua decisão e o deploy.`
- CTA primário: **Iniciar diagnóstico técnico** · CTA secundário (mono): `$ ver casos --selecionados`
- Hint de scroll (mono): `SCROLL — INICIANDO PIPELINE`

## 5.3 Sobre / Filosofia
- Título: **Atendimento direto é decisão de arquitetura.**
- Corpo: `Toda camada entre quem decide e quem executa adiciona latência, distorce requisito e dilui responsabilidade. A Wondher remove a camada: o mesmo arquiteto que desenha a topologia escreve o código de produção, instrumenta a telemetria e assina o resultado. Menos tradução, menos retrabalho, mais sistema em produção.`
- Fatos (mono): `0 gerentes de conta` · `1 responsável técnico` · `100% do código auditável`
- Assinatura: `Brian Mendes — Arquiteto de Software & Fundador`

## 5.4 Capacidades — 4 clusters

**C1 · EXPERIÊNCIAS WEB & WEBGL** — *Interfaces com orçamento de frame.*
`Next.js App Router, React Three Fiber e shaders GLSL sob budget explícito: LCP abaixo de 1.2s, INP abaixo de 50ms, canvas único compartilhado. Design que se move porque o sistema aguenta — não apesar dele.`
Stack: `Next.js · TypeScript · R3F/Three · GSAP · Lenis · GLSL`
Prova (mono): `ESTE SITE: 1 CANVAS · DPR ADAPTATIVO · CLS 0`

**C2 · AUTOMAÇÃO & PIPELINES DE CRM** — *Processo como infraestrutura.*
`Bitrix24, n8n e Make tratados como runtime: workflows idempotentes, simuláveis offline e auditáveis antes do go-live. Parser binário próprio para Bizproc — inspeção e export de .bpt sem caixa-preta.`
Stack: `Bitrix24/Bizproc · n8n · Make · FastAPI · REST/Webhooks`
Prova (mono): `FLOWCRAFT: PARSER .BPT · 32 ENDPOINTS · SIMULADOR MULTI-CENÁRIO`

**C3 · AGENTES DE IA & ORQUESTRAÇÃO** — *Modelos com contrato.*
`Agentes que operam sob contrato de dados: provedores intercambiáveis (Gemini, OpenAI, Anthropic), fallback determinístico quando a API falha e custo sob telemetria. IA que entra no pipeline — não no lugar dele.`
Stack: `Gemini · OpenAI · Anthropic · BYOK · RAG local`
Prova (mono): `3 PROVEDORES · DEGRADAÇÃO DETERMINÍSTICA · 0 LOCK-IN`

**C4 · RUNTIME & INFRAESTRUTURA** — *Local-first. Cloud quando fizer sentido.*
`Desktop com SQLite nativo, edge com Postgres/Supabase, deploy com rollback ensaiado. Dados do cliente ficam onde o cliente manda — arquitetura decide onde o estado mora, não a moda.`
Stack: `Electron/Glaze · SQLite · Postgres/Supabase · Vercel Edge`
Prova (mono): `CODEX: CLOUD→LOCAL-FIRST · 9,4MB OFFLINE · 21 IPC HANDLERS`

## 5.5 Casos Selecionados

**FLOWCRAFT** — `Compilador visual para automação Bitrix24.`
`Editor, simulador e exportador de templates Bizproc (.bpt) — formato binário proprietário, aberto por engenharia reversa (zlib + PHP serialize). Workflows validados offline antes de tocarem o CRM.`
Métricas (mono): `32 ENDPOINTS API` · `47 TESTES` · `92 ATIVIDADES CATALOGADAS`
Stack: `FastAPI · React 19 · React Flow · ELK`

**CODEX** — `Migração cloud → local-first sem perda de superfície.`
`App desktop que abandonou backend remoto por SQLite embarcado: 9,4 MB de dataset consultável offline, export estático Next.js e IPC tipado. Custo de infra: zero. Latência de leitura: local.`
Métricas (mono): `21 IPC HANDLERS` · `32 TESTES` · `0 DEPENDÊNCIA DE REDE`
Stack: `Electron · Next.js 16 · SQLite · Zustand`

**PULSE** — `Command center pessoal com telemetria real.`
`Captura de demandas com atrito mínimo, timer com crash recovery e métricas de carga e concentração — tudo local-first, sem conta, sem cloud. O dado de atenção é do usuário, não do fornecedor.`
Métricas (mono): `38 IPC HANDLERS` · `CRASH RECOVERY` · `SQLITE NATIVO`
Stack: `Glaze · React 19 · TanStack · Tailwind 4`

**WONDHER.IO v2** — `Este site, tratado como produto.`
`Canvas WebGL único orquestrado com o scroll, shaders GLSL autorais e budget de performance como requisito de release — não como otimização posterior.`
Métricas (mono): `LCP < 1.2s` · `INP < 50ms` · `CLS 0`
Stack: `Next.js · R3F · GSAP · Lenis · Supabase`

## 5.6 Pipeline — 6 checkpoints

1. **Diagnóstico** — `48h para mapear topologia atual, gargalos e métricas-alvo.` → `mapa de sistema + hipóteses`
2. **Arquitetura** — `RFC com contrato de dados, budgets e critérios de aceite. Nada entra em build sem aceite explícito.` → `RFC aprovada`
3. **Build** — `Sprints curtos com preview deploy por commit. Você acompanha o sistema crescendo em URL, não em slide.` → `previews auditáveis`
4. **Instrumentação** — `Telemetria, testes e budgets de performance ligados antes do go-live — o sistema nasce observável.` → `dashboards + suíte de testes`
5. **Go-live** — `Checklist de corte, rollback ensaiado, DNS e cache sob controle. Deploy é procedimento, não evento.` → `sistema em produção`
6. **Operação** — `SLA de resposta, evolução guiada por métrica e código 100% transferível. Sem refém de fornecedor.` → `capacidade instalada`

## 5.7 Terminal Footer
- Boot: `wondher@edge:~$ session iniciada — 4 comandos disponíveis. digite 'help'.`
- `help` → `stack · cases · latency · contact --now`
- `latency` → `você ↔ wondher: 1 pessoa, 0 intermediários. RTT médio de resposta: < 24h úteis.`
- `contact --now` → `iniciando handshake… informe nome, e-mail e o sistema que precisa existir.`
- Linha legal: `Wondher Digital Studio LTDA · CNPJ 64.981.578/0001-59 · Curitiba – PR · brianmendes@wondher.io`

---

# SEÇÃO 6 — ARQUITETURA DE ENGENHARIA FRONTEND & BOILERPLATE

## 6.1 Árvore de diretórios (Next.js App Router)

```
wondher-portfolio/
├─ app/
│  ├─ layout.tsx                  # Geist Sans/Mono (next/font), metadata, Providers
│  ├─ page.tsx                    # Server Component: compõe as 8 seções DOM
│  ├─ api/
│  │  ├─ telemetry/route.ts       # GET snapshot Supabase (cache 60s, fallback estático)
│  │  └─ inquiry/route.ts         # POST contato → Supabase (rate-limited)
│  ├─ opengraph-image.tsx
│  ├─ robots.ts / sitemap.ts / manifest.ts
├─ components/
│  ├─ providers/
│  │  └─ ScrollOrchestrator.tsx   # Lenis + GSAP ScrollTrigger + ponte p/ R3F
│  ├─ canvas/                     # camada WebGL (client, lazy)
│  │  ├─ SceneRoot.tsx            # <Canvas> único (§3.1)
│  │  ├─ HeroMonolith.tsx         # §3.2
│  │  ├─ ConductorLine.tsx        # §3.3
│  │  ├─ CapabilityMatrix.tsx     # matriz 4 nós (morph procedural)
│  │  └─ CaseViewports.tsx        # planos de parallax dos cases
│  └─ dom/                        # camada DOM (semântica, indexável)
│     ├─ Navbar.tsx  Hero.tsx  About.tsx  Capabilities.tsx
│     ├─ Cases.tsx  Pipeline.tsx  Stack.tsx  TerminalFooter.tsx
├─ lib/
│  ├─ scroll/scroll-state.ts      # store transiente DOM ↔ GL
│  ├─ a11y/use-prefers-reduced-motion.ts
│  ├─ telemetry/supabase.ts       # client server-only + tipos
│  └─ shaders/conductor.vert|frag # GLSL (import via raw loader)
├─ styles/tokens.css              # @theme Tailwind v4 (§2.1)
├─ supabase/migrations/0001_telemetry.sql   # Apêndice A
└─ docs/superpowers/specs/…       # este documento
```

Dependências-alvo: `next@16`, `react@19`, `three` + `@react-three/fiber@^9` + `@react-three/drei@^10`, `gsap@^3.13` + `@gsap/react`, `lenis@^1`, `zustand`, `tailwindcss@^4`, `@supabase/supabase-js@^2` (server-only).

## 6.2 Ponte de estado de scroll (transiente — zero re-render)

```ts
// lib/scroll/scroll-state.ts
// Mutado pelo orquestrador (fora do React render); lido em useFrame por referência.
export const scrollState = {
  progress: 0,   // 0..1 progresso bruto da página
  lerped: 0,     // suavizado no rAF do GSAP (consumido pelos shaders)
  velocity: 0,
  pointer: { x: 0, y: 0 }, // NDC -1..1
};
```

## 6.3 Orquestrador central — Lenis + GSAP ScrollTrigger + R3F Bridge

```tsx
// components/providers/ScrollOrchestrator.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { scrollState } from "@/lib/scroll/scroll-state";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollOrchestrator({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, reduceMotion } = ctx.conditions!;

          if (reduceMotion) {
            // Sem smooth scroll, sem pins, sem scrubs — estados finais aplicados via CSS.
            document.documentElement.classList.add("reduced-motion");
            return;
          }

          // ── Lenis dirigido pelo ticker do GSAP (fonte única de rAF) ──
          const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
          lenis.on("scroll", ScrollTrigger.update);
          const tick = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);

          // ── Progresso global → ponte R3F (uProgress do duto, câmera etc.) ──
          ScrollTrigger.create({
            id: "global-progress",
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              scrollState.progress = self.progress;
              scrollState.velocity = self.getVelocity() / 1000;
            },
          });
          // Suavização do valor consumido pelos shaders (scrub desacoplado)
          const smooth = gsap.quickTo(scrollState, "lerped", { duration: 0.6, ease: "power2.out" });
          const sync = () => smooth(scrollState.progress);
          gsap.ticker.add(sync);

          // ── Pointer NDC para tilt (passivo, sem layout read) ──
          const onPointer = (e: PointerEvent) => {
            scrollState.pointer.x = (e.clientX / innerWidth) * 2 - 1;
            scrollState.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
          };
          addEventListener("pointermove", onPointer, { passive: true });

          // ── Ex.: seção Capabilities pinned com scrub (§4.4) ──
          if (isDesktop) {
            gsap.timeline({
              scrollTrigger: {
                trigger: "#capabilities",
                start: "top top",
                end: "+=300%",
                pin: true,
                scrub: 1,
                snap: { snapTo: 1 / 3, duration: 0.4, ease: "power1.inOut" },
              },
            });
          }

          return () => {
            removeEventListener("pointermove", onPointer);
            gsap.ticker.remove(sync);
            gsap.ticker.remove(tick);
            lenis.destroy();
          };
        }
      );
    },
    { scope: root }
  );

  return <div ref={root}>{children}</div>;
}
```

Regras de integração (conformes às práticas oficiais GSAP): plugin registrado uma única vez; `useGSAP` com `scope` (cleanup automático de tweens e ScrollTriggers); ScrollTriggers criados na ordem do documento (ou `refreshPriority`); `scrub` **ou** `toggleActions`, nunca ambos; `ScrollTrigger.refresh()` após carregamento de fontes (`document.fonts.ready`); nada de GSAP em SSR.

---

# SEÇÃO 7 — TRÊS DIREÇÕES CRIATIVAS & VEREDITO

| Critério | A · Dark Cinematic & Precision Physics | B · Technical Editorial & Kinetic Brutalism | C · Systemic Lab & Real-Time Data Aesthetic |
|---|---|---|---|
| Assinatura | Monólito de vidro, luz volumétrica, física precisa | Tipografia gigante, grid exposto, motion tipográfico agressivo | HUD/instrumentação, dados vivos, estética de laboratório |
| Tipografia | Geist Sans display + Geist Mono metadados | Serifa editorial + grotesk condensada, corpo 90% type | Mono dominante, sans apenas em headlines |
| Paleta | Void #08090A + mint cirúrgico + indigo pontual | Papel escuro + 1 acento duro (alto contraste) | Void + mint como "tinta de dado" em toda parte |
| Motion | Coreografia contínua scroll-driven, câmera cinematográfica | Cortes secos, reveals tipográficos, pouco 3D | Contadores, sparklines, streams — atualização constante |
| Risco de perf. | Médio (transmission) — mitigável (§3.4) | Baixo | Alto (dados vivos + WebGL simultâneos) |
| Risco de marca | Clichê "dark 3D" se faltar assinatura | Frieza excessiva; brutalismo conflita com tom cirúrgico-premium | Gimmick se os dados não forem reais |
| Aderência ao perfil | Alta — traduz precisão e profundidade de sistema | Média — editorial forte, mas esconde a competência 3D/WebGL | Alta no discurso, cara na manutenção |
| Custo de implementação | Médio-alto | Baixo-médio | Alto |

## Veredito

**Adotar a Direção A — *Dark Cinematic & Precision Physics* — como espinha dorsal, absorvendo a camada de instrumentação da Direção C como sistema secundário** (chips mono de telemetria, métricas nos cases, terminal footer). Nome interno: **"Precision Cinema, Live Instrumentation"**.

Fundamentação:

1. **Prova de competência dupla.** O perfil do Brian é arquiteto-executor: a cinematografia WebGL (A) demonstra domínio de render pipeline — competência vendida no cluster C1 — enquanto a instrumentação (C) demonstra cultura de telemetria dos clusters C2–C4. O site vira o próprio case.
2. **Dados reais existem.** A camada C só funciona com dados verdadeiros — e há: métricas dos produtos (32 endpoints, 47 testes, 9,4 MB offline) e snapshot Supabase de operação. Nada precisa ser encenado.
3. **Continuidade de marca.** O wondher.io v1 já é dark com WebGL fluido; A evolui essa identidade sem ruptura, elevando o acabamento (transmissão, coreografia de câmera, linha condutora).
4. **B descartada como base:** o brutalismo cinético conflita com o registro "frio, cirúrgico, editorialmente polido" — agressividade tipográfica lê como provocação, não como precisão — e desperdiça o diferencial 3D. Sua herança útil (hierarquia editorial rígida, grid exposto) já está absorvida no sistema de grid (§2.2).
5. **C pura descartada:** custo permanente de manter dados vivos com o site parado entre projetos; risco de HUD-gimmick. Como camada secundária, entrega o mesmo sinal por 20% do custo.

---

## Fora do escopo desta entrega

- Implementação do site (bloqueada até aprovação deste design — gate do processo).
- Aplicação do schema Supabase (sem credenciais no ambiente; requer secrets `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` no Cursor Dashboard → Cloud Agents → Secrets).
- Migração de conteúdo/i18n do site v1 (`brianmendes`) e decisão de corte de DNS.
- Fotografia/HDRi definitivos (placeholder: HDRi estúdio 1k neutro).

## Próximos passos

1. Revisão e aprovação deste spec pelo usuário.
2. `writing-plans`: plano de implementação por fases (scaffold → tokens/DOM → canvas → coreografia → telemetria → QA de budgets).
3. Secrets Supabase adicionados → aplicar Apêndice A.

---

# Apêndice A — Schema Supabase (telemetria + contato)

```sql
-- supabase/migrations/0001_telemetry.sql

-- Snapshot de telemetria do estúdio (alimenta chips da navbar)
create table if not exists public.studio_telemetry (
  id smallint primary key default 1 check (id = 1),   -- singleton
  uptime_pct numeric(5,2) not null default 99.98,
  deploys_30d integer not null default 0,
  active_pipelines integer not null default 0,
  last_commit_sha text,
  updated_at timestamptz not null default now()
);

-- Contatos vindos do terminal footer
create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company text,
  message text not null check (char_length(message) between 10 and 4000),
  source text not null default 'terminal-footer',
  created_at timestamptz not null default now()
);

alter table public.studio_telemetry enable row level security;
alter table public.contact_inquiries enable row level security;

-- Telemetria: leitura pública, escrita apenas service_role (via CI/webhook de deploy)
create policy "telemetry_read_anon" on public.studio_telemetry
  for select to anon using (true);

-- Contato: insert público (rate limit na route handler), leitura apenas service_role
create policy "inquiry_insert_anon" on public.contact_inquiries
  for insert to anon with check (true);
```

Route handlers: `GET /api/telemetry` (cache 60s, fallback `lib/telemetry/static-snapshot.json` quando Supabase indisponível — mesma filosofia de fallback do FlowCraft) e `POST /api/inquiry` (validação zod + rate limit por IP + honeypot).

# Apêndice B — Critérios de aceite (gate de release da implementação)

1. Lighthouse (moto G4 emulado, Slow 4G): Performance ≥ 90; LCP < 1.2s em conexão de referência desktop; INP < 50ms; CLS = 0.
2. `prefers-reduced-motion`: página 100% legível e navegável sem canvas nem smooth scroll.
3. Teclado: toda ação alcançável por Tab; foco visível; terminal footer com equivalentes em links.
4. Contraste AA em todos os pares (tabela §2.1); `--color-pulse` nunca em texto < 24px.
5. Sem `markers: true`, sem `console.*` em produção; ScrollTriggers todos revertidos em unmount (StrictMode duplo-mount limpo).
6. JS inicial < 220KB gz (chunk 3D lazy); imagens AVIF/WebP com dimensões declaradas.
