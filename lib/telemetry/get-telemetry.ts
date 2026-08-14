import "server-only";
import type { TelemetrySnapshot } from "./types";
import fallback from "./static-snapshot.json";

type Row = { uptime_pct: number; deploys_30d: number; active_pipelines: number; last_commit_sha: string | null; updated_at: string };

export async function getTelemetry(): Promise<TelemetrySnapshot> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return fallback as TelemetrySnapshot;

  try {
    const res = await fetch(`${url}/rest/v1/studio_telemetry?id=eq.1&select=*`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback as TelemetrySnapshot;
    const [row] = (await res.json()) as Row[];
    if (!row) return fallback as TelemetrySnapshot;
    return {
      uptimePct: row.uptime_pct,
      deploys30d: row.deploys_30d,
      activePipelines: row.active_pipelines,
      lastCommitSha: row.last_commit_sha,
      updatedAt: row.updated_at,
    };
  } catch {
    return fallback as TelemetrySnapshot;
  }
}
