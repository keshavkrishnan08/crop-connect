import { NextResponse } from "next/server";
import { stripe, stripeEnabled, appUrl } from "@/lib/stripe";
import { authedClient } from "@/lib/api-auth";

export const runtime = "nodejs";

/** Start (or resume) Stripe Connect Express onboarding for a farm. */
export async function POST(req: Request) {
    if (!stripeEnabled()) return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
    const auth = await authedClient(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const s = stripe()!;

    const { data: profile } = await auth.db.from("profiles").select("stripe_account_id, email").eq("id", auth.userId).single();
    let account = profile?.stripe_account_id as string | null;

    if (!account) {
        const created = await s.accounts.create({
            type: "express",
            email: profile?.email ?? undefined,
            capabilities: { transfers: { requested: true } },
        });
        account = created.id;
        await auth.db.from("profiles").update({ stripe_account_id: account }).eq("id", auth.userId);
    }

    const link = await s.accountLinks.create({
        account,
        refresh_url: `${appUrl()}/app/profile`,
        return_url: `${appUrl()}/app/profile`,
        type: "account_onboarding",
    });
    return NextResponse.json({ url: link.url });
}

/** Report whether the farm can receive payouts. */
export async function GET(req: Request) {
    if (!stripeEnabled()) return NextResponse.json({ enabled: false, connected: false, payouts_enabled: false });
    const auth = await authedClient(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await auth.db.from("profiles").select("stripe_account_id").eq("id", auth.userId).single();
    if (!profile?.stripe_account_id) return NextResponse.json({ enabled: true, connected: false, payouts_enabled: false });

    const acct = await stripe()!.accounts.retrieve(profile.stripe_account_id);
    const payouts = !!(acct.payouts_enabled && acct.charges_enabled);
    await auth.db.from("profiles").update({ stripe_payouts_enabled: payouts }).eq("id", auth.userId);
    return NextResponse.json({ enabled: true, connected: true, payouts_enabled: payouts });
}
