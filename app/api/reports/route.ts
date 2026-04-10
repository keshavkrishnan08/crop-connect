import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const VALID_TYPES = ['user', 'listing', 'order', 'message'] as const;
const VALID_REASONS = [
    'fraud', 'fake_listing', 'harassment', 'spam',
    'inappropriate_content', 'scam', 'impersonation', 'other',
] as const;

export async function POST(req: NextRequest) {
    try {
        const rateLimited = checkRateLimit(getClientIP(req), 'report', 'report');
        if (rateLimited) return rateLimited;

        const auth = await requireAuth(req);
        if (auth.error) return auth.error;

        const { reportType, targetId, reason, description } = await req.json();

        if (!reportType || !targetId || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!VALID_TYPES.includes(reportType)) {
            return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
        }

        if (!VALID_REASONS.includes(reason)) {
            return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
        }

        // Prevent self-reporting
        if (reportType === 'user' && targetId === auth.user.id) {
            return NextResponse.json({ error: 'You cannot report yourself' }, { status: 400 });
        }

        const { error: insertError } = await supabaseAdmin
            .from('reports')
            .insert({
                reporter_id: auth.user.id,
                report_type: reportType,
                target_id: targetId,
                reason,
                description: description?.slice(0, 1000) || null, // Cap at 1000 chars
            });

        if (insertError) {
            if (insertError.code === '23505') {
                return NextResponse.json({ error: 'You have already reported this' }, { status: 409 });
            }
            throw insertError;
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Report error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
