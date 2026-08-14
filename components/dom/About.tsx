const FACTS = ["0 gerentes de conta", "1 responsável técnico", "100% do código auditável"];

export function About() {
  return (
    <section id="about" className="mx-auto grid max-w-[1320px] gap-12 px-5 py-40 md:grid-cols-2 md:px-24">
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
