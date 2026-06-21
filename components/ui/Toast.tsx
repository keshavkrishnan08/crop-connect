"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { Check, X, Bell, Sparkle } from "@/components/icons";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info" | "ai";
interface Toast { id: number; kind: Kind; title: string; description?: string; }

interface Ctx {
    success: (t: string, d?: string) => void;
    error: (t: string, d?: string) => void;
    info: (t: string, d?: string) => void;
    ai: (t: string, d?: string) => void;
}
const C = createContext<Ctx | null>(null);
export function useToast() { const c = useContext(C); if (!c) throw new Error("useToast within ToastProvider"); return c; }

const ICON: Record<Kind, React.ReactNode> = { success: <Check size={15} />, error: <X size={15} />, info: <Bell size={15} />, ai: <Sparkle size={15} /> };
const TONE: Record<Kind, string> = {
    success: "text-brand-600 bg-brand-50 border-brand-100",
    error: "text-danger bg-danger/5 border-danger/15",
    info: "text-ink-soft bg-ink/5 border-line",
    ai: "text-harvest-500 bg-harvest-400/10 border-harvest-400/20",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const seed = useRef(0);
    const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
    const push = useCallback((kind: Kind, title: string, description?: string) => {
        const id = ++seed.current;
        setToasts((p) => [...p, { id, kind, title, description }]);
        setTimeout(() => remove(id), 4200);
    }, [remove]);

    const api: Ctx = {
        success: (t, d) => push("success", t, d),
        error: (t, d) => push("error", t, d),
        info: (t, d) => push("info", t, d),
        ai: (t, d) => push("ai", t, d),
    };

    return (
        <C.Provider value={api}>
            {children}
            <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(92vw,360px)] flex-col gap-2.5">
                {toasts.map((t) => (
                    <div key={t.id} className="glass pointer-events-auto relative flex items-start gap-3 p-3.5 pr-9 animate-scale-in">
                        <div className={cn("grid h-8 w-8 place-items-center rounded-lg border", TONE[t.kind])}>{ICON[t.kind]}</div>
                        <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm font-semibold text-ink leading-tight">{t.title}</p>
                            {t.description && <p className="mt-0.5 text-[13px] text-ink-muted leading-snug">{t.description}</p>}
                        </div>
                        <button onClick={() => remove(t.id)} className="absolute right-2.5 top-2.5 text-ink-faint hover:text-ink" aria-label="Dismiss"><X size={15} /></button>
                    </div>
                ))}
            </div>
        </C.Provider>
    );
}
