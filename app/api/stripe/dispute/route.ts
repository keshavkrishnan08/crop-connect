import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireVerifiedAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
    try {
        // Authenticate — only the buyer can file a dispute
        const auth = await requireVerifiedAuth(req);
        if (auth.error) return auth.error;

        const { orderId, reason } = await req.json();
        const buyerId = auth.user.id;

        if (!orderId || !reason) {
            return NextResponse.json({ error: 'Missing orderId or reason' }, { status: 400 });
        }

        // Fetch order and verify buyer
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('buyer_id', buyerId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Can only dispute when funds are held or shipped
        const disputableStatuses = ['funds_held', 'shipped_awaiting_confirmation'];
        if (!disputableStatuses.includes(order.escrow_status || '')) {
            return NextResponse.json(
                { error: `Cannot dispute — current escrow status is "${order.escrow_status}"` },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                status: 'disputed',
                escrow_status: 'disputed',
                dispute_reason: reason,
                dispute_created_at: now,
                auto_release_at: null, // Pause auto-release during dispute
                updated_at: now,
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Dispute error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
