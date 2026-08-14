# Wondher.io v2

Site institucional do estúdio Wondher — Next.js 16 (App Router, RSC), TypeScript, Tailwind v4, WebGL (Three.js/R3F) e orquestração de scroll (Lenis + GSAP/ScrollTrigger).
A especificação de direção criativa e o plano de implementação por tasks vivem em `docs/superpowers/` (`specs/` e `plans/`), incluindo copy literal, tokens de design, coreografia de scroll e os critérios de aceite (Apêndice B) que este repositório precisa satisfazer.
Telemetria (chips da navbar) e o formulário de contato do terminal têm fallback estático determinístico quando o Supabase não está configurado — o site funciona 100% sem nenhuma variável de ambiente.

## Comandos

```bash
npm install

npm run dev       # servidor de desenvolvimento (Next.js, porta 3000)
npm run build     # build de produção (Turbopack)
npm run start     # serve o build de produção
npm run test      # testes unitários (Vitest + Testing Library)
npm run e2e       # testes e2e (Playwright): 8 seções, terminal, reduced-motion, a11y (axe)
npm run typecheck # tsc --noEmit
```

Evidência visual adicional (não faz parte do gate de CI, gera PNGs em `.superpowers/sdd/screens/`, diretório gitignorado):

```bash
npx playwright install chromium   # primeira execução, se ainda não instalado
npm run build && npm run start &  # servidor precisa estar de pé
npx playwright test e2e/screens.spec.ts
```

## Variáveis de ambiente (opcionais)

| Variável | Uso |
|---|---|
| `SUPABASE_URL` | Endpoint do projeto Supabase para telemetria e inbox de contato |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de service role, usada apenas no servidor (nunca exposta ao client) |

Sem essas variáveis, `getTelemetry()` retorna dados estáticos e o endpoint `/api/inquiry` responde com sucesso sem persistir (fallback determinístico) — nada quebra em ambiente local ou de preview sem Supabase configurado.

Quando os secrets existirem (produção ou um ambiente com Supabase real), aplique a migration antes do primeiro deploy que dependa de telemetria/contato persistidos:

```bash
# via Supabase CLI
supabase db push

# ou cole o conteúdo de supabase/migrations/0001_telemetry.sql
# no SQL editor do projeto (dashboard.supabase.com → SQL Editor)
```

## Qualidade e budgets

- **Testes:** Vitest (unitário/componentes) + Playwright (e2e) + `@axe-core/playwright` (acessibilidade, zero violações serious/critical).
- **`prefers-reduced-motion`:** cobertura e2e dedicada — sem canvas montado, classe `reduced-motion` aplicada ao `<html>`, conteúdo textual íntegro.
- **Performance:** First Load JS da rota `/` ≈ 186 KB gzip (chunk 3D/three.js é lazy-loaded via `dynamic(..., { ssr: false })`, ~230 KB gzip à parte, carregado só quando o canvas monta).
- **SEO:** `app/robots.ts`, `app/sitemap.ts` e `app/opengraph-image.tsx` (Open Graph 1200×630 gerado via `next/og`).

Detalhes de execução, números medidos nesta VM e ressalvas (Lighthouse em Chromium headless com SwiftShader) estão em `.superpowers/sdd/task-16-report.md`.
