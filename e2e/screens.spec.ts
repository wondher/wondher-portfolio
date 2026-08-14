// e2e/screens.spec.ts
// Script de evidência visual (não faz parte do gate de CI). Roda com:
//   npx playwright test e2e/screens.spec.ts
// Gera PNGs em .superpowers/sdd/screens/ (diretório gitignorado, não commitar).
import { test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), ".superpowers/sdd/screens");
const CENTER: [number, number] = [756, 491];

test.beforeAll(() => {
  mkdirSync(OUT_DIR, { recursive: true });
});

async function scrollElementToTop(page: Page, selector: string, maxSteps = 200) {
  let lastY = -1;
  let stagnant = 0;
  for (let i = 0; i < maxSteps; i++) {
    const top = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top : null;
    }, selector);
    if (top === null || top <= 20) return;
    await page.mouse.wheel(0, Math.min(420, Math.max(120, top)));
    await page.waitForTimeout(50);
    const y = await page.evaluate(() => window.scrollY);
    stagnant = y === lastY ? stagnant + 1 : 0;
    lastY = y;
    if (stagnant > 5) return; // fim do documento
  }
}

async function scrollExtraViewports(page: Page, multiplier: number, maxSteps = 200) {
  const viewport = page.viewportSize();
  const vh = viewport ? viewport.height : 982;
  const target = vh * multiplier;
  const startY = await page.evaluate(() => window.scrollY);
  let lastY = -1;
  let stagnant = 0;
  for (let i = 0; i < maxSteps; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y - startY >= target) return;
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(50);
    stagnant = y === lastY ? stagnant + 1 : 0;
    lastY = y;
    if (stagnant > 5) return;
  }
}

test.describe("screenshots", () => {
  test.use({ viewport: { width: 1512, height: 982 } });

  test("01-hero", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, "01-hero.png") });
  });

  test("02-capabilities", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(...CENTER);
    await scrollElementToTop(page, "#capabilities");
    await scrollExtraViewports(page, 1.5);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, "02-capabilities.png") });
  });

  test("03-cases", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(...CENTER);
    await scrollElementToTop(page, "#cases");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, "03-cases.png") });
  });

  test("04-pipeline", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(...CENTER);
    await scrollElementToTop(page, "#pipeline");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, "04-pipeline.png") });
  });

  test("05-footer-terminal", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(...CENTER);
    await scrollElementToTop(page, "#contact");
    await page.waitForTimeout(1500);
    const input = page.getByLabel("Comando do terminal");
    await input.fill("help");
    await input.press("Enter");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, "05-footer-terminal.png") });
  });
});
