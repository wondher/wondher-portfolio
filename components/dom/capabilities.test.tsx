import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Capabilities } from "./Capabilities";

it("renderiza os 4 clusters com provas mono", () => {
  render(<Capabilities />);
  expect(screen.getByText("C1 · EXPERIÊNCIAS WEB & WEBGL")).toBeInTheDocument();
  expect(screen.getByText("Processo como infraestrutura.")).toBeInTheDocument();
  expect(screen.getByText("3 PROVEDORES · DEGRADAÇÃO DETERMINÍSTICA · 0 LOCK-IN")).toBeInTheDocument();
  expect(screen.getByText("CODEX: CLOUD→LOCAL-FIRST · 9,4MB OFFLINE · 21 IPC HANDLERS")).toBeInTheDocument();
});
