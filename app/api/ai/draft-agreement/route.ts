import { NextResponse } from "next/server";
import { claudeText, aiEnabled } from "@/lib/anthropic";
import { fallbackAgreement, contractValueCents, deliveryCount } from "@/lib/contract";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { Terms } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
    terms: Terms;
    farm: { full_name: string; org_name: string | null; location_label: string | null };
    buyer: { full_name: string; org_name: string | null; location_label: string | null };
}

export async function POST(req: Request) {
    if (!rateLimit(`draft:${clientKey(req)}`, 15).ok) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    let body: Body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { terms, farm, buyer } = body;
    if (!terms?.crop) return NextResponse.json({ error: "Missing terms" }, { status: 400 });

    const fallback = fallbackAgreement(terms, farm, buyer);

    if (!aiEnabled()) {
        return NextResponse.json({ text: fallback, source: "template" });
    }

    const facts = {
        farm: farm.org_name || farm.full_name,
        farm_location: farm.location_label,
        buyer: buyer.org_name || buyer.full_name,
        buyer_location: buyer.location_label,
        crop: terms.crop,
        grade: terms.grade,
        quantity_per_delivery: `${terms.quantity} ${terms.unit}`,
        cadence: terms.cadence,
        deliveries: deliveryCount(terms),
        term: `${terms.term_start} to ${terms.term_end}`,
        unit_price: `$${(terms.unit_price_cents / 100).toFixed(2)} per ${terms.unit}`,
        total_value: `$${(contractValueCents(terms) / 100).toFixed(2)}`,
        delivery_terms: terms.delivery_terms,
        quality_terms: terms.quality_terms,
        notes: terms.notes,
    };

    const text = await claudeText({
        system:
            "You are a contracts assistant for CropConnect, a local-food supply platform. " +
            "Draft a clean, plain-language LOCAL SUPPLY AGREEMENT from the structured facts. " +
            "Be clear and fair to both parties. Use numbered sections: Product, Quantity & Cadence, Term, " +
            "Price, Delivery, Quality & Acceptance, Renewal, Notes (omit Notes if none). Keep it under 350 words. " +
            "Plain text only, no markdown. End with a one-line good-faith disclaimer that CropConnect is not a party " +
            "and a lawyer should review binding contracts. Do not invent terms not present in the facts.",
        prompt: `Draft the agreement from these facts:\n${JSON.stringify(facts, null, 2)}`,
        maxTokens: 1100,
        temperature: 0.35,
    });

    return NextResponse.json({ text: text || fallback, source: text ? "ai" : "template" });
}
