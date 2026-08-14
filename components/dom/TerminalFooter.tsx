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
      else printable.push(l);
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
          <ContactForm
            onDone={() => setContactMode(false)}
            onSuccess={() => {
              setHistory((h) => [...h, { kind: "out", text: "handshake concluído. resposta em < 24h úteis." }]);
              setContactMode(false);
            }}
          />
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

function ContactForm({ onDone, onSuccess }: { onDone: () => void; onSuccess: () => void }) {
  const [status, setStatus] = useState<"idle" | "sending" | "fail">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data),
      });
      if (res.ok) onSuccess();
      else setStatus("fail");
    } catch {
      setStatus("fail");
    }
  }

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
