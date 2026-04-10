import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { recalculateAndSave } from '@/lib/cropscore';

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req);
        if (auth.error) return auth.error;

        const result = await recalculateAndSave(auth.user.id);

        return NextResponse.json({
            success: true,
            score: result.score,
            tier: result.tier,
            label: result.label,
            breakdown: result.breakdown,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('CropScore calculation error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
