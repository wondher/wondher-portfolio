const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best-effort em memória (por instância serverless). Suficiente como 1ª barreira; RLS + honeypot completam.
const hits = new Map<string, number[]>();

export function __resetRateLimit(): void {
  hits.clear();
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return false;
  }
  hits.set(ip, [...recent, now]);
  return true;
}
