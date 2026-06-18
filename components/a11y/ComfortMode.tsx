"use client";

import * as React from "react";
import { Sparkle, Check } from "@/components/icons";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cc:comfort";

type ComfortContextValue = {
    comfort: boolean;
    toggle: () => void;
};

const ComfortContext = React.createContext<ComfortContextValue | null>(null);

function applyClass(on: boolean) {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("comfort", on);
}

export function ComfortProvider({ children }: { children: React.ReactNode }) {
    const [comfort, setComfort] = React.useState(false);

    // Read persisted preference on mount and sync the <html> class.
    React.useEffect(() => {
        let initial = false;
        try {
            initial = window.localStorage.getItem(STORAGE_KEY) === "1";
        } catch {
            initial = false;
        }
        setComfort(initial);
        applyClass(initial);
    }, []);

    const toggle = React.useCallback(() => {
        setComfort((prev) => {
            const next = !prev;
            applyClass(next);
            try {
                window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
            } catch {
                /* storage unavailable — keep in-memory state */
            }
            return next;
        });
    }, []);

    const value = React.useMemo<ComfortContextValue>(() => ({ comfort, toggle }), [comfort, toggle]);

    return <ComfortContext.Provider value={value}>{children}</ComfortContext.Provider>;
}

export function useComfort(): ComfortContextValue {
    const ctx = React.useContext(ComfortContext);
    if (!ctx) {
        throw new Error("useComfort must be used within a ComfortProvider");
    }
    return ctx;
}

export function ComfortToggle({ className }: { className?: string }) {
    const { comfort, toggle } = useComfort();
    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={comfort}
            aria-label={`Comfort mode ${comfort ? "on" : "off"}`}
            title="Comfort mode — larger text, higher contrast"
            className={cn(
                "btn-ghost inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                comfort
                    ? "bg-forest-500 text-white hover:bg-forest-600"
                    : "glass hairline text-ink-soft",
                className,
            )}
        >
            {comfort ? <Check size={16} /> : <Sparkle size={16} />}
            <span>Comfort mode</span>
            <span
                className={cn(
                    "ml-0.5 rounded-md px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide",
                    comfort ? "bg-white/20 text-white" : "bg-paper-warm text-ink-faint",
                )}
            >
                {comfort ? "On" : "Off"}
            </span>
        </button>
    );
}
