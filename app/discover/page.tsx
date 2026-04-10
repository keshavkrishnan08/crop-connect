"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import UserCard from "@/components/UserCard";
import { Profile } from "@/hooks/useProfile";
import Link from "next/link";

export default function DiscoverPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<'all' | 'farmer' | 'buyer'>('all');

    useEffect(() => {
        fetchProfiles();
    }, [roleFilter]);

    const fetchProfiles = async () => {
        setLoading(true);
        setError(null);

        let query = supabase
            .from('profiles')
            .select('*');

        if (roleFilter !== 'all') {
            query = query.eq('role', roleFilter);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
            setError('Could not load profiles. Please try again.');
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    };

    const filteredProfiles = profiles.filter(p =>
    (p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase()) ||
        p.crops?.some(c => c.toLowerCase().includes(search.toLowerCase())))
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D130E] font-display">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-[#0D130E]/70 backdrop-blur-3xl border-b border-gray-100 dark:border-white/5 h-20 md:h-24 flex items-center justify-between section-zoom">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft group-hover:rotate-6 transition-all duration-500">
                        <span className="material-symbols-outlined !text-[24px] font-black">spa</span>
                    </div>
                    <h2 className="text-[#131613] dark:text-white text-xl font-black tracking-tighter">CropConnect</h2>
                </Link>

                <div className="hidden lg:flex items-center gap-10">
                    <Link href="/dashboard/farmer" className="text-gray-400 dark:text-[#a3b2a4] text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all">Dashboard</Link>
                    <Link href="/discover" className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Discover</Link>
                </div>

                <Link href="/auth/login" className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-4 ring-gray-100 dark:ring-white/5 hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined !text-[20px]">person</span>
                </Link>
            </header>

            <main className="flex-1 flex flex-col py-16 section-zoom gap-16">
                {/* Search and Filters */}
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-4 text-center sm:text-left">
                        <h1 className="text-[#131613] dark:text-white text-5xl md:text-6xl font-black tracking-tighter leading-tight">Explore the <span className="text-primary italic">Community</span>.</h1>
                        <p className="text-gray-500 dark:text-[#a3b2a4] text-xl font-medium">Find farmers, buyers, and local produce near you.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="relative flex-1 group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined !text-[24px]">search</span>
                            </span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, location, or crop..."
                                className="w-full h-16 bg-white dark:bg-[#1a2c15] border border-gray-200 dark:border-white/10 rounded-2xl pl-14 pr-6 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all shadow-card dark:text-white"
                            />
                        </div>
                        <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10">
                            {(['all', 'farmer', 'buyer'] as const).map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === role ? 'bg-white dark:bg-[#1a2c15] text-primary shadow-soft' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    {role}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {error ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-24 gap-4">
                        <div className="size-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined !text-4xl">error</span>
                        </div>
                        <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                        <button onClick={fetchProfiles} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex-1 flex items-center justify-center p-24">
                        <div className="size-20 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredProfiles.length > 0 ? (
                            filteredProfiles.map((profile) => (
                                <UserCard key={profile.id} profile={profile} />
                            ))
                        ) : (
                            <div className="col-span-full py-40 flex flex-col items-center justify-center text-center gap-6">
                                <div className="size-24 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300">
                                    <span className="material-symbols-outlined !text-4xl">search_off</span>
                                </div>
                                <h3 className="text-2xl font-black text-[#131613] dark:text-white">No users found</h3>
                                <p className="text-gray-500 dark:text-[#a3b2a4] max-w-sm">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
