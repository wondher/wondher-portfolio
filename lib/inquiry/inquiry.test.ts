import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/inquiry/route";
import { __resetRateLimit } from "@/lib/inquiry/rate-limit";

function req(body: unknown, ip = "1.2.3.4") {
  return new Request("http://test/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}
const valid = { name: "Ana", email: "ana@empresa.com", message: "Preciso de um sistema de automação Bitrix24." };

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); __resetRateLimit(); });

describe("POST /api/inquiry", () => {
  it("400 para e-mail inválido", async () => {
    const res = await POST(req({ ...valid, email: "nope" }));
    expect(res.status).toBe(400);
  });
  it("honeypot preenchido → 200 silencioso sem persistir", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await POST(req({ ...valid, website: "spam.io" }));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it("sem env Supabase → 503 com fallback mailto", async () => {
    vi.stubEnv("SUPABASE_URL", ""); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const res = await POST(req(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ fallback: "mailto" });
  });
  it("com env → 202 e insere via REST", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    const res = await POST(req(valid));
    expect(res.status).toBe(202);
  });
  it("6º envio do mesmo IP na janela → 429", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    for (let i = 0; i < 5; i++) expect((await POST(req(valid, "9.9.9.9"))).status).toBe(202);
    expect((await POST(req(valid, "9.9.9.9"))).status).toBe(429);
  });
});
