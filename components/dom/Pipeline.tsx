import { PIPELINE_STEPS } from "@/lib/content/pipeline";

export function Pipeline() {
  return (
    <section id="pipeline" className="mx-auto max-w-[1320px] px-5 py-40 md:px-24">
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
