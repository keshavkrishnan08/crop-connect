import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';

/**
 * Resolve a dispute. Admin decides: refund the buyer or release funds to farmer.
 * POST { orderId, resolution: 'refund' | 'release', adminNote }
 */
export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req);
        if (auth.error) return auth.error;

        // Verify admin role
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', auth.user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can resolve disputes' }, { status: 403 });
        }

        const { orderId, resolution, adminNote } = await req.json();

        if (!orderId || !resolution) {
            return NextResponse.json({ error: 'Missing orderId or resolution' }, { status: 400 });
        }

        if (!['refund', 'release'].includes(resolution)) {
            return NextResponse.json({ error: 'Resolution must be "refund" or "release"' }, { status: 400 });
        }

        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('escrow_status', 'disputed')
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Disputed order not found' }, { status: 404 });
        }

        const now = new Date().toISOString();

        if (resolution === 'refund') {
            if (!order.stripe_payment_intent_id) {
                return NextResponse.json({ error: 'No payment to refund' }, { status: 400 });
            }

            await stripe.refunds.create({
                payment_intent: order.stripe_payment_intent_id,
            }, {
                idempotencyKey: `dispute-refund-${orderId}`,
            });

            await supabaseAdmin
                .from('orders')
                .update({
                    status: 'refunded',
                    escrow_status: 'refunded',
                    dispute_resolved_at: now,
                    dispute_resolution: 'refund',
                    dispute_admin_note: adminNote || null,
                    updated_at: now,
                })
                .eq('id', orderId);

            await supabaseAdmin.from('order_updates').insert({
                order_id: orderId,
                update_type: 'custom',
                message: `Dispute resolved — full refund issued to buyer.${adminNote ? ` Note: ${adminNote}` : ''}`,
                created_by: auth.user.id,
            });
        } else {
            // Release funds to farmer
            const { data: farmer } = await supabaseAdmin
                .from('profiles')
                .select('stripe_account_id')
                .eq('id', order.farmer_id)
                .single();

            if (!farmer?.stripe_account_id) {
                return NextResponse.json({ error: 'Farmer Stripe account not found' }, { status: 400 });
            }

            const payoutCents = Math.round((order.farmer_payout_amount || order.total_price * 0.95) * 100);

            const transfer = await stripe.transfers.create({
                amount: payoutCents,
                currency: 'usd',
                destination: farmer.stripe_account_id,
                metadata: { order_id: orderId, dispute_resolved: 'true' },
            }, {
                idempotencyKey: `dispute-release-${orderId}`,
            });

            await supabaseAdmin
                .from('orders')
                .update({
                    status: 'funds_released',
                    escrow_status: 'funds_released',
                    stripe_transfer_id: transfer.id,
                    dispute_resolved_at: now,
                    dispute_resolution: 'release',
                    dispute_admin_note: adminNote || null,
                    funds_released_at: now,
                    updated_at: now,
                })
                .eq('id', orderId);

            await supabaseAdmin.from('order_updates').insert({
                order_id: orderId,
                update_type: 'custom',
                message: `Dispute resolved — funds released to farmer.${adminNote ? ` Note: ${adminNote}` : ''}`,
                created_by: auth.user.id,
            });
        }

        return NextResponse.json({ success: true, resolution });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Dispute resolve error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
