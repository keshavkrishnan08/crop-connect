/**
 * Courier logistics for CropConnect.
 *
 * Two delivery methods per contract:
 *   • "farm"    — the farm delivers itself (free, off-platform).
 *   • "courier" — CropConnect arranges a local same-day courier and charges the
 *                 courier fee + a platform markup (our revenue).
 *
 * The estimator below is deterministic and works with zero config. To use a real
 * on-demand courier network, wire `providerQuote()` to Uber Direct (their open
 * Direct/DaaS API — best fit for local perishable produce in one metro) or an
 * aggregator like Nash/OrderOut. See the TODO in providerQuote().
 */

export interface CourierQuote {
    distanceKm: number | null;
    courierCents: number; // what the courier provider charges
    platformFeeCents: number; // CropConnect markup — our revenue
    totalCents: number; // what the buyer pays
    etaMins: number | null;
    source: "uber_direct" | "estimate";
}

const BASE_CENTS = 800; // $8 dispatch base
const PER_KM_CENTS = 120; // $1.20 / km
const MIN_CENTS = 1000; // $10 floor
const PLATFORM_MARKUP = 0.15; // 15% markup on top of courier cost
const ASSUMED_METRO_KM = 12; // when we don't have both coordinates

export function platformMarkupPct(): number {
    return Math.round(PLATFORM_MARKUP * 100);
}

/** Deterministic local-courier estimate — always available, no API key needed. */
export function estimateCourier(distanceKm: number | null): CourierQuote {
    const km = distanceKm ?? ASSUMED_METRO_KM;
    const courier = Math.max(MIN_CENTS, Math.round(BASE_CENTS + PER_KM_CENTS * km));
    const platform = Math.round(courier * PLATFORM_MARKUP);
    return {
        distanceKm,
        courierCents: courier,
        platformFeeCents: platform,
        totalCents: courier + platform,
        etaMins: km <= 15 ? 45 : km <= 40 ? 75 : 120,
        source: "estimate",
    };
}

/**
 * Real provider quote. Returns null unless a provider is configured, so callers
 * fall back to estimateCourier() and the product always works.
 *
 * TODO (Uber Direct): with UBER_DIRECT_CUSTOMER_ID / CLIENT_ID / CLIENT_SECRET,
 *   1) POST https://login.uber.com/oauth/v2/token  (grant_type=client_credentials,
 *      scope=eats.deliveries) → access_token
 *   2) POST https://api.uber.com/v1/customers/{customer_id}/delivery_quotes
 *      with pickup_address + dropoff_address → fee + duration
 * Then map the response into a CourierQuote (add our PLATFORM_MARKUP).
 */
export async function providerQuote(_args: {
    pickup: { lat: number | null; lng: number | null; label: string | null };
    dropoff: { lat: number | null; lng: number | null; label: string | null };
}): Promise<CourierQuote | null> {
    if (!process.env.UBER_DIRECT_CUSTOMER_ID) return null;
    // Intentionally not implemented without live credentials.
    return null;
}
