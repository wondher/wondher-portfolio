import { Navbar } from "@/components/dom/Navbar";
import { Hero } from "@/components/dom/Hero";
import { About } from "@/components/dom/About";
import { Capabilities } from "@/components/dom/Capabilities";
import { Cases } from "@/components/dom/Cases";
import { Pipeline } from "@/components/dom/Pipeline";
import { StackSection } from "@/components/dom/StackSection";
import { TerminalFooter } from "@/components/dom/TerminalFooter";
import { getTelemetry } from "@/lib/telemetry/get-telemetry";

export default async function Page() {
  const telemetry = await getTelemetry();
  return (
    <>
      <Navbar telemetry={telemetry} />
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
