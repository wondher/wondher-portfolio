import { Navbar } from "@/components/dom/Navbar";

export default function Page() {
  return (
    <>
      <Navbar telemetry={null} />
      <main id="conteudo" className="relative z-[var(--z-content)]" />
    </>
  );
}
