import { createRequire } from "node:module";

const require = createRequire(
  "file:///C:/Users/Programming/AppData/Roaming/npm/node_modules/playwright/package.json",
);
const { test, expect } = require("playwright/test");

/** @typedef {import('playwright/test').Page} Page */

/** @param {Page} page */
async function navBrandColor(page) {
  const brand = page.locator("header").getByText("Christian Fellowship Church").first();
  await expect(brand).toBeVisible();
  return brand.evaluate((el) => getComputedStyle(el).color);
}

/** @param {Page} page */
async function navBackgroundColor(page) {
  const header = page.locator("header").first();
  return header.evaluate((el) => getComputedStyle(el).backgroundColor);
}

/** @param {Page} page */
async function navIsTransparentAtTop(page) {
  const bg = await navBackgroundColor(page);
  const match = bg.match(/rgba?\(([^)]+)\)/);
  if (!match) return false;
  const parts = match[1].split(",").map((part) => part.trim());
  const alpha = Number.parseFloat(parts[parts.length - 1]);
  return alpha === 0;
}

/** @param {Page} page */
async function navBackdropFilter(page) {
  const header = page.locator("header").first();
  return header.evaluate((el) => getComputedStyle(el).backdropFilter);
}

test.describe("Hero overlay nav — home and board match", () => {
  test("top nav colors match between landing and board", async ({ page }) => {
    await page.goto("/");
    const homeBrandColor = await navBrandColor(page);

    await page.goto("/board");
    const boardBrandColor = await navBrandColor(page);

    expect(boardBrandColor).toBe(homeBrandColor);
  });

  for (const path of ["/", "/board"]) {
    test(`transparent nav at top on ${path}`, async ({ page }) => {
      await page.goto(path);

      const brandColor = await navBrandColor(page);
      expect(brandColor).toMatch(/255,\s*255,\s*255/);

      expect(await navIsTransparentAtTop(page)).toBe(true);
    });

    test(`opaque blurred nav after scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, 120));
      await page.waitForTimeout(400);

      const bg = await navBackgroundColor(page);
      expect(await navIsTransparentAtTop(page)).toBe(false);

      const blur = await navBackdropFilter(page);
      expect(blur).toContain("blur");

      const brandColor = await navBrandColor(page);
      expect(brandColor).toMatch(/255,\s*255,\s*255/);
    });
  }
});

test.describe("Board page layout", () => {
  test("board intro hero is about two-thirds of desktop height", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/board");

    const hero = page.locator("section.board-hero");
    await expect(hero).toBeVisible();

    const box = await hero.boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeGreaterThan(800 * 0.6);
    expect(box.height).toBeLessThanOrEqual(800 * 0.7 + 2);

    await expect(hero.locator("h1")).toBeVisible();
    await expect(hero.locator("h1")).toContainText("See what's on the board");
  });

  test("first ministry section is taller than split sections", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/board");

    const featured = page.locator(".bulletin-ministry-featured-header");
    const split = page.locator(".bulletin-ministry-split-header").first();
    await expect(featured).toBeVisible();
    await expect(split).toBeVisible();

    const featuredBox = await featured.boundingBox();
    const splitBox = await split.boundingBox();
    expect(featuredBox).not.toBeNull();
    expect(splitBox).not.toBeNull();
    expect(featuredBox.height).toBeGreaterThan(splitBox.height);
  });

  test("split ministry headers are two columns on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/board#worship");

    const header = page.locator("#worship .bulletin-ministry-split-header");
    await expect(header).toBeVisible();

    const cols = await header.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(" ").length).toBe(2);
  });

  test("board poster images load and remain visible", async ({ page }) => {
    await page.goto("/board#youth");
    await page.waitForTimeout(500);

    const images = page.locator(
      ".bulletin-poster-image img, .bulletin-poster-split-media img",
    );
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const img = images.nth(i);
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(async () =>
          img.evaluate(
            (el) => el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0,
          ),
        )
        .toBe(true);

      const imgBox = await img.boundingBox();
      expect(imgBox).not.toBeNull();
      expect(imgBox.height).toBeLessThan(560);

      const hasSrcset = await img.evaluate((el) => el.hasAttribute("srcset"));
      expect(hasSrcset).toBe(false);

      const initialSrc = await img.getAttribute("src");
      expect(initialSrc).toBeTruthy();
      expect(initialSrc).not.toContain("fit=");

      await page.waitForTimeout(250);

      const finalSrc = await img.getAttribute("src");
      expect(finalSrc).toBe(initialSrc);
    }
  });
});

test.describe("Landing invitation marquee", () => {
  test("marquee appears below hero with invite phrases", async ({ page }) => {
    await page.goto("/");
    const marquee = page.locator(".invite-marquee");
    await expect(marquee).toBeVisible();
    await expect(marquee.getByText("See you on Sunday").first()).toBeVisible();
    await expect(marquee.getByText("You're invited").first()).toBeVisible();
    await expect(marquee.getByText("We can't wait to meet you").first()).toBeVisible();
  });
});
