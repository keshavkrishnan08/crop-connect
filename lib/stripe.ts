import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Server-side Stripe client. Returns null when STRIPE_SECRET_KEY is absent. */
export function stripe(): Stripe | null {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion });
    return _stripe;
}

export function stripeEnabled(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
}

/** Platform fee taken on each escrow release (the marketplace's cut). */
export const PLATFORM_FEE_PCT = 0.05;

export function platformFeeCents(amountCents: number): number {
    return Math.round(amountCents * PLATFORM_FEE_PCT);
}

export function appUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
