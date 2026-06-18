import { NextResponse } from "next/server";
import { claudeText, aiEnabled } from "@/lib/anthropic";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface Body {
    viewerRole: "farm" | "buyer";
    ref: { crop: string; quantity: number; unit: string; cadence: string; term: string };
    candidate: { crop: string; quantity: number; unit: string; cadence: string; term: string; org: string; distanceKm: number | null };
    score: number;
    reasons: string[];
}

export async function POST(req: Request) {
    if (!rateLimit(`match:${clientKey(req)}`, 30).ok) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    let body: Body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const fallback = body.reasons?.length
        ? body.reasons.join(" · ")
        : `A ${body.score}% fit on crop, season and volume.`;

    if (!aiEnabled()) return NextResponse.json({ insight: fallback, source: "rules" });

    const insight = await claudeText({
        system:
            "You explain why two local-food supply postings are a good (or weak) match, for a farmer or buyer. " +
            "One or two sentences, warm and concrete, no fluff, no markdown. Reference the strongest real reasons.",
        prompt:
            `Viewer is a ${body.viewerRole}. Match score ${body.score}/100.\n` +
            `Their posting: ${JSON.stringify(body.ref)}\n` +
            `Candidate (${body.candidate.org}): ${JSON.stringify(body.candidate)}\n` +
            `Rule reasons: ${body.reasons.join("; ")}\n` +
            `Write the explanation.`,
        maxTokens: 160,
        temperature: 0.5,
    });

    return NextResponse.json({ insight: insight || fallback, source: insight ? "ai" : "rules" });
}
