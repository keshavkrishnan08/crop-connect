import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let fails = 0;
const check = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? "PASS" : "FAIL"} · ${msg}`); };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

try {
    // ---- marketing pages ----
    for (const path of ["/", "/how-it-works", "/what-we-handle", "/pricing", "/for-farms"]) {
        const r = await page.goto(BASE + path, { waitUntil: "networkidle" });
        check(r.status() === 200, `GET ${path} -> ${r.status()}`);
    }
    check(!/Run a stronger restaurant|The case for a local menu|Just how much more/.test(await page.goto(BASE + "/").then(() => page.content())), "stat/number sections removed from landing");
    check(/We get you|Produce from farms|loremflickr/i.test(await page.content()), "one produce gallery still present");

    // ---- /app requires auth ----
    await page.goto(BASE + "/app", { waitUntil: "networkidle" });
    check(/\/sign-in/.test(page.url()), "/app is protected -> redirected to sign-in");

    // ---- sign up a real account ----
    const email = `sim+${Date.now()}@cropconnect.test`;
    await page.locator('button:has-text("Create account")').first().click();
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "test123456");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/app", { timeout: 15000 });
    check(true, `signed up + landed in app as ${email}`);
    await page.waitForLoadState("networkidle");
    check(await page.locator("text=Sage").first().isVisible(), "agent (Sage) present on dashboard");
    check(await page.locator("text=Your sourcing pipeline").isVisible(), "automation board present");

    // ---- AUTONOMOUS AGENT: source an ingredient ----
    await page.goto(BASE + "/app/sourcing/new", { waitUntil: "networkidle" });
    await page.fill('input[placeholder*="heirloom tomato"]', "rainbow carrots");
    await page.click('button:has-text("Source it for me")');
    await page.waitForSelector("text=/Sage is sourcing/i", { timeout: 6000 });
    check(true, "autonomous run opened (Sage is sourcing)");
    await page.waitForSelector('button:has-text("See it running")', { timeout: 15000 });
    check(true, "agent finished all steps");
    await page.click('button:has-text("See it running")');
    await page.waitForURL("**/app", { timeout: 8000 });
    await page.waitForLoadState("networkidle");
    let html = await page.content();
    check(/rainbow carrots/i.test(html), "new ingredient appears on the board");
    check(/Matched/i.test(html), "agent logged a farm match");
    check(/Drafted your supply agreement/i.test(html), "agent logged the agreement");
    check(/Scheduled 8 weekly deliveries/i.test(html), "agent logged 8 deliveries");
    await page.screenshot({ path: "scripts/sim-dashboard.png" });

    // ---- persistence: brand-new browser context, sign in again, data is still there ----
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto(BASE + "/sign-in", { waitUntil: "networkidle" });
    await page2.fill('input[type="email"]', email);
    await page2.fill('input[type="password"]', "test123456");
    await page2.locator('button[type="submit"]').click();
    await page2.waitForURL("**/app", { timeout: 25000 });
    await page2.waitForLoadState("networkidle");
    await page2.waitForTimeout(2800); // let the account state pull
    check(/rainbow carrots/i.test(await page2.content()), "data persisted to the account (visible after fresh sign-in)");

    const uniq = [...new Set(errors)];
    const hydration = uniq.filter((e) => /Hydration|descendant of|cannot be a/.test(e));
    check(hydration.length === 0, `no hydration errors (${hydration.length})`);
    const real = uniq.filter((e) => !/Failed to fetch RSC payload/.test(e));
    check(real.length === 0, `no real runtime errors (${real.length}); ${real.slice(0, 3).map((e) => e.slice(0, 90)).join(" | ")}`);
} catch (e) {
    fails++;
    console.log("FAIL · exception: " + String(e).slice(0, 300));
} finally {
    await browser.close();
    console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILURES"}`);
    process.exit(fails === 0 ? 0 : 1);
}
