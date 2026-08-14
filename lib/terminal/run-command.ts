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
