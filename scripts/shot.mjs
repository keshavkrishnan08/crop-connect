import { chromium } from "playwright";
const b = await chromium.launch();
const f = await b.newPage({ viewport: { width: 1280, height: 1400 } });
await f.goto("http://localhost:3000/for-farms", { waitUntil: "networkidle" });
const h = f.locator('h2', { hasText: "Three steps" }).first();
await h.scrollIntoViewIfNeeded();
await f.waitForTimeout(2000);
await h.locator('xpath=ancestor::section').first().screenshot({ path: "scripts/farms-how.png" });
await b.close(); console.log("shot done");
