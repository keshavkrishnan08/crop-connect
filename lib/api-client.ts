import { supabase } from '@/lib/supabase';

/**
 * Authenticated fetch wrapper. Automatically attaches the current Supabase
 * session's access token as an Authorization: Bearer header.
 *
 * Use this for all API route calls that require authentication.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession();

    const headers = new Headers(options.headers);
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(url, { ...options, headers });
}
