"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { validateImageFile } from "@/lib/upload-validation";
import MapLocationPicker from "@/components/MapLocationPicker";

export default function FarmerOnboardingPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { profile, updateProfile, loading: profileLoading } = useProfile();

    // Redirect to login if not authenticated after loading completes
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [authLoading, user, router]);

    const [farmName, setFarmName] = useState("");
    const [location, setLocation] = useState("");
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [farmSize, setFarmSize] = useState("");
    const [farmUnit, setFarmUnit] = useState("Acres");
    const [yearEstablished, setYearEstablished] = useState("");
    const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
    const [cropInput, setCropInput] = useState("");
    const [yearsFarming, setYearsFarming] = useState("");
    const [website, setWebsite] = useState("");
    const [bio, setBio] = useState("");
    const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasLoadedProfileRef = useRef(false);

    // Load existing profile data once on first availability
    useEffect(() => {
        if (profile && !hasLoadedProfileRef.current) {
            hasLoadedProfileRef.current = true;
            setFarmName(profile.farm_name || "");
            setLocation(profile.location || "");
            setFarmSize(profile.farm_size?.toString() || "");
            setFarmUnit(profile.farm_unit || "Acres");
            setYearEstablished(profile.year_established?.toString() || "");
            setSelectedCrops(profile.crops || []);
            setYearsFarming(profile.years_farming?.toString() || "");
            setWebsite(profile.website || "");
            setBio(profile.bio || "");
            setSelectedCertifications(profile.certifications || []);
            setProfilePicture(profile.profile_picture || null);
        }
    }, [profile]);

    const suggestedCrops = ["Soybeans", "Potatoes", "Tomatoes", "Carrots", "Onions"];

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8faf8] dark:bg-[#111811] font-display">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary animate-pulse">
                        <span className="material-symbols-outlined text-3xl">agriculture</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    const addCrop = (crop: string) => {
        if (crop && !selectedCrops.includes(crop)) {
            setSelectedCrops([...selectedCrops, crop]);
            setCropInput("");
        }
    };

    const removeCrop = (crop: string) => {
        setSelectedCrops(selectedCrops.filter(c => c !== crop));
    };

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

    return (
        <div className="flex flex-col min-h-screen bg-[#f8faf8] dark:bg-[#111811]">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#111811]/90 backdrop-blur-xl px-6 lg:px-10 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="text-primary size-10 flex items-center justify-center bg-primary/10 rounded-xl transition-all hover:scale-110">
                        <span className="material-symbols-outlined !text-[28px]">agriculture</span>
                    </div>
                    <h2 className="text-[#131811] dark:text-white text-lg font-bold leading-tight tracking-tight">CropConnect</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#a3b2a4]">Profile Setup</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center py-8 lg:py-10 px-4 lg:px-0">
                <div className="w-full max-w-[680px] flex flex-col gap-6">
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-4 px-4 lg:px-0 max-w-lg mx-auto w-full">
                        <div className="flex gap-6 justify-between items-center">
                            <p className="text-[#131811] dark:text-white text-sm font-black uppercase tracking-widest">Farm Profile Setup</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold hidden sm:block uppercase tracking-wider">Almost there</p>
                        </div>
                        <div className="rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden h-2">
                            <div className="h-full rounded-full bg-primary shadow-glow transition-all duration-700 ease-out" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    {/* Main Card Container */}
                    <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 p-6 lg:p-8 flex flex-col gap-8">
                        {/* Page Heading */}
                        <div className="flex flex-col gap-2 text-center sm:text-left">
                            <h1 className="text-[#131811] dark:text-white tracking-tight text-2xl font-black leading-tight sm:text-3xl">Tell us about your Farm</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Help buyers find you by adding your basic details.</p>
                        </div>

                        {/* Form Content */}
                        <div className="flex flex-col gap-8">
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
                                    <p className="text-[#131811] dark:text-white text-lg font-black">Farm Profile Picture</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed font-medium">Upload a logo or photo of your farm. Max 5MB.</p>
                                </div>
                            </div>

                            {/* Input Fields Grid */}
                            <div className="grid grid-cols-1 gap-6">
                                {/* Farm Name */}
                                <div className="flex flex-col w-full gap-2">
                                    <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest ml-1">Farm Name</p>
                                    <input
                                        value={farmName}
                                        onChange={(e) => setFarmName(e.target.value)}
                                        className="w-full rounded-xl text-[#131811] dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-11 px-4 text-sm transition-all outline-none font-bold shadow-inner-soft"
                                        placeholder="e.g., Green Valley Organics"
                                    />
                                </div>

                                {/* Location & Map */}
                                <MapLocationPicker
                                    value={location}
                                    onChange={(newLocation, coords) => {
                                        setLocation(newLocation);
                                        if (coords) {
                                            setCoordinates(coords);
                                        }
                                    }}
                                    placeholder="Search for your farm address..."
                                />

                                {/* Farm Size & Unit */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col w-full gap-2">
                                        <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest ml-1">Total Size</p>
                                        <div className="flex gap-2">
                                            <input
                                                value={farmSize}
                                                onChange={(e) => setFarmSize(e.target.value)}
                                                className="flex-1 rounded-xl text-[#131811] dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-11 px-4 text-sm transition-all outline-none font-bold shadow-inner-soft"
                                                placeholder="0"
                                                type="number"
                                            />
                                            <div className="relative w-32">
                                                <select
                                                    value={farmUnit}
                                                    onChange={(e) => setFarmUnit(e.target.value)}
                                                    className="appearance-none w-full h-full rounded-xl text-[#131811] dark:text-white border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 text-sm font-black outline-none cursor-pointer shadow-inner-soft"
                                                >
                                                    <option>Acres</option>
                                                    <option>Hectares</option>
                                                </select>
                                                <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-primary">
                                                    <span className="material-symbols-outlined text-2xl">expand_more</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full gap-2">
                                        <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest ml-1">Year Established</p>
                                        <input
                                            value={yearEstablished}
                                            onChange={(e) => setYearEstablished(e.target.value)}
                                            className="w-full rounded-xl text-[#131811] dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-11 px-4 text-sm transition-all outline-none font-bold shadow-inner-soft"
                                            placeholder="e.g., 2015"
                                            type="number"
                                        />
                                    </div>
                                </div>

                                {/* Primary Crops (Multi-select) */}
                                <div className="flex flex-col w-full gap-3">
                                    <div className="flex justify-between items-center w-full px-1">
                                        <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest">What do you grow?</p>
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Select all that apply</span>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 min-h-[100px] transition-all focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary shadow-inner-soft">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {selectedCrops.map(crop => (
                                                <div key={crop} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white dark:bg-primary/20 text-primary dark:text-white rounded-xl text-xs font-black border border-primary/10 shadow-sm hover:shadow-md transition-all animate-fade-in group/tag">
                                                    {crop}
                                                    <button
                                                        onClick={() => removeCrop(crop)}
                                                        className="hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-400 hover:text-red-500 rounded-xl p-1 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined !text-xl">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <input
                                            value={cropInput}
                                            onChange={(e) => setCropInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addCrop(cropInput.trim());
                                                }
                                            }}
                                            className="w-full bg-transparent border-none focus:ring-0 p-2 text-sm placeholder:text-gray-400 font-bold dark:text-white"
                                            placeholder="Type to add crop and press Enter..."
                                        />
                                    </div>
                                    {/* Suggested Quick Adds */}
                                    <div className="flex gap-2 flex-wrap px-1">
                                        {suggestedCrops.filter(c => !selectedCrops.includes(c)).map(crop => (
                                            <button
                                                key={crop}
                                                onClick={() => addCrop(crop)}
                                                className="text-xs font-black px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm hover:shadow-md"
                                            >
                                                + {crop}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Years Farming & Website */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col w-full gap-2">
                                        <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest ml-1">Years of Experience</p>
                                        <input
                                            value={yearsFarming}
                                            onChange={(e) => setYearsFarming(e.target.value)}
                                            className="w-full rounded-xl text-[#131811] dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-11 px-4 text-sm transition-all outline-none font-bold shadow-inner-soft"
                                            placeholder="e.g., 10"
                                            type="number"
                                        />
                                    </div>
                                    <div className="flex flex-col w-full gap-2">
                                        <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest ml-1">Website (optional)</p>
                                        <input
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="w-full rounded-xl text-[#131811] dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-11 px-4 text-sm transition-all outline-none font-bold shadow-inner-soft"
                                            placeholder="https://yourfarm.com"
                                        />
                                    </div>
                                </div>

                                {/* Certifications */}
                                <div className="flex flex-col w-full gap-3">
                                    <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest ml-1">Certifications (optional)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {["USDA Organic", "Non-GMO", "Fair Trade", "GAP Certified", "Rainforest Alliance", "Animal Welfare Approved"].map(cert => (
                                            <button
                                                key={cert}
                                                type="button"
                                                onClick={() => {
                                                    if (selectedCertifications.includes(cert)) {
                                                        setSelectedCertifications(selectedCertifications.filter(c => c !== cert));
                                                    } else {
                                                        setSelectedCertifications([...selectedCertifications, cert]);
                                                    }
                                                }}
                                                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                                                    selectedCertifications.includes(cert)
                                                        ? 'bg-primary text-white shadow-glow'
                                                        : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                {selectedCertifications.includes(cert) && (
                                                    <span className="material-symbols-outlined !text-[14px] mr-1 align-middle">check</span>
                                                )}
                                                {cert}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="flex flex-col w-full gap-2">
                                    <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest ml-1">About Your Farm (optional)</p>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-xl text-[#131811] dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 py-3 text-sm transition-all outline-none font-bold shadow-inner-soft resize-none"
                                        placeholder="Tell buyers about your farm, practices, and what makes your produce special..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    await updateProfile({
                                        farm_name: farmName,
                                        location: location,
                                        farm_size: farmSize || null,
                                        farm_unit: farmUnit,
                                        year_established: parseInt(yearEstablished) || null,
                                        crops: selectedCrops,
                                        years_farming: parseInt(yearsFarming) || null,
                                        website: website || null,
                                        bio: bio || null,
                                        certifications: selectedCertifications.length > 0 ? selectedCertifications : null,
                                        role: 'farmer'
                                    });
                                    setIsSaving(false);
                                }}
                                className="w-full sm:w-auto text-gray-500 dark:text-gray-400 text-sm font-black px-8 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all"
                            >
                                {isSaving ? "Saving..." : "Save for Later"}
                            </button>
                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    const { success } = await updateProfile({
                                        farm_name: farmName,
                                        location: location,
                                        farm_size: farmSize || null,
                                        farm_unit: farmUnit,
                                        year_established: parseInt(yearEstablished) || null,
                                        crops: selectedCrops,
                                        role: 'farmer'
                                    });
                                    setIsSaving(false);
                                    if (success) {
                                        router.push('/dashboard/farmer');
                                    }
                                }}
                                disabled={isSaving}
                                className="w-full sm:w-auto bg-primary text-white text-sm font-black px-10 py-3 rounded-xl shadow-glow hover:bg-primary-dark hover:shadow-premium hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95 group disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Continue to Verification"}
                                {!isSaving && <span className="material-symbols-outlined !text-xl font-black transition-transform group-hover:translate-x-1">arrow_forward</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

