import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { expect, it, vi, afterEach } from "vitest";
import { TerminalFooter } from "./TerminalFooter";

afterEach(() => {
  cleanup();
});

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

it("após envio bem-sucedido mostra mensagem no histórico e retorna ao prompt", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  try {
    render(<TerminalFooter />);
    const input = screen.getByLabelText("Comando do terminal");
    fireEvent.change(input, { target: { value: "contact --now" } });
    fireEvent.submit(input.closest("form")!);
    fireEvent.change(screen.getByLabelText("nome"), { target: { value: "Ana Silva" } });
    fireEvent.change(screen.getByLabelText("e-mail"), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByLabelText("o sistema que precisa existir"), { target: { value: "plataforma de automação" } });
    fireEvent.click(screen.getByText("enviar briefing"));
    await waitFor(() => {
      expect(screen.getByText("handshake concluído. resposta em < 24h úteis.")).toBeInTheDocument();
      expect(screen.getByLabelText("Comando do terminal")).toBeInTheDocument();
    });
  } finally {
    vi.unstubAllGlobals();
  }
});
