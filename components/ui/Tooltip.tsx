"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Lightweight hover/focus tooltip — glass bubble, no dependency. */
export function Tooltip({
    label, children, side = "top", className,
}: {
    label: React.ReactNode; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right"; className?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const pos = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    }[side];
    return (
        <span
            className={cn("relative inline-flex", className)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
        >
            {children}
            {open && (
                <span className={cn("pointer-events-none absolute z-[150] whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-2xs font-semibold text-white shadow-glass animate-fade-in", pos)}>
                    {label}
                </span>
            )}
        </span>
    );
}
