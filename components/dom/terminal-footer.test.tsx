import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it } from "vitest";
import { TerminalFooter } from "./TerminalFooter";

it("executa help e mostra a saída", () => {
  render(<TerminalFooter />);
  const input = screen.getByLabelText("Comando do terminal");
  fireEvent.change(input, { target: { value: "help" } });
  fireEvent.submit(input.closest("form")!);
  expect(screen.getByText("stack · cases · latency · contact --now")).toBeInTheDocument();
});

it("contact --now abre o formulário", () => {
  render(<TerminalFooter />);
  const input = screen.getByLabelText("Comando do terminal");
  fireEvent.change(input, { target: { value: "contact --now" } });
  fireEvent.submit(input.closest("form")!);
  expect(screen.getByText("enviar briefing")).toBeInTheDocument();
});
