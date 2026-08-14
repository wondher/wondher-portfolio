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
