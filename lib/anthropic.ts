/**
 * Minimal server-side Claude client (no SDK dependency).
 * If ANTHROPIC_API_KEY is absent, callers fall back to deterministic templates,
 * so the product is always fully functional.
 */
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export function aiEnabled(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
}

export async function claudeText(opts: {
    system?: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
}): Promise<string | null> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    try {
        const res = await fetch(ANTHROPIC_URL, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: opts.maxTokens ?? 1200,
                temperature: opts.temperature ?? 0.4,
                system: opts.system,
                messages: [{ role: "user", content: opts.prompt }],
            }),
        });
        if (!res.ok) return null;
        const json = await res.json();
        const text = json?.content?.map((c: { text?: string }) => c.text ?? "").join("") ?? "";
        return text.trim() || null;
    } catch {
        return null;
    }
}
