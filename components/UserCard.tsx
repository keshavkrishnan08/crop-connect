"use client";

import { Profile } from "@/hooks/useProfile";

export default function UserCard({ profile }: { profile: Profile }) {
    return (
        <div className="bg-white dark:bg-[#1a2c15] p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-white/5 transition-all duration-500 hover:shadow-glow hover:-translate-y-1 group">
            <div className="flex items-center gap-6 mb-8">
                <div className="size-20 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-inner-soft">
                    {profile.profile_picture ? (
                        <img src={profile.profile_picture} alt={profile.full_name || "User"} className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-gray-300 text-4xl">person</span>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-[#131613] dark:text-white tracking-tight">{profile.full_name || "Anonymous User"}</h3>
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{profile.role || "User"}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {profile.farm_name && (
                    <div className="flex items-center gap-3 text-gray-500 dark:text-[#a3b2a4]">
                        <span className="material-symbols-outlined !text-xl">agriculture</span>
                        <p className="text-sm font-bold italic">{profile.farm_name}</p>
                    </div>
                )}
                {profile.location && (
                    <div className="flex items-center gap-3 text-gray-500 dark:text-[#a3b2a4]">
                        <span className="material-symbols-outlined !text-xl">location_on</span>
                        <p className="text-sm font-bold">{profile.location}</p>
                    </div>
                )}
            </div>

            {profile.crops && profile.crops.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {profile.crops.map((crop) => (
                        <span key={crop} className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-white/10 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                            {crop}
                        </span>
                    ))}
                </div>
            )}

            <button className="w-full py-4 bg-gray-50 dark:bg-white/5 text-[#131613] dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-100 dark:border-white/10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                View Profile
            </button>
        </div>
    );
}
