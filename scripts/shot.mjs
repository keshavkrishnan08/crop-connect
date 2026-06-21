import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto("http://localhost:3000/sign-in", { waitUntil: "networkidle" });
await p.locator('button:has-text("Create account")').first().click();
await p.fill('input[type="email"]', `tabs+${Date.now()}@cropconnect.test`);
await p.fill('input[type="password"]', "test123456");
await p.locator('button[type="submit"]').click();
await p.waitForURL("**/app", { timeout: 20000 });
await p.waitForTimeout(2500);
let out = {};
for (const path of ["/app", "/app/orders", "/app/deals", "/app/banking", "/app/sourcing"]) {
  await p.goto("http://localhost:3000"+path, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  out[path] = (await p.title()) ? "ok" : "?";
}
await p.goto("http://localhost:3000/app", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
const html = await p.content();
console.log("roadmap:", /Your roadmap/.test(html), "| deals text on /app/deals checked separately");
await p.goto("http://localhost:3000/app/banking", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
console.log("banking escrow:", /Held in escrow|Escrow/.test(await p.content()));
await p.goto("http://localhost:3000/app/sourcing", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
console.log("board agent badge:", /is orchestrating|drag to arrange/.test(await p.content()));
await p.screenshot({ path: "scripts/dash.png" });
await b.close(); console.log("routes:", JSON.stringify(out));
