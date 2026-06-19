import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Verify the caller from their Supabase access token (sent as a Bearer header),
 * and return a per-user Supabase client that respects RLS — so API routes can
 * only touch rows the user is actually allowed to see.
 */
export async function authedClient(req: Request): Promise<{ userId: string; db: SupabaseClient } | null> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;

    const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
    if (!token) return null;

    const db = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return null;
    return { userId: data.user.id, db };
}
