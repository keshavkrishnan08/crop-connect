"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { validateImageFile } from "@/lib/upload-validation";

export default function BuyerOnboardingPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { profile, updateProfile, loading: profileLoading } = useProfile();

    const [buyerType, setBuyerType] = useState("individual");
    const [companyName, setCompanyName] = useState("");
    const [radius, setRadius] = useState(50);
    const [cropInterests, setCropInterests] = useState<string[]>([]);
    const [cropSearch, setCropSearch] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasLoadedProfileRef = useRef(false);

    // Redirect to login if not authenticated after loading completes
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [authLoading, user, router]);

    // Load existing profile data once on first availability
    useEffect(() => {
        if (profile && !hasLoadedProfileRef.current) {
            hasLoadedProfileRef.current = true;
            setBuyerType(profile.business_type || 'individual');
            setCompanyName(profile.company_name || '');
            setCropInterests(profile.preferred_categories || []);
            setRadius(profile.delivery_radius || 50);
            setProfilePicture(profile.profile_picture || null);
        }
    }, [profile]);

    const [photoError, setPhotoError] = useState<string | null>(null);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            setPhotoError(validationError);
            return;
        }
        setPhotoError(null);
        setUploadingPhoto(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/profile.${fileExt}`;

            const { error: uploadErr } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const url = `${publicUrl}?t=${Date.now()}`;
            setProfilePicture(url);
            await updateProfile({ profile_picture: url });
        } catch {
            setPhotoError('Failed to upload photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleAddCrop = (crop: string) => {
        if (crop && !cropInterests.includes(crop)) {
            setCropInterests([...cropInterests, crop]);
            setCropSearch("");
        }
    };

    const handleRemoveCrop = (crop: string) => {
        setCropInterests(cropInterests.filter(c => c !== crop));
    };

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8faf8] dark:bg-[#111811] font-display">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 bg-earth/10 rounded-xl flex items-center justify-center text-earth animate-pulse">
                        <span className="material-symbols-outlined text-3xl">shopping_basket</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f8faf8] dark:bg-[#111811]">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-100 dark:border-white/5 px-6 lg:px-10 py-4 bg-white/80 dark:bg-[#111811]/90 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="size-10 text-primary bg-primary/10 rounded-xl flex items-center justify-center transition-all hover:scale-110">
                        <span className="material-symbols-outlined !text-[28px]">agriculture</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">CropConnect</h2>
                </div>
                <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-[#a3b2a4]">Profile Setup</span>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[680px] flex flex-col gap-6">
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-6 justify-between items-end">
                            <p className="text-slate-900 dark:text-white text-sm font-black uppercase tracking-widest">Profile Setup</p>
                            <p className="text-slate-400 dark:text-[#a3b2a4] text-xs font-black uppercase tracking-widest">Almost there</p>
                        </div>
                        <div className="rounded-full h-2 w-full bg-slate-100 dark:bg-[#414e42] overflow-hidden">
                            <div className="h-full rounded-full bg-primary shadow-glow transition-all duration-700 ease-out" style={{ width: '50%' }}></div>
                        </div>
                    </div>

                    {/* Page Header */}
                    <div className="flex flex-col gap-2 text-center sm:text-left">
                        <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Tell us about your buying needs
                        </h1>
                        <p className="text-slate-500 dark:text-[#a3b2a4] text-base font-medium">
                            This helps us match you with the right local farmers.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 bg-white dark:bg-[#1a2c15] rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 p-6 lg:p-8">
                        {/* Profile Picture Upload */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="size-24 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primary group-hover:scale-105 group-hover:shadow-glow">
                                    {profilePicture ? (
                                        <div
                                            className="w-full h-full bg-cover bg-center"
                                            style={{ backgroundImage: `url("${profilePicture}")` }}
                                        />
                                    ) : uploadingPhoto ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    ) : (
                                        <span className="material-symbols-outlined text-gray-300 text-3xl group-hover:text-primary transition-colors">add_a_photo</span>
                                    )}
                                </div>
                                {uploadingPhoto && profilePicture && (
                                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#2a3c24] text-primary rounded-2xl p-2.5 shadow-premium border border-gray-100 dark:border-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <span className="material-symbols-outlined text-xl font-bold">edit</span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex flex-col justify-center gap-2 text-center sm:text-left pt-1">
                                <p className="text-[#131811] dark:text-white text-lg font-black">Profile Picture</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed font-medium">Upload a photo to build trust with farmers. Max 5MB.</p>
                            </div>
                        </div>

                        {/* Section 1: Buyer Type */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">I am a...</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Option individual */}
                                <label className="group relative flex flex-col items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all duration-300 hover:shadow-premium hover:-translate-y-1 overflow-hidden">
                                    <input
                                        type="radio"
                                        name="buyer_type"
                                        value="individual"
                                        checked={buyerType === "individual"}
                                        onChange={(e) => setBuyerType(e.target.value)}
                                        className="peer sr-only"
                                    />
                                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner-soft ${buyerType === 'individual' ? 'bg-primary text-white scale-110 shadow-glow' : 'bg-gray-50 text-gray-400 dark:bg-white/5 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                        <span className="material-symbols-outlined text-2xl">person</span>
                                    </div>
                                    <div className="flex flex-col gap-2 relative z-10">
                                        <p className={`text-base font-black transition-colors ${buyerType === 'individual' ? 'text-slate-900 dark:text-white underline decoration-primary decoration-4 underline-offset-4' : 'text-slate-500 dark:text-gray-400'}`}>Individual</p>
                                        <p className="text-slate-500 dark:text-[#a3b2a4] text-sm font-medium leading-relaxed italic">Personal consumption</p>
                                    </div>
                                    <div className={`absolute inset-0 rounded-2xl border-2 transition-all ${buyerType === 'individual' ? 'border-primary ring-4 ring-primary/5 bg-primary/[0.02]' : 'border-gray-100 dark:border-white/10'}`}></div>
                                </label>
                                {/* Option restaurant */}
                                <label className="group relative flex flex-col items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all duration-300 hover:shadow-premium hover:-translate-y-1 overflow-hidden">
                                    <input
                                        type="radio"
                                        name="buyer_type"
                                        value="restaurant"
                                        checked={buyerType === "restaurant"}
                                        onChange={(e) => setBuyerType(e.target.value)}
                                        className="peer sr-only"
                                    />
                                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner-soft ${buyerType === 'restaurant' ? 'bg-primary text-white scale-110 shadow-glow' : 'bg-gray-50 text-gray-400 dark:bg-white/5 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                        <span className="material-symbols-outlined text-2xl">restaurant</span>
                                    </div>
                                    <div className="flex flex-col gap-2 relative z-10">
                                        <p className={`text-base font-black transition-colors ${buyerType === 'restaurant' ? 'text-slate-900 dark:text-white underline decoration-primary decoration-4 underline-offset-4' : 'text-slate-500 dark:text-gray-400'}`}>Restaurant</p>
                                        <p className="text-slate-500 dark:text-[#a3b2a4] text-sm font-medium leading-relaxed italic">Menu sourcing</p>
                                    </div>
                                    <div className={`absolute inset-0 rounded-2xl border-2 transition-all ${buyerType === 'restaurant' ? 'border-primary ring-4 ring-primary/5 bg-primary/[0.02]' : 'border-gray-100 dark:border-white/10'}`}></div>
                                </label>
                                {/* Option wholesaler */}
                                <label className="group relative flex flex-col items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all duration-300 hover:shadow-premium hover:-translate-y-1 overflow-hidden">
                                    <input
                                        type="radio"
                                        name="buyer_type"
                                        value="wholesaler"
                                        checked={buyerType === "wholesaler"}
                                        onChange={(e) => setBuyerType(e.target.value)}
                                        className="peer sr-only"
                                    />
                                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner-soft ${buyerType === 'wholesaler' ? 'bg-primary text-white scale-110 shadow-glow' : 'bg-gray-50 text-gray-400 dark:bg-white/5 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                        <span className="material-symbols-outlined text-2xl">storefront</span>
                                    </div>
                                    <div className="flex flex-col gap-2 relative z-10">
                                        <p className={`text-base font-black transition-colors ${buyerType === 'wholesaler' ? 'text-slate-900 dark:text-white underline decoration-primary decoration-4 underline-offset-4' : 'text-slate-500 dark:text-gray-400'}`}>Wholesaler</p>
                                        <p className="text-slate-500 dark:text-[#a3b2a4] text-sm font-medium leading-relaxed italic">Bulk distribution</p>
                                    </div>
                                    <div className={`absolute inset-0 rounded-2xl border-2 transition-all ${buyerType === 'wholesaler' ? 'border-primary ring-4 ring-primary/5 bg-primary/[0.02]' : 'border-gray-100 dark:border-white/10'}`}></div>
                                </label>
                            </div>
                        </div>

                        {/* Company Name (for restaurant/wholesaler) */}
                        {buyerType !== 'individual' && (
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Business Name</h3>
                                <input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-11 px-4 text-sm transition-all outline-none font-bold shadow-inner-soft"
                                    placeholder="e.g., Fresh Kitchen Co."
                                />
                            </div>
                        )}

                        {/* Section 2: Radius Slider */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Preferred Delivery Radius</h3>
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 shadow-inner-soft border border-gray-100 dark:border-white/10">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10">
                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">From my location</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{radius}</span>
                                        <span className="text-base font-bold text-slate-400">km</span>
                                    </div>
                                </div>
                                <div className="relative w-full h-12 flex items-center group">
                                    <input
                                        className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
                                        max="100"
                                        min="0"
                                        type="range"
                                        value={radius}
                                        onChange={(e) => setRadius(parseInt(e.target.value))}
                                    />
                                    <div className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded-full absolute z-0 overflow-hidden shadow-inner-soft">
                                        <div className="h-full bg-primary transition-all duration-100 group-hover:bg-[#3dd60f] shadow-glow" style={{ width: `${radius}%` }}></div>
                                    </div>
                                    <div
                                        className="size-10 bg-white dark:bg-slate-800 border-4 border-primary rounded-full absolute z-10 shadow-premium flex items-center justify-center pointer-events-none transition-transform group-active:scale-125"
                                        style={{ left: `${radius}%`, transform: 'translateX(-50%)' }}
                                    >
                                        <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-4 text-[10px] text-slate-400 dark:text-[#a3b2a4] font-black uppercase tracking-[0.2em] px-1">
                                    <span>Local (0 km)</span>
                                    <span>Regional (100 km)</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Crop Interests */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Crop Interests</h3>
                            <div className="bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 p-5 flex flex-col gap-5 shadow-inner-soft">
                                <p className="text-sm font-medium text-slate-500 dark:text-[#a3b2a4] pl-1 leading-relaxed">Select the crops you are most interested in purchasing.</p>
                                {/* Input Area */}
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">search</span>
                                        </span>
                                        <input
                                            className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm h-11 shadow-inner-soft"
                                            placeholder="Search crops (e.g. Potatoes, Apples...)"
                                            value={cropSearch}
                                            onChange={(e) => setCropSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCrop(cropSearch.trim())}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleAddCrop(cropSearch.trim())}
                                        className="bg-primary hover:bg-primary-dark text-white px-6 rounded-xl font-black transition-all shadow-glow hover:shadow-premium active:scale-95 text-sm"
                                        type="button"
                                    >
                                        Add
                                    </button>
                                </div>
                                {/* Tag Cloud */}
                                <div className="flex flex-wrap gap-2 px-1">
                                    {cropInterests.map(crop => (
                                        <div key={crop} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-white dark:bg-primary/20 text-primary border border-primary/10 text-xs font-black shadow-sm hover:shadow-glow transition-all animate-fade-in group/tag">
                                            <span>{crop}</span>
                                            <button
                                                onClick={() => handleRemoveCrop(crop)}
                                                className="hover:bg-primary/10 rounded-xl p-1 transition-colors"
                                                type="button"
                                            >
                                                <span className="material-symbols-outlined text-[20px] block">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {["Wheat", "Soybeans", "Carrots"].filter(c => !cropInterests.includes(c)).map(crop => (
                                        <button
                                            key={crop}
                                            onClick={() => handleAddCrop(crop)}
                                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-slate-500 dark:text-[#a3b2a4] text-xs font-black hover:border-primary hover:text-primary transition-all bg-white dark:bg-white/5 shadow-sm hover:shadow-premium"
                                            type="button"
                                        >
                                            + {crop}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                            <button
                                onClick={() => router.back()}
                                className="text-slate-500 dark:text-[#a3b2a4] font-black text-sm hover:text-slate-900 dark:hover:text-white px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                                type="button"
                            >
                                Back
                            </button>
                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    const { success } = await updateProfile({
                                        role: 'buyer',
                                        business_type: buyerType,
                                        company_name: companyName || null,
                                        preferred_categories: cropInterests,
                                        delivery_radius: radius,
                                    });
                                    setIsSaving(false);
                                    if (success) {
                                        router.push('/dashboard/buyer');
                                    }
                                }}
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-black text-sm px-10 py-3 rounded-xl shadow-glow hover:shadow-premium hover:-translate-y-0.5 transition-all active:scale-95 group disabled:opacity-50"
                                type="button"
                            >
                                <span>{isSaving ? "Saving..." : "Save & Continue"}</span>
                                {!isSaving && <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

