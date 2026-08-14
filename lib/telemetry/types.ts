// lib/telemetry/types.ts
export type TelemetrySnapshot = {
  uptimePct: number;
  deploys30d: number;
  activePipelines: number;
  lastCommitSha: string | null;
  updatedAt: string;
};
