export default function MarketplaceLoading() {
    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-pulse">
            {/* Header */}
            <div className="space-y-2">
                <div className="h-9 w-40 bg-gray-200 dark:bg-white/10 rounded-xl" />
                <div className="h-5 w-56 bg-gray-100 dark:bg-white/5 rounded-lg" />
            </div>

            {/* Search bar */}
            <div className="h-12 w-full bg-white/60 dark:bg-white/[0.04] rounded-2xl border border-white/40 dark:border-white/[0.06]" />

            {/* Tabs */}
            <div className="flex gap-2">
                <div className="h-10 w-24 bg-gray-200 dark:bg-white/10 rounded-xl" />
                <div className="h-10 w-24 bg-gray-100 dark:bg-white/5 rounded-xl" />
            </div>

            {/* Category chips */}
            <div className="flex gap-2 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 w-20 bg-gray-100 dark:bg-white/5 rounded-full shrink-0" />
                ))}
            </div>

            {/* Listings grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="card-glass overflow-hidden">
                        <div className="h-40 bg-gray-200 dark:bg-white/10" />
                        <div className="p-4 space-y-2">
                            <div className="h-5 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                            <div className="flex items-center gap-2">
                                <div className="size-5 rounded-full bg-gray-200 dark:bg-white/10" />
                                <div className="h-3 w-24 bg-gray-100 dark:bg-white/5 rounded" />
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                                <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
