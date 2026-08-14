import { Navbar } from "@/components/dom/Navbar";
import { Hero } from "@/components/dom/Hero";
import { About } from "@/components/dom/About";
import { Capabilities } from "@/components/dom/Capabilities";
import { Cases } from "@/components/dom/Cases";
import { Pipeline } from "@/components/dom/Pipeline";
import { StackSection } from "@/components/dom/StackSection";
import { TerminalFooter } from "@/components/dom/TerminalFooter";

export default function Page() {
  return (
    <>
      <Navbar telemetry={null} />
      <main className="relative z-[var(--z-content)]">
        <Hero />
        <About />
        <Capabilities />
        <Cases />
        <Pipeline />
        <StackSection />
      </main>
      <TerminalFooter />
    </>
  );
}
