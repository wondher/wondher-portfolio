import { describe, expect, it } from "vitest";
import { scrollState, resetScrollState } from "./scroll-state";

describe("scrollState", () => {
  it("nasce zerado e com ponteiro neutro", () => {
    resetScrollState();
    expect(scrollState).toMatchObject({ progress: 0, lerped: 0, velocity: 0, cluster: 0, pointer: { x: 0, y: 0 } });
  });
  it("é mutável por referência (contrato transiente)", () => {
    resetScrollState();
    const ref = scrollState;
    ref.progress = 0.42;
    expect(scrollState.progress).toBe(0.42);
  });
  it("resetScrollState restaura tudo", () => {
    scrollState.progress = 1; scrollState.lerped = 1; scrollState.cluster = 3; scrollState.pointer.x = -1;
    resetScrollState();
    expect(scrollState.progress).toBe(0);
    expect(scrollState.pointer.x).toBe(0);
  });
});
