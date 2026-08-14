# Wondher.io v2 — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o site wondher.io v2 conforme o spec `docs/superpowers/specs/2026-08-14-wondher-io-creative-direction-design.md` — direção "Precision Cinema, Live Instrumentation".

**Architecture:** Next.js 16 App Router com duas camadas estritas: DOM semântico (`components/dom/`, indexável, 100% funcional sem WebGL) e canvas WebGL único lazy (`components/canvas/`, `aria-hidden`, fixed atrás do conteúdo). Ponte DOM→GL por módulo mutável transiente (`lib/scroll/scroll-state.ts`), Lenis dirigido pelo ticker do GSAP, dados de telemetria/contato via route handlers com fallback estático (Supabase opcional por env).

**Tech Stack:** Next.js 16 · React 19 · TypeScript strict · Tailwind CSS v4 (`@theme`) · GSAP 3.13 + @gsap/react + ScrollTrigger · Lenis 1.x · three + @react-three/fiber 9 + drei 10 · geist (fonts) · zod · Vitest + Testing Library · Playwright + @axe-core/playwright

## Global Constraints

- Budgets (gate de release): LCP < 1.2s (LCP = H1 DOM, nunca canvas) · INP < 50ms · CLS = 0 · JS inicial < 220KB gz antes do chunk 3D (lazy).
- Canvas: único, `fixed inset-0`, `aria-hidden`, `pointer-events: none`, `dpr={[1, 1.75]}`, `zIndex var(--z-canvas)`.
- `prefers-reduced-motion`: canvas NÃO monta; Lenis desativado; classe `reduced-motion` no `<html>`; página íntegra.
- Contraste: pares AA da tabela §2.1 do spec; `--color-pulse` (#6366F1) nunca em texto < 24px (usar `--color-pulse-text` #818CF8).
- Copy: exatamente as strings pt-BR do spec §5 (zero emoji, zero exclamação; labels mono em MAIÚSCULAS).
- Cores/tipografia/movimento SÓ via tokens CSS (§2.1); nenhum hex solto em componente.
- Zero setState/alocação por frame: canvas lê `scrollState` por referência em `useFrame`.
- GSAP: plugins registrados 1×; `useGSAP` com `scope`; scrub OU toggleActions (nunca ambos); sem `markers` em produção; nada de GSAP/ScrollTrigger em SSR.
- IDs de seção: `#hero #about #capabilities #cases #pipeline #stack #contact`.
- TypeScript `strict: true`; `npx tsc --noEmit` limpo em todo commit.
- Commits: conventional commits, um por task no mínimo.

## Desvios registrados vs. spec (racional)

1. **Sem `zustand`** — o spec listava como dep-alvo; o módulo mutável `scroll-state.ts` cumpre o papel sem dependência (YAGNI).
2. **Shaders como template strings TS** (`lib/shaders/conductor.ts`) em vez de raw loader `.vert/.frag` — evita configurar loader no Turbopack; conteúdo GLSL idêntico ao spec §3.3.
3. **Pin de Capabilities vive no componente** `Capabilities.tsx` (useGSAP scoped), não no orquestrador — o exemplo do spec §6.3 era ilustrativo; ownership por seção limpa o cleanup.

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `app/layout.tsx` | fonts Geist, metadata, `<ScrollOrchestrator>` + `<CanvasLoader>` |
| `app/page.tsx` | compõe as 8 seções DOM (Server Component) |
| `app/api/telemetry/route.ts` | GET snapshot (revalidate 60s) |
| `app/api/inquiry/route.ts` | POST contato (zod + honeypot + rate limit) |
| `app/robots.ts` / `app/sitemap.ts` / `app/opengraph-image.tsx` | SEO |
| `styles/tokens.css` | `@theme` Tailwind v4 (§2.1 do spec, literal) |
| `lib/scroll/scroll-state.ts` | ponte transiente DOM↔GL |
| `lib/a11y/use-prefers-reduced-motion.ts` | hook de media query |
| `lib/telemetry/get-telemetry.ts` + `static-snapshot.json` | snapshot com fallback |
| `lib/terminal/run-command.ts` | parser puro dos comandos do footer |
| `lib/shaders/conductor.ts` | GLSL vertex/fragment (strings) |
| `components/providers/ScrollOrchestrator.tsx` | Lenis × GSAP × ponte |
| `components/dom/{Navbar,Hero,About,Capabilities,Cases,Pipeline,StackSection,TerminalFooter}.tsx` | seções |
| `components/canvas/{CanvasLoader,SceneRoot,HeroMonolith,ConductorLine,CapabilityMatrix,CaseViewports}.tsx` | camada WebGL |
| `supabase/migrations/0001_telemetry.sql` | Apêndice A do spec, literal |
| `vitest.config.ts` / `vitest.setup.ts` / `playwright.config.ts` / `e2e/site.spec.ts` | testes |

---

### Task 1: Scaffold Next 16 + Tailwind v4 + tokens + fonts

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `styles/tokens.css`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`

**Interfaces:**
- Produces: alias `@/*` → raiz; tokens CSS (`--color-void`, `--font-display` etc.); scripts npm `dev/build/start/test/e2e/typecheck`.

- [ ] **Step 1: Inicializar pacote e instalar dependências**

```bash
cd /agent/repos/wondher-portfolio
npm init -y
npm pkg set name="wondher-portfolio" private=true type="module" \
  scripts.dev="next dev" scripts.build="next build" scripts.start="next start" \
  scripts.typecheck="tsc --noEmit" scripts.test="vitest run" scripts.e2e="playwright test"
npm i next@16 react@19 react-dom@19 gsap @gsap/react lenis three @react-three/fiber@9 @react-three/drei@10 geist zod @supabase/supabase-js
npm i -D typescript @types/react @types/react-dom @types/node @types/three tailwindcss @tailwindcss/postcss vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test @axe-core/playwright
```

- [ ] **Step 2: Ler os docs embarcados do Next 16** (breaking changes vs. treinamento): listar `node_modules/next/dist/docs/` e ler os guias de App Router/`next.config` antes de escrever config. Ajustar os arquivos das próximas steps se algum guia contradisser.

- [ ] **Step 3: Criar configs**

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext", "moduleResolution": "bundler", "jsx": "preserve",
    "strict": true, "noEmit": true, "esModuleInterop": true, "skipLibCheck": true,
    "resolveJsonModule": true, "isolatedModules": true, "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

```ts
// next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { reactStrictMode: true };
export default nextConfig;
```

```js
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

```gitignore
# .gitignore
node_modules/
.next/
out/
*.log
test-results/
playwright-report/
lh.json
```

- [ ] **Step 4: Criar `styles/tokens.css`** — copiar LITERALMENTE o bloco `@theme` do spec §2.1 (começa em `@import "tailwindcss";`), incluindo cores, fontes, escala fluida, movimento, elevação e camadas z.

- [ ] **Step 5: Layout raiz + página vazia**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/styles/tokens.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wondher.io"),
  title: "Wondher — Engenharia Criativa & Sistemas",
  description:
    "Sites de alta performance, automação de CRM e agentes de IA — entregues por quem responde pela métrica. Zero camadas de intermediação entre a sua decisão e o deploy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-void text-ink font-display antialiased">{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
export default function Page() {
  return <main id="conteudo" className="relative z-[var(--z-content)]" />;
}
```

- [ ] **Step 6: Verificar**

```bash
npx tsc --noEmit && npm run build
```
Esperado: build verde, rota `/` estática.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: scaffold next 16 + tailwind v4 + tokens + geist"`

---

### Task 2: `scroll-state` (ponte DOM↔GL) — TDD

**Files:**
- Create: `lib/scroll/scroll-state.ts`, `vitest.config.ts`, `vitest.setup.ts`
- Test: `lib/scroll/scroll-state.test.ts`

**Interfaces:**
- Produces: `scrollState: { progress: number; lerped: number; velocity: number; cluster: number; pointer: { x: number; y: number } }` e `resetScrollState(): void`. Consumido por ScrollOrchestrator (escrita), canvas e Capabilities (leitura).

- [ ] **Step 1: Configurar Vitest**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], include: ["**/*.test.{ts,tsx}"], exclude: ["node_modules", "e2e"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Teste falhando**

```ts
// lib/scroll/scroll-state.test.ts
import { describe, expect, it } from "vitest";
import { scrollState, resetScrollState } from "./scroll-state";

describe("scrollState", () => {
  it("nasce zerado e com ponteiro neutro", () => {
    resetScrollState();
    expect(scrollState).toMatchObject({ progress: 0, lerped: 0, velocity: 0, cluster: 0, pointer: { x: 0, y: 0 } });
  });
  it("é mutável por referência (contrato transiente)", () => {
    resetScrollState();
    const ref = scrollState;
    ref.progress = 0.42;
    expect(scrollState.progress).toBe(0.42);
  });
  it("resetScrollState restaura tudo", () => {
    scrollState.progress = 1; scrollState.lerped = 1; scrollState.cluster = 3; scrollState.pointer.x = -1;
    resetScrollState();
    expect(scrollState.progress).toBe(0);
    expect(scrollState.pointer.x).toBe(0);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar** — `npx vitest run lib/scroll` → FAIL (módulo inexistente).

- [ ] **Step 4: Implementar**

```ts
// lib/scroll/scroll-state.ts
// Mutado pelo orquestrador (fora do render do React); lido por referência em useFrame.
// Contrato: nenhum consumidor faz setState a partir destes valores por frame.
export const scrollState = {
  progress: 0, // 0..1 progresso bruto da página
  lerped: 0,   // suavizado no ticker (uProgress dos shaders)
  velocity: 0,
  cluster: 0,  // 0..3 progresso da seção Capabilities (pin)
  pointer: { x: 0, y: 0 }, // NDC -1..1
};

export function resetScrollState(): void {
  scrollState.progress = 0;
  scrollState.lerped = 0;
  scrollState.velocity = 0;
  scrollState.cluster = 0;
  scrollState.pointer.x = 0;
  scrollState.pointer.y = 0;
}
```

- [ ] **Step 5: Rodar e ver passar** — `npx vitest run lib/scroll` → 3 passed.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: scroll-state transiente com testes"`

---

### Task 3: Hook `usePrefersReducedMotion` — TDD

**Files:**
- Create: `lib/a11y/use-prefers-reduced-motion.ts`
- Test: `lib/a11y/use-prefers-reduced-motion.test.tsx`

**Interfaces:**
- Produces: `usePrefersReducedMotion(): boolean` (client hook, SSR-safe: `false` no servidor).

- [ ] **Step 1: Teste falhando**

```tsx
// lib/a11y/use-prefers-reduced-motion.test.tsx
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches, media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
}

describe("usePrefersReducedMotion", () => {
  it("retorna true quando a media query casa", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
  it("retorna false quando não casa", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run lib/a11y` → FAIL.

- [ ] **Step 3: Implementar**

```ts
// lib/a11y/use-prefers-reduced-motion.ts
"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
```

- [ ] **Step 4: Rodar e ver passar** — `npx vitest run lib/a11y` → 2 passed.
- [ ] **Step 5: Commit** — `git commit -am "feat: hook usePrefersReducedMotion"`

---

### Task 4: ScrollOrchestrator (Lenis × GSAP × ponte)

**Files:**
- Create: `components/providers/ScrollOrchestrator.tsx`
- Modify: `app/layout.tsx` (envolver `{children}`)
- Test: `components/providers/scroll-orchestrator.test.tsx`

**Interfaces:**
- Consumes: `scrollState` (Task 2).
- Produces: componente `<ScrollOrchestrator>{children}</ScrollOrchestrator>`; classe `reduced-motion` no `<html>` quando aplicável; escrita contínua de `scrollState.progress/lerped/velocity/pointer`.

- [ ] **Step 1: Teste falhando (gate de reduced motion)**

```tsx
// components/providers/scroll-orchestrator.test.tsx
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ScrollOrchestrator } from "./ScrollOrchestrator";

it("aplica classe reduced-motion no html quando o usuário prefere menos movimento", async () => {
  vi.stubGlobal("matchMedia", vi.fn((q: string) => ({
    matches: q.includes("prefers-reduced-motion"),
    media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn(),
  })));
  render(<ScrollOrchestrator><p>conteudo</p></ScrollOrchestrator>);
  await vi.waitFor(() => expect(document.documentElement.classList.contains("reduced-motion")).toBe(true));
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run components/providers` → FAIL.

- [ ] **Step 3: Implementar** — código do spec §6.3, com o pin de Capabilities REMOVIDO (vive na Task 8) e classe no `<html>`:

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
        { reduceMotion: "(prefers-reduced-motion: reduce)", noPreference: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (ctx.conditions!.reduceMotion) {
            document.documentElement.classList.add("reduced-motion");
            return () => document.documentElement.classList.remove("reduced-motion");
          }

          // Lenis dirigido pelo ticker do GSAP — fonte única de rAF
          const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
          lenis.on("scroll", ScrollTrigger.update);
          const tick = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);

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

          const smooth = gsap.quickTo(scrollState, "lerped", { duration: 0.6, ease: "power2.out" });
          const sync = () => smooth(scrollState.progress);
          gsap.ticker.add(sync);

          const onPointer = (e: PointerEvent) => {
            scrollState.pointer.x = (e.clientX / innerWidth) * 2 - 1;
            scrollState.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
          };
          addEventListener("pointermove", onPointer, { passive: true });

          // Reposicionar triggers quando as fontes carregarem (layout muda)
          document.fonts?.ready.then(() => ScrollTrigger.refresh());

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

- [ ] **Step 4: Ligar no layout** — em `app/layout.tsx`, envolver: `<body …><ScrollOrchestrator>{children}</ScrollOrchestrator></body>`.

- [ ] **Step 5: Verificar** — `npx vitest run && npx tsc --noEmit && npm run build` → tudo verde.
- [ ] **Step 6: Commit** — `git commit -am "feat: orquestrador lenis + gsap + ponte de scroll"`

---

### Task 5: Navbar (chips de telemetria + relógio vivo)

**Files:**
- Create: `components/dom/Navbar.tsx`
- Modify: `app/page.tsx`
- Test: `components/dom/navbar.test.tsx`

**Interfaces:**
- Consumes: nada ainda (dados estáticos; Task 10 injeta telemetria real via prop).
- Produces: `<Navbar telemetry={TelemetrySnapshot | null} />`; tipo `TelemetrySnapshot` fica em `lib/telemetry/types.ts` (criar já):

```ts
// lib/telemetry/types.ts
export type TelemetrySnapshot = {
  uptimePct: number;
  deploys30d: number;
  activePipelines: number;
  lastCommitSha: string | null;
  updatedAt: string;
};
```

- [ ] **Step 1: Teste falhando**

```tsx
// components/dom/navbar.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Navbar } from "./Navbar";

it("renderiza chips de telemetria e CTA", () => {
  render(<Navbar telemetry={{ uptimePct: 99.98, deploys30d: 14, activePipelines: 3, lastCommitSha: null, updatedAt: "2026-08-14T00:00:00Z" }} />);
  expect(screen.getByText("WONDHER®")).toBeInTheDocument();
  expect(screen.getByText("SYS:OPERACIONAL · UPTIME 99.98%")).toBeInTheDocument();
  expect(screen.getByText("DEPLOYS/30D: 14")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Iniciar diagnóstico" })).toHaveAttribute("href", "#contact");
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run components/dom` → FAIL.

- [ ] **Step 3: Implementar**

```tsx
// components/dom/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import type { TelemetrySnapshot } from "@/lib/telemetry/types";

function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour12: false });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{`CURITIBA · UTC-3 · ${time ?? "--:--:--"}`}</span>;
}

export function Navbar({ telemetry }: { telemetry: TelemetrySnapshot | null }) {
  return (
    <header className="fixed left-1/2 top-6 z-[var(--z-nav)] w-[min(1320px,calc(100%-40px))] -translate-x-1/2">
      <nav
        aria-label="Principal"
        className="flex items-center justify-between gap-4 rounded-full border border-hairline bg-surface/80 px-5 py-2.5 shadow-elevation backdrop-blur-[12px]"
      >
        <a href="#hero" className="font-display text-sm font-semibold tracking-[0.14em] text-ink">
          WONDHER®
        </a>
        <div className="hidden items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-ink-muted md:flex">
          <span className="text-signal">
            {telemetry ? `SYS:OPERACIONAL · UPTIME ${telemetry.uptimePct.toFixed(2)}%` : "SYS:OPERACIONAL"}
          </span>
          {telemetry ? <span>{`DEPLOYS/30D: ${telemetry.deploys30d}`}</span> : null}
          <Clock />
        </div>
        <a
          href="#contact"
          className="rounded-full bg-signal px-4 py-1.5 text-sm font-medium text-void transition-[transform,box-shadow] duration-[var(--duration-fast)] hover:shadow-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Iniciar diagnóstico
        </a>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Compor na página** — `app/page.tsx` passa `telemetry={null}` por enquanto (Task 10 troca).
- [ ] **Step 5: Rodar testes + typecheck** — `npx vitest run && npx tsc --noEmit` → verde.
- [ ] **Step 6: Commit** — `git commit -am "feat: navbar com chips de telemetria e relógio"`

---

### Task 6: Hero + About (copy literal do spec §5.2–5.3)

**Files:**
- Create: `components/dom/Hero.tsx`, `components/dom/About.tsx`
- Modify: `app/page.tsx`
- Test: `components/dom/hero-about.test.tsx`

**Interfaces:**
- Produces: `<Hero />`, `<About />` sem props; ids `#hero`, `#about`.

- [ ] **Step 1: Teste falhando (fidelidade de copy)**

```tsx
// components/dom/hero-about.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Hero } from "./Hero";
import { About } from "./About";

it("hero tem H1, kicker e CTAs do spec", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Quem projeta a arquitetura escreve o código.");
  expect(screen.getByText("ENGENHARIA CRIATIVA & SISTEMAS — CURITIBA/BR")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Iniciar diagnóstico técnico" })).toHaveAttribute("href", "#contact");
  expect(screen.getByRole("link", { name: "$ ver casos --selecionados" })).toHaveAttribute("href", "#cases");
});

it("about tem manifesto e fatos mono", () => {
  render(<About />);
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Atendimento direto é decisão de arquitetura.");
  expect(screen.getByText("0 gerentes de conta")).toBeInTheDocument();
  expect(screen.getByText("Brian Mendes — Arquiteto de Software & Fundador")).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run components/dom` → FAIL.

- [ ] **Step 3: Implementar Hero**

```tsx
// components/dom/Hero.tsx
export function Hero() {
  return (
    <section id="hero" className="relative flex min-h-dvh flex-col justify-center px-5 md:px-24">
      <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-signal">
        ENGENHARIA CRIATIVA &amp; SISTEMAS — CURITIBA/BR
      </p>
      <h1 className="mt-6 max-w-[11ch] text-[length:var(--text-display)] font-semibold leading-[0.98] tracking-[-0.02em] text-ink md:max-w-[9ch]">
        Quem projeta a arquitetura escreve o código.
      </h1>
      <p className="mt-8 max-w-[62ch] text-[length:var(--text-lead)] leading-relaxed text-ink-muted">
        Sites de alta performance, automação de CRM e agentes de IA — entregues por quem responde
        pela métrica. Zero camadas de intermediação entre a sua decisão e o deploy.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href="#contact"
          className="rounded-full bg-signal px-6 py-3 font-medium text-void transition-shadow duration-[var(--duration-fast)] hover:shadow-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Iniciar diagnóstico técnico
        </a>
        <a
          href="#cases"
          className="rounded-full border border-hairline px-6 py-3 font-mono text-sm text-ink transition-colors duration-[var(--duration-fast)] hover:border-signal-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          $ ver casos --selecionados
        </a>
      </div>
      <p className="absolute bottom-8 left-5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink-muted md:left-24">
        SCROLL — INICIANDO PIPELINE
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Implementar About** (manifesto §5.3 + diagrama de latência como lista semântica; o SVG animado entra com GSAP na própria seção via classe `.lat-route`, sem scrub — `toggleActions: "play none none reverse"` fica para polimento do e2e visual, não bloqueia):

```tsx
// components/dom/About.tsx
const FACTS = ["0 gerentes de conta", "1 responsável técnico", "100% do código auditável"];

export function About() {
  return (
    <section id="about" className="mx-auto grid max-w-[1320px] gap-12 px-5 py-40 md:grid-cols-2 md:px-0">
      <div>
        <h2 className="text-[length:var(--text-h2)] font-semibold leading-tight tracking-[-0.01em] text-ink">
          Atendimento direto é decisão de arquitetura.
        </h2>
        <p className="mt-6 max-w-[62ch] leading-relaxed text-ink-muted">
          Toda camada entre quem decide e quem executa adiciona latência, distorce requisito e dilui
          responsabilidade. A Wondher remove a camada: o mesmo arquiteto que desenha a topologia
          escreve o código de produção, instrumenta a telemetria e assina o resultado. Menos
          tradução, menos retrabalho, mais sistema em produção.
        </p>
        <p className="mt-8 font-mono text-sm text-ink">Brian Mendes — Arquiteto de Software &amp; Fundador</p>
      </div>
      <div className="flex flex-col justify-center gap-6">
        <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink-muted">ROTA CONVENCIONAL</p>
        <p className="lat-route font-mono text-sm text-ink-muted line-through decoration-[#f87171]/60">
          cliente → gerente → tráfego → dev
        </p>
        <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink-muted">ROTA WONDHER</p>
        <p className="lat-route font-mono text-sm text-signal">cliente → arquiteto-executor</p>
        <ul className="mt-6 grid gap-3 border-t border-hairline pt-6">
          {FACTS.map((f) => (
            <li key={f} className="font-mono text-sm uppercase tracking-[0.08em] text-ink">{f}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Compor na página, rodar testes, typecheck** — verde.
- [ ] **Step 6: Commit** — `git commit -am "feat: hero e about com copy do spec"`

---

### Task 7: Capabilities (split pinned + 4 clusters, copy §5.4)

**Files:**
- Create: `components/dom/Capabilities.tsx`, `lib/content/capabilities.ts`
- Modify: `app/page.tsx`
- Test: `components/dom/capabilities.test.tsx`

**Interfaces:**
- Consumes: `scrollState` (escreve `cluster`), GSAP/useGSAP.
- Produces: `<Capabilities />`; dados exportados `CAPABILITY_CLUSTERS: Cluster[]` com `{ id, label, title, body, stack, proof }` (CapabilityMatrix da Task 15 usa o índice do cluster).

- [ ] **Step 1: Extrair conteúdo**

```ts
// lib/content/capabilities.ts
export type Cluster = { id: string; label: string; title: string; body: string; stack: string; proof: string };

export const CAPABILITY_CLUSTERS: Cluster[] = [
  {
    id: "web",
    label: "C1 · EXPERIÊNCIAS WEB & WEBGL",
    title: "Interfaces com orçamento de frame.",
    body: "Next.js App Router, React Three Fiber e shaders GLSL sob budget explícito: LCP abaixo de 1.2s, INP abaixo de 50ms, canvas único compartilhado. Design que se move porque o sistema aguenta — não apesar dele.",
    stack: "Next.js · TypeScript · R3F/Three · GSAP · Lenis · GLSL",
    proof: "ESTE SITE: 1 CANVAS · DPR ADAPTATIVO · CLS 0",
  },
  {
    id: "crm",
    label: "C2 · AUTOMAÇÃO & PIPELINES DE CRM",
    title: "Processo como infraestrutura.",
    body: "Bitrix24, n8n e Make tratados como runtime: workflows idempotentes, simuláveis offline e auditáveis antes do go-live. Parser binário próprio para Bizproc — inspeção e export de .bpt sem caixa-preta.",
    stack: "Bitrix24/Bizproc · n8n · Make · FastAPI · REST/Webhooks",
    proof: "FLOWCRAFT: PARSER .BPT · 32 ENDPOINTS · SIMULADOR MULTI-CENÁRIO",
  },
  {
    id: "ai",
    label: "C3 · AGENTES DE IA & ORQUESTRAÇÃO",
    title: "Modelos com contrato.",
    body: "Agentes que operam sob contrato de dados: provedores intercambiáveis (Gemini, OpenAI, Anthropic), fallback determinístico quando a API falha e custo sob telemetria. IA que entra no pipeline — não no lugar dele.",
    stack: "Gemini · OpenAI · Anthropic · BYOK · RAG local",
    proof: "3 PROVEDORES · DEGRADAÇÃO DETERMINÍSTICA · 0 LOCK-IN",
  },
  {
    id: "infra",
    label: "C4 · RUNTIME & INFRAESTRUTURA",
    title: "Local-first. Cloud quando fizer sentido.",
    body: "Desktop com SQLite nativo, edge com Postgres/Supabase, deploy com rollback ensaiado. Dados do cliente ficam onde o cliente manda — arquitetura decide onde o estado mora, não a moda.",
    stack: "Electron/Glaze · SQLite · Postgres/Supabase · Vercel Edge",
    proof: "CODEX: CLOUD→LOCAL-FIRST · 9,4MB OFFLINE · 21 IPC HANDLERS",
  },
];
```

- [ ] **Step 2: Teste falhando**

```tsx
// components/dom/capabilities.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Capabilities } from "./Capabilities";

it("renderiza os 4 clusters com provas mono", () => {
  render(<Capabilities />);
  expect(screen.getByText("C1 · EXPERIÊNCIAS WEB & WEBGL")).toBeInTheDocument();
  expect(screen.getByText("Processo como infraestrutura.")).toBeInTheDocument();
  expect(screen.getByText("3 PROVEDORES · DEGRADAÇÃO DETERMINÍSTICA · 0 LOCK-IN")).toBeInTheDocument();
  expect(screen.getByText("CODEX: CLOUD→LOCAL-FIRST · 9,4MB OFFLINE · 21 IPC HANDLERS")).toBeInTheDocument();
});
```

- [ ] **Step 3: Rodar e ver falhar**, depois **implementar**:

```tsx
// components/dom/Capabilities.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CAPABILITY_CLUSTERS } from "@/lib/content/capabilities";
import { scrollState } from "@/lib/scroll/scroll-state";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Capabilities() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (!ctx.conditions!.isDesktop) return;
          const panels = gsap.utils.toArray<HTMLElement>(".cap-panel");
          gsap.set(panels.slice(1), { autoAlpha: 0 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=300%",
              pin: true,
              scrub: 1,
              snap: { snapTo: 1 / 3, duration: 0.4, ease: "power1.inOut" },
              onUpdate: (self) => {
                scrollState.cluster = self.progress * 3; // 0..3 → CapabilityMatrix
              },
            },
          });
          panels.slice(1).forEach((panel, i) => {
            tl.to(panels[i], { autoAlpha: 0, y: -24, duration: 0.35 }, i)
              .to(panel, { autoAlpha: 1, y: 0, duration: 0.35 }, i + 0.15);
          });
        }
      );
    },
    { scope: root }
  );

  return (
    <section id="capabilities" ref={root} className="relative min-h-dvh px-5 py-40 md:px-24">
      <div className="md:grid md:grid-cols-2 md:gap-12">
        <div className="relative md:min-h-[60vh]">
          {CAPABILITY_CLUSTERS.map((c, i) => (
            <article
              key={c.id}
              className={`cap-panel md:absolute md:inset-0 ${i > 0 ? "mt-16 md:mt-0" : ""}`}
            >
              <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-signal">{c.label}</p>
              <h3 className="mt-4 text-[length:var(--text-h2)] font-semibold leading-tight text-ink">{c.title}</h3>
              <p className="mt-5 max-w-[52ch] leading-relaxed text-ink-muted">{c.body}</p>
              <p className="mt-6 font-mono text-sm text-ink">{c.stack}</p>
              <p className="mt-3 inline-block rounded border border-hairline bg-surface px-3 py-1.5 font-mono text-[13px] uppercase tracking-[0.08em] text-signal">
                {c.proof}
              </p>
            </article>
          ))}
        </div>
        <div aria-hidden className="hidden md:block" /> {/* janela para a matriz no canvas */}
      </div>
    </section>
  );
}
```

Nota: no mobile os painéis ficam em fluxo (`md:absolute` só no desktop) — sem pin, conforme Global Constraints.

- [ ] **Step 4: Compor na página; rodar testes + typecheck + build** — verde.
- [ ] **Step 5: Commit** — `git commit -am "feat: capabilities pinned com 4 clusters"`

---

### Task 8: Cases + Pipeline (copy §5.5–5.6)

**Files:**
- Create: `components/dom/Cases.tsx`, `components/dom/Pipeline.tsx`, `lib/content/cases.ts`, `lib/content/pipeline.ts`
- Modify: `app/page.tsx`
- Test: `components/dom/cases-pipeline.test.tsx`

**Interfaces:**
- Produces: `<Cases />` (id `#cases`), `<Pipeline />` (id `#pipeline`); `CASES: CaseStudy[]` `{ id, name, thesis, body, metrics: string[], stack }`; `PIPELINE_STEPS: PipelineStep[]` `{ n, title, body, artifact }`.

- [ ] **Step 1: Conteúdo**

```ts
// lib/content/cases.ts
export type CaseStudy = { id: string; name: string; thesis: string; body: string; metrics: string[]; stack: string };

export const CASES: CaseStudy[] = [
  {
    id: "flowcraft", name: "FLOWCRAFT", thesis: "Compilador visual para automação Bitrix24.",
    body: "Editor, simulador e exportador de templates Bizproc (.bpt) — formato binário proprietário, aberto por engenharia reversa (zlib + PHP serialize). Workflows validados offline antes de tocarem o CRM.",
    metrics: ["32 ENDPOINTS API", "47 TESTES", "92 ATIVIDADES CATALOGADAS"],
    stack: "FastAPI · React 19 · React Flow · ELK",
  },
  {
    id: "codex", name: "CODEX", thesis: "Migração cloud → local-first sem perda de superfície.",
    body: "App desktop que abandonou backend remoto por SQLite embarcado: 9,4 MB de dataset consultável offline, export estático Next.js e IPC tipado. Custo de infra: zero. Latência de leitura: local.",
    metrics: ["21 IPC HANDLERS", "32 TESTES", "0 DEPENDÊNCIA DE REDE"],
    stack: "Electron · Next.js 16 · SQLite · Zustand",
  },
  {
    id: "pulse", name: "PULSE", thesis: "Command center pessoal com telemetria real.",
    body: "Captura de demandas com atrito mínimo, timer com crash recovery e métricas de carga e concentração — tudo local-first, sem conta, sem cloud. O dado de atenção é do usuário, não do fornecedor.",
    metrics: ["38 IPC HANDLERS", "CRASH RECOVERY", "SQLITE NATIVO"],
    stack: "Glaze · React 19 · TanStack · Tailwind 4",
  },
  {
    id: "wondher-v2", name: "WONDHER.IO v2", thesis: "Este site, tratado como produto.",
    body: "Canvas WebGL único orquestrado com o scroll, shaders GLSL autorais e budget de performance como requisito de release — não como otimização posterior.",
    metrics: ["LCP < 1.2s", "INP < 50ms", "CLS 0"],
    stack: "Next.js · R3F · GSAP · Lenis · Supabase",
  },
];
```

```ts
// lib/content/pipeline.ts
export type PipelineStep = { n: string; title: string; body: string; artifact: string };

export const PIPELINE_STEPS: PipelineStep[] = [
  { n: "01", title: "Diagnóstico", body: "48h para mapear topologia atual, gargalos e métricas-alvo.", artifact: "mapa de sistema + hipóteses" },
  { n: "02", title: "Arquitetura", body: "RFC com contrato de dados, budgets e critérios de aceite. Nada entra em build sem aceite explícito.", artifact: "RFC aprovada" },
  { n: "03", title: "Build", body: "Sprints curtos com preview deploy por commit. Você acompanha o sistema crescendo em URL, não em slide.", artifact: "previews auditáveis" },
  { n: "04", title: "Instrumentação", body: "Telemetria, testes e budgets de performance ligados antes do go-live — o sistema nasce observável.", artifact: "dashboards + suíte de testes" },
  { n: "05", title: "Go-live", body: "Checklist de corte, rollback ensaiado, DNS e cache sob controle. Deploy é procedimento, não evento.", artifact: "sistema em produção" },
  { n: "06", title: "Operação", body: "SLA de resposta, evolução guiada por métrica e código 100% transferível. Sem refém de fornecedor.", artifact: "capacidade instalada" },
];
```

- [ ] **Step 2: Teste falhando**

```tsx
// components/dom/cases-pipeline.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Cases } from "./Cases";
import { Pipeline } from "./Pipeline";

it("cases renderizam os 4 projetos com métricas", () => {
  render(<Cases />);
  expect(screen.getByText("FLOWCRAFT")).toBeInTheDocument();
  expect(screen.getByText("32 ENDPOINTS API")).toBeInTheDocument();
  expect(screen.getByText("Este site, tratado como produto.")).toBeInTheDocument();
});

it("pipeline renderiza 6 checkpoints com artefatos", () => {
  render(<Pipeline />);
  expect(screen.getByText("Diagnóstico")).toBeInTheDocument();
  expect(screen.getByText("→ RFC aprovada")).toBeInTheDocument();
  expect(screen.getByText("→ capacidade instalada")).toBeInTheDocument();
});
```

- [ ] **Step 3: Rodar e ver falhar**, depois **implementar**:

```tsx
// components/dom/Cases.tsx
import { CASES } from "@/lib/content/cases";

export function Cases() {
  return (
    <section id="cases" className="mx-auto max-w-[1320px] px-5 py-40 md:px-0">
      <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-signal">CASOS SELECIONADOS</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {CASES.map((c) => (
          <article
            key={c.id}
            className="case-card group rounded-2xl border border-hairline bg-surface/80 p-8 shadow-elevation backdrop-blur-[12px] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] hover:-translate-y-1.5"
          >
            <h3 className="font-mono text-sm tracking-[0.14em] text-ink">{c.name}</h3>
            <p className="mt-3 text-[length:var(--text-h3)] font-semibold leading-snug text-ink">{c.thesis}</p>
            <p className="mt-4 leading-relaxed text-ink-muted">{c.body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {c.metrics.map((m) => (
                <li key={m} className="rounded border border-hairline px-2.5 py-1 font-mono text-[13px] uppercase tracking-[0.08em] text-signal">{m}</li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[13px] text-ink-muted">{c.stack}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/dom/Pipeline.tsx
import { PIPELINE_STEPS } from "@/lib/content/pipeline";

export function Pipeline() {
  return (
    <section id="pipeline" className="mx-auto max-w-[1320px] px-5 py-40 md:px-0">
      <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-signal">PIPELINE SEQUENCIAL DE ENTREGA</p>
      <ol className="relative mt-14 grid gap-14 md:before:absolute md:before:left-1/2 md:before:top-0 md:before:h-full md:before:w-px md:before:bg-hairline">
        {PIPELINE_STEPS.map((s, i) => (
          <li key={s.n} className={`pipeline-node md:w-[calc(50%-48px)] ${i % 2 ? "md:ml-auto" : ""}`}>
            <p className="font-mono text-4xl font-medium text-pulse">{s.n}</p>
            <h3 className="mt-3 text-[length:var(--text-h3)] font-semibold text-ink">{s.title}</h3>
            <p className="mt-3 max-w-[48ch] leading-relaxed text-ink-muted">{s.body}</p>
            <p className="mt-4 font-mono text-[13px] uppercase tracking-[0.08em] text-signal">{`→ ${s.artifact}`}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

Nota: número em `--color-pulse` tem 36px (≥ 24px) — dentro da regra de contraste.

- [ ] **Step 4: Compor, testar, typecheck** — verde. **Commit** — `git commit -am "feat: cases e pipeline com conteúdo real"`

---

### Task 9: Stack + TerminalFooter (parser TDD, copy §5.7)

**Files:**
- Create: `lib/terminal/run-command.ts`, `components/dom/StackSection.tsx`, `components/dom/TerminalFooter.tsx`
- Modify: `app/page.tsx`
- Test: `lib/terminal/run-command.test.ts`, `components/dom/terminal-footer.test.tsx`

**Interfaces:**
- Produces:

```ts
export type TerminalLine =
  | { kind: "out"; text: string }
  | { kind: "err"; text: string }
  | { kind: "action"; action: "contact" };
export function runCommand(input: string): TerminalLine[];
```

O form de contato (modo `action:contact`) faz POST em `/api/inquiry` (Task 11); até lá usa `mailto:` direto.

- [ ] **Step 1: Teste do parser (falhando)**

```ts
// lib/terminal/run-command.test.ts
import { describe, expect, it } from "vitest";
import { runCommand } from "./run-command";

describe("runCommand", () => {
  it("help lista os comandos", () => {
    expect(runCommand("help")).toEqual([{ kind: "out", text: "stack · cases · latency · contact --now" }]);
  });
  it("latency devolve a linha do spec", () => {
    expect(runCommand("latency")).toEqual([
      { kind: "out", text: "você ↔ wondher: 1 pessoa, 0 intermediários. RTT médio de resposta: < 24h úteis." },
    ]);
  });
  it("contact --now dispara ação", () => {
    expect(runCommand("contact --now")).toContainEqual({ kind: "action", action: "contact" });
  });
  it("comando desconhecido vira err com dica", () => {
    expect(runCommand("rm -rf /")).toEqual([{ kind: "err", text: "comando não encontrado: rm. digite 'help'." }]);
  });
  it("easter egg sudo hire-me", () => {
    expect(runCommand("sudo hire-me")).toEqual([
      { kind: "out", text: "permissão concedida. envie o briefing: brianmendes@wondher.io" },
    ]);
  });
  it("input vazio não produz linhas", () => {
    expect(runCommand("  ")).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**, depois **implementar**:

```ts
// lib/terminal/run-command.ts
export type TerminalLine =
  | { kind: "out"; text: string }
  | { kind: "err"; text: string }
  | { kind: "action"; action: "contact" };

const STACK_LINES = [
  "web: next.js · typescript · r3f/three · gsap · lenis · glsl",
  "automação: bitrix24/bizproc · n8n · make · fastapi",
  "ia: gemini · openai · anthropic · byok · rag local",
  "runtime: electron/glaze · sqlite · postgres/supabase · vercel edge",
];

const CASE_LINES = [
  "flowcraft — compilador visual bitrix24 [32 endpoints · 47 testes]",
  "codex — cloud→local-first [21 ipc · 0 dependência de rede]",
  "pulse — command center local-first [38 ipc · crash recovery]",
  "wondher.io v2 — este site [lcp<1.2s · cls 0]",
];

export function runCommand(input: string): TerminalLine[] {
  const cmd = input.trim();
  if (!cmd) return [];
  const [head] = cmd.split(/\s+/);

  switch (cmd) {
    case "help":
      return [{ kind: "out", text: "stack · cases · latency · contact --now" }];
    case "stack":
      return STACK_LINES.map((text) => ({ kind: "out" as const, text }));
    case "cases":
      return CASE_LINES.map((text) => ({ kind: "out" as const, text }));
    case "latency":
      return [{ kind: "out", text: "você ↔ wondher: 1 pessoa, 0 intermediários. RTT médio de resposta: < 24h úteis." }];
    case "contact --now":
      return [
        { kind: "out", text: "iniciando handshake… informe nome, e-mail e o sistema que precisa existir." },
        { kind: "action", action: "contact" },
      ];
    case "sudo hire-me":
      return [{ kind: "out", text: "permissão concedida. envie o briefing: brianmendes@wondher.io" }];
    default:
      return [{ kind: "err", text: `comando não encontrado: ${head}. digite 'help'.` }];
  }
}
```

- [ ] **Step 3: StackSection**

```tsx
// components/dom/StackSection.tsx
const DOMAINS: Array<{ area: string; items: string; usedIn: string }> = [
  { area: "WEB / RENDER", items: "Next.js 16 · TypeScript · Tailwind v4 · Three/R3F · GSAP · Lenis · GLSL", usedIn: "em produção em: wondher.io v2" },
  { area: "AUTOMAÇÃO / CRM", items: "Bitrix24/Bizproc · n8n · Make · FastAPI · REST/Webhooks", usedIn: "em produção em: FlowCraft" },
  { area: "IA / ORQUESTRAÇÃO", items: "Gemini · OpenAI · Anthropic · BYOK · fallback determinístico", usedIn: "em produção em: FlowCraft · Pulse · Codex" },
  { area: "RUNTIME / DADOS", items: "Electron/Glaze · SQLite · Postgres/Supabase · Vercel Edge", usedIn: "em produção em: Pulse · Codex" },
];

export function StackSection() {
  return (
    <section id="stack" className="mx-auto max-w-[1320px] px-5 py-40 md:px-0">
      <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-signal">STACK & DOMÍNIO DE INFRAESTRUTURA</p>
      <dl className="mt-10 divide-y divide-[color:var(--color-hairline)] border-y border-hairline">
        {DOMAINS.map((d) => (
          <div key={d.area} className="group grid gap-2 py-6 md:grid-cols-[220px_1fr] md:gap-8">
            <dt className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink">{d.area}</dt>
            <dd>
              <p className="font-mono text-sm text-ink-muted">{d.items}</p>
              <p className="mt-1 font-mono text-[13px] text-signal opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-within:opacity-100">
                {d.usedIn}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: TerminalFooter** (form acessível, `aria-live`, links equivalentes):

```tsx
// components/dom/TerminalFooter.tsx
"use client";

import { useRef, useState } from "react";
import { runCommand, type TerminalLine } from "@/lib/terminal/run-command";

type HistoryEntry = { kind: "prompt" | "out" | "err"; text: string };
const BOOT: HistoryEntry = { kind: "out", text: "wondher@edge:~$ session iniciada — 4 comandos disponíveis. digite 'help'." };

export function TerminalFooter() {
  const [history, setHistory] = useState<HistoryEntry[]>([BOOT]);
  const [contactMode, setContactMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value ?? "";
    if (!value.trim()) return;
    const lines = runCommand(value);
    const printable: HistoryEntry[] = [{ kind: "prompt", text: `wondher@edge:~$ ${value}` }];
    for (const l of lines) {
      if (l.kind === "action") setContactMode(true);
      else printable.push(l as HistoryEntry);
    }
    setHistory((h) => [...h, ...printable]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <footer id="contact" className="border-t border-hairline bg-surface/60 px-5 py-24 md:px-24">
      <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-signal">TERMINAL — CANAL DIRETO</p>
      <div className="mt-8 max-w-[720px] rounded-2xl border border-hairline bg-void p-6 font-mono text-sm shadow-elevation">
        <div aria-live="polite" className="grid max-h-64 gap-1.5 overflow-y-auto">
          {history.map((h, i) => (
            <p key={i} className={h.kind === "err" ? "text-[#f87171]" : h.kind === "prompt" ? "text-ink" : "text-ink-muted"}>
              {h.text}
            </p>
          ))}
        </div>
        {contactMode ? (
          <ContactForm onDone={() => setContactMode(false)} />
        ) : (
          <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
            <label htmlFor="term-in" className="sr-only">Comando do terminal</label>
            <span aria-hidden className="text-signal">wondher@edge:~$</span>
            <input
              ref={inputRef} id="term-in" autoComplete="off" spellCheck={false}
              className="w-full bg-transparent text-ink caret-[color:var(--color-signal)] outline-none placeholder:text-ink-muted/50"
              placeholder="digite 'help'"
            />
          </form>
        )}
      </div>
      <nav aria-label="Contato" className="mt-10 flex flex-wrap gap-6 font-mono text-[13px] text-ink-muted">
        <a className="underline-offset-4 hover:text-signal hover:underline" href="mailto:brianmendes@wondher.io">brianmendes@wondher.io</a>
        <a className="underline-offset-4 hover:text-signal hover:underline" href="https://github.com/wondher">github.com/wondher</a>
      </nav>
      <p className="mt-8 font-mono text-[13px] text-ink-muted">
        Wondher Digital Studio LTDA · CNPJ 64.981.578/0001-59 · Curitiba – PR · brianmendes@wondher.io
      </p>
    </footer>
  );
}

function ContactForm({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "fail">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data),
      });
      setStatus(res.ok ? "ok" : "fail");
    } catch {
      setStatus("fail");
    }
  }

  if (status === "ok") return <p className="mt-4 text-signal">handshake concluído. resposta em &lt; 24h úteis.</p>;
  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      <label className="grid gap-1 text-ink-muted">nome
        <input name="name" required minLength={2} className="border-b border-hairline bg-transparent py-1 text-ink outline-none focus:border-signal" />
      </label>
      <label className="grid gap-1 text-ink-muted">e-mail
        <input name="email" type="email" required className="border-b border-hairline bg-transparent py-1 text-ink outline-none focus:border-signal" />
      </label>
      <label className="grid gap-1 text-ink-muted">o sistema que precisa existir
        <textarea name="message" required minLength={10} rows={3} className="border-b border-hairline bg-transparent py-1 text-ink outline-none focus:border-signal" />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" /> {/* honeypot */}
      <div className="flex gap-3">
        <button type="submit" disabled={status === "sending"} className="rounded-full bg-signal px-5 py-2 text-void disabled:opacity-50">
          {status === "sending" ? "enviando…" : "enviar briefing"}
        </button>
        <button type="button" onClick={onDone} className="rounded-full border border-hairline px-5 py-2 text-ink">cancelar</button>
      </div>
      {status === "fail" ? (
        <p className="text-[#f87171]">
          canal indisponível. use <a className="underline" href="mailto:brianmendes@wondher.io">brianmendes@wondher.io</a>
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 5: Teste do footer (RTL)**

```tsx
// components/dom/terminal-footer.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it } from "vitest";
import { TerminalFooter } from "./TerminalFooter";

it("executa help e mostra a saída", () => {
  render(<TerminalFooter />);
  const input = screen.getByLabelText("Comando do terminal");
  fireEvent.change(input, { target: { value: "help" } });
  fireEvent.submit(input.closest("form")!);
  expect(screen.getByText("stack · cases · latency · contact --now")).toBeInTheDocument();
});

it("contact --now abre o formulário", () => {
  render(<TerminalFooter />);
  const input = screen.getByLabelText("Comando do terminal");
  fireEvent.change(input, { target: { value: "contact --now" } });
  fireEvent.submit(input.closest("form")!);
  expect(screen.getByText("enviar briefing")).toBeInTheDocument();
});
```

- [ ] **Step 6: Compor página completa** — `app/page.tsx` final desta fase:

```tsx
// app/page.tsx
import { Navbar } from "@/components/dom/Navbar";
import { Hero } from "@/components/dom/Hero";
import { About } from "@/components/dom/About";
import { Capabilities } from "@/components/dom/Capabilities";
import { Cases } from "@/components/dom/Cases";
import { Pipeline } from "@/components/dom/Pipeline";
import { StackSection } from "@/components/dom/StackSection";
import { TerminalFooter } from "@/components/dom/TerminalFooter";

export default function Page() {
  return (
    <>
      <Navbar telemetry={null} />
      <main className="relative z-[var(--z-content)]">
        <Hero />
        <About />
        <Capabilities />
        <Cases />
        <Pipeline />
        <StackSection />
      </main>
      <TerminalFooter />
    </>
  );
}
```

- [ ] **Step 7: `npx vitest run && npx tsc --noEmit && npm run build`** → verde. **Commit** — `git commit -am "feat: stack e terminal footer com parser de comandos"`

---

### Task 10: `/api/telemetry` com fallback + navbar consome — TDD

**Files:**
- Create: `lib/telemetry/get-telemetry.ts`, `lib/telemetry/static-snapshot.json`, `app/api/telemetry/route.ts`
- Modify: `app/page.tsx` (buscar telemetria no server e passar à navbar)
- Test: `lib/telemetry/get-telemetry.test.ts`

**Interfaces:**
- Consumes: `TelemetrySnapshot` (Task 5).
- Produces: `getTelemetry(): Promise<TelemetrySnapshot>` — Supabase REST quando `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` existem; senão fallback estático. Nunca lança.

- [ ] **Step 1: Fallback estático**

```json
// lib/telemetry/static-snapshot.json
{ "uptimePct": 99.98, "deploys30d": 14, "activePipelines": 3, "lastCommitSha": null, "updatedAt": "2026-08-14T00:00:00Z" }
```

- [ ] **Step 2: Teste falhando**

```ts
// lib/telemetry/get-telemetry.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { getTelemetry } from "./get-telemetry";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("getTelemetry", () => {
  it("sem env Supabase retorna o snapshot estático", async () => {
    vi.stubEnv("SUPABASE_URL", ""); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const t = await getTelemetry();
    expect(t.uptimePct).toBe(99.98);
    expect(t.deploys30d).toBe(14);
  });
  it("com env, mapeia a linha do Supabase", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ uptime_pct: 99.5, deploys_30d: 7, active_pipelines: 2, last_commit_sha: "abc1234", updated_at: "2026-08-14T10:00:00Z" }],
    }));
    const t = await getTelemetry();
    expect(t).toEqual({ uptimePct: 99.5, deploys30d: 7, activePipelines: 2, lastCommitSha: "abc1234", updatedAt: "2026-08-14T10:00:00Z" });
  });
  it("com env mas fetch falhando, cai no fallback (nunca lança)", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const t = await getTelemetry();
    expect(t.uptimePct).toBe(99.98);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**, depois **implementar**:

```ts
// lib/telemetry/get-telemetry.ts
import "server-only";
import type { TelemetrySnapshot } from "./types";
import fallback from "./static-snapshot.json";

type Row = { uptime_pct: number; deploys_30d: number; active_pipelines: number; last_commit_sha: string | null; updated_at: string };

export async function getTelemetry(): Promise<TelemetrySnapshot> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return fallback as TelemetrySnapshot;

  try {
    const res = await fetch(`${url}/rest/v1/studio_telemetry?id=eq.1&select=*`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback as TelemetrySnapshot;
    const [row] = (await res.json()) as Row[];
    if (!row) return fallback as TelemetrySnapshot;
    return {
      uptimePct: row.uptime_pct,
      deploys30d: row.deploys_30d,
      activePipelines: row.active_pipelines,
      lastCommitSha: row.last_commit_sha,
      updatedAt: row.updated_at,
    };
  } catch {
    return fallback as TelemetrySnapshot;
  }
}
```

Nota: `server-only` impede import acidental no client (o pacote já vem com o Next; se o build reclamar, `npm i server-only`).

- [ ] **Step 4: Route handler + página**

```ts
// app/api/telemetry/route.ts
import { NextResponse } from "next/server";
import { getTelemetry } from "@/lib/telemetry/get-telemetry";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json(await getTelemetry());
}
```

Em `app/page.tsx`: `export default async function Page()` e `const telemetry = await getTelemetry();` → `<Navbar telemetry={telemetry} />`.

- [ ] **Step 5: Testes + typecheck + build** → verde. **Commit** — `git commit -am "feat: telemetria com fallback estático e navbar viva"`

---

### Task 11: `/api/inquiry` (zod + honeypot + rate limit) + migration — TDD

**Files:**
- Create: `app/api/inquiry/route.ts`, `lib/inquiry/schema.ts`, `supabase/migrations/0001_telemetry.sql`
- Test: `lib/inquiry/inquiry.test.ts`

**Interfaces:**
- Consumes: form da Task 9 (`{ name, email, message, website? }`).
- Produces: `POST /api/inquiry` → `202 {queued:true}` | `400` inválido | `200 {queued:false}` honeypot (drop silencioso) | `503 {fallback:"mailto"}` sem Supabase | `429` rate limit. `inquirySchema` (zod).

- [ ] **Step 1: Migration** — copiar LITERALMENTE o Apêndice A do spec para `supabase/migrations/0001_telemetry.sql`. (Aplicação requer secrets — ver Task 16 checklist.)

- [ ] **Step 2: Teste falhando**

```ts
// lib/inquiry/inquiry.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST, __resetRateLimit } from "@/app/api/inquiry/route";

function req(body: unknown, ip = "1.2.3.4") {
  return new Request("http://test/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}
const valid = { name: "Ana", email: "ana@empresa.com", message: "Preciso de um sistema de automação Bitrix24." };

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); __resetRateLimit(); });

describe("POST /api/inquiry", () => {
  it("400 para e-mail inválido", async () => {
    const res = await POST(req({ ...valid, email: "nope" }));
    expect(res.status).toBe(400);
  });
  it("honeypot preenchido → 200 silencioso sem persistir", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await POST(req({ ...valid, website: "spam.io" }));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it("sem env Supabase → 503 com fallback mailto", async () => {
    vi.stubEnv("SUPABASE_URL", ""); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const res = await POST(req(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ fallback: "mailto" });
  });
  it("com env → 202 e insere via REST", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    const res = await POST(req(valid));
    expect(res.status).toBe(202);
  });
  it("6º envio do mesmo IP na janela → 429", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    for (let i = 0; i < 5; i++) expect((await POST(req(valid, "9.9.9.9"))).status).toBe(202);
    expect((await POST(req(valid, "9.9.9.9"))).status).toBe(429);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**, depois **implementar**:

```ts
// lib/inquiry/schema.ts
import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().max(160).optional(),
  message: z.string().min(10).max(4000),
  website: z.string().optional(), // honeypot — humano não vê o campo
});
export type Inquiry = z.infer<typeof inquirySchema>;
```

```ts
// app/api/inquiry/route.ts
import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/inquiry/schema";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best-effort em memória (por instância serverless). Suficiente como 1ª barreira; RLS + honeypot completam.
const hits = new Map<string, number[]>();

export function __resetRateLimit(): void {
  hits.clear();
}

export async function POST(req: Request): Promise<NextResponse> {
  const parsed = inquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }
  const { website, ...inquiry } = parsed.data;
  if (website) return NextResponse.json({ queued: false }, { status: 200 }); // bot: drop silencioso

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return NextResponse.json({ error: "limite de envios atingido" }, { status: 429 });
  }
  hits.set(ip, [...recent, now]);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ queued: false, fallback: "mailto" }, { status: 503 });
  }

  const res = await fetch(`${url}/rest/v1/contact_inquiries`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify({ ...inquiry, source: "terminal-footer" }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ queued: false, fallback: "mailto" }, { status: 503 });
  }
  return NextResponse.json({ queued: true }, { status: 202 });
}
```

- [ ] **Step 4: Testes + typecheck + build** → verde. **Commit** — `git commit -am "feat: api de contato com honeypot, rate limit e migration supabase"`

---

### Task 12: SceneRoot + CanvasLoader (canvas único, gates)

**Files:**
- Create: `components/canvas/SceneRoot.tsx`, `components/canvas/CanvasLoader.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `usePrefersReducedMotion` (Task 3).
- Produces: `<CanvasLoader />` (client, dynamic import ssr:false); slots `{children}` do `SceneRoot` recebem HeroMonolith/ConductorLine/etc. nas Tasks 14–15.

- [ ] **Step 1: Implementar** (spec §3.1 + pausa em `visibilitychange`):

```tsx
// components/canvas/SceneRoot.tsx
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
```

```tsx
// components/canvas/CanvasLoader.tsx
"use client";

import dynamic from "next/dynamic";

// Boundary client para permitir ssr:false (chunk 3D fora do JS inicial)
const Scene = dynamic(() => import("./SceneStage").then((m) => m.SceneStage), { ssr: false });

export function CanvasLoader() {
  return <Scene />;
}
```

```tsx
// components/canvas/SceneStage.tsx  (criado agora; Tasks 14–15 adicionam filhos)
"use client";

import { SceneRoot } from "./SceneRoot";

export function SceneStage() {
  return <SceneRoot />;
}
```

- [ ] **Step 2: Ligar no layout** — `app/layout.tsx`, dentro do body, antes do orquestrador: `<CanvasLoader />`.
- [ ] **Step 3: Verificar** — `npm run build`; conferir no output que o chunk de `three` NÃO está no First Load JS da rota `/`. `npx tsc --noEmit` verde.
- [ ] **Step 4: Commit** — `git commit -am "feat: canvas único lazy com gates de dpr, visibilidade e reduced motion"`

---

### Task 13: Shaders + ConductorLine

**Files:**
- Create: `lib/shaders/conductor.ts`, `components/canvas/ConductorLine.tsx`
- Modify: `components/canvas/SceneStage.tsx`

**Interfaces:**
- Consumes: `scrollState.lerped`.
- Produces: `<ConductorLine />` montada no `SceneStage`.

- [ ] **Step 1: Shaders (GLSL do spec §3.3, literal, como strings)**

```ts
// lib/shaders/conductor.ts
export const conductorVertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  float energized = step(uv.y, uProgress);
  pos += normal * sin(uv.y * 24.0 - uTime * 2.0) * 0.02 * energized;
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
  float core = smoothstep(0.5, 0.06, abs(vUv.x - 0.5));
  float filled = 1.0 - smoothstep(uProgress - 0.06, uProgress, vUv.y);
  float pulse = 0.5 + 0.5 * sin(vUv.y * 40.0 - uTime * 3.0);
  vec3 base = mix(uColorB, uColorA, vUv.y);
  vec3 color = base * (0.22 + 0.78 * filled) + base * pulse * 0.15 * filled;
  float head = smoothstep(0.045, 0.0, abs(vUv.y - uProgress));
  color += uColorA * head * 1.4;
  float alpha = core * (0.10 + 0.90 * max(filled, head * 0.9));
  gl_FragColor = vec4(color, alpha);
}
`;
```

- [ ] **Step 2: Componente** (spec §3.3, literal):

```tsx
// components/canvas/ConductorLine.tsx
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
```

- [ ] **Step 3: Montar no `SceneStage`** (`<SceneRoot><ConductorLine /></SceneRoot>`), `npm run dev`, rolar a página e verificar visualmente o preenchimento do duto acompanhando o scroll (suave, sem saltos).
- [ ] **Step 4: `npx tsc --noEmit && npm run build`** → verde. **Commit** — `git commit -am "feat: linha condutora procedural reativa ao scroll"`

---

### Task 14: HeroMonolith

**Files:**
- Create: `components/canvas/HeroMonolith.tsx`
- Modify: `components/canvas/SceneStage.tsx`

**Interfaces:**
- Consumes: `scrollState.progress/pointer`.
- Produces: `<HeroMonolith />` no `SceneStage`.

- [ ] **Step 1: Implementar** — usar LITERALMENTE o código do spec §3.2 (`HERO_RANGE = 0.18`, grupo em `[3.8, 0, -2]`, `boxGeometry [1.4, 2.9, 0.55]` com `meshPhysicalMaterial` transmission, core icosaédrico, 24 shards em `instancedMesh` com cast `as THREE.MeshStandardMaterial`).
- [ ] **Step 2: Fallback mobile/low-tier** — envolver material em prop derivada de `matchMedia("(max-width: 767px)")` no mount: quando mobile, renderizar `meshPhysicalMaterial` com `transparent opacity={0.28} roughness={0.05} envMapIntensity={1.6}` e sem `transmission`:

```tsx
const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
// no JSX:
{isMobile ? (
  <meshPhysicalMaterial transparent opacity={0.28} roughness={0.05} envMapIntensity={1.6} />
) : (
  <meshPhysicalMaterial transmission={1} thickness={1.6} roughness={0.12} ior={1.45}
    attenuationColor="#0f1115" attenuationDistance={2.5} iridescence={0.35}
    iridescenceIOR={1.3} clearcoat={0.6} envMapIntensity={1.2} />
)}
```

- [ ] **Step 3: Montar no `SceneStage`; verificação visual** em `npm run dev` @1512px: monólito sangra a borda direita, tilt segue o cursor, fragmenta ao rolar (concluído até `progress 0.18`).
- [ ] **Step 4: `npx tsc --noEmit && npm run build`** → verde. **Commit** — `git commit -am "feat: monólito hero com transmissão e fragmentação instanciada"`

---

### Task 15: CapabilityMatrix (morph 4 formações) + CaseViewports (parallax)

**Files:**
- Create: `components/canvas/CapabilityMatrix.tsx`, `components/canvas/CaseViewports.tsx`
- Modify: `components/canvas/SceneStage.tsx`

**Interfaces:**
- Consumes: `scrollState.cluster` (0..3, Task 7) e `scrollState.lerped`.
- Produces: ambos montados no `SceneStage`.

- [ ] **Step 1: CapabilityMatrix** — 64 cubos instanciados interpolando 4 formações (grade wireframe → dutos → grafo neural → die de silício), centro em `[-3.5, 0, -1.5]`:

```tsx
// components/canvas/CapabilityMatrix.tsx
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
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const forms = useMemo(formations, []);

  useFrame((state) => {
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
    <group position={[-3.5, 0, -1.5]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.09, 0.09, 0.09]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.85} roughness={0.3} emissive="#6366f1" emissiveIntensity={0.15} />
      </instancedMesh>
    </group>
  );
}
```

- [ ] **Step 2: CaseViewports** — 3 planos de parallax em `[0, -1.2, -3]` deslocando X por `lerped` na janela da seção Cases (progress global ≈ 0.55–0.75):

```tsx
// components/canvas/CaseViewports.tsx
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
```

- [ ] **Step 3: Montar ambos no `SceneStage`; verificação visual** do morph durante o pin de Capabilities (alternância dos 4 clusters) e do parallax na seção Cases.
- [ ] **Step 4: `npx tsc --noEmit && npm run build`** → verde. **Commit** — `git commit -am "feat: matriz de capacidades com morph e viewports de parallax"`

---

### Task 16: E2E (Playwright + axe + reduced-motion) + SEO + budgets + README

**Files:**
- Create: `playwright.config.ts`, `e2e/site.spec.ts`, `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: site completo das tasks anteriores.

- [ ] **Step 1: Config Playwright**

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: true, timeout: 60_000 },
});
```

- [ ] **Step 2: Testes e2e**

```ts
// e2e/site.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("página renderiza as 8 seções e o H1 do spec", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quem projeta a arquitetura escreve o código.");
  for (const id of ["hero", "about", "capabilities", "cases", "pipeline", "stack", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
});

test("terminal responde help e latency", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("Comando do terminal");
  await input.fill("help");
  await input.press("Enter");
  await expect(page.getByText("stack · cases · latency · contact --now")).toBeVisible();
  await input.fill("latency");
  await input.press("Enter");
  await expect(page.getByText(/1 pessoa, 0 intermediários/)).toBeVisible();
});

test("reduced-motion: sem canvas, classe aplicada, conteúdo íntegro", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html.reduced-motion")).toBeAttached();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByText("FLOWCRAFT")).toBeAttached();
});

test("a11y: sem violações serious/critical (axe)", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad).toEqual([]);
});
```

- [ ] **Step 3: SEO**

```ts
// app/robots.ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://wondher.io/sitemap.xml" };
}
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://wondher.io", lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
```

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#08090A", color: "#e7e9ec", fontSize: 64, fontWeight: 600 }}>
        <div style={{ color: "#00f5a0", fontSize: 24, letterSpacing: 4 }}>WONDHER — ENGENHARIA CRIATIVA &amp; SISTEMAS</div>
        <div style={{ marginTop: 24, lineHeight: 1.05 }}>Quem projeta a arquitetura escreve o código.</div>
        <div style={{ marginTop: 32, height: 4, width: 320, background: "linear-gradient(90deg,#6366f1,#00f5a0)" }} />
      </div>
    ),
    size
  );
}
```

- [ ] **Step 4: Rodar tudo**

```bash
npx playwright install chromium
npm run build && npx vitest run && npm run e2e
```
Esperado: build verde; unit e e2e todos passando.

- [ ] **Step 5: Budgets**

```bash
npm run build   # anotar First Load JS da rota "/" — DEVE ser < 220KB gz (chunk 3D é lazy)
npm run start &
npx lighthouse http://localhost:3000 --preset=desktop --only-categories=performance \
  --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=lh.json
node -e "const r=require('./lh.json');const a=r.audits;console.log('perf',r.categories.performance.score,'LCP',a['largest-contentful-paint'].numericValue,'CLS',a['cumulative-layout-shift'].numericValue);process.exit(r.categories.performance.score>=0.9&&a['cumulative-layout-shift'].numericValue===0?0:1)"
```
Esperado: exit 0. Se falhar: conferir se o chunk 3D entrou no bundle inicial (import estático acidental) e se alguma imagem/fonte está sem dimensão reservada.

- [ ] **Step 6: README** — substituir por: título "Wondher.io v2", 3 linhas de descrição (site do estúdio, spec e plano em `docs/superpowers/`), comandos `npm run dev/build/test/e2e`, nota de env (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` opcionais — fallback estático sem eles) e instrução de aplicar `supabase/migrations/0001_telemetry.sql` via SQL editor/CLI quando os secrets existirem.

- [ ] **Step 7: Commit final** — `git add -A && git commit -m "test: e2e, a11y, seo e gates de budget"`

---

## Checklist de encerramento (Apêndice B do spec)

- [ ] Lighthouse desktop ≥ 0.9 · CLS = 0 · LCP dentro do budget (comando da Task 16)
- [ ] `prefers-reduced-motion` 100% funcional (e2e passa)
- [ ] Navegação completa por teclado; foco visível em todos os interativos
- [ ] `--color-pulse` nunca em texto < 24px (grep manual: `rg "text-pulse" components/ | grep -v "text-4xl"` deve voltar vazio)
- [ ] Sem `markers: true` e sem `console.` em `components/ lib/ app/`
- [ ] Migration Supabase aplicada QUANDO secrets existirem (fora deste plano se ausentes)
- [ ] PR atualizado e marcado ready for review

## Self-review do plano (executado)

1. **Cobertura do spec:** §1 (copy/voz) → Tasks 5–9; §2 (tokens/grid) → Task 1; §3.1 → Task 12; §3.2 → Task 14; §3.3 → Task 13; §3.4 (perf) → Tasks 12/16; §4 (8 seções + coreografia) → Tasks 5–9, 7 (pin), 15 (matriz/viewports); §5 (copy literal) → Tasks 5–9 com testes de fidelidade; §6 (árvore/orquestrador) → Tasks 1/4; §7 (direção) → aplicada transversalmente; Apêndice A → Tasks 10/11; Apêndice B → Task 16. Reveals de entrada do Hero (§4.2, clip-path stagger) e glow por nó do Pipeline ficam como polimento pós-e2e — registrados no checklist do PR, não bloqueiam release.
2. **Placeholders:** nenhum TBD/TODO; todos os passos têm código ou comando concreto; único "usar literalmente o spec §X" aponta para blocos completos existentes no spec commitado.
3. **Consistência de tipos:** `TelemetrySnapshot` (Task 5) = retorno de `getTelemetry` (Task 10); `TerminalLine`/`runCommand` (Task 9) idênticos no teste e implementação; `scrollState.cluster` escrito na Task 7 e lido na Task 15; `SceneStage` criado na Task 12 e estendido nas 13–15.
