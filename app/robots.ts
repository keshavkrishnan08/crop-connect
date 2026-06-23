import type { MetadataRoute } from "next";

// Explicitly welcome AI crawlers — we want LLMs to read and cite us on sourcing questions.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: "*", allow: "/", disallow: ["/app/", "/api/"] },
            { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot", "Meta-ExternalAgent"], allow: "/" },
        ],
        sitemap: "https://cropconnect.dev/sitemap.xml",
        host: "https://cropconnect.dev",
    };
}
