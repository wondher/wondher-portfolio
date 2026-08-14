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
