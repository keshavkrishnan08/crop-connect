"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useListings, Listing } from "@/hooks/useListings";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function MyCropsPage() {
    const { profile } = useProfile();
    const { toast } = useToast();
    const { listings, loading, createListing, updateListing, deleteListing, fetchMyListings } = useListings();
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);

    useEffect(() => {
        fetchMyListings();
    }, [fetchMyListings]);

    const stats = useMemo(() => {
        const available = listings.filter(l => l.status === 'available').length;
        const sold = listings.filter(l => l.status === 'sold').length;
        const totalValue = listings.reduce((sum, l) => sum + (l.quantity * l.price_per_unit), 0);
        return { total: listings.length, available, sold, totalValue };
    }, [listings]);

    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.crop_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || listing.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this listing?')) {
            await deleteListing(id);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'sold': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6 overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[#131613] dark:text-white">My Crop Listings</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Manage your inventory and listings</p>
                </div>
                <Link
                    href="/dashboard/farmer/listings/new"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add New Crop
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Total Listings</p>
                    <p className="text-2xl font-black text-[#131613] dark:text-white">{stats.total}</p>
                </div>
                <div className="stat-card">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Available</p>
                    <p className="text-2xl font-black text-green-600">{stats.available}</p>
                </div>
                <div className="stat-card">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sold</p>
                    <p className="text-2xl font-black text-[#131613] dark:text-white">{stats.sold}</p>
                </div>
                <div className="stat-card">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Inventory Value</p>
                    <p className="text-2xl font-black text-primary">${stats.totalValue.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between card-glass p-3">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                    {['all', 'available', 'pending', 'sold'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                                filterStatus === status
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                            }`}
                        >
                            {status === 'all' ? 'All' : status}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 !text-[20px]">search</span>
                    <input
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        placeholder="Search crops..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Listings */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-12 flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="size-24 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                            <span className="material-symbols-outlined !text-[48px]">eco</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#131613] dark:text-white mb-2">No listings yet</h3>
                        <p className="text-gray-500 mb-4">Add your first crop listing to start selling</p>
                        <Link
                            href="/dashboard/farmer/listings/new"
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl"
                        >
                            Add Your First Crop
                        </Link>
                    </div>
                ) : filteredListings.map(listing => (
                    <div key={listing.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 card-glass hover:!shadow-card-hover hover:!-translate-y-0.5">
                        {/* Image */}
                        <div className="w-full md:w-24 h-32 md:h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden shrink-0">
                            {listing.image_url ? (
                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${listing.image_url}")` }} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary/30 !text-[32px]">eco</span>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            <div>
                                <p className="font-bold text-[#131613] dark:text-white">{listing.crop_name}</p>
                                <p className="text-xs text-gray-500">{listing.category || 'Uncategorized'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Quantity</p>
                                <p className="font-bold text-[#131613] dark:text-white">{listing.quantity} {listing.unit}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Price</p>
                                <p className="font-bold text-primary">${listing.price_per_unit}/{listing.unit}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status</p>
                                <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${getStatusStyle(listing.status)}`}>
                                    {listing.status}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            <button
                                onClick={() => setEditingListing(listing)}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined !text-[20px]">edit</span>
                            </button>
                            <button
                                onClick={() => handleDelete(listing.id)}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <span className="material-symbols-outlined !text-[20px]">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingListing) && (
                <CropModal
                    listing={editingListing}
                    onClose={() => { setShowAddModal(false); setEditingListing(null); }}
                    onCreate={createListing}
                    onUpdate={updateListing}
                    farmerId={profile?.id || ''}
                />
            )}
        </div>
    );
}

function CropModal({
    listing,
    onClose,
    onCreate,
    onUpdate,
    farmerId
}: {
    listing: Listing | null;
    onClose: () => void;
    onCreate: (data: any) => Promise<any>;
    onUpdate: (id: string, data: any) => Promise<any>;
    farmerId: string;
}) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        crop_name: listing?.crop_name || "",
        description: listing?.description || "",
        quantity: listing?.quantity?.toString() || "",
        unit: listing?.unit || "lbs",
        price_per_unit: listing?.price_per_unit?.toString() || "",
        category: listing?.category || "",
        status: listing?.status || "available",
        image_url: listing?.image_url || "",
        // Extended fields for buyers to understand
        variety: "",
        growing_method: "",
        certifications: [] as string[],
        harvest_date: "",
        shelf_life: "",
        storage_instructions: "",
        minimum_order: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = ["Vegetables", "Fruits", "Grains", "Dairy", "Meat", "Herbs", "Organic", "Other"];
    const certificationOptions = ["USDA Organic", "Non-GMO", "Fair Trade", "Local", "Sustainable", "Pesticide-Free"];
    const growingMethods = ["Conventional", "Organic", "Hydroponic", "Greenhouse", "Field Grown", "Indoor"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.crop_name || !formData.quantity || !formData.price_per_unit) return;

        setSubmitting(true);

        const data = {
            crop_name: formData.crop_name,
            description: formData.description,
            quantity: parseFloat(formData.quantity),
            unit: formData.unit,
            price_per_unit: parseFloat(formData.price_per_unit),
            category: formData.category,
            status: formData.status,
            image_url: formData.image_url,
        };

        if (listing) {
            await onUpdate(listing.id, data);
        } else {
            await onCreate({ ...data, farmer_id: farmerId });
        }

        setSubmitting(false);
        onClose();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !farmerId) return;

        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${farmerId}/crops/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('crops')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('crops')
                .getPublicUrl(fileName);

            setFormData({ ...formData, image_url: publicUrl });
        } catch {
            toast('Failed to upload image', 'error');
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white/95 dark:bg-[#1a2c15]/95 backdrop-blur-2xl rounded-2xl shadow-glass-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white/90 dark:bg-[#1a2c15]/90 backdrop-blur-xl p-6 border-b border-white/20 dark:border-white/[0.06] z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 size-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 className="text-2xl font-black text-[#131613] dark:text-white">
                        {listing ? 'Edit Listing' : 'Add New Crop'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Provide detailed information to help buyers</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Crop Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="size-24 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden">
                                {formData.image_url ? (
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${formData.image_url}")` }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <span className="material-symbols-outlined !text-[40px]">add_photo_alternate</span>
                                    </div>
                                )}
                            </div>
                            <div>
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
                                    className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Photo'}
                                </button>
                                <p className="text-xs text-gray-400 mt-2">High quality photos help sell faster</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Crop Name *</label>
                            <input
                                required
                                value={formData.crop_name}
                                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                                className="input-premium"
                                placeholder="e.g., Organic Roma Tomatoes"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Variety/Type</label>
                            <input
                                value={formData.variety}
                                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                                className="input-premium"
                                placeholder="e.g., San Marzano"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="select-premium"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Growing Method</label>
                            <select
                                value={formData.growing_method}
                                onChange={(e) => setFormData({ ...formData, growing_method: e.target.value })}
                                className="select-premium"
                            >
                                <option value="">Select method</option>
                                {growingMethods.map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quantity and Pricing */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="input-premium"
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
                                <option value="lbs">lbs</option>
                                <option value="kg">kg</option>
                                <option value="units">units</option>
                                <option value="bushels">bushels</option>
                                <option value="cases">cases</option>
                                <option value="dozen">dozen</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price/Unit *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price_per_unit}
                                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                                className="input-premium"
                                placeholder="2.50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Min Order</label>
                            <input
                                type="number"
                                value={formData.minimum_order}
                                onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                                className="input-premium"
                                placeholder="10"
                            />
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Certifications</label>
                        <div className="flex flex-wrap gap-2">
                            {certificationOptions.map(cert => (
                                <button
                                    key={cert}
                                    type="button"
                                    onClick={() => toggleCertification(cert)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        formData.certifications.includes(cert)
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                    }`}
                                >
                                    {cert}
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
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none dark:text-white"
                            placeholder="Describe your crop - taste, texture, best uses, growing practices..."
                        />
                    </div>

                    {/* Additional Info */}
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
                                value={formData.shelf_life}
                                onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })}
                                className="input-premium"
                                placeholder="e.g., 2 weeks refrigerated"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Storage Instructions</label>
                        <input
                            value={formData.storage_instructions}
                            onChange={(e) => setFormData({ ...formData, storage_instructions: e.target.value })}
                            className="input-premium"
                            placeholder="e.g., Store in cool, dry place"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Listing Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "pending" | "sold" })}
                            className="select-premium"
                        >
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold Out</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    {listing ? 'Update Listing' : 'Create Listing'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
