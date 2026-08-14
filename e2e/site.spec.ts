import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("página renderiza as 8 seções e o H1 do spec", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quem projeta a arquitetura escreve o código.");
  for (const id of ["hero", "about", "capabilities", "cases", "pipeline", "stack", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
});

test("terminal responde help e latency", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("Comando do terminal");
  await input.fill("help");
  await input.press("Enter");
  await expect(page.getByText("stack · cases · latency · contact --now")).toBeVisible();
  await input.fill("latency");
  await input.press("Enter");
  await expect(page.getByText(/1 pessoa, 0 intermediários/)).toBeVisible();
});

test("reduced-motion: sem canvas, classe aplicada, conteúdo íntegro", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html.reduced-motion")).toBeAttached();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByText("FLOWCRAFT").first()).toBeAttached();
});

test("a11y: sem violações serious/critical (axe)", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad).toEqual([]);
});
