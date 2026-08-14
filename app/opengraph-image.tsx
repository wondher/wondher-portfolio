import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#08090A", color: "#e7e9ec", fontSize: 64, fontWeight: 600 }}>
        <div style={{ color: "#00f5a0", fontSize: 24, letterSpacing: 4 }}>WONDHER — ENGENHARIA CRIATIVA &amp; SISTEMAS</div>
        <div style={{ marginTop: 24, lineHeight: 1.05 }}>Quem projeta a arquitetura escreve o código.</div>
        <div style={{ marginTop: 32, height: 4, width: 320, background: "linear-gradient(90deg,#6366f1,#00f5a0)" }} />
      </div>
    ),
    size
  );
}
