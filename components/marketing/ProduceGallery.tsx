"use client";

import { motion } from "framer-motion";
import { MapPin } from "@/components/icons";

/** Real, keyword-matched photos (stable locked seeds). Plain <img>, lazy-loaded. */
const TILES: { q: string; label: string; place: string; feature?: boolean }[] = [
    { q: "heirloom,tomatoes", label: "Heirloom tomatoes", place: "Teter Farm", feature: true },
    { q: "salad,greens", label: "Garden greens", place: "Blue Oak" },
    { q: "mushrooms", label: "Mushrooms", place: "Ember & Lu" },
    { q: "fresh,herbs", label: "Herbs", place: "Blue Oak" },
    { q: "squash,vegetable", label: "Summer squash", place: "Sunfield" },
    { q: "farm,field,vegetables", label: "Picked this week", place: "Sebastopol" },
];

export function ProduceGallery() {
    return (
        <div className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[160px] sm:grid-cols-3 sm:gap-4">
            {TILES.map((t, i) => (
                <motion.figure
                    key={t.q}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`group relative overflow-hidden rounded-2xl ring-1 ring-line ${t.feature ? "col-span-2 row-span-2" : ""}`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://loremflickr.com/800/800/${t.q}?lock=${i + 21}`}
                        alt={t.label}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                    <figcaption className="absolute inset-x-3 bottom-3 flex items-end justify-between">
                        <span className="font-display text-sm text-white drop-shadow sm:text-base">{t.label}</span>
                        <span className="hidden items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-2xs font-semibold text-ink-soft backdrop-blur sm:inline-flex">
                            <MapPin size={10} /> {t.place}
                        </span>
                    </figcaption>
                </motion.figure>
            ))}
        </div>
    );
}
