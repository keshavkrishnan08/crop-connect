import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://cropconnect.dev";
    const routes = ["", "/how-it-works", "/what-we-handle", "/pricing", "/for-farms"];
    return routes.map((r) => ({
        url: `${base}${r}`,
        changeFrequency: "weekly",
        priority: r === "" ? 1 : 0.7,
    }));
}
