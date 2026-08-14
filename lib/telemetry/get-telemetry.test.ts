import { afterEach, describe, expect, it, vi } from "vitest";
import { getTelemetry } from "./get-telemetry";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("getTelemetry", () => {
  it("sem env Supabase retorna o snapshot estático", async () => {
    vi.stubEnv("SUPABASE_URL", ""); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const t = await getTelemetry();
    expect(t.uptimePct).toBe(99.98);
    expect(t.deploys30d).toBe(14);
  });
  it("com env, mapeia a linha do Supabase", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ uptime_pct: 99.5, deploys_30d: 7, active_pipelines: 2, last_commit_sha: "abc1234", updated_at: "2026-08-14T10:00:00Z" }],
    }));
    const t = await getTelemetry();
    expect(t).toEqual({ uptimePct: 99.5, deploys30d: 7, activePipelines: 2, lastCommitSha: "abc1234", updatedAt: "2026-08-14T10:00:00Z" });
  });
  it("com env mas fetch falhando, cai no fallback (nunca lança)", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const t = await getTelemetry();
    expect(t.uptimePct).toBe(99.98);
  });
});
