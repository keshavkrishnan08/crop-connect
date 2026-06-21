import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto("file:///Users/keshavkrishnan/Claude/CropConnect2/pitch/cropconnect-deck.html", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
const s = await p.locator(".slide").all();
await s[1].screenshot({ path: "pitch/p-problem.png" });
await p.pdf({ path: "pitch/cropconnect-deck.pdf", width: "1280px", height: "720px", printBackground: true });
await b.close(); console.log("done");
