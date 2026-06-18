/**
 * Tiny in-memory fixed-window rate limiter for API routes.
 * Per-process only (resets on redeploy) — enough to blunt abuse of the AI routes
 * without external infra. Swap for Upstash/Redis if you need cross-instance limits.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000): { ok: boolean; remaining: number } {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now > b.reset) {
        buckets.set(key, { count: 1, reset: now + windowMs });
        return { ok: true, remaining: limit - 1 };
    }
    b.count++;
    if (b.count > limit) return { ok: false, remaining: 0 };
    return { ok: true, remaining: limit - b.count };
}

export function clientKey(req: Request): string {
    const fwd = req.headers.get("x-forwarded-for");
    return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "anon").trim();
}
