import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ScrollOrchestrator } from "@/components/providers/ScrollOrchestrator";
import { CanvasLoader } from "@/components/canvas/CanvasLoader";
import "@/styles/tokens.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wondher.io"),
  title: "Wondher — Engenharia Criativa & Sistemas",
  description:
    "Sites de alta performance, automação de CRM e agentes de IA — entregues por quem responde pela métrica. Zero camadas de intermediação entre a sua decisão e o deploy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-void text-ink font-display antialiased">
        <CanvasLoader />
        <ScrollOrchestrator>{children}</ScrollOrchestrator>
      </body>
    </html>
  );
}
