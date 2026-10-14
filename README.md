# CropConnect

**Done-for-you local produce sourcing for restaurants.** Live at [cropconnect.dev](https://cropconnect.dev).

Independent kitchens keep three to five cents on every dollar. They have already called every supplier and cut every cost, so the only real lever left is charging more, and food from a named farm down the road is how they do it. The menu price moves, the food cost barely does, and on margins that thin the gap is close to pure profit. Sourcing it yourself means calling farms, chasing trucks, and hoping someone shows up. CropConnect runs that whole supply side so the kitchen just cooks.

## What it does

- **Free margin audit.** Paste a menu and get, in about a minute, the dishes worth bringing local, the vetted farms near you, and the margin you are leaving on the table. No login. (`/audit`)
- **Farm matching.** Ranks nearby growers against each dish from a vetted local-farm network.
- **Done-for-you operations.** Sourcing, contracting, and weekly delivery, with menu provenance that puts the farm's name in front of guests.
- **Operator dashboard.** Orders, sourcing, deals, menu, margins, and banking views for a running account.

## Stack

Next.js (App Router) and TypeScript, Tailwind CSS, Framer Motion, Leaflet for maps, Supabase for data and auth, and Stripe for billing. Deployed on Vercel.

## Run it locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. The marketing site and the free audit tool run with no setup. The full operator app expects Supabase and Stripe keys; see `SETUP.md` for the environment variables.

## How the numbers work

The audit models margin uplift from a dish's price lift minus its produce-cost delta, across an attach rate on weekly covers. Demand figures come from public consumer research (National Restaurant Association and FMI surveys), and the farm set is a vetted local network. Everything the audit shows is an illustrative model, labeled as such, not a guarantee.
