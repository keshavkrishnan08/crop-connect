# CropConnect — Setup

Contract-based local-supply platform. Farms and wholesale buyers agree to committed
quantities, prices and delivery cadences over a term; the app drafts the agreement,
visualizes the supply chain on an editable board, and tracks deliveries and renewals.

## 1. Apply the database schema (once)

Open your Supabase project → **SQL Editor** → paste the entire contents of
[`supabase/schema.sql`](./supabase/schema.sql) → **Run**. It is idempotent (safe to re-run).

This creates every table, RLS policy, the auto-profile trigger, and realtime publications.

## 2. Environment variables

`.env.local` already has the two public Supabase keys. For full functionality add:

```bash
# Required (already set)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional — unlocks real Claude contract drafting + match insight.
# Without it, the app falls back to a strong deterministic template (still fully functional).
ANTHROPIC_API_KEY=sk-ant-...
# ANTHROPIC_MODEL=claude-sonnet-4-6   # optional override

# Optional — only needed for server-side admin operations / future webhooks.
SUPABASE_SERVICE_ROLE_KEY=...

# Optional — connect a real local courier network for "CropConnect courier" delivery.
# Without these, the app shows a deterministic fee estimate (still fully usable).
# Wire these into lib/shipping.ts → providerQuote() (Uber Direct DaaS API).
UBER_DIRECT_CUSTOMER_ID=...
UBER_DIRECT_CLIENT_ID=...
UBER_DIRECT_CLIENT_SECRET=...

# Optional — real escrow payments via Stripe Connect.
# Without these, the contract still works; the per-delivery "Fund" button just reports
# payments aren't enabled. SUPABASE_SERVICE_ROLE_KEY is required for the webhook to mark
# a delivery funded.
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...            # from `stripe listen` or the dashboard webhook
NEXT_PUBLIC_APP_URL=http://localhost:3000  # used for Connect onboarding + Checkout return URLs
```

## Payments (Stripe Connect escrow)

1. Add the Stripe keys above + `SUPABASE_SERVICE_ROLE_KEY`.
2. Point a webhook at `POST /api/stripe/webhook` for the `checkout.session.completed` event
   (locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`).
3. Flow: a farm connects payouts (Stripe Connect Express) from an active contract → the buyer
   funds each delivery into escrow (Checkout) → confirming the delivery releases the funds to
   the farm minus a 5% platform fee.

## 3. Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Flow

1. **Sign up** → choose Farm or Buyer → onboarding.
2. **List** a supply offer (farm) or need (buyer).
3. **Discover** → AI-ranked matches → **Propose** a contract.
4. **Negotiate** — accept / counter / decline, with a visual term diff and version history.
5. Both confirm → contract goes **Active**: deliveries + the supply-chain board generate.
6. **Supply chain board** — drag steps, connect them, mark where the product is. Editable until close.
7. **Supply Hub** — every active contract's chain on one combined board.
8. **Renew** at term end. Renewal is the proof.

## Architecture

- `app/` — `/` landing, `(auth)/` login+signup, `app/` the authed product, `api/ai/` Claude routes.
- `components/ui` — glass design kit · `components/icons` — fully custom SVG set (no icon library).
- `components/visual` — SupplyChainBoard (custom canvas), DeliveryCalendar, ValueModel, LifecycleTracker, TermDiff.
- `components/contract` — TermsForm, ContractCard, ContractWorkspace, StatusBadge.
- `lib/` — `types`, `queries` (RLS-bound data access), `match` (rule-based ranking), `contract` (value/schedule/agreement), `auth`.
