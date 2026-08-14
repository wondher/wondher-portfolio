import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/inquiry/rate-limit";
import { inquirySchema } from "@/lib/inquiry/schema";

export async function POST(req: Request): Promise<NextResponse> {
  const parsed = inquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }
  const { website, ...inquiry } = parsed.data;
  if (website) return NextResponse.json({ queued: false }, { status: 200 }); // bot: drop silencioso

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "limite de envios atingido" }, { status: 429 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ queued: false, fallback: "mailto" }, { status: 503 });
  }

  const res = await fetch(`${url}/rest/v1/contact_inquiries`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify({ ...inquiry, source: "terminal-footer" }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ queued: false, fallback: "mailto" }, { status: 503 });
  }
  return NextResponse.json({ queued: true }, { status: 202 });
}
