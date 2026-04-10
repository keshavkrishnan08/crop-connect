import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';

const VALID_UPDATE_TYPES = [
    'order_placed', 'payment_received', 'preparing', 'packed',
    'picked_up', 'in_transit', 'out_for_delivery', 'delivered',
    'delayed', 'custom',
] as const;

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req);
        if (auth.error) return auth.error;

        const orderId = req.nextUrl.searchParams.get('orderId');
        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        // Verify user is buyer or farmer on this order
        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('buyer_id, farmer_id')
            .eq('id', orderId)
            .single();

        if (!order || (order.buyer_id !== auth.user.id && order.farmer_id !== auth.user.id)) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const { data: updates, error } = await supabaseAdmin
            .from('order_updates')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ updates: updates || [] });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Fetch order updates error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req);
        if (auth.error) return auth.error;

        const { orderId, updateType, message } = await req.json();

        if (!orderId || !updateType) {
            return NextResponse.json({ error: 'Missing orderId or updateType' }, { status: 400 });
        }

        if (!VALID_UPDATE_TYPES.includes(updateType)) {
            return NextResponse.json({ error: `Invalid updateType: ${updateType}` }, { status: 400 });
        }

        // Verify user is buyer or farmer on this order
        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('buyer_id, farmer_id')
            .eq('id', orderId)
            .single();

        if (!order || (order.buyer_id !== auth.user.id && order.farmer_id !== auth.user.id)) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const { data: update, error } = await supabaseAdmin
            .from('order_updates')
            .insert({
                order_id: orderId,
                update_type: updateType,
                message: message || null,
                created_by: auth.user.id,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, update });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Create order update error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
