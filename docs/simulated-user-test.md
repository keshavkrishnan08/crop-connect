# CropConnect — Simulated User Test (n=100)

*All figures below are model-estimated from 100 simulated personas (~60 farms / 40 buyers), not measured from live users. Treat them as directional signal, not ground truth.*

## Headline numbers

| Metric | Value |
|---|---|
| Signed up | 99% |
| Proposed/closed a first contract | 33% |
| Used the supply-chain board | 39% |
| Avg first session | 19 min |
| Avg sessions, week 1 | 2.8 |
| Est. 30-day return | 26.7% |
| Retained (still active) | 10 of 100 |
| NPS | **-79** (avg raw score 5.4/10) |

The story in one line: people sign up, spend a real 19 minutes poking around, propose maybe one contract — then leave. A -79 NPS with a 5.4 average means almost nobody is a promoter and almost everybody is a passive-to-detractor "nice idea, not yet." Engagement is shallow (2.8 sessions) and retention craters to ~27% by day 30, with only 10% genuinely sticking.

## Farms vs Buyers — where they diverge

| Metric | Farms (60) | Buyers (40) |
|---|---|---|
| First contract | 28.3% | **40%** |
| Used board | **46.7%** | 27.5% |
| First session | 19.4 min | 18.4 min |
| 30-day return | 27.1% | 26.1% |
| NPS | -77 | **-82** |

- **Buyers propose contracts more (40% vs 28%)** but rate the product worse (-82 vs -77). They show up with intent, find the farm side thin, and bounce harder. Buyers are the more disappointed, more demanding segment.
- **Farms engage with the board far more (47% vs 28%)** — yet most still don't understand why it exists. Higher usage, not higher comprehension.
- Sessions, session length, and 30-day return are essentially identical across segments. The divergence is in *intent and disappointment*, not raw activity.

Both segments converge on the exact same two complaints: no money moves through the platform, and there's nobody on the other side in their metro.

## The retention story

**Who stays (the 10%):** tech-comfortable, app-native early adopters and values-driven buyers — the mushroom micro-grower (NPS 7, 55% return), the growth-hungry sweet-corn farmer (45%), the new-American restaurant group (40%). They love the contract model itself and will "keep poking at it." They are explicitly waiting, not committed: every retained persona conditions their return on payments shipping and the marketplace filling up.

**Who churns (the 90%):** low-tech farmers, burned skeptics, handshake-deal buyers, and anyone time-poor. Personas with prior ag-startup burns (NPS 4, 15% return) and low-tech growers drop fastest.

**Exactly where they drop off:**
1. **After proposing one contract** — board feels like overkill, buyer inbox stays silent, logins taper by day 5. *(most common path)*
2. **At Discover/Matches** — opened expecting local restaurants/grocers, found a thin or empty metro, nobody to propose to.
3. **At the negotiation / term-diff step** — overwhelmed by contract terms (bands, cadence, opt-out, min cycles), never reached sample or board.
4. **Realizing no money flows** — even those who propose a contract conclude the deal has to finish off-app, so why stay.
5. A few never finish sign-up at all.

The pattern: the funnel dies at *first proposal* because there's no counterparty to respond and no payment to make it real. Cold-start + no escrow = no second week.

## Top missing features (ranked, synonyms merged)

1. **Payments / escrow inside the platform** — *by far #1, both segments.* ~15+ mentions. "Without money moving through it, the contract is just a fancy handshake I still have to enforce offline." Farms want to get paid and stop chasing invoices; buyers ask "what am I even signing?"
2. **Liquidity — real counterparties in my metro** — *both segments, ~10 mentions.* Farms see thin match lists; buyers see "too few local listings to bother." A marketplace with no counterparties is useless.
3. **Native mobile app** — *both, ~6 mentions.* "I run my farm/cafe/sourcing from my phone, not a laptop."
4. **Aggregation of small farms into one order** — *buyers especially, also small farms.* Farm-to-table buyers rarely fill volume from one farm; small growers want to bundle up to land bigger orders.
5. **A human to talk to / phone onboarding** — *both, low-tech skew.* "I won't self-serve through forms." "I want to just call the farmer like a human, not a term-diff."
6. **Demand/season planning + simple surplus handling** — *farms.* Commit acres in winter, not July; handle small/surplus volume without months-long cycles.

## Biggest points of confusion

1. **The Cmd-K command palette** — top confusion (3 mentions). "Meant nothing to me." Pure dev-tool intrusion for farmers and cafe owners.
2. **Contract term overload** — quantity bands, cadence, opt-out windows, minimum cycles thrown at once (multiple mentions). "Contract-lawyer talk." "Just tell me a number and a price."
3. **The drag-and-drop supply-chain board** — "looked like an engineering diagram / project-management software; I didn't know why I'd need it. I just grow tomatoes."
4. **Is this legally binding?** — repeated. With no payment, signatures, or escrow, nobody knows if the contract is real or "a pretty PDF I download."
5. **Courier / Uber Direct "quote only"** — unclear cost and who actually shows up to move the goods.
6. **Marketplace vs contract tool** — "took me a bit to get that it's contract-first, not spot sales."
7. **Trust in an empty marketplace** — "how do I trust reliability scores when it looks new and empty?"

## The 5 changes that would most move retention

1. **Ship real payments/escrow.** This is the #1 missing feature *and* a top confusion *and* a named drop-off cause. Until money moves through the platform, every contract is a "fancy handshake" and there's no reason to stay on-app. Nothing else matters as much.
2. **Solve cold-start liquidity per metro.** Seed and concentrate supply/demand in a few metros instead of spreading thin nationally. Show buyers real local farms and farms real local buyers, or gate sign-ups by metro readiness. An empty match list kills the first session.
3. **Make the board optional and hide it by default.** ~half of farms open it and most don't understand it. It reads as engineering software. Move contract proposal onto a simple linear flow; surface the board only for power users who want it.
4. **Cut contract terms down to a progressive first step.** Quantity bands + cadence + opt-out + min cycles in one shot overwhelms first listings. Start with "produce, quantity, price, how often" — reveal advanced terms later. Kill the Cmd-K palette for these users.
5. **Add a human/phone path and a mobile app.** Low-tech farmers and burned skeptics explicitly refuse to self-serve. A "talk to a real person" onboarding option plus a phone-first experience captures the segment that runs their business from the field, not a laptop.

(Aggregation of small farms into bundled orders is the strong #6 — it directly unlocks buyer volume and is worth fast-following.)

## What's working — don't bury it

The contract model itself genuinely lands. Across nearly every verdict, even the detractors, the same praise repeats: "smartest contract terms I've seen for farming," "actually understands how farming works." The crop-failure clause, reliability/CropScore reputation, and Comfort Mode earn real goodwill — Comfort Mode repeatedly buys ten minutes of trust from skeptical, low-tech, older users who distrust apps on principle. The product is polished ("slick," "pretty and thoughtful"), and the people who get it (app-native specialty growers, values-driven restaurant groups) are ready to make it their sales backbone. The core insight is validated. The product is a beautiful, trusted *demo* that nobody can transact on yet. Close the payments-and-liquidity gap and the same users who churned told you exactly what they'd do: come back.