import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PAYMENT_TIMEOUT_HOURS, SHIP_TIMEOUT_DAYS } from '@/lib/stripe';

/**
 * Auto-cancel cron job. Handles two cases:
 * 1. Abandoned payments: awaiting_payment for >24h → cancel order + void payment intent
 * 2. Unshipped orders: funds_held for >3 days → refund buyer + cancel order
 *
 * Call via Vercel Cron every hour.
 */
export async function GET(req: NextRequest) {
    return handleAutoCancel(req);
}

export async function POST(req: NextRequest) {
    return handleAutoCancel(req);
}

async function handleAutoCancel(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const results = {
            abandonedPayments: { processed: 0, errors: [] as string[] },
            unshippedOrders: { processed: 0, errors: [] as string[] },
        };

        // --- 1. Cancel abandoned payments (awaiting_payment > 24h) ---
        const paymentCutoff = new Date(now.getTime() - PAYMENT_TIMEOUT_HOURS * 60 * 60 * 1000).toISOString();

        const { data: abandonedOrders, error: abandonedError } = await supabaseAdmin
            .from('orders')
            .select('id, stripe_payment_intent_id, updated_at')
            .eq('escrow_status', 'awaiting_payment')
            .lte('updated_at', paymentCutoff);

        if (abandonedError) throw abandonedError;

        for (const order of abandonedOrders || []) {
            try {
                // Void the payment intent if it exists
                if (order.stripe_payment_intent_id) {
                    try {
                        await stripe.paymentIntents.cancel(order.stripe_payment_intent_id, {}, {
                            idempotencyKey: `cancel-abandoned-${order.id}`,
                        });
                    } catch (stripeErr) {
                        // Payment intent may already be cancelled or succeeded — that's fine
                        console.warn(`[auto-cancel] Could not cancel PI for order ${order.id}:`, stripeErr);
                    }
                }

                await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'cancelled',
                        escrow_status: 'cancelled',
                        cancellation_reason: 'Payment not completed within 24 hours',
                        cancelled_at: now.toISOString(),
                        updated_at: now.toISOString(),
                    })
                    .eq('id', order.id)
                    .eq('escrow_status', 'awaiting_payment'); // guard against race

                await supabaseAdmin.from('order_updates').insert({
                    order_id: order.id,
                    update_type: 'custom',
                    message: 'Order automatically cancelled — payment not received within 24 hours.',
                    created_by: null,
                });

                results.abandonedPayments.processed++;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                results.abandonedPayments.errors.push(`Order ${order.id}: ${msg}`);
            }
        }

        // --- 2. Refund + cancel unshipped orders (funds_held > 3 days) ---
        const shipCutoff = new Date(now.getTime() - SHIP_TIMEOUT_DAYS * 24 * 60 * 60 * 1000).toISOString();

        const { data: unshippedOrders, error: unshippedError } = await supabaseAdmin
            .from('orders')
            .select('id, stripe_payment_intent_id, buyer_id, farmer_id, updated_at')
            .eq('escrow_status', 'funds_held')
            .lte('updated_at', shipCutoff);

        if (unshippedError) throw unshippedError;

        for (const order of unshippedOrders || []) {
            try {
                // Refund the buyer
                if (order.stripe_payment_intent_id) {
                    await stripe.refunds.create({
                        payment_intent: order.stripe_payment_intent_id,
                    }, {
                        idempotencyKey: `refund-unshipped-${order.id}`,
                    });
                }

                await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'cancelled',
                        escrow_status: 'cancelled',
                        cancellation_reason: 'Farmer did not ship within 3 days — buyer refunded',
                        cancelled_at: now.toISOString(),
                        updated_at: now.toISOString(),
                    })
                    .eq('id', order.id)
                    .eq('escrow_status', 'funds_held'); // guard against race

                await supabaseAdmin.from('order_updates').insert({
                    order_id: order.id,
                    update_type: 'custom',
                    message: 'Order automatically cancelled and refunded — seller did not ship within 3 days.',
                    created_by: null,
                });

                results.unshippedOrders.processed++;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                results.unshippedOrders.errors.push(`Order ${order.id}: ${msg}`);
            }
        }

        return NextResponse.json(results);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Auto-cancel cron error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
