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
