import { NextRequest, NextResponse } from 'next/server';
import { stripe, calculateFees } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireVerifiedAuth } from '@/lib/api-auth';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        // Rate limit
        const rateLimited = checkRateLimit(getClientIP(req), 'create-payment', 'payment');
        if (rateLimited) return rateLimited;

        // Require verified email for financial operations
        const auth = await requireVerifiedAuth(req);
        if (auth.error) return auth.error;

        const { orderId } = await req.json();
        const buyerId = auth.user.id;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        // Fetch order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('buyer_id', buyerId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Block self-dealing: buyer cannot be the farmer
        if (order.farmer_id === buyerId) {
            return NextResponse.json(
                { error: 'You cannot purchase your own listing' },
                { status: 403 }
            );
        }

        // Validate order amount against listing
        if (order.listing_id) {
            const { data: listing } = await supabaseAdmin
                .from('listings')
                .select('price_per_unit, quantity')
                .eq('id', order.listing_id)
                .single();

            if (listing) {
                const expectedTotal = listing.price_per_unit * order.quantity;
                const tolerance = 0.01; // Allow 1 cent rounding
                if (Math.abs(order.total_price - expectedTotal) > tolerance) {
                    return NextResponse.json(
                        { error: 'Order amount does not match listing price. Please try again.' },
                        { status: 400 }
                    );
                }
                if (order.quantity > listing.quantity) {
                    return NextResponse.json(
                        { error: 'Requested quantity exceeds available stock' },
                        { status: 400 }
                    );
                }
            }
        }

        if (order.stripe_payment_intent_id) {
            const existing = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
            if (existing.status !== 'canceled') {
                return NextResponse.json({ clientSecret: existing.client_secret });
            }
        }

        // Get farmer's Stripe account
        const { data: farmer, error: farmerError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_account_id, stripe_onboarding_complete')
            .eq('id', order.farmer_id)
            .single();

        if (farmerError || !farmer?.stripe_account_id || !farmer?.stripe_onboarding_complete) {
            return NextResponse.json(
                { error: 'Farmer has not set up their payment account yet' },
                { status: 400 }
            );
        }

        const { platformFee, farmerPayout } = calculateFees(order.total_price);
        const amountInCents = Math.round(order.total_price * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: {
                order_id: orderId,
                buyer_id: buyerId,
                farmer_id: order.farmer_id,
                farmer_stripe_account: farmer.stripe_account_id,
            },
            automatic_payment_methods: { enabled: true },
        }, {
            idempotencyKey: `create-pi-${orderId}`,
        });

        await supabaseAdmin
            .from('orders')
            .update({
                stripe_payment_intent_id: paymentIntent.id,
                platform_fee_amount: platformFee,
                farmer_payout_amount: farmerPayout,
                status: 'awaiting_payment',
                escrow_status: 'awaiting_payment',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Create payment error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
