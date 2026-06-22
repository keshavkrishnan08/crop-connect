import { createBrowserClient } from "@supabase/ssr";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True only when real (non-placeholder) credentials are present. */
export function supabaseConfigured() {
    return !!(SUPABASE_URL && SUPABASE_URL.startsWith("http") && SUPABASE_ANON && (SUPABASE_ANON.startsWith("eyJ") || SUPABASE_ANON.startsWith("sb_")));
}

let _client: ReturnType<typeof createBrowserClient> | null = null;

/** Browser Supabase client, or null when not configured (app falls back to local demo). */
export function getBrowserClient() {
    if (!supabaseConfigured()) return null;
    if (_client) return _client;
    _client = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON!);
    return _client;
}
