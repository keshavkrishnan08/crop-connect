import { NextResponse } from "next/server";
import { stripe, stripeEnabled, appUrl } from "@/lib/stripe";
import { authedClient } from "@/lib/api-auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Buyer funds one delivery into escrow (held on the platform until release). */
export async function POST(req: Request) {
    if (!stripeEnabled()) return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
    if (!rateLimit(`fund:${clientKey(req)}`, 20).ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const auth = await authedClient(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { delivery_id } = await req.json().catch(() => ({}));
    if (!delivery_id) return NextResponse.json({ error: "Missing delivery_id" }, { status: 400 });

    // RLS ensures only a contract party can read this row
    const { data: delivery } = await auth.db
        .from("deliveries")
        .select("id, seq, quantity, declared_quantity, payment_status, contract:contracts!inner(id, buyer_id, terms)")
        .eq("id", delivery_id)
        .single();
    if (!delivery) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const contract = (delivery as unknown as { contract: { id: string; buyer_id: string; terms: { crop: string; unit_price_cents: number } } }).contract;
    if (contract.buyer_id !== auth.userId) return NextResponse.json({ error: "Only the buyer funds deliveries" }, { status: 403 });
    if (delivery.payment_status !== "unpaid") return NextResponse.json({ error: "Already funded" }, { status: 409 });

    const qty = (delivery.declared_quantity ?? delivery.quantity) as number;
    const amount = Math.max(50, Math.round(qty * contract.terms.unit_price_cents));

    const session = await stripe()!.checkout.sessions.create({
        mode: "payment",
        line_items: [{
            quantity: 1,
            price_data: {
                currency: "usd",
                unit_amount: amount,
                product_data: { name: `${contract.terms.crop} — delivery ${delivery.seq}` },
            },
        }],
        metadata: { delivery_id },
        success_url: `${appUrl()}/app/contracts/${contract.id}?paid=1`,
        cancel_url: `${appUrl()}/app/contracts/${contract.id}`,
    });

    await auth.db.from("deliveries").update({ amount_cents: amount }).eq("id", delivery_id);
    return NextResponse.json({ url: session.url });
}
