import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AUTO_RELEASE_DAYS } from '@/lib/stripe';
import { requireVerifiedAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
    try {
        // Authenticate — only the farmer can mark as shipped
        const auth = await requireVerifiedAuth(req);
        if (auth.error) return auth.error;

        const { orderId, trackingNumber, carrier, estimatedDeliveryDate } = await req.json();
        const farmerId = auth.user.id;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        if (!trackingNumber || !carrier) {
            return NextResponse.json({ error: 'Tracking number and carrier are required' }, { status: 400 });
        }

        // Verify order belongs to farmer and is in correct state
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('farmer_id', farmerId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.escrow_status !== 'funds_held') {
            return NextResponse.json(
                { error: `Cannot mark as shipped — current escrow status is "${order.escrow_status}"` },
                { status: 400 }
            );
        }

        const now = new Date();
        const autoReleaseAt = new Date(now.getTime() + AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000);

        const updateFields: Record<string, unknown> = {
            status: 'shipped',
            escrow_status: 'shipped_awaiting_confirmation',
            farmer_shipped_at: now.toISOString(),
            auto_release_at: autoReleaseAt.toISOString(),
            tracking_number: trackingNumber,
            carrier: carrier,
            updated_at: now.toISOString(),
        };

        if (estimatedDeliveryDate) {
            updateFields.estimated_delivery_date = estimatedDeliveryDate;
        }

        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update(updateFields)
            .eq('id', orderId);

        if (updateError) throw updateError;

        // Auto-create order update entry
        await supabaseAdmin
            .from('order_updates')
            .insert({
                order_id: orderId,
                update_type: 'in_transit',
                message: `Shipped via ${carrier}. Tracking: ${trackingNumber}${estimatedDeliveryDate ? `. Estimated delivery: ${estimatedDeliveryDate}` : ''}`,
                created_by: farmerId,
            });

        return NextResponse.json({
            success: true,
            autoReleaseAt: autoReleaseAt.toISOString(),
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Ship order error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
