import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

// Disable body parsing — we need the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid signature';
        console.error('Webhook signature verification failed:', message);
        return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata.order_id;

                if (orderId) {
                    await supabaseAdmin
                        .from('orders')
                        .update({
                            status: 'funds_held',
                            escrow_status: 'funds_held',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', orderId)
                        .eq('stripe_payment_intent_id', paymentIntent.id);
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata.order_id;

                if (orderId) {
                    await supabaseAdmin
                        .from('orders')
                        .update({
                            status: 'payment_failed',
                            escrow_status: 'payment_failed',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', orderId)
                        .eq('stripe_payment_intent_id', paymentIntent.id);
                }
                break;
            }

            case 'account.updated': {
                const account = event.data.object as Stripe.Account;
                if (account.details_submitted) {
                    await supabaseAdmin
                        .from('profiles')
                        .update({ stripe_onboarding_complete: true })
                        .eq('stripe_account_id', account.id);
                }
                break;
            }

            case 'charge.dispute.created': {
                // Stripe-level chargeback — freeze order and flag as disputed
                const dispute = event.data.object as Stripe.Dispute;
                const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
                if (chargeId) {
                    const charge = await stripe.charges.retrieve(chargeId);
                    const piId = typeof charge.payment_intent === 'string'
                        ? charge.payment_intent
                        : charge.payment_intent?.id;

                    if (piId) {
                        const now = new Date().toISOString();
                        await supabaseAdmin
                            .from('orders')
                            .update({
                                status: 'disputed',
                                escrow_status: 'disputed',
                                dispute_reason: `Stripe chargeback: ${dispute.reason || 'unknown'}`,
                                dispute_created_at: now,
                                auto_release_at: null,
                                updated_at: now,
                            })
                            .eq('stripe_payment_intent_id', piId);
                    }
                }
                break;
            }

            case 'charge.dispute.closed': {
                const dispute = event.data.object as Stripe.Dispute;
                const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
                if (chargeId) {
                    const charge = await stripe.charges.retrieve(chargeId);
                    const piId = typeof charge.payment_intent === 'string'
                        ? charge.payment_intent
                        : charge.payment_intent?.id;

                    if (piId) {
                        const now = new Date().toISOString();
                        const won = dispute.status === 'won';
                        await supabaseAdmin
                            .from('orders')
                            .update({
                                dispute_resolved_at: now,
                                dispute_resolution: won ? 'chargeback_won' : 'chargeback_lost',
                                dispute_admin_note: `Stripe chargeback ${won ? 'won (funds retained)' : 'lost (funds returned to cardholder)'}`,
                                // If merchant lost, mark as refunded
                                ...(won ? {} : { status: 'refunded', escrow_status: 'refunded' }),
                                updated_at: now,
                            })
                            .eq('stripe_payment_intent_id', piId);
                    }
                }
                break;
            }

            case 'charge.refunded': {
                // Confirm refund processed — update order if not already marked
                const charge = event.data.object as Stripe.Charge;
                const piId = typeof charge.payment_intent === 'string'
                    ? charge.payment_intent
                    : charge.payment_intent?.id;

                if (piId && charge.refunded) {
                    await supabaseAdmin
                        .from('orders')
                        .update({
                            status: 'refunded',
                            escrow_status: 'refunded',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('stripe_payment_intent_id', piId)
                        .neq('escrow_status', 'refunded'); // only if not already refunded
                }
                break;
            }
        }

        // Handle events not in Stripe's typed union (e.g. Connect events)
        if ((event.type as string) === 'transfer.failed') {
            const transfer = (event.data as { object: Stripe.Transfer }).object;
            const orderId = transfer.metadata?.order_id;
            if (orderId) {
                console.error(`[webhook] Transfer failed for order ${orderId}: ${transfer.id}`);
                const now = new Date().toISOString();
                await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'funds_held',
                        escrow_status: 'funds_held',
                        stripe_transfer_id: null,
                        funds_released_at: null,
                        updated_at: now,
                    })
                    .eq('id', orderId)
                    .eq('escrow_status', 'funds_released');

                await supabaseAdmin.from('order_updates').insert({
                    order_id: orderId,
                    update_type: 'custom',
                    message: 'Farmer payout failed — funds returned to escrow. Our team is investigating.',
                    created_by: null,
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error('Webhook handler error:', err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
