import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * CropScore — proprietary reputation algorithm for CropConnect.
 *
 * Farmer CropScore (0-100):
 *   Transaction Reliability  25%  — completed / (completed + disputed + cancelled)
 *   Quality Rating           25%  — avg review rating / 5
 *   Responsiveness           15%  — % produce request responses within 24h
 *   Shipping Speed           15%  — avg days from funds_held → shipped (capped at 7)
 *   Platform Tenure          10%  — min(months_active / 12, 1)
 *   Community Engagement     10%  — min((posts + comments) / 20, 1)
 *
 * Buyer CropScore (0-100):
 *   Payment Reliability      30%  — % orders with payment within 48h
 *   Confirmation Speed       20%  — avg days from shipped → confirmed (capped at 7)
 *   Review Engagement        15%  — % completed orders with reviews
 *   Dispute Rate (inverse)   20%  — 1 - (disputes / total_orders)
 *   Platform Tenure          15%  — min(months_active / 12, 1)
 */

export interface CropScoreBreakdown {
    [factor: string]: { raw: number; weighted: number; weight: number };
}

export interface CropScoreResult {
    score: number;
    tier: string;
    label: string;
    breakdown: CropScoreBreakdown;
}

const TIERS = [
    { min: 80, tier: 'platinum', label: 'Elite' },
    { min: 60, tier: 'gold', label: 'Trusted' },
    { min: 40, tier: 'silver', label: 'Rising' },
    { min: 0, tier: 'bronze', label: 'New Member' },
] as const;

export function getTierForScore(score: number): { tier: string; label: string } {
    for (const t of TIERS) {
        if (score >= t.min) return { tier: t.tier, label: t.label };
    }
    return { tier: 'bronze', label: 'New Member' };
}

// ── Farmer ──────────────────────────────────────────────────

async function calculateFarmerCropScore(userId: string): Promise<CropScoreResult> {
    const breakdown: CropScoreBreakdown = {};

    // 1. Transaction Reliability (25%)
    const { data: orderStats } = await supabaseAdmin
        .from('orders')
        .select('status, escrow_status')
        .eq('farmer_id', userId);

    const orders = orderStats || [];
    const completed = orders.filter(o => o.escrow_status === 'funds_released').length;
    const disputed = orders.filter(o => o.escrow_status === 'disputed').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const total = completed + disputed + cancelled;
    const reliabilityRaw = total > 0 ? completed / total : 0.5;
    breakdown['Transaction Reliability'] = { raw: reliabilityRaw, weighted: reliabilityRaw * 25, weight: 25 };

    // 2. Quality Rating (25%) — computed from reviews table
    const { data: reviews } = await supabaseAdmin
        .from('reviews')
        .select('rating')
        .eq('reviewed_user_id', userId);

    const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    const ratingRaw = reviews && reviews.length > 0 ? avgRating / 5 : 0.5;
    breakdown['Quality Rating'] = { raw: ratingRaw, weighted: ratingRaw * 25, weight: 25 };

    // 3. Responsiveness (15%) — % produce request responses within 24h
    const { data: responses } = await supabaseAdmin
        .from('produce_request_responses')
        .select('created_at, request_id')
        .eq('farmer_id', userId);

    let respondedWithin24h = 0;
    const allResponses = responses || [];
    if (allResponses.length > 0) {
        // Get the corresponding requests to compare timestamps
        const requestIds = Array.from(new Set(allResponses.map(r => r.request_id)));
        const { data: requestsData } = await supabaseAdmin
            .from('produce_requests')
            .select('id, created_at')
            .in('id', requestIds);

        const requestMap = new Map((requestsData || []).map(r => [r.id, r.created_at]));

        for (const resp of allResponses) {
            const requestCreated = requestMap.get(resp.request_id);
            if (requestCreated) {
                const hours = (new Date(resp.created_at).getTime() - new Date(requestCreated).getTime()) / (1000 * 60 * 60);
                if (hours <= 24) respondedWithin24h++;
            }
        }
    }
    const responsivenessRaw = allResponses.length > 0 ? respondedWithin24h / allResponses.length : 0.5;
    breakdown['Responsiveness'] = { raw: responsivenessRaw, weighted: responsivenessRaw * 15, weight: 15 };

    // 4. Shipping Speed (15%) — avg days from order creation → shipped, capped at 7
    let shippingSpeedRaw = 0.5;
    const { data: shippedDetails } = await supabaseAdmin
        .from('orders')
        .select('created_at, farmer_shipped_at')
        .eq('farmer_id', userId)
        .not('farmer_shipped_at', 'is', null);

    if (shippedDetails && shippedDetails.length > 0) {
        let totalDays = 0;
        for (const o of shippedDetails) {
            const created = new Date(o.created_at).getTime();
            const shipped = new Date(o.farmer_shipped_at).getTime();
            const days = (shipped - created) / (1000 * 60 * 60 * 24);
            totalDays += Math.min(days, 7);
        }
        const avgDays = totalDays / shippedDetails.length;
        shippingSpeedRaw = Math.max(0, 1 - (avgDays / 7));
    }
    breakdown['Shipping Speed'] = { raw: shippingSpeedRaw, weighted: shippingSpeedRaw * 15, weight: 15 };

    // 5. Platform Tenure (10%)
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
    const monthsActive = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const tenureRaw = Math.min(monthsActive / 12, 1);
    breakdown['Platform Tenure'] = { raw: tenureRaw, weighted: tenureRaw * 10, weight: 10 };

    // 6. Community Engagement (10%) — posts + comments, capped at 20
    const { count: postsCount } = await supabaseAdmin
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId);

    const { count: commentsCount } = await supabaseAdmin
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId);

    const communityTotal = (postsCount || 0) + (commentsCount || 0);
    const communityRaw = Math.min(communityTotal / 20, 1);
    breakdown['Community Engagement'] = { raw: communityRaw, weighted: communityRaw * 10, weight: 10 };

    const score = Math.round(
        Object.values(breakdown).reduce((sum, f) => sum + f.weighted, 0)
    );
    const { tier, label } = getTierForScore(score);

    return { score, tier, label, breakdown };
}

// ── Buyer ───────────────────────────────────────────────────

async function calculateBuyerCropScore(userId: string): Promise<CropScoreResult> {
    const breakdown: CropScoreBreakdown = {};

    // 1. Payment Reliability (30%)
    const { data: orderStats } = await supabaseAdmin
        .from('orders')
        .select('status, escrow_status, created_at, stripe_payment_intent_id')
        .eq('buyer_id', userId);

    const orders = orderStats || [];
    const paidOrders = orders.filter(o =>
        o.escrow_status && !['none', 'awaiting_payment', 'payment_failed'].includes(o.escrow_status)
    );
    const paymentRaw = orders.length > 0 ? paidOrders.length / orders.length : 0.5;
    breakdown['Payment Reliability'] = { raw: paymentRaw, weighted: paymentRaw * 30, weight: 30 };

    // 2. Confirmation Speed (20%)
    const { data: confirmedOrders } = await supabaseAdmin
        .from('orders')
        .select('farmer_shipped_at, buyer_confirmed_at')
        .eq('buyer_id', userId)
        .not('buyer_confirmed_at', 'is', null)
        .not('farmer_shipped_at', 'is', null);

    let confirmSpeedRaw = 0.5;
    if (confirmedOrders && confirmedOrders.length > 0) {
        let totalDays = 0;
        for (const o of confirmedOrders) {
            const shipped = new Date(o.farmer_shipped_at).getTime();
            const confirmed = new Date(o.buyer_confirmed_at).getTime();
            const days = (confirmed - shipped) / (1000 * 60 * 60 * 24);
            totalDays += Math.min(days, 7);
        }
        const avgDays = totalDays / confirmedOrders.length;
        confirmSpeedRaw = Math.max(0, 1 - (avgDays / 7));
    }
    breakdown['Confirmation Speed'] = { raw: confirmSpeedRaw, weighted: confirmSpeedRaw * 20, weight: 20 };

    // 3. Review Engagement (15%)
    const completedCount = orders.filter(o => o.escrow_status === 'funds_released').length;
    const { count: reviewCount } = await supabaseAdmin
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('reviewer_id', userId);

    const reviewRaw = completedCount > 0
        ? Math.min((reviewCount || 0) / completedCount, 1)
        : 0.5;
    breakdown['Review Engagement'] = { raw: reviewRaw, weighted: reviewRaw * 15, weight: 15 };

    // 4. Dispute Rate inverse (20%)
    const disputeCount = orders.filter(o => o.escrow_status === 'disputed').length;
    const disputeRaw = orders.length > 0
        ? 1 - (disputeCount / orders.length)
        : 1;
    breakdown['Low Dispute Rate'] = { raw: disputeRaw, weighted: disputeRaw * 20, weight: 20 };

    // 5. Platform Tenure (15%)
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
    const monthsActive = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const tenureRaw = Math.min(monthsActive / 12, 1);
    breakdown['Platform Tenure'] = { raw: tenureRaw, weighted: tenureRaw * 15, weight: 15 };

    const score = Math.round(
        Object.values(breakdown).reduce((sum, f) => sum + f.weighted, 0)
    );
    const { tier, label } = getTierForScore(score);

    return { score, tier, label, breakdown };
}

// ── Main entry ──────────────────────────────────────────────

export async function calculateCropScore(userId: string): Promise<CropScoreResult> {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (profile?.role === 'farmer') {
        return calculateFarmerCropScore(userId);
    }
    return calculateBuyerCropScore(userId);
}

export async function saveCropScore(userId: string, result: CropScoreResult): Promise<void> {
    await supabaseAdmin
        .from('profiles')
        .update({
            crop_score: result.score,
            crop_score_tier: result.tier,
            crop_score_updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
}

/**
 * Recalculate and save CropScore for a user.
 * Safe to call fire-and-forget.
 */
export async function recalculateAndSave(userId: string): Promise<CropScoreResult> {
    const result = await calculateCropScore(userId);
    await saveCropScore(userId, result);
    return result;
}
