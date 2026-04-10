import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/** Lazily initialize Stripe to avoid build-time errors when env vars are missing */
export function getStripeServer(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('Missing STRIPE_SECRET_KEY environment variable');
        }
        _stripe = new Stripe(key);
    }
    return _stripe;
}

/** @deprecated Use getStripeServer() instead. Kept for convenience in API routes. */
export const stripe = new Proxy({} as Stripe, {
    get(_target, prop) {
        return (getStripeServer() as unknown as Record<string | symbol, unknown>)[prop];
    },
});

/** Platform fee percentage (5%) */
export const PLATFORM_FEE_PERCENT = 5;

/** Calculate platform fee and farmer payout from total */
export function calculateFees(totalAmount: number) {
    const platformFee = Math.round(totalAmount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
    const farmerPayout = Math.round((totalAmount - platformFee) * 100) / 100;
    return { platformFee, farmerPayout };
}

/** Days after shipping before auto-release of funds */
export const AUTO_RELEASE_DAYS = 7;

/** Hours before an unpaid order is auto-cancelled */
export const PAYMENT_TIMEOUT_HOURS = 24;

/** Days a farmer has to ship before order is auto-cancelled and buyer refunded */
export const SHIP_TIMEOUT_DAYS = 3;

/** Days before an unresolved dispute is auto-refunded to the buyer */
export const DISPUTE_TIMEOUT_DAYS = 14;
