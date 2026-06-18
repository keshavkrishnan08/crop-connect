"use client";

import { type Terms } from "@/lib/types";
import { diffTerms } from "@/lib/contract";
import { ArrowRight } from "@/components/icons";

/** Side-by-side highlight of what changed between two term versions. */
export function TermDiff({ from, to, fromLabel = "Previous", toLabel = "Proposed" }: {
    from: Terms; to: Terms; fromLabel?: string; toLabel?: string;
}) {
    const rows = diffTerms(from, to);
    if (rows.length === 0) {
        return <p className="rounded-2xl bg-paper-warm px-4 py-3 text-sm text-ink-muted">No terms changed — same as the previous version.</p>;
    }
    return (
        <div className="overflow-hidden rounded-2xl border border-line">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center bg-paper-warm px-4 py-2 text-2xs font-semibold uppercase tracking-wide text-ink-faint">
                <span>{fromLabel}</span>
                <span />
                <span className="text-forest-600">{toLabel}</span>
            </div>
            {rows.map((r) => (
                <div key={r.field} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-line px-4 py-2.5">
                    <div>
                        <p className="text-2xs font-medium uppercase tracking-wide text-ink-faint">{r.label}</p>
                        <p className="text-sm text-ink-muted line-through decoration-ink-faint/40">{r.from}</p>
                    </div>
                    <ArrowRight size={16} className="text-forest-400" />
                    <div>
                        <p className="text-2xs font-medium uppercase tracking-wide text-forest-600">{r.label}</p>
                        <p className="text-sm font-semibold text-ink">{r.to}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
