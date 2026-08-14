import { About } from "@/components/dom/About";
import { Capabilities } from "@/components/dom/Capabilities";
import { Cases } from "@/components/dom/Cases";
import { Hero } from "@/components/dom/Hero";
import { Navbar } from "@/components/dom/Navbar";
import { Pipeline } from "@/components/dom/Pipeline";

export default function Page() {
  return (
    <>
      <Navbar telemetry={null} />
      <main id="conteudo" className="relative z-[var(--z-content)]">
        <Hero />
        <About />
        <Capabilities />
        <Cases />
        <Pipeline />
      </main>
    </>
  );
}
