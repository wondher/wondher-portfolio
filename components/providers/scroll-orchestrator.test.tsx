// components/providers/scroll-orchestrator.test.tsx
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ScrollOrchestrator } from "./ScrollOrchestrator";

it("aplica classe reduced-motion no html quando o usuário prefere menos movimento", async () => {
  vi.stubGlobal("matchMedia", vi.fn((q: string) => ({
    matches: q.includes("prefers-reduced-motion"),
    media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn(),
  })));
  render(<ScrollOrchestrator><p>conteudo</p></ScrollOrchestrator>);
  await vi.waitFor(() => expect(document.documentElement.classList.contains("reduced-motion")).toBe(true));
});
