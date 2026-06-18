# Should CropConnect build local B2C produce on the Uber Direct rails?

_Strategy memo, June 2026. Short answer: not as a pivot — but there's one B2C wedge worth keeping warm._

---

## The seductive logic

"We already have the courier API. Consumers love local produce. Why not let people order a farm box and have Uber Direct drop it at their door? Bigger market, retail margins."

It's a real idea. The courier infrastructure you built _is_ genuinely reusable. But B2C produce is a **different company**, and the unit economics are where the dream usually dies.

## Why on-demand B2C produce is brutal

1. **Last-mile economics don't close.** A produce order is low AOV — call it $25–40. An on-demand courier run is $10–15. That's 30–50% of the order in delivery. Imperfect/Misfits/Farmgirl survive only by **batching** routes (own logistics, fixed weekly windows, dense stops) — the opposite of on-demand single drops. Uber Direct is perfect for one restaurant pickup → one restaurant drop. It's terrible for 200 households each wanting 3 lbs of tomatoes.
2. **Farms aren't fulfillment centers.** B2C means picking individual consumer orders, packing boxes, customer support, handling complaints about a bruised peach. Farms grow; they don't pick-pack-ship-CS. Someone has to aggregate and pack → that's a **hub / dark store** → capital + ops heavy.
3. **It's a graveyard.** Good Eggs (raised $100M+), Farmstead, Rosie, countless local-grocery startups. Perishable online grocery has crushed far better-funded teams.
4. **It abandons the wedge.** CropConnect's entire thesis — committed supply, provability, reliability, contracts — is B2B. B2C is consumer marketing, CAC, retention, app-store ops. Doing both early splits a small team's focus fatally.
5. **Demand gen flips.** B2B is sales-led: a rep wins a few high-value relationships. B2C is marketing-led: you buy/earn thousands of low-value customers. Totally different muscle, cost structure, and team.

## What's actually true and useful

- The **courier integration is a real asset** and reusable.
- **Spot/immediate** transactions (which B2C is) fit the **surplus/waste** problem far better than forward contracts do — see the GTM doc. This is the one place B2C is _additive_, not a pivot.

## The one B2C wedge worth keeping warm: surplus "rescue boxes"

Instead of becoming a grocery app, ride the rails you already have for the thing contracts _can't_ solve:

> A farm has surplus that won't fill a contract (the glut, the cosmetic culls). It lists a **same-day rescue box** at a discount. Nearby consumers grab it; **Uber Direct delivers** from the farm. CropConnect takes a margin + the courier markup.

Why this is the _right_ B2C shape and a full grocery play is not:
- It **monetizes waste** (the visceral farmer pain) without becoming a race-to-the-bottom wholesale dump.
- It's **spot, not fulfillment** — the farm packs one box, courier handles the rest. No picking thousands of SKUs.
- It **reuses** the courier + farm profiles + reliability you already built.
- It's **additive** to the B2B core and a cheap way to _test_ consumer demand before betting the company.
- Higher margin than wholesale, and it makes the farmer money on product that was worth $0.

Risks to respect: still low AOV vs courier cost (gate it on a minimum box size / distance), perishable quality, and don't let it distract from proving B2B contracts first.

## The honest long-game

The credible path to a big consumer business is **not** "build a produce delivery app now." It's:

1. Win **committed B2B supply** (contracts) → you control predictable local volume.
2. Become the **local aggregator/distributor** off that committed supply (the spec's later stage).
3. _Then_, with aggregated supply + a hub, optionally sell **downstream** — to consumers or grocers — from a position of supply control.

B2C as a _consequence of owning supply_ is defensible. B2C as a _cold-start delivery app_ is the graveyard.

## Recommendation

- **Now:** don't pivot. Stay B2B. Prove that contracts get signed _and renewed_.
- **Cheap experiment (optional, additive):** a surplus **rescue-box** feature on the existing courier rails — monetizes waste, tests consumer pull, reuses what's built.
- **Later:** B2C/consumer only after you own committed supply and have a hub. Earn the right to it.

> Uber Direct made last-mile _possible_. It did not make perishable B2C _profitable_. Use it for the contract drop-offs that already have a paying buyer — and, if you want a taste of consumer, for surplus boxes that turn waste into cash. Not for a grocery app you'd have to subsidize.
