import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { User } from '@supabase/supabase-js';

/**
 * Extract and verify the authenticated user from a Next.js API route request.
 * Reads the JWT from the Authorization: Bearer <token> header and verifies it
 * against Supabase Auth.
 *
 * Returns the user if valid, or null if missing/invalid.
 */
export async function getAuthUser(req: NextRequest): Promise<User | null> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    if (!token) return null;

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) return null;
        return user;
    } catch {
        return null;
    }
}

/**
 * Require authentication on an API route. If the user is not authenticated,
 * returns a 401 JSON response. Otherwise returns the verified user.
 */
export async function requireAuth(req: NextRequest): Promise<
    { user: User; error?: never } | { user?: never; error: NextResponse }
> {
    const user = await getAuthUser(req);
    if (!user) {
        return {
            error: NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            ),
        };
    }
    return { user };
}

/**
 * Require authentication AND verified email. Use this for all financial operations
 * (payments, refunds, listings, inquiries) to prevent throwaway-account fraud.
 */
export async function requireVerifiedAuth(req: NextRequest): Promise<
    { user: User; error?: never } | { user?: never; error: NextResponse }
> {
    const result = await requireAuth(req);
    if (result.error) return result;

    if (!result.user.email_confirmed_at) {
        return {
            error: NextResponse.json(
                { error: 'Please verify your email before performing this action' },
                { status: 403 }
            ),
        };
    }
    return result;
}

/**
 * Require authentication AND verify the authenticated user matches the expected userId.
 * Prevents IDOR attacks where one user passes another user's ID.
 */
export async function requireAuthAs(req: NextRequest, expectedUserId: string): Promise<
    { user: User; error?: never } | { user?: never; error: NextResponse }
> {
    const result = await requireAuth(req);
    if (result.error) return result;

    if (result.user.id !== expectedUserId) {
        return {
            error: NextResponse.json(
                { error: 'Forbidden — you can only perform this action for your own account' },
                { status: 403 }
            ),
        };
    }
    return result;
}
