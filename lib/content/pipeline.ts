export type PipelineStep = { n: string; title: string; body: string; artifact: string };

export const PIPELINE_STEPS: PipelineStep[] = [
  { n: "01", title: "Diagnóstico", body: "48h para mapear topologia atual, gargalos e métricas-alvo.", artifact: "mapa de sistema + hipóteses" },
  { n: "02", title: "Arquitetura", body: "RFC com contrato de dados, budgets e critérios de aceite. Nada entra em build sem aceite explícito.", artifact: "RFC aprovada" },
  { n: "03", title: "Build", body: "Sprints curtos com preview deploy por commit. Você acompanha o sistema crescendo em URL, não em slide.", artifact: "previews auditáveis" },
  { n: "04", title: "Instrumentação", body: "Telemetria, testes e budgets de performance ligados antes do go-live — o sistema nasce observável.", artifact: "dashboards + suíte de testes" },
  { n: "05", title: "Go-live", body: "Checklist de corte, rollback ensaiado, DNS e cache sob controle. Deploy é procedimento, não evento.", artifact: "sistema em produção" },
  { n: "06", title: "Operação", body: "SLA de resposta, evolução guiada por métrica e código 100% transferível. Sem refém de fornecedor.", artifact: "capacidade instalada" },
];
