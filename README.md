# CropConnect

**Done-for-you local produce sourcing for restaurants. A free menu audit shows a kitchen the margin it is leaving on the table, and an operator app runs the farms, contracts, and deliveries that capture it.**

Independent kitchens have already called every supplier and cut every cost. There is little left to trim, so the lever that remains is price, and food from a named farm down the road is what diners pay more for. A local dish can carry a few dollars more while its food cost barely changes. Most kitchens skip it anyway, because sourcing locally means calling farms, chasing trucks, and hoping someone shows up. CropConnect treats local sourcing as a margin problem, not a procurement chore: it starts from the menu, prices the upside dish by dish, and then runs the supply side so the kitchen only cooks.

Live site: **https://cropconnect.dev**

```
pasted menu  ->  parse dishes (trailing price, category, produce keywords)
             ->  margin model: (price lift - produce cost) x attach rate x weekly covers
             ->  rank farms per dish (crop match, reliability, distance, price)
             ->  audit report  ->  setup request  ->  emailed lead
operator app:  request  ->  farm chosen  ->  under contract  ->  delivering  ->  live on menu
```

The menu price moves. The food cost barely does.

## The core idea

1. **Raise the price, do not cut the cost.** The margin model in `lib/margin.ts` counts only the added gross profit per order: a price lift minus the extra produce cost. The defaults are a **$3.00** lift and **$0.75** of extra produce, with **12%** of weekly covers ordering each featured dish.
2. **Every number is an editable estimate.** The price lift, produce cost, and attach rate are sliders in the demo and in Settings, and every uplift is shown as a range whose conservative end is **60%** of the expected figure.
3. **The kitchen names an ingredient. The software does the rest.** One request moves through five stages. The app ranks farms, splits volume across farms when one cannot cover it, drafts an agreement at the farm's posted price (no haggling), schedules deliveries, and turns limited weekly supply into limited-edition menu pricing.

## What it does

| Feature | Where | Detail |
|---|---|---|
| **Free margin audit** | `/audit` | Paste a menu, set weekly covers (200 to 3,000). Returns up to **6** dishes to bring local, a matched farm for each, and the monthly and annual margin. No login. Runs entirely in the browser. |
| **Setup request** | `/audit`, after the report | Name, email, role, and notes are sent with the audit figures to a form service that emails the lead (Web3Forms when a key is configured, FormSubmit otherwise). |
| **Margin demo** | `/demo` | A six-step walkthrough (Restaurant, Menu, Read, Margins, Upside, Plan) that lifts the current blended margin to a modeled one using the kitchen's own numbers. |
| **Farm ranking** | `rankFarms` in `lib/store.ts` | Score out of 100: crop match **55**, reliability **22**, distance **13** (linear to zero at 60 miles), price **10**. Returns up to three plain-language reasons per match. |
| **Contracts** | `/app/sourcing/[id]` | Posted price per unit, a 12-week default term, weekly cadence, and 11 optional quality specs (organic, 48-hour harvest, cold chain, Brix, and more), each with its own price add-on. |
| **Delivery and SLA credits** | `lib/store.ts` | A delivery confirms only with a photo. A late drop credits **10%** of its value back to the kitchen. A failed quality check credits **25%**. |
| **Profit Recovery** | `/app/recovery` | Flags invoice lines billed more than 5% over a benchmark, models waste removed by suggested pars, and finds underpriced local dishes. |
| **Menu provenance** | `/app/story` | Writes a menu line from the farm record (`<crop> from <farm>, <n> miles up the road.`) with plain templating, no language model. |
| **Sage, the assistant** | `components/app/ChatAgent.tsx` | Answers questions about margins, deliveries, escrow, and next steps from the live account state. Rule based, no external API. |
| **Pricing calculator** | `/pricing` | $299 a month base plus $99, $199, or $349 per item by volume tier, with 10% off for six months and 20% off for twelve. |
| **Accounts and sync** | `lib/supabase/` | Supabase email and password auth. Middleware gates `/app`. Account state syncs to six tables. |

## How it works

**Stack.** Next.js 14 (App Router) and TypeScript, Tailwind CSS, Framer Motion, and a custom SVG icon set. Fonts are Fraunces, Hanken Grotesk, and JetBrains Mono through `next/font`. Supabase handles auth and storage. Deployed on Vercel.

**Menu parsing.** `parseMenu` keeps each line that ends in a price between $3 and $200, infers a category from keywords (salad, starter, side, special, otherwise main), assigns a category food-cost benchmark (24% for sides up to 34% for mains), and marks a dish as produce driven when its name hits a keyword list (tomato, beet, squash, greens, and so on). The top four produce-driven dishes are auto-featured.

**Margin model.** Monthly uplift per featured dish is the added profit per order times covers times attach rate times 4.345 weeks. The operator app rolls this up into realized margin (items live on the menu) and modeled margin (items under contract or delivering). A scarcity model converts each sourced crop's weekly pounds into servings and adds a premium that grows as supply shrinks, from $0.75 at high volume to $5 at 25 servings or fewer.

**State.** The operator app runs on a small dependency-free store (`useSyncExternalStore`) seeded with a demo restaurant, six farms, and live sourcing items, persisted to `localStorage`. The first paint always uses the deterministic seed so server and client render the same markup. When Supabase is configured, `SupabaseSync` pulls the signed-in account after mount, then pushes every change through a 600 ms debounce and a serialized writer that never runs two pushes at once and always persists the latest state. Rows map to `restaurants`, `dishes`, `sourcing_items`, `deliveries`, `orders`, and `activity`.

**Graceful fallback.** With no Supabase keys, middleware lets everything through and the app runs as a local demo. With no Web3Forms key, the lead form posts to FormSubmit's AJAX endpoint instead. The marketing site and the audit need no configuration.

**Discoverability.** `app/robots.ts` explicitly allows AI crawlers, `app/sitemap.ts` lists the five marketing routes, `public/llms.txt` describes the service for language models, and the root layout ships Organization and WebSite JSON-LD.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

The marketing pages, `/audit`, and `/demo` run with no setup. For accounts, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. For lead email through Web3Forms, set `NEXT_PUBLIC_WEB3FORMS_KEY`.

## Layout

```
app/
  page.tsx               landing page
  audit/                 free margin audit and setup request form
  demo/                  six-step margin walkthrough
  how-it-works/  what-we-handle/  pricing/  for-farms/   marketing pages
  sign-in/               Supabase email and password auth
  app/                   operator app: pipeline, sourcing, orders, deals, menu, margins,
                         recovery, banking, story, onboarding, settings
  robots.ts  sitemap.ts  crawler rules and sitemap
components/
  app/                   app shell, Sage assistant, autonomous-run overlay, Supabase sync
  marketing/             landing sections, pricing calculator, flow visuals
  sourcing/  ui/  icons/ stage rail, design kit, custom SVG icons
lib/
  margin.ts              margin model, menu parser, sample menus
  store.ts               app state, seed farms, farm ranking, contracts, SLA, escrow ledger
  recovery.ts            invoice, waste, and menu recovery estimates
  supabase/              browser and server clients, session middleware, state sync
docs/                    go-to-market notes, farm interface notes, simulated persona test
pitch/                   pitch deck (HTML and PDF) and pre-read
scripts/                 Playwright smoke test, Supabase check, screenshot and pre-read helpers
public/llms.txt          plain-text description for language models
```

## Honesty

* The farm network in the code is a seed list of six farms around Indianapolis, and the audit
  matches every city against them. Farm details in the app (year established, acreage, capacity)
  are derived from those seed records, not collected from the farms.
* Contracts, escrow, payouts, and SLA credits are modeled in the browser store. No payment
  provider is wired in yet.
* Sage and the autonomous run are deterministic. Farm replies in a contract thread are scripted,
  and Sage answers from local state without calling a model.
* The audit is a model with stated assumptions, not a guarantee. Every input is editable and every
  uplift is shown as a range.
* The Supabase schema is not in the repo (`/supabase/` is git-ignored).
