# Farm-Facing Interface — Spec

This is the **supply side** of CropConnect, to be built as a separate interface (a farm logs in and sees this). The restaurant-facing app is built *as if* this exists; everything below is the real counterpart that makes those flows two-sided. Capture, don't build yet.

The shared spine is the same `SourcingItem` / `LOI` / `Delivery` / `SupplyUpdate` model — the farm app reads and writes the same records, just from the other party's point of view.

---

## 1. Farm onboarding & vetting
A farm cannot transact until it is **vetted and approved**.

- **Apply**: farm profile (name, farmer, location, acreage, crops, growing practices, story, photos).
- **Compliance uploads**: GAP / Harmonized food-safety audit, liability insurance **COI**, business license, organic / Naturally Grown certificates. Each with an **expiration date** tracked by the system.
- **Payout KYC**: Stripe Connect onboarding (bank account, tax ID, W-9) so the farm can be paid.
- **Review & approve**: CropConnect (or an automated check + human) approves → farm gets a **"Vetted" badge** with the cert set behind it. Expired docs auto-suspend the farm from new matches.
- Restaurant-facing counterpart: the "Vetted" badge and the due-diligence tab read these records.

## 2. Catalog & availability (posted, in advance)
Pricing is **not negotiated** — farms publish it up front.

- **Posted price list** per crop (per unit). This is the fixed rate restaurants see.
- **Availability calendar**: what crops are available, in what weeks (seasonality), and **how much weekly capacity is free** vs already committed.
- **Capacity reservation**: when a contract is signed, that volume is **blocked** on the farm's calendar so it can't be double-sold.
- Restaurant-facing counterpart: matching uses real availability + posted price; the contract price comes straight from here.

## 3. Incoming requests → accept / decline / counter
When the agent matches a request, the farm sees it and must respond.

- **Request inbox**: crop, volume/week, term, requested quality specs, start date, the restaurant (anonymized until accepted, optional).
- **Capacity check**: system shows whether the farm has the free capacity; farm confirms or proposes a **partial fill** (which triggers fractional allocation across farms on the restaurant side).
- **Spec confirmation**: farm confirms it can meet each requested spec (organic, Grade No. 1, cold-chain, etc.) — some specs a farm may not offer.
- **Respond**: **Accept** (at posted terms), **Counter** (volume or start date only — never price), or **Decline**.
- Restaurant-facing counterpart: the contract's "Farm accepted / confirmed availability" state and the supply timeline reflect this.

## 4. Contract execution (two-sided signature)
- Farm reviews the LOI (price fixed, specs + term + transport + schedule).
- **Farm counter-signs** after the restaurant signs → contract is **executed**, gets a reference number, both parties hold a copy (PDF/record).
- **Amendments**: mid-contract changes (volume, specs, day) are proposed by either side and require the other to accept → a new contract **version** with full history.
- Restaurant-facing counterpart: dual signatures + contract ref + version history.

## 5. Weekly fulfillment (the farm's loop)
- **Harvest confirmation**: before each drop the farm confirms the week's harvest is on track, or **flags a shortfall early** (→ agent reroutes to a backup farm on the restaurant side).
- **Pack & QC at source**: farm marks packed, runs the spec checklist, photographs.
- **Dispatch / handoff**: farm hands to the courier (or restaurant pickup); status → in transit with ETA.
- Each of these writes a **SupplyUpdate** the restaurant sees live.

## 6. Money (payouts)
- **Escrow**: the restaurant's payment for each delivery is held in escrow and **released to the farm only after the restaurant confirms receipt** (photo + QC).
- **Payout schedule**: confirmed deliveries → payout to the farm's connected account.
- **Statements & 1099**: monthly statement of deliveries, releases, fees; year-end 1099.
- **Disputes**: if a restaurant rejects a drop, escrow holds; resolution (credit / partial / replacement) before release.

## 7. Messaging & ratings
- **Per-contract thread** with the restaurant, mediated by the agent (the same `loi.log` thread).
- **Performance scorecard**: fill rate, on-time %, QC pass rate → feeds the farm's public rating; repeated QC fails → strikes → suspension.

---

## Build order when the farm app is built
1. Onboarding + vetting + payout KYC (gates everything).
2. Catalog + availability calendar + capacity reservation.
3. Request inbox + accept/counter/decline.
4. Two-sided execution + amendments.
5. Weekly harvest-confirm / shortfall-flag / dispatch.
6. Payouts + statements + disputes.
7. Messaging + scorecard.

Until then, the restaurant app **simulates the farm's responses** (auto-accept at posted terms, counter-signature, harvest confirmations, the occasional handled delay) so the restaurant experience is complete and two-sided.
