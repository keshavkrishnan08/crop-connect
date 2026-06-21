"use client";

import * as React from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { pullState, pushState } from "@/lib/supabase/sync";
import { getState, hydrateRemote, setRemoteSink, type AppState } from "@/lib/store";

/** Binds the local store to the signed-in account: pulls on load, pushes on change. */
export function SupabaseSync() {
    React.useEffect(() => {
        const supabase = getBrowserClient();
        if (!supabase) return; // not configured — local demo mode
        let active = true;

        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !active) return;

            // Serialized writer: never run two pushes at once, always persist the latest state.
            let pushing = false;
            let pending: AppState | null = null;
            let waiters: Array<() => void> = [];
            async function drain() {
                pushing = true;
                while (pending) {
                    const snap = pending; pending = null;
                    try { await pushState(supabase!, user!.id, snap); } catch { /* keep local */ }
                }
                pushing = false;
                const w = waiters; waiters = [];
                w.forEach((r) => r());
            }
            const sink = (s: AppState) => {
                pending = s;
                const p = new Promise<void>((res) => waiters.push(res));
                if (!pushing) drain();
                return p;
            };

            setRemoteSink(sink); // register first so changes during load are captured
            try {
                const remote = await pullState(supabase, user.id);
                if (!active) return;
                if (remote) hydrateRemote(remote);
                else await pushState(supabase, user.id, getState()); // seed a new account
            } catch { /* keep local state on failure */ }
        })();

        const { data: sub } = supabase.auth.onAuthStateChange((event: string) => {
            if (event === "SIGNED_OUT") setRemoteSink(null);
        });

        return () => { active = false; setRemoteSink(null); sub.subscription.unsubscribe(); };
    }, []);

    return null;
}
