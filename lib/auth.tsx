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

    const loadProfile = useCallback(async (userId: string) => {
        const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (data) setProfile(data as Profile);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (session?.user) await loadProfile(session.user.id);
    }, [session, loadProfile]);

    useEffect(() => {
        let active = true;
        supabase.auth.getSession().then(async ({ data }) => {
            if (!active) return;
            setSession(data.session);
            if (data.session?.user) await loadProfile(data.session.user.id);
            setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
            setSession(s);
            if (s?.user) await loadProfile(s.user.id);
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
