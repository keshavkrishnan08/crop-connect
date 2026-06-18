"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile, Role } from "@/lib/types";

interface AuthState {
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) => {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
            setProfile(data as Profile);
            return;
        }
        // Self-heal: no profile row yet (e.g. DB trigger not applied) → create a minimal one
        // so the app never deadlocks. Onboarding then fills it in.
        const meta = user.user_metadata ?? {};
        const role = meta.role === "farm" || meta.role === "buyer" ? (meta.role as string) : "buyer";
        const { data: created } = await supabase
            .from("profiles")
            .upsert({ id: user.id, email: user.email ?? null, full_name: (meta.full_name as string) || "", role })
            .select()
            .single();
        setProfile((created as Profile) ?? null);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (session?.user) await loadProfile(session.user);
    }, [session, loadProfile]);

    useEffect(() => {
        let active = true;
        supabase.auth.getSession().then(async ({ data }) => {
            if (!active) return;
            setSession(data.session);
            if (data.session?.user) await loadProfile(data.session.user);
            setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
            setSession(s);
            if (s?.user) await loadProfile(s.user);
            else setProfile(null);
        });
        return () => {
            active = false;
            sub.subscription.unsubscribe();
        };
    }, [loadProfile]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setProfile(null);
    }, []);

    return (
        <Ctx.Provider value={{ session, profile, loading, refreshProfile, signOut }}>
            {children}
        </Ctx.Provider>
    );
}

export type { Role };
