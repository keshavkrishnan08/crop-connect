"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    error: string | null;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    error: null,
    signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    setError(error.message);
                } else {
                    setSession(session);
                    setUser(session?.user ?? null);
                }
            } catch (err) {
                setError('Failed to initialize authentication');
            } finally {
                isInitializedRef.current = true;
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setError(null);
            // Only set loading=false if getSession() has already completed
            if (isInitializedRef.current) {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
                setError(error.message);
            } else {
                setSession(null);
                setUser(null);
            }
        } catch (err) {
            setError('Failed to sign out');
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, loading, error, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
