import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON, supabaseConfigured } from "./client";

/** Refresh the auth session and gate /app behind a signed-in user. */
export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({ request });

    // Not configured yet — let everything through (local demo mode).
    if (!supabaseConfigured()) return response;

    const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON!, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
        },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // Protect the app. Send unauthenticated visitors to sign-in.
    if (!user && request.nextUrl.pathname.startsWith("/app")) {
        const url = request.nextUrl.clone();
        url.pathname = "/sign-in";
        url.searchParams.set("next", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return response;
}
