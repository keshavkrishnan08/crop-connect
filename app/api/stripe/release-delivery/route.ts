import { NextResponse } from "next/server";
import { stripe, stripeEnabled, platformFeeCents } from "@/lib/stripe";
import { authedClient } from "@/lib/api-auth";

export const runtime = "nodejs";

/** Release escrow to the farm (amount minus platform fee) once a delivery is confirmed. */
export async function POST(req: Request) {
    if (!stripeEnabled()) return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
    const auth = await authedClient(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { delivery_id } = await req.json().catch(() => ({}));
    if (!delivery_id) return NextResponse.json({ error: "Missing delivery_id" }, { status: 400 });

    const { data: delivery } = await auth.db
        .from("deliveries")
        .select("id, amount_cents, payment_status, contract:contracts!inner(id, farm_id, buyer_id)")
        .eq("id", delivery_id)
        .single();
    if (!delivery) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const contract = (delivery as unknown as { contract: { farm_id: string; buyer_id: string } }).contract;
    if (auth.userId !== contract.farm_id && auth.userId !== contract.buyer_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (delivery.payment_status !== "funded") return NextResponse.json({ error: "Not funded" }, { status: 409 });

    // farm's connected account (profiles are publicly readable)
    const { data: farm } = await auth.db.from("profiles").select("stripe_account_id").eq("id", contract.farm_id).single();
    if (!farm?.stripe_account_id) return NextResponse.json({ error: "Farm hasn't connected payouts" }, { status: 409 });

    const amount = delivery.amount_cents as number;
    const fee = platformFeeCents(amount);
    const transfer = await stripe()!.transfers.create({
        amount: amount - fee,
        currency: "usd",
        destination: farm.stripe_account_id,
        metadata: { delivery_id },
    });

    await auth.db.from("deliveries").update({ payment_status: "released", stripe_transfer: transfer.id }).eq("id", delivery_id);
    return NextResponse.json({ released: true, net_cents: amount - fee, fee_cents: fee });
}
