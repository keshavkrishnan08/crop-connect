"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/kit";
import { X } from "@/components/icons";

interface ConfirmOpts {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "danger" | "forest";
}

const Ctx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);

export function useConfirm() {
    return useContext(Ctx);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [opts, setOpts] = useState<ConfirmOpts | null>(null);
    const resolver = useRef<(v: boolean) => void>(() => {});

    const confirm = useCallback((o: ConfirmOpts) => {
        setOpts(o);
        return new Promise<boolean>((res) => { resolver.current = res; });
    }, []);

    const close = (v: boolean) => { resolver.current(v); setOpts(null); };

    return (
        <Ctx.Provider value={confirm}>
            {children}
            {opts && (
                <div className="fixed inset-0 z-[160] grid place-items-center p-4">
                    <div className="absolute inset-0 bg-ink/35 backdrop-blur-sm animate-fade-in" onClick={() => close(false)} />
                    <div className="relative z-10 w-full max-w-sm glass-card p-6 animate-scale-in">
                        <button onClick={() => close(false)} className="absolute right-3 top-3 text-ink-faint hover:text-ink"><X size={18} /></button>
                        <h3 className="font-display text-2xl text-ink">{opts.title}</h3>
                        {opts.description && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{opts.description}</p>}
                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => close(false)}>{opts.cancelLabel ?? "Cancel"}</Button>
                            <Button variant={opts.tone === "forest" ? "primary" : "danger"} onClick={() => close(true)}>
                                {opts.confirmLabel ?? "Confirm"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Ctx.Provider>
    );
}
