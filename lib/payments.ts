import { supabase } from "@/lib/supabase";

async function authHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

/** Farm: begin Stripe Connect onboarding. Returns { url } to redirect to. */
export async function startStripeConnect(): Promise<{ url?: string; error?: string }> {
    const r = await fetch("/api/stripe/connect", { method: "POST", headers: await authHeaders() });
    return r.json();
}

export async function getPayoutStatus(): Promise<{ enabled: boolean; connected: boolean; payouts_enabled: boolean }> {
    const r = await fetch("/api/stripe/connect", { headers: await authHeaders() });
    if (!r.ok) return { enabled: false, connected: false, payouts_enabled: false };
    return r.json();
}

/** Buyer: fund a delivery into escrow. Returns { url } (Stripe Checkout) to redirect to. */
export async function fundDelivery(deliveryId: string): Promise<{ url?: string; error?: string }> {
    const r = await fetch("/api/stripe/fund-delivery", {
        method: "POST",
        headers: { ...(await authHeaders()), "content-type": "application/json" },
        body: JSON.stringify({ delivery_id: deliveryId }),
    });
    return r.json();
}

/** Release escrow to the farm (called when a delivery is confirmed). */
export async function releaseDelivery(deliveryId: string): Promise<{ released?: boolean; error?: string }> {
    const r = await fetch("/api/stripe/release-delivery", {
        method: "POST",
        headers: { ...(await authHeaders()), "content-type": "application/json" },
        body: JSON.stringify({ delivery_id: deliveryId }),
    });
    return r.json();
}
