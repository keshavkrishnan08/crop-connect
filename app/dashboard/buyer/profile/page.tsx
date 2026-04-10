"use client";

import { useState, useEffect, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { validateImageFile } from "@/lib/upload-validation";

export default function BuyerProfile() {
    const { profile, loading, updateProfile } = useProfile();
    const [settings, setSettings] = useState({
        full_name: "",
        location: "",
        bio: "",
        email: "",
        phone: "",
        company_name: "",
        company_address: "",
        delivery_address: "",
        preferred_categories: [] as string[],
        business_type: "",
        years_in_business: "",
        average_order_size: "",
        website: "",
    });
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const profileInputRef = useRef<HTMLInputElement>(null);

    const availableCategories = ["Vegetables", "Fruits", "Grains", "Dairy", "Meat", "Herbs", "Organic", "Local"];

    useEffect(() => {
        if (profile) {
            setSettings({
                full_name: profile.full_name || "",
                location: profile.location || "",
                bio: profile.bio || "",
                email: profile.email || "",
                phone: profile.phone || "",
                company_name: profile.company_name || "",
                company_address: profile.company_address || "",
                delivery_address: profile.delivery_address || "",
                preferred_categories: profile.preferred_categories || [],
                business_type: profile.business_type || "",
                years_in_business: profile.years_in_business?.toString() || "",
                average_order_size: profile.average_order_size || "",
                website: profile.website || "",
            });
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const result = await updateProfile({
            full_name: settings.full_name,
            location: settings.location,
            bio: settings.bio,
            email: settings.email,
            phone: settings.phone,
            company_name: settings.company_name,
            company_address: settings.company_address,
            delivery_address: settings.delivery_address,
            preferred_categories: settings.preferred_categories,
            business_type: settings.business_type,
            years_in_business: settings.years_in_business ? parseInt(settings.years_in_business) : null,
            average_order_size: settings.average_order_size,
            website: settings.website,
        });

        setSaving(false);

        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            setError(result.error || "Failed to update profile");
        }
    };

    const toggleCategory = (category: string) => {
        setSettings(prev => ({
            ...prev,
            preferred_categories: prev.preferred_categories.includes(category)
                ? prev.preferred_categories.filter(c => c !== category)
                : [...prev.preferred_categories, category]
        }));
    };

    const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploadingProfile(true);
        setError(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}/profile.${fileExt}`;

            const { error: uploadErr } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            await updateProfile({ profile_picture: publicUrl });
        } catch (err) {
            setError('Failed to upload profile photo. Please try again.');
        } finally {
            setUploadingProfile(false);
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
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6 overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-white/5 pb-6">
                <h1 className="text-3xl font-black tracking-tighter text-[#131613] dark:text-white">Business Profile</h1>
                <p className="text-sm text-gray-500 dark:text-[#a3b2a4] font-medium mt-1">
                    Complete your profile to help farmers understand your business
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {/* Profile Photo Section */}
            <div className="card-glass p-6">
                <h2 className="text-lg font-black text-[#131613] dark:text-white mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">photo_camera</span>
                    Profile Photo
                </h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {profile?.profile_picture ? (
                            <div
                                className="size-24 rounded-2xl bg-cover bg-center border-2 border-gray-100 dark:border-white/10"
                                style={{ backgroundImage: `url("${profile.profile_picture}")` }}
                            />
                        ) : (
                            <div className="size-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                                <span className="material-symbols-outlined text-primary !text-[40px]">person</span>
                            </div>
                        )}
                        {uploadingProfile && (
                            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                    <div>
                        <input
                            ref={profileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => profileInputRef.current?.click()}
                            disabled={uploadingProfile}
                            className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                        >
                            {uploadingProfile ? 'Uploading...' : 'Upload Photo'}
                        </button>
                        <p className="text-xs text-gray-400 mt-2">JPG, PNG up to 5MB</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Personal Information */}
                <div className="card-glass p-6">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white mb-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                            <input
                                value={settings.full_name}
                                onChange={e => setSettings({ ...settings, full_name: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={e => setSettings({ ...settings, email: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="john@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</label>
                            <input
                                type="tel"
                                value={settings.phone}
                                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label>
                            <input
                                value={settings.location}
                                onChange={e => setSettings({ ...settings, location: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="City, State"
                            />
                        </div>
                    </div>
                </div>

                {/* Company Information */}
                <div className="card-glass p-6">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white mb-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">business</span>
                        Company Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Company Name</label>
                            <input
                                value={settings.company_name}
                                onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="Your Company LLC"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Business Type</label>
                            <select
                                value={settings.business_type}
                                onChange={e => setSettings({ ...settings, business_type: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            >
                                <option value="">Select type...</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="grocery">Grocery Store</option>
                                <option value="distributor">Distributor</option>
                                <option value="food_service">Food Service</option>
                                <option value="processor">Food Processor</option>
                                <option value="retail">Retail</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Company Address</label>
                            <input
                                value={settings.company_address}
                                onChange={e => setSettings({ ...settings, company_address: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="123 Business St, City, ST 12345"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Website (optional)</label>
                            <input
                                value={settings.website}
                                onChange={e => setSettings({ ...settings, website: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="https://yourcompany.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Years in Business</label>
                            <input
                                type="number"
                                value={settings.years_in_business}
                                onChange={e => setSettings({ ...settings, years_in_business: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="5"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">About Your Business</label>
                            <textarea
                                value={settings.bio}
                                onChange={e => setSettings({ ...settings, bio: e.target.value })}
                                rows={4}
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none dark:text-white"
                                placeholder="Tell farmers about your business, what you're looking for, quality standards, volume needs..."
                            />
                        </div>
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="card-glass p-6">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white mb-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">local_shipping</span>
                        Delivery Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preferred Delivery Address</label>
                            <input
                                value={settings.delivery_address}
                                onChange={e => setSettings({ ...settings, delivery_address: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                placeholder="456 Delivery Lane, City, ST 12345"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Average Order Size</label>
                            <select
                                value={settings.average_order_size}
                                onChange={e => setSettings({ ...settings, average_order_size: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            >
                                <option value="">Select typical order size...</option>
                                <option value="small">Small (Under $500)</option>
                                <option value="medium">Medium ($500 - $2,000)</option>
                                <option value="large">Large ($2,000 - $10,000)</option>
                                <option value="enterprise">Enterprise ($10,000+)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sourcing Preferences */}
                <div className="card-glass p-6">
                    <h2 className="text-lg font-black text-[#131613] dark:text-white mb-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">tune</span>
                        Sourcing Preferences
                    </h2>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preferred Categories</label>
                        <p className="text-xs text-gray-400 mb-3">Select the types of produce you typically purchase</p>
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map(category => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => toggleCategory(category)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        settings.preferred_categories.includes(category)
                                            ? "bg-primary text-white shadow-md"
                                            : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-12 px-8 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                Save Profile
                            </>
                        )}
                    </button>
                    {saved && (
                        <p className="text-primary font-bold text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined">check_circle</span>
                            Profile saved!
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
