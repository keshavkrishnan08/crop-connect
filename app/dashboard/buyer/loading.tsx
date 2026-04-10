export default function BuyerDashboardLoading() {
    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
            {/* Hero / Greeting */}
            <div className="space-y-2">
                <div className="h-9 w-64 bg-gray-200 dark:bg-white/10 rounded-xl" />
                <div className="h-5 w-40 bg-gray-100 dark:bg-white/5 rounded-lg" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="card-glass p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded" />
                            <div className="size-10 rounded-xl bg-gray-200 dark:bg-white/10" />
                        </div>
                        <div className="h-8 w-12 bg-gray-200 dark:bg-white/10 rounded" />
                    </div>
                ))}
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="card-glass p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gray-200 dark:bg-white/10" />
                            <div className="space-y-1.5 flex-1">
                                <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded" />
                                <div className="h-3 w-48 bg-gray-100 dark:bg-white/5 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Listings grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gray-200 dark:bg-white/10" />
                    <div className="space-y-1.5">
                        <div className="h-6 w-36 bg-gray-200 dark:bg-white/10 rounded" />
                        <div className="h-3 w-52 bg-gray-100 dark:bg-white/5 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card-glass overflow-hidden">
                            <div className="h-32 bg-gray-200 dark:bg-white/10" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                                <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded" />
                                <div className="flex justify-between mt-3">
                                    <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                                    <div className="h-5 w-20 bg-gray-200 dark:bg-white/10 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Farmers grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gray-200 dark:bg-white/10" />
                    <div className="space-y-1.5">
                        <div className="h-6 w-28 bg-gray-200 dark:bg-white/10 rounded" />
                        <div className="h-3 w-44 bg-gray-100 dark:bg-white/5 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card-glass p-4 flex flex-col items-center">
                            <div className="size-14 rounded-full bg-gray-200 dark:bg-white/10 mb-3" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded mb-2" />
                            <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
