// components/dom/navbar.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Navbar } from "./Navbar";

it("renderiza chips de telemetria e CTA", () => {
  render(<Navbar telemetry={{ uptimePct: 99.98, deploys30d: 14, activePipelines: 3, lastCommitSha: null, updatedAt: "2026-08-14T00:00:00Z" }} />);
  expect(screen.getByText("WONDHER®")).toBeInTheDocument();
  expect(screen.getByText("SYS:OPERACIONAL · UPTIME 99.98%")).toBeInTheDocument();
  expect(screen.getByText("DEPLOYS/30D: 14")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Iniciar diagnóstico" })).toHaveAttribute("href", "#contact");
});
