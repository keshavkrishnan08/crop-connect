import * as React from "react";
import { Eyebrow } from "@/components/ui/kit";

export function PageHeader({ eyebrow, title, subtitle, actions, className }: { eyebrow?: string; title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; className?: string }) {
    return (
        <div className={`mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className ?? ""}`}>
            <div>
                {eyebrow && <div className="mb-2"><Eyebrow>{eyebrow}</Eyebrow></div>}
                <h1 className="font-display text-[2rem] leading-[1.05] text-ink sm:text-[2.4rem]">{title}</h1>
                {subtitle && <p className="mt-2 max-w-xl text-[15px] text-ink-muted">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
        </div>
    );
}
