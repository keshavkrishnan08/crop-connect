"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useListings } from "@/hooks/useListings";
import { supabase } from "@/lib/supabase";
import { validateImageFile } from "@/lib/upload-validation";

const cropCategories = [
    { value: "vegetables", label: "Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=150&fit=crop" },
    { value: "fruits", label: "Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&h=150&fit=crop" },
    { value: "grains", label: "Grains & Cereals", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop" },
    { value: "legumes", label: "Legumes & Beans", image: "https://images.unsplash.com/photo-1515543904823-6aed99ab0bc8?w=200&h=150&fit=crop" },
    { value: "dairy", label: "Dairy & Eggs", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=150&fit=crop" },
    { value: "meat", label: "Meat & Poultry", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=150&fit=crop" },
    { value: "seafood", label: "Seafood", image: "https://images.unsplash.com/photo-1510130113845-91d66adafb8c?w=200&h=150&fit=crop" },
    { value: "herbs", label: "Herbs & Spices", image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=200&h=150&fit=crop" },
    { value: "nuts", label: "Nuts & Seeds", image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&h=150&fit=crop" },
    { value: "honey", label: "Honey & Bee", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&h=150&fit=crop" },
    { value: "mushrooms", label: "Mushrooms", image: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=200&h=150&fit=crop" },
    { value: "flowers", label: "Cut Flowers", image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=200&h=150&fit=crop" },
    { value: "plants", label: "Plants & Seedlings", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150&fit=crop" },
    { value: "preserves", label: "Preserves & Jams", image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=150&fit=crop" },
    { value: "baked", label: "Baked Goods", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=150&fit=crop" },
    { value: "beverages", label: "Beverages", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=150&fit=crop" },
    { value: "organic", label: "Certified Organic", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=150&fit=crop" },
    { value: "other", label: "Other", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&h=150&fit=crop" },
];

const units = [
    { value: "lbs", label: "Pounds (lbs)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "oz", label: "Ounces (oz)" },
    { value: "units", label: "Units/Pieces" },
    { value: "dozen", label: "Dozen" },
    { value: "bushels", label: "Bushels" },
    { value: "cases", label: "Cases" },
    { value: "bunches", label: "Bunches" },
    { value: "pints", label: "Pints" },
    { value: "quarts", label: "Quarts" },
    { value: "gallons", label: "Gallons" },
    { value: "tons", label: "Tons" },
];

const certifications = [
    { value: "usda_organic", label: "USDA Organic", icon: "verified" },
    { value: "non_gmo", label: "Non-GMO", icon: "eco" },
    { value: "fair_trade", label: "Fair Trade", icon: "handshake" },
    { value: "rainforest", label: "Rainforest Alliance", icon: "forest" },
    { value: "animal_welfare", label: "Animal Welfare Approved", icon: "pets" },
    { value: "grass_fed", label: "Grass Fed", icon: "grass" },
    { value: "free_range", label: "Free Range", icon: "nature" },
    { value: "pesticide_free", label: "Pesticide Free", icon: "block" },
    { value: "locally_grown", label: "Locally Grown", icon: "location_on" },
    { value: "sustainable", label: "Sustainably Farmed", icon: "recycling" },
];

const growingMethods = [
    { value: "conventional", label: "Conventional" },
    { value: "organic", label: "Organic" },
    { value: "hydroponic", label: "Hydroponic" },
    { value: "aquaponic", label: "Aquaponic" },
    { value: "greenhouse", label: "Greenhouse" },
    { value: "field", label: "Field Grown" },
    { value: "indoor", label: "Indoor/Vertical" },
    { value: "permaculture", label: "Permaculture" },
    { value: "biodynamic", label: "Biodynamic" },
];

const deliveryOptions = [
    { value: "farm_pickup", label: "Farm Pickup", icon: "store", description: "Buyers pick up at your farm" },
    { value: "local_delivery", label: "Local Delivery", icon: "local_shipping", description: "You deliver within radius" },
    { value: "shipping", label: "Ship Nationwide", icon: "flight", description: "Ship via carrier" },
    { value: "farmers_market", label: "Farmers Market", icon: "storefront", description: "Available at market" },
];

export default function NewListingPage() {
    const router = useRouter();
    const { profile } = useProfile();
    const { createListing } = useListings();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        // Basic Info
        crop_name: "",
        category: "",
        variety: "",
        description: "",

        // Quantity & Pricing
        quantity: "",
        unit: "lbs",
        price_per_unit: "",
        minimum_order: "",
        bulk_discount: false,
        bulk_discount_percent: "",
        bulk_discount_quantity: "",

        // Availability
        available_from: "",
        available_until: "",
        recurring: false,
        recurring_frequency: "",
        seasonal_notes: "",

        // Quality & Certifications
        growing_method: "",
        certifications: [] as string[],
        harvest_date: "",
        shelf_life: "",
        storage_instructions: "",

        // Delivery
        delivery_options: [] as string[],
        delivery_radius: "",
        delivery_fee: "",
        pickup_location: "",
        pickup_instructions: "",

        // Media
        image_url: "",
        additional_images: [] as string[],

        // Advanced
        allergens: "",
        nutritional_info: "",
        preparation_tips: "",
        pairings: "",
    });

    const totalSteps = 5;

    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            setUploadError(validationError);
            return;
        }
        setUploadError(null);
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}/crops/${Date.now()}.${fileExt}`;

            const { error: uploadErr } = await supabase.storage
                .from('crops')
                .upload(fileName, file, { upsert: true });

            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabase.storage
                .from('crops')
                .getPublicUrl(fileName);

            setFormData({ ...formData, image_url: publicUrl });
        } catch (err) {
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const toggleCertification = (cert: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.includes(cert)
                ? prev.certifications.filter(c => c !== cert)
                : [...prev.certifications, cert]
        }));
    };

    const toggleDeliveryOption = (option: string) => {
        setFormData(prev => ({
            ...prev,
            delivery_options: prev.delivery_options.includes(option)
                ? prev.delivery_options.filter(o => o !== option)
                : [...prev.delivery_options, option]
        }));
    };

    const handleSubmit = async () => {
        if (!formData.crop_name || !formData.quantity || !formData.price_per_unit) {
            setError('Please fill in all required fields');
            return;
        }

        if (!profile?.id) {
            setError('You must be logged in to create a listing');
            return;
        }

        setSubmitting(true);
        setError(null);

        const result = await createListing({
            crop_name: formData.crop_name,
            quantity: parseFloat(formData.quantity),
            unit: formData.unit,
            price_per_unit: parseFloat(formData.price_per_unit),
            category: formData.category,
            description: [
                formData.description,
                formData.variety && `Variety: ${formData.variety}`,
                formData.growing_method && `Growing Method: ${formData.growing_method}`,
                formData.certifications.length > 0 && `Certifications: ${formData.certifications.join(', ')}`,
                formData.harvest_date && `Harvested: ${formData.harvest_date}`,
                formData.shelf_life && `Shelf Life: ${formData.shelf_life}`,
                formData.storage_instructions && `Storage: ${formData.storage_instructions}`,
                formData.delivery_options.length > 0 && `Delivery: ${formData.delivery_options.join(', ')}`,
                formData.delivery_radius && `Delivery Radius: ${formData.delivery_radius} miles`,
                formData.minimum_order && `Minimum Order: ${formData.minimum_order} ${formData.unit}`,
                formData.recurring && `Recurring: ${formData.recurring_frequency}`,
            ].filter(Boolean).join('\n'),
            image_url: formData.image_url || undefined,
        });

        setSubmitting(false);

        if (result.success) {
            router.push('/dashboard/farmer');
        } else {
            setError(result.error || 'Failed to create listing. Please try again.');
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const canProceed = () => {
        switch (step) {
            case 1: return formData.crop_name && formData.category;
            case 2: return formData.quantity && formData.price_per_unit;
            case 3: return true;
            case 4: return formData.delivery_options.length > 0;
            default: return true;
        }
    };

    return (
        <div className="flex-1 w-full overflow-y-auto no-scrollbar bg-transparent">
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/farmer"
                        className="size-12 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/20 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#131613] dark:text-white">Create New Listing</h1>
                        <p className="text-gray-500 dark:text-[#a3b2a4] text-sm">Add your produce to the marketplace</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="card-glass p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-500">Step {step} of {totalSteps}</span>
                        <span className="text-sm font-bold text-primary">{Math.round((step / totalSteps) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-3">
                        {["Product", "Pricing", "Quality", "Delivery", "Review"].map((label, i) => (
                            <span
                                key={label}
                                className={`text-[10px] font-bold uppercase tracking-wide ${
                                    step > i ? 'text-primary' : step === i + 1 ? 'text-[#131613] dark:text-white' : 'text-gray-400'
                                }`}
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="card-glass !rounded-3xl !shadow-glass-lg overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* Step 1: Product Info */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-[#131613] dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">eco</span>
                                        Product Information
                                    </h2>
                                    <p className="text-gray-500 text-sm">What are you selling?</p>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Product Photo</label>
                                    <div className="flex items-start gap-4">
                                        <div className="size-32 rounded-2xl bg-gray-100 dark:bg-white/10 overflow-hidden border-2 border-dashed border-gray-200 dark:border-white/20">
                                            {formData.image_url ? (
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${formData.image_url}")` }} />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                    <span className="material-symbols-outlined !text-[40px]">add_photo_alternate</span>
                                                    <span className="text-[10px] font-bold mt-1">Add Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="px-6 py-3 bg-gray-100 dark:bg-white/10 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined !text-[18px]">upload</span>
                                                {uploading ? 'Uploading...' : 'Upload Photo'}
                                            </button>
                                            <p className="text-xs text-gray-400 mt-2">High-quality photos increase sales by 40%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Product Name *</label>
                                        <input
                                            type="text"
                                            value={formData.crop_name}
                                            onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                                            className="input-premium text-lg"
                                            placeholder="e.g., Organic Heirloom Tomatoes"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Variety/Strain</label>
                                        <input
                                            type="text"
                                            value={formData.variety}
                                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                                            className="input-premium"
                                            placeholder="e.g., Cherokee Purple"
                                        />
                                    </div>
                                </div>

                                {/* Category Selection */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {cropCategories.map(cat => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                                className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden h-24 ${
                                                    formData.category === cat.value
                                                        ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30'
                                                        : 'border-gray-100 dark:border-white/10 hover:border-primary/50'
                                                }`}
                                            >
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 hover:scale-110"
                                                    style={{ backgroundImage: `url("${cat.image}")` }}
                                                />
                                                <div className={`absolute inset-0 transition-all duration-300 ${
                                                    formData.category === cat.value
                                                        ? 'bg-primary/40'
                                                        : 'bg-black/30 hover:bg-black/40'
                                                }`} />
                                                <div className="absolute inset-0 flex items-end p-2">
                                                    <span className={`text-[10px] font-bold text-center w-full leading-tight text-white drop-shadow-md ${
                                                        formData.category === cat.value ? 'text-white' : ''
                                                    }`}>
                                                        {cat.label}
                                                    </span>
                                                </div>
                                                {formData.category === cat.value && (
                                                    <div className="absolute top-2 right-2 size-5 bg-primary rounded-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white !text-[14px]">check</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-medium outline-none transition-all duration-300 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none dark:text-white text-[#131613]"
                                        placeholder="Describe your product - flavor, texture, growing practices, what makes it special..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Pricing & Quantity */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-[#131613] dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">payments</span>
                                        Pricing & Availability
                                    </h2>
                                    <p className="text-gray-500 text-sm">Set your quantity and pricing</p>
                                </div>

                                {/* Quantity and Price */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity *</label>
                                        <input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            className="input-premium text-xl font-bold text-center"
                                            placeholder="100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Unit</label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="select-premium"
                                        >
                                            {units.map(u => (
                                                <option key={u.value} value={u.value}>{u.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price/Unit *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-primary">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.price_per_unit}
                                                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                                                className="input-premium text-xl font-bold pl-10"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Min Order</label>
                                        <input
                                            type="number"
                                            value={formData.minimum_order}
                                            onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                                            className="input-premium"
                                            placeholder="1"
                                        />
                                    </div>
                                </div>

                                {/* Bulk Discount */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-500/20 space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, bulk_discount: !formData.bulk_discount })}
                                        className="w-full flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                                                formData.bulk_discount ? 'bg-amber-500 text-white' : 'bg-white dark:bg-white/10 text-amber-500'
                                            }`}>
                                                <span className="material-symbols-outlined">sell</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-[#131613] dark:text-white">Bulk Discount</p>
                                                <p className="text-xs text-gray-500">Offer discounts for larger orders</p>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center ${
                                            formData.bulk_discount ? 'bg-amber-500 justify-end' : 'bg-gray-200 dark:bg-white/20 justify-start'
                                        }`}>
                                            <div className="size-5 rounded-full bg-white shadow-md mx-1"></div>
                                        </div>
                                    </button>
                                    {formData.bulk_discount && (
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500">Discount %</label>
                                                <input
                                                    type="number"
                                                    value={formData.bulk_discount_percent}
                                                    onChange={(e) => setFormData({ ...formData, bulk_discount_percent: e.target.value })}
                                                    className="input-premium"
                                                    placeholder="10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500">Min Qty for Discount</label>
                                                <input
                                                    type="number"
                                                    value={formData.bulk_discount_quantity}
                                                    onChange={(e) => setFormData({ ...formData, bulk_discount_quantity: e.target.value })}
                                                    className="input-premium"
                                                    placeholder="50"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Availability Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Available From</label>
                                        <input
                                            type="date"
                                            value={formData.available_from}
                                            onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                                            className="input-premium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Available Until</label>
                                        <input
                                            type="date"
                                            value={formData.available_until}
                                            onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                                            className="input-premium"
                                        />
                                    </div>
                                </div>

                                {/* Recurring Toggle */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-500/20 space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, recurring: !formData.recurring })}
                                        className="w-full flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                                                formData.recurring ? 'bg-blue-500 text-white' : 'bg-white dark:bg-white/10 text-blue-500'
                                            }`}>
                                                <span className="material-symbols-outlined">autorenew</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-[#131613] dark:text-white">Recurring Availability</p>
                                                <p className="text-xs text-gray-500">This product is available on a regular schedule</p>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center ${
                                            formData.recurring ? 'bg-blue-500 justify-end' : 'bg-gray-200 dark:bg-white/20 justify-start'
                                        }`}>
                                            <div className="size-5 rounded-full bg-white shadow-md mx-1"></div>
                                        </div>
                                    </button>
                                    {formData.recurring && (
                                        <div className="space-y-3 pt-2">
                                            <select
                                                value={formData.recurring_frequency}
                                                onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
                                                className="select-premium"
                                            >
                                                <option value="">Select frequency</option>
                                                <option value="weekly">Weekly harvest</option>
                                                <option value="bi-weekly">Bi-weekly harvest</option>
                                                <option value="monthly">Monthly harvest</option>
                                                <option value="seasonal">Seasonal (specify below)</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={formData.seasonal_notes}
                                                onChange={(e) => setFormData({ ...formData, seasonal_notes: e.target.value })}
                                                className="input-premium"
                                                placeholder="e.g., June-September, Spring harvest only"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Quality & Certifications */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-[#131613] dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">verified</span>
                                        Quality & Certifications
                                    </h2>
                                    <p className="text-gray-500 text-sm">Build trust with detailed quality information</p>
                                </div>

                                {/* Growing Method */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Growing Method</label>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                        {growingMethods.map(method => (
                                            <button
                                                key={method.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, growing_method: method.value })}
                                                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                                    formData.growing_method === method.value
                                                        ? 'bg-primary text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                                }`}
                                            >
                                                {method.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Certifications */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Certifications</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                        {certifications.map(cert => (
                                            <button
                                                key={cert.value}
                                                type="button"
                                                onClick={() => toggleCertification(cert.value)}
                                                className={`p-3 rounded-xl transition-all duration-300 flex flex-col items-center gap-2 border-2 ${
                                                    formData.certifications.includes(cert.value)
                                                        ? 'border-primary bg-primary/10 shadow-md'
                                                        : 'border-gray-100 dark:border-white/10 hover:border-primary/30'
                                                }`}
                                            >
                                                <span className={`material-symbols-outlined !text-[24px] ${
                                                    formData.certifications.includes(cert.value) ? 'text-primary' : 'text-gray-400'
                                                }`}>{cert.icon}</span>
                                                <span className={`text-[10px] font-bold text-center ${
                                                    formData.certifications.includes(cert.value) ? 'text-primary' : 'text-gray-600 dark:text-gray-300'
                                                }`}>{cert.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quality Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Harvest Date</label>
                                        <input
                                            type="date"
                                            value={formData.harvest_date}
                                            onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                            className="input-premium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Shelf Life</label>
                                        <input
                                            type="text"
                                            value={formData.shelf_life}
                                            onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })}
                                            className="input-premium"
                                            placeholder="e.g., 2 weeks refrigerated"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Storage Instructions</label>
                                    <textarea
                                        value={formData.storage_instructions}
                                        onChange={(e) => setFormData({ ...formData, storage_instructions: e.target.value })}
                                        rows={2}
                                        className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-medium outline-none transition-all hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none dark:text-white text-[#131613]"
                                        placeholder="How should buyers store this product for best freshness?"
                                    />
                                </div>

                                {/* Additional Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Allergen Information</label>
                                        <input
                                            type="text"
                                            value={formData.allergens}
                                            onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                                            className="input-premium"
                                            placeholder="e.g., May contain tree nuts"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preparation Tips</label>
                                        <input
                                            type="text"
                                            value={formData.preparation_tips}
                                            onChange={(e) => setFormData({ ...formData, preparation_tips: e.target.value })}
                                            className="input-premium"
                                            placeholder="e.g., Best roasted or in salads"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Delivery Options */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-[#131613] dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">local_shipping</span>
                                        Delivery Options
                                    </h2>
                                    <p className="text-gray-500 text-sm">How can buyers get your products?</p>
                                </div>

                                {/* Delivery Methods */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Delivery Methods *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {deliveryOptions.map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => toggleDeliveryOption(option.value)}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-4 ${
                                                    formData.delivery_options.includes(option.value)
                                                        ? 'border-primary bg-primary/5 shadow-lg'
                                                        : 'border-gray-100 dark:border-white/10 hover:border-primary/30'
                                                }`}
                                            >
                                                <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                                    formData.delivery_options.includes(option.value)
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                                                }`}>
                                                    <span className="material-symbols-outlined">{option.icon}</span>
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${
                                                        formData.delivery_options.includes(option.value) ? 'text-primary' : 'text-[#131613] dark:text-white'
                                                    }`}>{option.label}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                                                </div>
                                                {formData.delivery_options.includes(option.value) && (
                                                    <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Details */}
                                {formData.delivery_options.includes('local_delivery') && (
                                    <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-500/20 space-y-4">
                                        <h4 className="font-bold text-[#131613] dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-500">local_shipping</span>
                                            Local Delivery Settings
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500">Delivery Radius (miles)</label>
                                                <input
                                                    type="number"
                                                    value={formData.delivery_radius}
                                                    onChange={(e) => setFormData({ ...formData, delivery_radius: e.target.value })}
                                                    className="input-premium"
                                                    placeholder="25"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500">Delivery Fee ($)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.delivery_fee}
                                                    onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                                                    className="input-premium"
                                                    placeholder="0.00 (or free)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.delivery_options.includes('farm_pickup') && (
                                    <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200/50 dark:border-green-500/20 space-y-4">
                                        <h4 className="font-bold text-[#131613] dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-green-500">store</span>
                                            Farm Pickup Details
                                        </h4>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">Pickup Location</label>
                                            <input
                                                type="text"
                                                value={formData.pickup_location}
                                                onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                                                className="input-premium"
                                                placeholder="e.g., Main barn entrance, 123 Farm Road"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">Pickup Instructions</label>
                                            <textarea
                                                value={formData.pickup_instructions}
                                                onChange={(e) => setFormData({ ...formData, pickup_instructions: e.target.value })}
                                                rows={2}
                                                className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-medium outline-none transition-all hover:border-primary/30 focus:border-primary resize-none dark:text-white text-[#131613]"
                                                placeholder="e.g., Available Mon-Fri 8am-5pm, call ahead to schedule"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 5: Review */}
                        {step === 5 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-[#131613] dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">fact_check</span>
                                        Review Your Listing
                                    </h2>
                                    <p className="text-gray-500 text-sm">Make sure everything looks good before publishing</p>
                                </div>

                                {/* Preview Card */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-green-500/10 border border-primary/20">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="md:w-48 h-48 rounded-2xl bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0">
                                            {formData.image_url ? (
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${formData.image_url}")` }} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-gray-300 !text-[64px]">eco</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-primary uppercase tracking-wide">{formData.category || 'Category'}</p>
                                                <h3 className="text-2xl font-black text-[#131613] dark:text-white">{formData.crop_name || 'Product Name'}</h3>
                                                {formData.variety && <p className="text-gray-500">{formData.variety}</p>}
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-primary">${formData.price_per_unit || '0.00'}</span>
                                                <span className="text-gray-500">per {formData.unit}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{formData.description || 'No description provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Quantity</p>
                                        <p className="text-lg font-black text-[#131613] dark:text-white">{formData.quantity || '—'} {formData.unit}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Min Order</p>
                                        <p className="text-lg font-black text-[#131613] dark:text-white">{formData.minimum_order || '1'} {formData.unit}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Growing</p>
                                        <p className="text-lg font-bold text-[#131613] dark:text-white capitalize">{formData.growing_method || 'Not specified'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Delivery</p>
                                        <p className="text-lg font-bold text-[#131613] dark:text-white">{formData.delivery_options.length} options</p>
                                    </div>
                                </div>

                                {/* Certifications */}
                                {formData.certifications.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.certifications.map(cert => {
                                            const certInfo = certifications.find(c => c.value === cert);
                                            return (
                                                <span key={cert} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined !text-[14px]">{certInfo?.icon}</span>
                                                    {certInfo?.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Toggles Summary */}
                                <div className="flex flex-wrap gap-3">
                                    {formData.recurring && (
                                        <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined !text-[18px]">autorenew</span>
                                            Recurring: {formData.recurring_frequency}
                                        </span>
                                    )}
                                    {formData.bulk_discount && (
                                        <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined !text-[18px]">sell</span>
                                            {formData.bulk_discount_percent}% off on {formData.bulk_discount_quantity}+ {formData.unit}
                                        </span>
                                    )}
                                    {formData.delivery_radius && (
                                        <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined !text-[18px]">delivery_truck_speed</span>
                                            Delivers within {formData.delivery_radius} miles
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 md:mx-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="ml-auto text-red-500 hover:text-red-700"
                            >
                                <span className="material-symbols-outlined !text-[18px]">close</span>
                            </button>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 p-6 md:p-8 pt-0 border-t border-gray-100 dark:border-white/5 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                if (step > 1) {
                                    prevStep();
                                } else {
                                    router.push('/dashboard/farmer');
                                }
                            }}
                            className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        <div className="flex-1"></div>
                        {step < totalSteps ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-green-500 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Continue
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-green-500 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">publish</span>
                                        Publish Listing
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
