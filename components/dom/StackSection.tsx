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
