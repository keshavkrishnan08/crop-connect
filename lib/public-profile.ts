import { createClient } from '@supabase/supabase-js';

/**
 * Server-safe Supabase client using the public anon key.
 * Does NOT require SUPABASE_SERVICE_ROLE_KEY — works with RLS policies.
 */
function getServerClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return createClient(url, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export interface PublicProfile {
    id: string;
    full_name: string | null;
    user_type: string | null;
    farm_name: string | null;
    company_name: string | null;
    location: string | null;
    bio: string | null;
    profile_picture: string | null;
    crops: string[] | null;
    farming_practices: string[] | null;
    certifications: string[] | null;
    years_farming: number | null;
    years_in_business: number | null;
    farm_size: string | null;
    delivery_radius: number | null;
    phone: string | null;
    email: string | null;
    stripe_onboarding_complete: boolean | null;
    rating_average: number | null;
    rating_count: number | null;
    total_completed_orders: number | null;
    crop_score: number | null;
    crop_score_tier: string | null;
    updated_at: string;
}

/**
 * Explicit list of fields safe for public display.
 * NEVER include: email, phone, stripe_account_id,
 * or any other sensitive/private fields.
 */
const PUBLIC_PROFILE_FIELDS = [
    'id',
    'full_name',
    'user_type:role',
    'farm_name',
    'company_name',
    'location',
    'bio',
    'profile_picture',
    'crops',
    'farming_practices',
    'certifications',
    'years_farming',
    'years_in_business',
    'farm_size',
    'farm_unit',
    'delivery_radius',
    'is_verified',
    'rating_average',
    'rating_count',
    'total_completed_orders',
    'crop_score',
    'crop_score_tier',
    'updated_at',
].join(', ');

export interface PublicListing {
    id: string;
    crop_name: string;
    category: string | null;
    description: string | null;
    price_per_unit: number;
    unit: string;
    quantity_available: number;
    image_url: string | null;
    status: string;
    created_at: string;
}

export interface PublicReview {
    id: string;
    rating: number;
    title: string | null;
    review_text: string | null;
    created_at: string;
    reviewer: {
        id: string;
        full_name: string | null;
        profile_picture: string | null;
        company_name: string | null;
        farm_name: string | null;
        user_type: string | null;
    } | null;
}

export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
    const supabase = getServerClient();
    const { data, error } = await supabase
        .from('profiles')
        .select(PUBLIC_PROFILE_FIELDS)
        .eq('id', userId)
        .single();

    if (error || !data) return null;
    return data as unknown as PublicProfile;
}

export async function getUserListings(userId: string): Promise<PublicListing[]> {
    const supabase = getServerClient();
    const { data, error } = await supabase
        .from('listings')
        .select('id, crop_name, category, description, price_per_unit, unit, quantity_available, image_url, status, created_at')
        .eq('farmer_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

    if (error) return [];
    return data || [];
}

export async function getUserReviews(userId: string, page = 0, limit = 5): Promise<{ reviews: PublicReview[]; total: number }> {
    const supabase = getServerClient();
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from('reviews')
        .select(`
            id, rating, title, review_text, created_at,
            reviewer:profiles!reviewer_id (
                id, full_name, profile_picture, company_name, farm_name, user_type:role
            )
        `, { count: 'exact' })
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) return { reviews: [], total: 0 };
    // Supabase returns joined relations — cast to expected shape
    const reviews: PublicReview[] = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        rating: row.rating as number,
        title: row.title as string | null,
        review_text: row.review_text as string | null,
        created_at: row.created_at as string,
        reviewer: Array.isArray(row.reviewer) ? (row.reviewer[0] || null) : (row.reviewer || null),
    }));
    return { reviews, total: count || 0 };
}
