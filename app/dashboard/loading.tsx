export default function DashboardLoading() {
    return (
        <div className="flex-1 w-full p-4 md:p-8 space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded-xl" />
                    <div className="h-4 w-32 bg-gray-100 dark:bg-white/5 rounded-lg" />
                </div>
                <div className="h-10 w-28 bg-gray-200 dark:bg-white/10 rounded-xl" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/40 dark:border-white/[0.06] p-4 space-y-3">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded" />
                        <div className="h-8 w-16 bg-gray-200 dark:bg-white/10 rounded" />
                    </div>
                ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/40 dark:border-white/[0.06] p-4 space-y-3">
                        <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-xl" />
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                        <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
