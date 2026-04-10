import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Processes orders past their auto-release date.
 * Call this endpoint via a cron job (e.g., Vercel Cron, Supabase pg_cron).
 */
// Vercel Cron sends GET requests
export async function GET(req: NextRequest) {
    return handleAutoRelease(req);
}

export async function POST(req: NextRequest) {
    return handleAutoRelease(req);
}

async function handleAutoRelease(req: NextRequest) {
    try {
        // Optional: verify a shared secret for cron security
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date().toISOString();

        // Find all orders past their auto-release date
        const { data: orders, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('escrow_status', 'shipped_awaiting_confirmation')
            .not('auto_release_at', 'is', null)
            .lte('auto_release_at', now);

        if (fetchError) throw fetchError;

        if (!orders || orders.length === 0) {
            return NextResponse.json({ processed: 0 });
        }

        let processed = 0;
        const errors: string[] = [];

        for (const order of orders) {
            try {
                // Get farmer's Stripe account
                const { data: farmer } = await supabaseAdmin
                    .from('profiles')
                    .select('stripe_account_id')
                    .eq('id', order.farmer_id)
                    .single();

                if (!farmer?.stripe_account_id) {
                    errors.push(`Order ${order.id}: farmer has no Stripe account`);
                    continue;
                }

                const payoutCents = Math.round((order.farmer_payout_amount || order.total_price * 0.95) * 100);

                const transfer = await stripe.transfers.create({
                    amount: payoutCents,
                    currency: 'usd',
                    destination: farmer.stripe_account_id,
                    metadata: {
                        order_id: order.id,
                        farmer_id: order.farmer_id,
                        auto_released: 'true',
                    },
                }, {
                    idempotencyKey: `auto-release-${order.id}`,
                });

                await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'funds_released',
                        escrow_status: 'funds_released',
                        stripe_transfer_id: transfer.id,
                        funds_released_at: now,
                        auto_release_at: null,
                        updated_at: now,
                    })
                    .eq('id', order.id);

                processed++;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                errors.push(`Order ${order.id}: ${message}`);
            }
        }

        return NextResponse.json({
            processed,
            total: orders.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Auto-release error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
