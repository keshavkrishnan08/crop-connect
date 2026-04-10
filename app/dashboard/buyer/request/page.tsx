"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

const cropCategories = [
    { value: "vegetables", label: "Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=150&fit=crop" },
    { value: "fruits", label: "Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&h=150&fit=crop" },
    { value: "grains", label: "Grains & Cereals", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop" },
    { value: "dairy", label: "Dairy & Eggs", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=150&fit=crop" },
    { value: "meat", label: "Meat & Poultry", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=150&fit=crop" },
    { value: "herbs", label: "Herbs & Spices", image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=200&h=150&fit=crop" },
    { value: "organic", label: "Organic", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=150&fit=crop" },
    { value: "other", label: "Other", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&h=150&fit=crop" },
];

const qualityStandards = [
    { value: "standard", label: "Standard Quality", description: "Good quality produce for everyday use" },
    { value: "premium", label: "Premium Quality", description: "High-grade produce, minimal blemishes" },
    { value: "organic", label: "Certified Organic", description: "USDA certified organic produce" },
    { value: "local", label: "Locally Sourced", description: "From farms within 100 miles" },
];

const deliveryPreferences = [
    { value: "pickup", label: "Farm Pickup", icon: "store", description: "I'll pick up from the farm" },
    { value: "delivery", label: "Delivery", icon: "local_shipping", description: "Deliver to my location" },
    { value: "flexible", label: "Flexible", icon: "swap_horiz", description: "Either works for me" },
];

export default function PostRequestPage() {
    const router = useRouter();
    const { profile } = useProfile();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        crop_name: "",
        category: "",
        quantity: "",
        unit: "lbs",
        max_price: "",
        quality_standard: "",
        delivery_preference: "",
        needed_by: "",
        recurring: false,
        recurring_frequency: "",
        description: "",
        special_requirements: "",
    });

    const handleSubmit = async () => {
        if (!formData.crop_name || !formData.quantity) return;
        if (!profile?.id) {
            setError("You must be logged in to post a request");
            return;
        }

        setSubmitting(true);
        setError(null);

        const { error: insertError } = await supabase.from('produce_requests').insert({
            buyer_id: profile.id,
            crop_name: formData.crop_name,
            category: formData.category,
            quantity: parseFloat(formData.quantity),
            unit: formData.unit,
            max_price: formData.max_price ? parseFloat(formData.max_price) : null,
            description: [
                formData.description,
                formData.quality_standard && `Quality: ${formData.quality_standard}`,
                formData.delivery_preference && `Delivery: ${formData.delivery_preference}`,
                formData.special_requirements && `Special Requirements: ${formData.special_requirements}`,
                formData.recurring && `Recurring: ${formData.recurring_frequency}`,
            ].filter(Boolean).join('\n'),
            needed_by: formData.needed_by || null,
            status: 'open',
        });

        setSubmitting(false);

        if (insertError) {
            setError(insertError.message || 'Failed to post request');
            return;
        }

        // Redirect back to dashboard on success
        router.push('/dashboard/buyer');
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            router.push('/dashboard/buyer');
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));

    const canProceed = () => {
        switch (step) {
            case 1: return formData.crop_name && formData.category;
            case 2: return formData.quantity && formData.unit;
            case 3: return true;
            default: return true;
        }
    };

    return (
        <div className="flex-1 w-full overflow-y-auto no-scrollbar bg-transparent">
            <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="size-10 rounded-xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#131613] dark:text-white">Post a Produce Request</h1>
                        <p className="text-gray-500 dark:text-[#a3b2a4] text-sm">Tell farmers exactly what you need</p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Progress Steps */}
                <div className="flex items-center justify-between">
                    {[
                        { num: 1, label: "Product" },
                        { num: 2, label: "Quantity" },
                        { num: 3, label: "Preferences" },
                        { num: 4, label: "Review" },
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                                    step >= s.num
                                        ? 'bg-gradient-to-br from-primary to-green-500 text-white shadow-lg shadow-primary/25'
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                                }`}>
                                    {step > s.num ? (
                                        <span className="material-symbols-outlined !text-[20px]">check</span>
                                    ) : s.num}
                                </div>
                                <span className={`text-[10px] font-bold mt-2 transition-colors ${step >= s.num ? 'text-primary' : 'text-gray-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < 3 && (
                                <div className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all duration-500 ${
                                    step > s.num ? 'bg-gradient-to-r from-primary to-green-500' : 'bg-gray-100 dark:bg-white/10'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="card-glass !rounded-3xl !shadow-glass-lg p-6 md:p-8">
                    {/* Step 1: Product Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">What are you looking for?</h2>
                                <p className="text-gray-500 text-sm">Tell us the produce you need</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.crop_name}
                                    onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                                    className="input-premium text-lg"
                                    placeholder="e.g., Roma Tomatoes, Fuji Apples, Organic Spinach..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category *</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                                <span className="text-xs font-bold text-center w-full text-white drop-shadow-md">
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
                        </div>
                    )}

                    {/* Step 2: Quantity & Price */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">How much do you need?</h2>
                                <p className="text-gray-500 text-sm">Specify the quantity and your budget</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity *</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="input-premium text-2xl font-black text-center"
                                        placeholder="100"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Unit</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="select-premium text-lg font-bold"
                                    >
                                        <option value="lbs">Pounds (lbs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="units">Units/Pieces</option>
                                        <option value="bushels">Bushels</option>
                                        <option value="cases">Cases</option>
                                        <option value="dozen">Dozen</option>
                                        <option value="tons">Tons</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Maximum Budget (per {formData.unit || 'unit'})</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.max_price}
                                        onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                                        className="input-premium text-2xl font-black pl-12"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Leave empty for open pricing</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">When do you need it?</label>
                                <input
                                    type="date"
                                    value={formData.needed_by}
                                    onChange={(e) => setFormData({ ...formData, needed_by: e.target.value })}
                                    className="input-premium"
                                />
                            </div>

                            {/* Recurring Order Toggle */}
                            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, recurring: !formData.recurring })}
                                    className="w-full flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${formData.recurring ? 'bg-primary text-white' : 'bg-white dark:bg-white/10 text-gray-400'}`}>
                                            <span className="material-symbols-outlined">autorenew</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-[#131613] dark:text-white">Recurring Order</p>
                                            <p className="text-xs text-gray-500">Set up a regular delivery schedule</p>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center ${
                                        formData.recurring ? 'bg-primary justify-end' : 'bg-gray-200 dark:bg-white/20 justify-start'
                                    }`}>
                                        <div className="size-5 rounded-full bg-white shadow-md mx-1"></div>
                                    </div>
                                </button>
                                {formData.recurring && (
                                    <select
                                        value={formData.recurring_frequency}
                                        onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
                                        className="select-premium"
                                    >
                                        <option value="">Select frequency</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="bi-weekly">Bi-Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preferences */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">Your Preferences</h2>
                                <p className="text-gray-500 text-sm">Help farmers understand your needs better</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quality Standard</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {qualityStandards.map(quality => (
                                        <button
                                            key={quality.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, quality_standard: quality.value })}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                                                formData.quality_standard === quality.value
                                                    ? 'border-primary bg-primary/5 shadow-lg'
                                                    : 'border-gray-100 dark:border-white/10 hover:border-primary/30'
                                            }`}
                                        >
                                            <p className={`font-bold ${formData.quality_standard === quality.value ? 'text-primary' : 'text-[#131613] dark:text-white'}`}>
                                                {quality.label}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{quality.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Delivery Preference</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {deliveryPreferences.map(pref => (
                                        <button
                                            key={pref.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, delivery_preference: pref.value })}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                                                formData.delivery_preference === pref.value
                                                    ? 'border-primary bg-primary/5 shadow-lg'
                                                    : 'border-gray-100 dark:border-white/10 hover:border-primary/30'
                                            }`}
                                        >
                                            <div className={`size-12 rounded-xl flex items-center justify-center transition-all ${
                                                formData.delivery_preference === pref.value
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                                            }`}>
                                                <span className="material-symbols-outlined">{pref.icon}</span>
                                            </div>
                                            <span className={`text-xs font-bold text-center ${formData.delivery_preference === pref.value ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {pref.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Additional Details</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-medium outline-none transition-all duration-300 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none dark:text-white text-[#131613]"
                                    placeholder="Any specific varieties, grades, or requirements..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Special Requirements</label>
                                <textarea
                                    value={formData.special_requirements}
                                    onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                                    rows={2}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a2c15] font-medium outline-none transition-all duration-300 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none dark:text-white text-[#131613]"
                                    placeholder="Packaging, certifications, handling instructions..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">Review Your Request</h2>
                                <p className="text-gray-500 text-sm">Make sure everything looks good before posting</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-green-500/10 border border-primary/20">
                                    <div className="flex items-start gap-4">
                                        <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white shadow-lg">
                                            <span className="material-symbols-outlined !text-[32px]">eco</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-[#131613] dark:text-white">{formData.crop_name || 'Product Name'}</h3>
                                            <p className="text-primary font-bold capitalize">{formData.category || 'Category'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Quantity</p>
                                        <p className="text-xl font-black text-[#131613] dark:text-white">{formData.quantity || '—'} {formData.unit}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Max Budget</p>
                                        <p className="text-xl font-black text-primary">{formData.max_price ? `$${formData.max_price}/${formData.unit}` : 'Open'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Needed By</p>
                                        <p className="text-lg font-bold text-[#131613] dark:text-white">{formData.needed_by || 'Flexible'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Delivery</p>
                                        <p className="text-lg font-bold text-[#131613] dark:text-white capitalize">{formData.delivery_preference || 'Any'}</p>
                                    </div>
                                </div>

                                {formData.recurring && (
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-500">autorenew</span>
                                            <p className="font-bold text-blue-700 dark:text-blue-300">Recurring Order: {formData.recurring_frequency}</p>
                                        </div>
                                    </div>
                                )}

                                {(formData.description || formData.special_requirements) && (
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-2">Additional Notes</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{formData.description}</p>
                                        {formData.special_requirements && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                                                <span className="font-bold">Special: </span>{formData.special_requirements}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        <div className="flex-1"></div>
                        {step < 4 ? (
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
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">send</span>
                                        Post Request
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
