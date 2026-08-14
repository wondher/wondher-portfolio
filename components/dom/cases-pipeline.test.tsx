import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Cases } from "./Cases";
import { Pipeline } from "./Pipeline";

it("cases renderizam os 4 projetos com métricas", () => {
  render(<Cases />);
  expect(screen.getByText("FLOWCRAFT")).toBeInTheDocument();
  expect(screen.getByText("32 ENDPOINTS API")).toBeInTheDocument();
  expect(screen.getByText("Este site, tratado como produto.")).toBeInTheDocument();
});

it("pipeline renderiza 6 checkpoints com artefatos", () => {
  render(<Pipeline />);
  expect(screen.getByText("Diagnóstico")).toBeInTheDocument();
  expect(screen.getByText("→ RFC aprovada")).toBeInTheDocument();
  expect(screen.getByText("→ capacidade instalada")).toBeInTheDocument();
});
