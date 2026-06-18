import { NextResponse } from "next/server";
import { estimateCourier, providerQuote } from "@/lib/shipping";
import { distanceKm } from "@/lib/match";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface Pt { lat: number | null; lng: number | null; label: string | null }
interface Body { pickup: Pt; dropoff: Pt }

export async function POST(req: Request) {
    if (!rateLimit(`ship:${clientKey(req)}`, 30).ok) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    let body: Body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

    const pickup = body.pickup ?? { lat: null, lng: null, label: null };
    const dropoff = body.dropoff ?? { lat: null, lng: null, label: null };

    const real = await providerQuote({ pickup, dropoff });
    if (real) return NextResponse.json(real);

    const km = distanceKm(pickup, dropoff);
    return NextResponse.json(estimateCourier(km));
}
