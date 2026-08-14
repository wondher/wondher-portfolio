export type Cluster = { id: string; label: string; title: string; body: string; stack: string; proof: string };

export const CAPABILITY_CLUSTERS: Cluster[] = [
  {
    id: "web",
    label: "C1 · EXPERIÊNCIAS WEB & WEBGL",
    title: "Interfaces com orçamento de frame.",
    body: "Next.js App Router, React Three Fiber e shaders GLSL sob budget explícito: LCP abaixo de 1.2s, INP abaixo de 50ms, canvas único compartilhado. Design que se move porque o sistema aguenta — não apesar dele.",
    stack: "Next.js · TypeScript · R3F/Three · GSAP · Lenis · GLSL",
    proof: "ESTE SITE: 1 CANVAS · DPR ADAPTATIVO · CLS 0",
  },
  {
    id: "crm",
    label: "C2 · AUTOMAÇÃO & PIPELINES DE CRM",
    title: "Processo como infraestrutura.",
    body: "Bitrix24, n8n e Make tratados como runtime: workflows idempotentes, simuláveis offline e auditáveis antes do go-live. Parser binário próprio para Bizproc — inspeção e export de .bpt sem caixa-preta.",
    stack: "Bitrix24/Bizproc · n8n · Make · FastAPI · REST/Webhooks",
    proof: "FLOWCRAFT: PARSER .BPT · 32 ENDPOINTS · SIMULADOR MULTI-CENÁRIO",
  },
  {
    id: "ai",
    label: "C3 · AGENTES DE IA & ORQUESTRAÇÃO",
    title: "Modelos com contrato.",
    body: "Agentes que operam sob contrato de dados: provedores intercambiáveis (Gemini, OpenAI, Anthropic), fallback determinístico quando a API falha e custo sob telemetria. IA que entra no pipeline — não no lugar dele.",
    stack: "Gemini · OpenAI · Anthropic · BYOK · RAG local",
    proof: "3 PROVEDORES · DEGRADAÇÃO DETERMINÍSTICA · 0 LOCK-IN",
  },
  {
    id: "infra",
    label: "C4 · RUNTIME & INFRAESTRUTURA",
    title: "Local-first. Cloud quando fizer sentido.",
    body: "Desktop com SQLite nativo, edge com Postgres/Supabase, deploy com rollback ensaiado. Dados do cliente ficam onde o cliente manda — arquitetura decide onde o estado mora, não a moda.",
    stack: "Electron/Glaze · SQLite · Postgres/Supabase · Vercel Edge",
    proof: "CODEX: CLOUD→LOCAL-FIRST · 9,4MB OFFLINE · 21 IPC HANDLERS",
  },
];
