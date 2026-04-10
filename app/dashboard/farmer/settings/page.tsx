"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { supabase } from "@/lib/supabase";
import { validateImageFile, validateImageFiles } from "@/lib/upload-validation";

export default function FarmerSettings() {
    const searchParams = useSearchParams();
    const { profile, loading, updateProfile, refreshProfile } = useProfile();
    const { isLoading: stripeLoading, error: stripeError, startOnboarding, checkOnboardingStatus, clearError: clearStripeError } = useStripeConnect();
    const profilePhotoRef = useRef<HTMLInputElement>(null);
    const farmPhotosRef = useRef<HTMLInputElement>(null);
    const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; payoutsEnabled: boolean; chargesEnabled: boolean } | null>(null);
    const [checkingStripe, setCheckingStripe] = useState(false);

    const [settings, setSettings] = useState({
        farm_name: "",
        full_name: "",
        location: "",
        bio: "",
        email: "",
        phone: "",
        delivery_radius: "",
        farm_address: "",
        farm_size: "",
        years_farming: "",
        website: "",
        certifications: [] as string[],
        farming_practices: [] as string[],
        crops_grown: "",
        payment_methods: [] as string[],
        operating_hours: "",
        seasonal_availability: "",
    });
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [farmPhotos, setFarmPhotos] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const certificationOptions = [
        "USDA Organic",
        "Non-GMO Project Verified",
        "GAP Certified",
        "Rainforest Alliance",
        "Fair Trade",
        "Certified Naturally Grown",
        "Animal Welfare Approved",
        "Certified Humane",
    ];

    const practiceOptions = [
        "Sustainable Farming",
        "Regenerative Agriculture",
        "No-Till Farming",
        "Cover Cropping",
        "Integrated Pest Management",
        "Permaculture",
        "Biodynamic",
        "Hydroponics",
        "Aquaponics",
    ];

    const paymentOptions = [
        "Cash",
        "Check",
        "Credit Card",
        "Debit Card",
        "ACH Transfer",
        "PayPal",
        "Venmo",
        "Wire Transfer",
    ];

    // Check Stripe status on mount and after return from onboarding
    useEffect(() => {
        const checkStripe = async () => {
            setCheckingStripe(true);
            const status = await checkOnboardingStatus();
            if (status) {
                setStripeStatus(status);
                if (status.connected && !profile?.stripe_onboarding_complete) {
                    refreshProfile();
                }
            }
            setCheckingStripe(false);
        };

        if (profile?.id) {
            checkStripe();
        }

        // Check if returning from Stripe onboarding
        const stripeParam = searchParams.get('stripe');
        if (stripeParam === 'complete') {
            checkStripe();
        }
    }, [profile?.id]);

    useEffect(() => {
        if (profile) {
            setSettings({
                farm_name: profile.farm_name || "",
                full_name: profile.full_name || "",
                location: profile.location || "",
                bio: profile.bio || "",
                email: profile.email || "",
                phone: profile.phone || "",
                delivery_radius: profile.delivery_radius?.toString() || "",
                farm_address: profile.farm_address || "",
                farm_size: profile.farm_size || "",
                years_farming: profile.years_farming?.toString() || "",
                website: profile.website || "",
                certifications: profile.certifications || [],
                farming_practices: profile.farming_practices || [],
                crops_grown: profile.crops_grown || "",
                payment_methods: profile.payment_methods || [],
                operating_hours: profile.operating_hours || "",
                seasonal_availability: profile.seasonal_availability || "",
            });
            setProfilePicture(profile.profile_picture || null);
            setFarmPhotos(profile.farm_photos || []);
        }
    }, [profile]);

    const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploadingPhoto(true);
        setError(null);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}/profile.${fileExt}`;

            const { error: uploadErr } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadErr) throw uploadErr;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
            setProfilePicture(newUrl);
            await updateProfile({ profile_picture: newUrl });
        } catch (err) {
            setError('Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleFarmPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !profile?.id) return;

        const validationError = validateImageFiles(files);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploadingPhoto(true);
        setError(null);
        try {
            const newPhotos: string[] = [];

            for (let i = 0; i < Math.min(files.length, 6 - farmPhotos.length); i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${profile.id}/farm-${Date.now()}-${i}.${fileExt}`;

                const { error: uploadErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, file);

                if (uploadErr) throw uploadErr;

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                newPhotos.push(urlData.publicUrl);
            }

            const updatedPhotos = [...farmPhotos, ...newPhotos];
            setFarmPhotos(updatedPhotos);
            await updateProfile({ farm_photos: updatedPhotos });
        } catch (err) {
            setError('Failed to upload farm photos');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const removeFarmPhoto = async (index: number) => {
        const updatedPhotos = farmPhotos.filter((_, i) => i !== index);
        setFarmPhotos(updatedPhotos);
        await updateProfile({ farm_photos: updatedPhotos });
    };

    const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
        if (array.includes(item)) {
            setter(array.filter(i => i !== item));
        } else {
            setter([...array, item]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const result = await updateProfile({
            farm_name: settings.farm_name,
            full_name: settings.full_name,
            location: settings.location,
            bio: settings.bio,
            email: settings.email,
            phone: settings.phone,
            delivery_radius: settings.delivery_radius ? parseInt(settings.delivery_radius) : null,
            farm_address: settings.farm_address,
            farm_size: settings.farm_size,
            years_farming: settings.years_farming ? parseInt(settings.years_farming) : null,
            website: settings.website,
            certifications: settings.certifications,
            farming_practices: settings.farming_practices,
            crops_grown: settings.crops_grown,
            payment_methods: settings.payment_methods,
            operating_hours: settings.operating_hours,
            seasonal_availability: settings.seasonal_availability,
        });

        setSaving(false);

        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            setError(result.error || "Failed to update settings");
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 space-y-10 animate-fade-in overflow-y-auto">
            <div className="border-b border-gray-100 dark:border-white/5 pb-8">
                <h1 className="text-3xl font-black tracking-tighter dark:text-white">Farm Profile & Settings</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">Create a compelling profile that helps buyers discover and trust your farm</p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-10">
                {/* Profile Photo Section */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">account_circle</span>
                        Profile Photo
                    </h2>
                    <div className="flex items-center gap-6">
                        <div
                            className="relative size-28 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/20 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => profilePhotoRef.current?.click()}
                        >
                            {profilePicture ? (
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url("${profilePicture}")` }}
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-gray-400">
                                    <span className="material-symbols-outlined !text-[32px]">add_a_photo</span>
                                    <span className="text-[10px] font-bold">Add Photo</span>
                                </div>
                            )}
                            {uploadingPhoto && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <input
                            ref={profilePhotoRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoUpload}
                            className="hidden"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-[#131613] dark:text-white">Upload your profile photo</p>
                            <p className="text-xs text-gray-500 mt-1">This helps buyers put a face to your farm. Square images work best.</p>
                            <button
                                type="button"
                                onClick={() => profilePhotoRef.current?.click()}
                                className="mt-3 px-4 py-2 bg-gray-100 dark:bg-white/10 text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors dark:text-white"
                            >
                                {profilePicture ? 'Change Photo' : 'Upload Photo'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Farm Photos Section */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3 section-header-accent">
                        <span className="material-symbols-outlined text-primary">photo_library</span>
                        Farm Gallery
                    </h2>
                    <p className="text-sm text-gray-500">Showcase your farm, crops, and operations. Buyers love seeing where their food comes from.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {farmPhotos.map((photo, index) => (
                            <div key={index} className="relative aspect-video rounded-xl overflow-hidden group">
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url("${photo}")` }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFarmPhoto(index)}
                                    className="absolute top-2 right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined !text-[18px]">close</span>
                                </button>
                            </div>
                        ))}
                        {farmPhotos.length < 6 && (
                            <div
                                className="aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-white/5"
                                onClick={() => farmPhotosRef.current?.click()}
                            >
                                <div className="flex flex-col items-center gap-1 text-gray-400">
                                    <span className="material-symbols-outlined !text-[32px]">add_photo_alternate</span>
                                    <span className="text-xs font-bold">Add Photo</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <input
                        ref={farmPhotosRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFarmPhotosUpload}
                        className="hidden"
                    />
                </div>

                {/* Farm Information */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3 section-header-accent">
                        <span className="material-symbols-outlined text-primary">agriculture</span>
                        Farm Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Farm Name *</label>
                            <input
                                value={settings.farm_name}
                                onChange={e => setSettings({ ...settings, farm_name: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="Miller Family Farm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Location (City, State)</label>
                            <input
                                value={settings.location}
                                onChange={e => setSettings({ ...settings, location: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="Des Moines, IA"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Farm Size (acres)</label>
                            <input
                                value={settings.farm_size}
                                onChange={e => setSettings({ ...settings, farm_size: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="150 acres"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Years Farming</label>
                            <input
                                type="number"
                                value={settings.years_farming}
                                onChange={e => setSettings({ ...settings, years_farming: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="25"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Farm Address</label>
                            <input
                                value={settings.farm_address}
                                onChange={e => setSettings({ ...settings, farm_address: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="1234 Farm Road, Des Moines, IA 50301"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Farm Description</label>
                            <textarea
                                value={settings.bio}
                                onChange={e => setSettings({ ...settings, bio: e.target.value })}
                                rows={4}
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all resize-none dark:text-white"
                                placeholder="Tell buyers about your farm's history, mission, and what makes your produce special..."
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Crops & Products Grown</label>
                            <textarea
                                value={settings.crops_grown}
                                onChange={e => setSettings({ ...settings, crops_grown: e.target.value })}
                                rows={2}
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all resize-none dark:text-white"
                                placeholder="Tomatoes, peppers, lettuce, squash, corn, beans..."
                            />
                        </div>
                    </div>
                </div>

                {/* Certifications */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">verified</span>
                        Certifications
                    </h2>
                    <p className="text-sm text-gray-500">Select all certifications your farm holds</p>
                    <div className="flex flex-wrap gap-2">
                        {certificationOptions.map(cert => (
                            <button
                                key={cert}
                                type="button"
                                onClick={() => toggleArrayItem(settings.certifications, cert, (arr) => setSettings({ ...settings, certifications: arr }))}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                    settings.certifications.includes(cert)
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                }`}
                            >
                                {settings.certifications.includes(cert) && (
                                    <span className="material-symbols-outlined !text-[14px] mr-1">check</span>
                                )}
                                {cert}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Farming Practices */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">eco</span>
                        Farming Practices
                    </h2>
                    <p className="text-sm text-gray-500">What methods do you use?</p>
                    <div className="flex flex-wrap gap-2">
                        {practiceOptions.map(practice => (
                            <button
                                key={practice}
                                type="button"
                                onClick={() => toggleArrayItem(settings.farming_practices, practice, (arr) => setSettings({ ...settings, farming_practices: arr }))}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                    settings.farming_practices.includes(practice)
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                }`}
                            >
                                {settings.farming_practices.includes(practice) && (
                                    <span className="material-symbols-outlined !text-[14px] mr-1">check</span>
                                )}
                                {practice}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">contact_mail</span>
                        Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Your Name</label>
                            <input
                                value={settings.full_name}
                                onChange={e => setSettings({ ...settings, full_name: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="John Miller"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Contact Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={e => setSettings({ ...settings, email: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="john@millerfarms.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Phone Number</label>
                            <input
                                type="tel"
                                value={settings.phone}
                                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Website</label>
                            <input
                                type="url"
                                value={settings.website}
                                onChange={e => setSettings({ ...settings, website: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="https://millerfarms.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Operations */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">schedule</span>
                        Business Operations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Operating Hours</label>
                            <input
                                value={settings.operating_hours}
                                onChange={e => setSettings({ ...settings, operating_hours: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="Mon-Sat: 7am-6pm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Seasonal Availability</label>
                            <input
                                value={settings.seasonal_availability}
                                onChange={e => setSettings({ ...settings, seasonal_availability: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="April through November"
                            />
                        </div>
                    </div>
                </div>

                {/* Bank Account & Payouts (Stripe Connect) */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">account_balance</span>
                        Bank Account & Payouts
                    </h2>
                    <p className="text-sm text-gray-500">
                        Connect your bank account to receive payments from buyers through our secure escrow system.
                    </p>

                    {checkingStripe ? (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            <span className="text-sm text-gray-500">Checking payout status...</span>
                        </div>
                    ) : stripeStatus?.connected && stripeStatus?.payoutsEnabled ? (
                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-600 !text-[24px]">check_circle</span>
                                </div>
                                <div>
                                    <p className="font-bold text-green-800 dark:text-green-300">Payouts Connected</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Your bank account is connected. You&apos;ll receive payouts when buyers confirm delivery.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={startOnboarding}
                                disabled={stripeLoading}
                                className="mt-3 text-sm text-green-700 dark:text-green-400 underline hover:no-underline"
                            >
                                Update payout settings
                            </button>
                        </div>
                    ) : stripeStatus?.connected ? (
                        <div className="p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-yellow-600 !text-[24px]">warning</span>
                                </div>
                                <div>
                                    <p className="font-bold text-yellow-800 dark:text-yellow-300">Setup Incomplete</p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                        Your account is connected but payouts aren&apos;t enabled yet. Complete the setup to receive payments.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={startOnboarding}
                                disabled={stripeLoading}
                                className="mt-3 px-5 py-2 bg-yellow-600 text-white text-sm font-bold rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                            >
                                {stripeLoading ? 'Opening...' : 'Complete Setup'}
                            </button>
                        </div>
                    ) : (
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-blue-600 !text-[24px]">account_balance</span>
                                </div>
                                <div>
                                    <p className="font-bold text-blue-800 dark:text-blue-300">Set Up Payouts</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        Connect your bank account through Stripe to receive secure payments. Buyers pay into escrow, and funds are released to you when they confirm delivery.
                                    </p>
                                    <ul className="mt-3 space-y-1 text-xs text-blue-600 dark:text-blue-400">
                                        <li className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined !text-[14px]">check</span>
                                            Secure bank-level encryption
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined !text-[14px]">check</span>
                                            Direct deposits to your bank account
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined !text-[14px]">check</span>
                                            Escrow protection for both parties
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={startOnboarding}
                                disabled={stripeLoading}
                                className="mt-4 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {stripeLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined !text-[20px]">link</span>
                                        Connect Bank Account
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {stripeError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
                            <span>{stripeError}</span>
                            <button type="button" onClick={clearStripeError} className="text-red-500 hover:text-red-700">
                                <span className="material-symbols-outlined !text-[18px]">close</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Payment Methods */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">payments</span>
                        Accepted Payment Methods
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {paymentOptions.map(method => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => toggleArrayItem(settings.payment_methods, method, (arr) => setSettings({ ...settings, payment_methods: arr }))}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                    settings.payment_methods.includes(method)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                }`}
                            >
                                {settings.payment_methods.includes(method) && (
                                    <span className="material-symbols-outlined !text-[14px] mr-1">check</span>
                                )}
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Delivery Settings */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">local_shipping</span>
                        Delivery Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#131613] dark:text-white ml-1">Delivery Radius (miles)</label>
                            <input
                                type="number"
                                value={settings.delivery_radius}
                                onChange={e => setSettings({ ...settings, delivery_radius: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-inner-soft transition-all dark:text-white"
                                placeholder="50"
                            />
                            <p className="text-xs text-gray-400 ml-1">How far are you willing to deliver?</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex items-center justify-between sticky bottom-0 bg-background-light dark:bg-background-dark py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-t border-gray-100 dark:border-white/5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-12 px-10 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-glow hover:shadow-premium hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                Save Profile
                                {saved && <span className="material-symbols-outlined !text-[18px] animate-bounce">check_circle</span>}
                            </>
                        )}
                    </button>
                    {saved && <p className="text-primary font-black text-xs animate-fade-in">Profile saved successfully!</p>}
                </div>
            </form>
        </div>
    );
}
