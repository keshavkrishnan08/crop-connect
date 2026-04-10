import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { DISPUTE_TIMEOUT_DAYS } from '@/lib/stripe';

/**
 * Auto-resolve stale disputes. Disputes older than 14 days with no admin action
 * are automatically refunded to the buyer (buyer-favorable default).
 *
 * Call via Vercel Cron daily.
 */
export async function GET(req: NextRequest) {
    return handleAutoResolveDisputes(req);
}

export async function POST(req: NextRequest) {
    return handleAutoResolveDisputes(req);
}

async function handleAutoResolveDisputes(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const cutoff = new Date(now.getTime() - DISPUTE_TIMEOUT_DAYS * 24 * 60 * 60 * 1000).toISOString();

        const { data: staleDisputes, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('id, stripe_payment_intent_id, buyer_id, farmer_id, dispute_created_at')
            .eq('escrow_status', 'disputed')
            .lte('dispute_created_at', cutoff);

        if (fetchError) throw fetchError;

        let processed = 0;
        const errors: string[] = [];

        for (const order of staleDisputes || []) {
            try {
                if (order.stripe_payment_intent_id) {
                    await stripe.refunds.create({
                        payment_intent: order.stripe_payment_intent_id,
                    }, {
                        idempotencyKey: `auto-dispute-refund-${order.id}`,
                    });
                }

                await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'refunded',
                        escrow_status: 'refunded',
                        dispute_resolved_at: now.toISOString(),
                        dispute_resolution: 'auto_refund',
                        dispute_admin_note: `Auto-refunded after ${DISPUTE_TIMEOUT_DAYS} days with no resolution`,
                        updated_at: now.toISOString(),
                    })
                    .eq('id', order.id)
                    .eq('escrow_status', 'disputed'); // guard against race

                await supabaseAdmin.from('order_updates').insert({
                    order_id: order.id,
                    update_type: 'custom',
                    message: `Dispute auto-resolved after ${DISPUTE_TIMEOUT_DAYS} days — buyer refunded.`,
                    created_by: null,
                });

                processed++;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                errors.push(`Order ${order.id}: ${msg}`);
            }
        }

        return NextResponse.json({
            processed,
            total: staleDisputes?.length || 0,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Auto-resolve disputes error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
