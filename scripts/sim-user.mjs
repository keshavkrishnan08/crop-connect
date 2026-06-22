import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let fails = 0;
const check = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? "PASS" : "FAIL"} · ${msg}`); };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

try {
    for (const path of ["/", "/how-it-works", "/pricing", "/for-farms"]) {
        const r = await page.goto(BASE + path, { waitUntil: "networkidle" });
        check(r.status() === 200, `GET ${path} -> ${r.status()}`);
    }

    await page.goto(BASE + "/app", { waitUntil: "networkidle" });
    check(/\/sign-in/.test(page.url()), "/app protected -> sign-in");

    const email = `sim+${Date.now()}@cropconnect.test`;
    await page.locator('button:has-text("Create account")').first().click();
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "test123456");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/app", { timeout: 20000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const dash = await page.content();
    check(/Recent/.test(dash), "dashboard shows recent events");
    check(/Your roadmap/.test(dash), "dashboard shows roadmap");

    // source -> autonomous run -> contract room
    await page.goto(BASE + "/app/sourcing/new", { waitUntil: "networkidle" });
    await page.fill('input[placeholder*="heirloom tomato"]', "rainbow carrots");
    await page.click('button:has-text("Source it for me")');
    await page.waitForSelector("text=/is sourcing your/i", { timeout: 6000 });
    check(true, "autonomous run opened");
    await page.waitForSelector('button:has-text("Review your contract")', { timeout: 15000 });
    check(true, "agent drafted the contract");
    await page.click('button:has-text("Review your contract")');
    await page.waitForURL("**/app/sourcing/**", { timeout: 8000 });
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("text=Preliminary terms", { timeout: 6000 });
    let html = await page.content();
    check(/Preliminary terms/.test(html), "contract room shows preliminary terms (LOI)");
    check(/Quality guidelines/.test(html), "contract room shows quality guidelines");
    check(/Negotiation/.test(html), "contract room shows the negotiation thread");

    // negotiate a quality term
    await page.locator('button:has-text("Grade No. 1 only")').click();
    await page.waitForTimeout(600);
    check(/can meet this for|Added/.test(await page.content()), "agent negotiated a quality guideline with the farm");

    // sign the contract
    await page.locator('button:has-text("Sign contract")').click();
    await page.waitForTimeout(1200);
    html = await page.content();
    check(/Official contract|Contract signed/.test(html), "contract signs into an official contract");
    check(/Deliveries/.test(html), "deliveries scheduled after signing");

    // persistence: fresh context
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto(BASE + "/sign-in", { waitUntil: "networkidle" });
    await page2.fill('input[type="email"]', email);
    await page2.fill('input[type="password"]', "test123456");
    await page2.locator('button[type="submit"]').click();
    await page2.waitForURL("**/app", { timeout: 25000 });
    await page2.waitForLoadState("networkidle");
    await page2.waitForTimeout(2800);
    await page2.goto(BASE + "/app/orders", { waitUntil: "networkidle" });
    await page2.waitForTimeout(1200);
    check(/rainbow carrots/i.test(await page2.content()), "signed contract persisted to the account");

    const real = [...new Set(errors)].filter((e) => !/Failed to fetch RSC payload|loremflickr|403/.test(e));
    check(real.length === 0, `no real runtime errors (${real.length}); ${real.slice(0, 2).map((e) => e.slice(0, 80)).join(" | ")}`);
} catch (e) {
    fails++;
    console.log("FAIL · exception: " + String(e).slice(0, 300));
} finally {
    await browser.close();
    console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILURES"}`);
    process.exit(fails === 0 ? 0 : 1);
}
