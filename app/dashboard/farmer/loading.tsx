export default function FarmerDashboardLoading() {
    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
            {/* Greeting */}
            <div className="space-y-2">
                <div className="h-9 w-56 bg-gray-200 dark:bg-white/10 rounded-xl" />
                <div className="h-5 w-36 bg-gray-100 dark:bg-white/5 rounded-lg" />
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

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Listings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gray-200 dark:bg-white/10" />
                            <div className="h-6 w-28 bg-gray-200 dark:bg-white/10 rounded" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="card-glass p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-xl bg-gray-200 dark:bg-white/10" />
                                        <div className="space-y-1.5 flex-1">
                                            <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                                            <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-3 w-20 bg-gray-100 dark:bg-white/5 rounded" />
                                        <div className="h-5 w-16 bg-gray-200 dark:bg-white/10 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Orders */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gray-200 dark:bg-white/10" />
                            <div className="h-6 w-28 bg-gray-200 dark:bg-white/10 rounded" />
                        </div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card-glass p-4 flex items-center gap-4">
                                <div className="size-10 rounded-lg bg-gray-200 dark:bg-white/10" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded" />
                                    <div className="h-3 w-24 bg-gray-100 dark:bg-white/5 rounded" />
                                </div>
                                <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side column */}
                <div className="space-y-6">
                    <div className="card-glass p-5 space-y-4">
                        <div className="h-5 w-28 bg-gray-200 dark:bg-white/10 rounded" />
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-white/10" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                                    <div className="h-2 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="card-glass p-5 space-y-3">
                        <div className="h-5 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                        <div className="h-10 w-full bg-gray-200 dark:bg-white/10 rounded-xl" />
                        <div className="h-10 w-full bg-gray-100 dark:bg-white/5 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
