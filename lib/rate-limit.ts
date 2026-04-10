import { NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests by IP + route key. Resets after the window expires.
 *
 * For production at scale, swap this with Redis or Upstash Rate Limit.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
        if (now > entry.resetAt) store.delete(key);
    });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    /** Max requests allowed in the window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

const DEFAULTS: Record<string, RateLimitConfig> = {
    auth: { limit: 10, windowSeconds: 60 },        // 10 attempts/min
    payment: { limit: 5, windowSeconds: 60 },       // 5 payment attempts/min
    message: { limit: 30, windowSeconds: 60 },      // 30 messages/min
    listing: { limit: 10, windowSeconds: 300 },     // 10 listings/5min
    report: { limit: 5, windowSeconds: 300 },       // 5 reports/5min
    general: { limit: 60, windowSeconds: 60 },      // 60 req/min default
};

/**
 * Check rate limit. Returns null if allowed, or a 429 NextResponse if blocked.
 */
export function checkRateLimit(
    ip: string | null,
    routeKey: string,
    configKey: keyof typeof DEFAULTS = 'general'
): NextResponse | null {
    const config = DEFAULTS[configKey] || DEFAULTS.general;
    const identifier = ip || 'unknown';
    const key = `${identifier}:${routeKey}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
        return null;
    }

    entry.count++;

    if (entry.count > config.limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: { 'Retry-After': String(retryAfter) },
            }
        );
    }

    return null;
}

/**
 * Extract client IP from Next.js request headers.
 */
export function getClientIP(req: Request): string | null {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.headers.get('x-real-ip') || null;
}
