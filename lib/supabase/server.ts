import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON, supabaseConfigured } from "./client";

/** Server Supabase client bound to the request cookies. Null when not configured. */
export function getServerClient() {
    if (!supabaseConfigured()) return null;
    const cookieStore = cookies();
    return createServerClient(SUPABASE_URL!, SUPABASE_ANON!, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // called from a Server Component — middleware refreshes the session instead
                }
            },
        },
    });
}
