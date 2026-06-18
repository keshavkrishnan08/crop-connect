"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { Check, X, Sparkle, Bell } from "@/components/icons";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info" | "ai";
interface Toast {
    id: number;
    kind: ToastKind;
    title: string;
    description?: string;
}

interface ToastCtx {
    toast: (t: Omit<Toast, "id">) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    ai: (title: string, description?: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

const ICONS: Record<ToastKind, React.ReactNode> = {
    success: <Check size={16} />,
    error: <X size={16} />,
    info: <Bell size={16} />,
    ai: <Sparkle size={16} />,
};

const ACCENT: Record<ToastKind, string> = {
    success: "text-forest-600 bg-forest-50 border-forest-100",
    error: "text-berry bg-berry/5 border-berry/15",
    info: "text-sky bg-sky/5 border-sky/15",
    ai: "text-harvest-500 bg-harvest-400/10 border-harvest-400/20",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    let idSeed = React.useRef(0);

    const remove = useCallback((id: number) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    }, []);

    const toast = useCallback((t: Omit<Toast, "id">) => {
        const id = ++idSeed.current;
        setToasts((prev) => [...prev, { ...t, id }]);
        setTimeout(() => remove(id), 4200);
    }, [remove]);

    const api: ToastCtx = {
        toast,
        success: (title, description) => toast({ kind: "success", title, description }),
        error: (title, description) => toast({ kind: "error", title, description }),
        info: (title, description) => toast({ kind: "info", title, description }),
        ai: (title, description) => toast({ kind: "ai", title, description }),
    };

    return (
        <Ctx.Provider value={api}>
            {children}
            <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(92vw,360px)] flex-col gap-2.5">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="glass-card pointer-events-auto flex items-start gap-3 p-3.5 pr-9 animate-scale-in relative"
                        role="status"
                    >
                        <div className={cn("grid h-8 w-8 place-items-center rounded-xl border", ACCENT[t.kind])}>
                            {ICONS[t.kind]}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm font-semibold text-ink leading-tight">{t.title}</p>
                            {t.description && (
                                <p className="mt-0.5 text-[13px] text-ink-muted leading-snug">{t.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => remove(t.id)}
                            className="absolute right-2.5 top-2.5 text-ink-faint hover:text-ink transition-colors"
                            aria-label="Dismiss"
                        >
                            <X size={15} />
                        </button>
                    </div>
                ))}
            </div>
        </Ctx.Provider>
    );
}
