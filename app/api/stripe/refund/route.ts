import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireVerifiedAuth } from '@/lib/api-auth';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        const rateLimited = checkRateLimit(getClientIP(req), 'refund', 'payment');
        if (rateLimited) return rateLimited;

        const auth = await requireVerifiedAuth(req);
        if (auth.error) return auth.error;

        const { orderId } = await req.json();
        const buyerId = auth.user.id;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('buyer_id', buyerId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Can refund if funds are held or disputed
        const refundableStatuses = ['funds_held', 'disputed'];
        if (!refundableStatuses.includes(order.escrow_status || '')) {
            return NextResponse.json(
                { error: `Cannot refund — current escrow status is "${order.escrow_status}"` },
                { status: 400 }
            );
        }

        if (!order.stripe_payment_intent_id) {
            return NextResponse.json({ error: 'No payment to refund' }, { status: 400 });
        }

        // Issue full refund via Stripe
        let refund;
        try {
            refund = await stripe.refunds.create({
                payment_intent: order.stripe_payment_intent_id,
            }, {
                idempotencyKey: `refund-${orderId}`,
            });
        } catch (refundErr) {
            console.error('[refund] Stripe refund failed:', refundErr);
            return NextResponse.json(
                { error: 'Failed to process refund with payment provider' },
                { status: 500 }
            );
        }

        const now = new Date().toISOString();

        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                status: 'refunded',
                escrow_status: 'refunded',
                stripe_refund_id: refund.id,
                auto_release_at: null,
                updated_at: now,
            })
            .eq('id', orderId);

        if (updateError) {
            console.error('[refund] Order update failed:', updateError);
            // Refund succeeded but order not updated - log for monitoring
        }

        return NextResponse.json({ success: true, refundId: refund.id });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Refund error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
