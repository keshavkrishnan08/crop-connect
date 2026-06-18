import { NextResponse } from "next/server";
import { claudeText, aiEnabled } from "@/lib/anthropic";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { suggestFairTerms, contractValueCents } from "@/lib/contract";
import { CADENCE_LABEL, type Terms, type ListingType } from "@/lib/types";

export const runtime = "nodejs";

interface Side { terms: Terms; type: ListingType; ceiling?: number | null }
interface Body { ref: Side; candidate: Side }

export async function POST(req: Request) {
    if (!rateLimit(`suggest:${clientKey(req)}`, 20).ok) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    let body: Body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
    if (!body?.ref?.terms || !body?.candidate?.terms) {
        return NextResponse.json({ error: "Missing sides" }, { status: 400 });
    }

    // The suggestion itself is deterministic, fair logic — never hallucinated.
    const terms = suggestFairTerms(body.ref, body.candidate);

    const supply = body.ref.type === "supply" ? body.ref : body.candidate;
    const need = body.ref.type === "need" ? body.ref : body.candidate;
    const ceiling = need.ceiling ?? null;
    const template =
        `A fair meeting point: ${terms.quantity} ${terms.unit} ${CADENCE_LABEL[terms.cadence].toLowerCase()} ` +
        `at $${(terms.unit_price_cents / 100).toFixed(2)}/${terms.unit}` +
        `${ceiling && supply.terms.unit_price_cents > ceiling ? ", splitting the gap between the asking price and the buyer's ceiling" : ""}` +
        `, over the window you both have open.`;

    let rationale = template;
    let source = "rules";
    if (aiEnabled()) {
        const ai = await claudeText({
            system:
                "You explain, in ONE warm sentence, why a proposed starting contract is fair to both a farm and a buyer. " +
                "No markdown, no preamble. Reference the concrete numbers.",
            prompt:
                `Supply offer: ${JSON.stringify({ ...supply.terms, ceiling: undefined })}\n` +
                `Buyer need: ${JSON.stringify(need.terms)} ceiling ${ceiling ?? "none"}\n` +
                `Proposed starting terms: ${JSON.stringify(terms)}\n` +
                `Estimated total value: $${(contractValueCents(terms) / 100).toFixed(2)}\n` +
                `Explain why this is a fair starting point.`,
            maxTokens: 140,
            temperature: 0.5,
        });
        if (ai) { rationale = ai; source = "ai"; }
    }

    return NextResponse.json({ terms, rationale, source });
}
