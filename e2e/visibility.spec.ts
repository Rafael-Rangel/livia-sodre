import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const OUT = path.join(process.cwd(), "e2e", "artifacts");

async function visibilityReport(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((els) =>
    els.slice(0, 8).map((el, i) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        i,
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 60),
        opacity: style.opacity,
        visibility: style.visibility,
        display: style.display,
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        visibleBox: rect.width > 0 && rect.height > 0,
      };
    }),
  );
}

async function jumpTo(page: Page, id: string) {
  // Avoid mouse.wheel (can crash under heavy canvas/frame decode).
  // Jump past the cinematic pin spacer directly to the section.
  await page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) throw new Error(`missing #${sectionId}`);
    el.scrollIntoView({ behavior: "instant", block: "start" });
    window.dispatchEvent(new Event("scroll"));
  }, id);
  await page.waitForTimeout(700);
}

async function assertSectionVisible(page: Page, id: string, probe: string) {
  const section = page.locator(`#${id}`);
  await expect(section).toBeAttached();
  await jumpTo(page, id);

  const probeEl = section.locator(probe).first();
  await expect(probeEl).toBeVisible();

  const { opacity, visibility } = await probeEl.evaluate((el) => {
    const s = getComputedStyle(el);
    return { opacity: s.opacity, visibility: s.visibility };
  });

  expect(Number(opacity)).toBeGreaterThan(0.5);
  expect(visibility).toBe("visible");
}

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

test.describe("Landing visibility @ production", () => {
  test("hero + sections are not blank", async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".cine-title", { state: "visible", timeout: 20_000 });
    await page.waitForTimeout(1200);

    const brand = page.locator(".cine-title").first();
    await expect(brand).toBeVisible();
    await expect(brand).toContainText(/Lívia Sodré/i);

    const brandOpacity = await brand.evaluate(
      (el) => getComputedStyle(el).opacity,
    );
    expect(Number(brandOpacity)).toBeGreaterThan(0.3);

    const cta = page.locator(".cine-ctas a.btn-primary").first();
    await expect(cta).toBeVisible();

    await page.screenshot({
      path: path.join(OUT, `${testInfo.project.name}-hero.png`),
      fullPage: false,
    });

    await assertSectionVisible(page, "servicos", "h2");
    await assertSectionVisible(page, "servicos", ".svc-item");
    await page.screenshot({
      path: path.join(OUT, `${testInfo.project.name}-servicos.png`),
      fullPage: false,
    });

    await assertSectionVisible(page, "equipe", "h2");
    await assertSectionVisible(page, "equipe", ".team-card");
    await page.screenshot({
      path: path.join(OUT, `${testInfo.project.name}-equipe.png`),
      fullPage: false,
    });

    await assertSectionVisible(page, "sobre", "h2");
    await assertSectionVisible(page, "sobre", ".about-reveal");
    await page.screenshot({
      path: path.join(OUT, `${testInfo.project.name}-sobre.png`),
      fullPage: false,
    });

    const report = {
      project: testInfo.project.name,
      url: page.url(),
      consoleErrors,
      hero: await visibilityReport(
        page,
        ".cine-title, .cine-script, .cine-ctas",
      ),
      services: await visibilityReport(page, "#servicos .svc-item"),
      team: await visibilityReport(page, "#equipe .team-card"),
      about: await visibilityReport(page, "#sobre .about-reveal"),
    };

    fs.writeFileSync(
      path.join(OUT, `${testInfo.project.name}-report.json`),
      JSON.stringify(report, null, 2),
    );

    for (const item of [...report.services, ...report.team, ...report.about]) {
      expect(Number(item.opacity)).toBeGreaterThan(0.5);
      expect(item.visibility).toBe("visible");
      expect(item.visibleBox).toBe(true);
    }

    const fatal = consoleErrors.filter((e) =>
      /SplitType|lenis|Cannot find module|is not defined|ChunkLoadError/i.test(
        e,
      ),
    );
    expect(fatal, `Fatal console errors: ${fatal.join(" | ")}`).toEqual([]);
  });
});
