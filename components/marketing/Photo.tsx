/** A real, keyword-matched photo (stable locked seed). Plain lazy <img>, no config needed. */
export function Photo({ q, alt, seed = 1, caption, place, className = "" }: { q: string; alt: string; seed?: number; caption?: string; place?: string; className?: string }) {
    return (
        <figure className={`group relative overflow-hidden rounded-3xl ring-1 ring-line ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={`https://loremflickr.com/900/700/${encodeURIComponent(q)}?lock=${seed}`}
                alt={alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {(caption || place) && (
                <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                    <figcaption className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2">
                        {caption && <span className="font-display text-[15px] text-white drop-shadow">{caption}</span>}
                        {place && <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-2xs font-semibold text-ink-soft backdrop-blur">{place}</span>}
                    </figcaption>
                </>
            )}
        </figure>
    );
}
