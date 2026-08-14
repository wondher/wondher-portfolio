// lib/a11y/use-prefers-reduced-motion.test.tsx
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches, media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
}

describe("usePrefersReducedMotion", () => {
  it("retorna true quando a media query casa", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
  it("retorna false quando não casa", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});
