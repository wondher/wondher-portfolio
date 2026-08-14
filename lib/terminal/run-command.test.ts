import { describe, expect, it } from "vitest";
import { runCommand } from "./run-command";

describe("runCommand", () => {
  it("help lista os comandos", () => {
    expect(runCommand("help")).toEqual([{ kind: "out", text: "stack · cases · latency · contact --now" }]);
  });
  it("latency devolve a linha do spec", () => {
    expect(runCommand("latency")).toEqual([
      { kind: "out", text: "você ↔ wondher: 1 pessoa, 0 intermediários. RTT médio de resposta: < 24h úteis." },
    ]);
  });
  it("contact --now dispara ação", () => {
    expect(runCommand("contact --now")).toContainEqual({ kind: "action", action: "contact" });
  });
  it("comando desconhecido vira err com dica", () => {
    expect(runCommand("rm -rf /")).toEqual([{ kind: "err", text: "comando não encontrado: rm. digite 'help'." }]);
  });
  it("easter egg sudo hire-me", () => {
    expect(runCommand("sudo hire-me")).toEqual([
      { kind: "out", text: "permissão concedida. envie o briefing: brianmendes@wondher.io" },
    ]);
  });
  it("input vazio não produz linhas", () => {
    expect(runCommand("  ")).toEqual([]);
  });
});
