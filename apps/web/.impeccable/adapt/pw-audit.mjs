import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Programming/AppData/Roaming/npm/node_modules/playwright");
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = dirname(fileURLToPath(import.meta.url));
mkdirSync(outDir, { recursive: true });

const widths = [320, 360, 390, 768];
const url = "http://localhost:5173/";

const browser = await chromium.launch({ channel: "chrome" });

function overflowing(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const pageOverflow = {
      clientWidth: doc.clientWidth,
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
    };
    const els = [...document.querySelectorAll("body *")].filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      return el.scrollWidth > el.clientWidth + 1 || r.right > doc.clientWidth + 2;
    });
    return {
      pageOverflow,
      overflowing: els.slice(0, 25).map((el) => ({
        tag: el.tagName,
        id: el.id,
        class: String(el.className).slice(0, 120),
        client: el.clientWidth,
        scroll: el.scrollWidth,
        right: Math.round(el.getBoundingClientRect().right),
      })),
    };
  });
}

for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 } });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: ".grace-nav{position:static!important}" });
  await page.screenshot({
    path: join(outDir, `landing-${w}-top.png`),
    fullPage: false,
  });
  const stats = page.locator(".stats-row");
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await stats.locator("xpath=ancestor::section[1]").screenshot({ path: join(outDir, `stats-${w}.png`) });
  const visit = page.locator("#visit");
  await visit.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await visit.screenshot({ path: join(outDir, `visit-${w}.png`) });
  const footer = page.locator("footer#contact");
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await footer.screenshot({ path: join(outDir, `footer-${w}.png`) });
  const metrics = await overflowing(page);
  console.log(`\n=== ${w}px ===`);
  console.log(JSON.stringify(metrics, null, 2));
  await page.close();
}

await browser.close();
