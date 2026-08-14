import { NextResponse } from "next/server";
import { getTelemetry } from "@/lib/telemetry/get-telemetry";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json(await getTelemetry());
}
