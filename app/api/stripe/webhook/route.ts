import { NextResponse } from "next/server";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

/** Stripe webhook — marks a delivery's escrow as funded once checkout completes. */
export async function POST(req: Request) {
    if (!stripeEnabled()) return NextResponse.json({ error: "not configured" }, { status: 503 });
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;
    try {
        if (!secret || !sig) throw new Error("missing signature");
        event = stripe()!.webhooks.constructEvent(body, sig, secret);
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const deliveryId = session.metadata?.delivery_id;
        if (deliveryId) {
            try {
                await supabaseAdmin.from("deliveries").update({
                    payment_status: "funded",
                    stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
                }).eq("id", deliveryId);
            } catch {
                // service-role key not set — funding state will need manual reconciliation
                return NextResponse.json({ received: true, warning: "admin client unavailable" });
            }
        }
    }

    return NextResponse.json({ received: true });
}
