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
