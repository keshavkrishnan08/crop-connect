import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireVerifiedAuth } from '@/lib/api-auth';
import { recalculateAndSave } from '@/lib/cropscore';

export async function POST(req: NextRequest) {
    try {
        // Authenticate — only the buyer can release funds
        const auth = await requireVerifiedAuth(req);
        if (auth.error) return auth.error;

        const { orderId } = await req.json();
        const buyerId = auth.user.id;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        // Fetch the order and verify buyer ownership
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('buyer_id', buyerId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Validate — must be shipped_awaiting_confirmation
        if (order.escrow_status !== 'shipped_awaiting_confirmation') {
            return NextResponse.json(
                { error: `Cannot release funds — current escrow status is "${order.escrow_status}"` },
                { status: 400 }
            );
        }

        // Get farmer's Stripe account
        const { data: farmer } = await supabaseAdmin
            .from('profiles')
            .select('stripe_account_id')
            .eq('id', order.farmer_id)
            .single();

        if (!farmer?.stripe_account_id) {
            return NextResponse.json(
                { error: 'Farmer Stripe account not found' },
                { status: 400 }
            );
        }

        // Transfer funds to farmer (payout amount in cents)
        const payoutCents = Math.round((order.farmer_payout_amount || order.total_price * 0.95) * 100);

        let transfer;
        try {
            transfer = await stripe.transfers.create({
                amount: payoutCents,
                currency: 'usd',
                destination: farmer.stripe_account_id,
                metadata: {
                    order_id: orderId,
                    farmer_id: order.farmer_id,
                },
            }, {
                idempotencyKey: `release-${orderId}`,
            });
        } catch (transferErr) {
            console.error('[release-funds] Stripe transfer failed:', transferErr);
            return NextResponse.json(
                { error: 'Failed to transfer funds to farmer' },
                { status: 500 }
            );
        }

        const now = new Date().toISOString();

        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                status: 'funds_released',
                escrow_status: 'funds_released',
                stripe_transfer_id: transfer.id,
                buyer_confirmed_at: buyerId ? now : order.buyer_confirmed_at,
                funds_released_at: now,
                auto_release_at: null,
                updated_at: now,
            })
            .eq('id', orderId);

        if (updateError) {
            console.error('[release-funds] Order update failed:', updateError);
            // Note: Transfer already succeeded, so we continue but log the error
        }

        // Auto-create order update
        const { error: insertError } = await supabaseAdmin
            .from('order_updates')
            .insert({
                order_id: orderId,
                update_type: 'delivered',
                message: 'Delivery confirmed and funds released to farmer.',
                created_by: buyerId,
            });

        if (insertError) {
            console.error('[release-funds] Order update insert failed:', insertError);
        }

        // Background: recalculate CropScore for both parties (log errors but don't fail request)
        recalculateAndSave(buyerId).catch(err =>
            console.error('[release-funds] CropScore recalc failed for buyer:', err)
        );
        recalculateAndSave(order.farmer_id).catch(err =>
            console.error('[release-funds] CropScore recalc failed for farmer:', err)
        );

        return NextResponse.json({ success: true, transferId: transfer.id });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Release funds error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
