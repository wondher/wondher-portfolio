import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Hero } from "./Hero";
import { About } from "./About";

it("hero tem H1, kicker e CTAs do spec", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Quem projeta a arquitetura escreve o código.");
  expect(screen.getByText("ENGENHARIA CRIATIVA & SISTEMAS — CURITIBA/BR")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Iniciar diagnóstico técnico" })).toHaveAttribute("href", "#contact");
  expect(screen.getByRole("link", { name: "$ ver casos --selecionados" })).toHaveAttribute("href", "#cases");
});

it("about tem manifesto e fatos mono", () => {
  render(<About />);
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Atendimento direto é decisão de arquitetura.");
  expect(screen.getByText("0 gerentes de conta")).toBeInTheDocument();
  expect(screen.getByText("Brian Mendes — Arquiteto de Software & Fundador")).toBeInTheDocument();
});
