import Link from 'next/link';
import { getPublicProfile, getUserListings, getUserReviews } from '@/lib/public-profile';
import PublicProfileClient from '@/components/PublicProfileClient';
import CropScoreBadge from '@/components/CropScoreBadge';

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ searchParams }: { searchParams: { id?: string } }) {
    const userId = searchParams.id;

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6] dark:bg-[#141e15]">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-gray-300 !text-[64px]">person_off</span>
                    <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Profile Not Found</h1>
                    <p className="text-gray-500">No user ID provided.</p>
                    <Link href="/dashboard/marketplace" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl">
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const [profile, listings, reviewData] = await Promise.all([
        getPublicProfile(userId),
        getUserListings(userId),
        getUserReviews(userId, 0, 5),
    ]);

    const completedOrders = profile?.total_completed_orders || 0;

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6] dark:bg-[#141e15]">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-gray-300 !text-[64px]">person_off</span>
                    <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Profile Not Found</h1>
                    <p className="text-gray-500">This user does not exist.</p>
                    <Link href="/dashboard/marketplace" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl">
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const isFarmer = profile.user_type === 'farmer';
    const displayName = isFarmer
        ? (profile.farm_name || profile.full_name || 'Farm')
        : (profile.company_name || profile.full_name || 'Buyer');

    const memberSince = new Date(profile.updated_at).getFullYear();
    const yearsActive = isFarmer ? profile.years_farming : profile.years_in_business;
    const ratingAvg = profile.rating_average ? Number(profile.rating_average) : 0;
    const ratingCount = profile.rating_count || 0;

    // Trust badges
    const badges: { icon: string; label: string; color: string }[] = [];
    if (profile.stripe_onboarding_complete) {
        badges.push({ icon: 'account_balance', label: 'Stripe Verified', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' });
    }
    if (ratingAvg >= 4.0 && ratingCount >= 3) {
        badges.push({ icon: 'workspace_premium', label: isFarmer ? 'Trusted Seller' : 'Trusted Buyer', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' });
    }
    if (completedOrders >= 10) {
        badges.push({ icon: 'military_tech', label: 'Established', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' });
    }
    if (yearsActive && yearsActive >= 5) {
        badges.push({ icon: 'emoji_events', label: 'Veteran', color: 'text-green-600 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' });
    }

    return (
        <div className="bg-[#f6f8f6] dark:bg-[#141e15] text-[#131613] dark:text-gray-100 min-h-screen font-display antialiased">
            {/* Top Nav */}
            <header className="sticky top-0 z-50 bg-white dark:bg-[#1C261E] border-b border-[#f1f3f1] dark:border-[#2f3d32] px-4 md:px-8 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <Link href="/dashboard/marketplace" className="flex items-center gap-2 text-[#131613] dark:text-white shrink-0">
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined filled text-3xl">eco</span>
                        </div>
                        <h2 className="hidden md:block text-lg font-bold leading-tight tracking-[-0.015em]">CropConnect</h2>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/dashboard/marketplace" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
                            Back to Marketplace
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Hero Section */}
                        <div className="bg-white dark:bg-[#1C261E] rounded-2xl overflow-hidden border border-[#e5e7eb] dark:border-[#2f3d32] shadow-sm mb-6">
                            {/* Cover */}
                            <div className="h-48 md:h-56 w-full bg-gradient-to-br from-primary/30 via-primary/10 to-emerald-100 dark:from-primary/20 dark:via-primary/5 dark:to-emerald-900/20 relative" />
                            <div className="px-6 pb-6 relative">
                                {/* Avatar */}
                                <div className="-mt-16 mb-4 flex justify-between items-end">
                                    <div className="size-32 rounded-full border-4 border-white dark:border-[#1C261E] bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-md flex items-center justify-center">
                                        {profile.profile_picture ? (
                                            <div
                                                className="w-full h-full bg-cover bg-center"
                                                style={{ backgroundImage: `url("${profile.profile_picture}")` }}
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-gray-400 !text-[48px]">
                                                {isFarmer ? 'agriculture' : 'storefront'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Name + Badges */}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h1 className="text-2xl md:text-3xl font-bold text-[#131613] dark:text-white">{displayName}</h1>
                                            {badges.length > 0 && (
                                                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border border-primary/20">
                                                    <span className="material-symbols-outlined filled !text-[14px]">verified</span>
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#6b806c] dark:text-gray-400 text-sm">
                                            {profile.location && (
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined !text-[18px]">location_on</span>
                                                    {profile.location}
                                                </div>
                                            )}
                                            <span className="hidden md:inline">&#8226;</span>
                                            <span>Member since {memberSince}</span>
                                            {isFarmer && profile.farm_size && (
                                                <>
                                                    <span className="hidden md:inline">&#8226;</span>
                                                    <span>{profile.farm_size}</span>
                                                </>
                                            )}
                                        </div>
                                        {/* Rating inline */}
                                        {ratingCount > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="material-symbols-outlined filled text-amber-400 !text-[20px]">star</span>
                                                <span className="font-bold text-[#131613] dark:text-white">{ratingAvg.toFixed(1)}</span>
                                                <span className="text-sm text-gray-500">({ratingCount} review{ratingCount !== 1 ? 's' : ''})</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Trust Badges */}
                                    {badges.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {badges.map((badge, i) => (
                                                <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${badge.color}`}>
                                                    <span className="material-symbols-outlined !text-[16px]">{badge.icon}</span>
                                                    {badge.label}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* CropScore */}
                                {profile.crop_score != null && Number(profile.crop_score) > 0 && (
                                    <div className="mt-4">
                                        <CropScoreBadge
                                            score={Number(profile.crop_score)}
                                            tier={profile.crop_score_tier}
                                            variant="full"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white dark:bg-[#1C261E] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#2f3d32] flex flex-col gap-1 items-start">
                                <span className="text-2xl font-bold text-[#131613] dark:text-white">{completedOrders}</span>
                                <span className="text-xs text-[#6b806c] font-medium">Completed Orders</span>
                            </div>
                            <div className="bg-white dark:bg-[#1C261E] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#2f3d32] flex flex-col gap-1 items-start">
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl font-bold text-[#131613] dark:text-white">
                                        {ratingCount > 0 ? ratingAvg.toFixed(1) : '--'}
                                    </span>
                                    {ratingCount > 0 && <span className="material-symbols-outlined filled text-amber-400 !text-[18px]">star</span>}
                                </div>
                                <span className="text-xs text-[#6b806c] font-medium">Avg Rating</span>
                            </div>
                            <div className="bg-white dark:bg-[#1C261E] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#2f3d32] flex flex-col gap-1 items-start">
                                <span className="text-2xl font-bold text-[#131613] dark:text-white">{ratingCount}</span>
                                <span className="text-xs text-[#6b806c] font-medium">Reviews</span>
                            </div>
                            <div className="bg-white dark:bg-[#1C261E] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#2f3d32] flex flex-col gap-1 items-start">
                                <span className="text-2xl font-bold text-[#131613] dark:text-white">
                                    {yearsActive ? `${yearsActive}+` : '--'}
                                </span>
                                <span className="text-xs text-[#6b806c] font-medium">{isFarmer ? 'Years Farming' : 'Years in Business'}</span>
                            </div>
                        </div>

                        {/* About */}
                        {profile.bio && (
                            <section className="mb-8">
                                <h3 className="text-xl font-bold text-[#131613] dark:text-white mb-3">
                                    {isFarmer ? 'About the Farm' : 'About'}
                                </h3>
                                <div className="bg-white dark:bg-[#1C261E] p-6 rounded-2xl border border-[#e5e7eb] dark:border-[#2f3d32]">
                                    <p className="text-[#4a544a] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                                </div>
                            </section>
                        )}

                        {/* Certifications & Practices */}
                        {(profile.certifications?.length || profile.farming_practices?.length) && (
                            <section className="mb-8">
                                <h3 className="text-xl font-bold text-[#131613] dark:text-white mb-3">Certifications & Practices</h3>
                                <div className="bg-white dark:bg-[#1C261E] p-6 rounded-2xl border border-[#e5e7eb] dark:border-[#2f3d32]">
                                    {profile.certifications && profile.certifications.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm uppercase tracking-wide text-[#6b806c] font-bold mb-2">Certifications</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.certifications.map((cert, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eaf4ea] dark:bg-primary/20 text-[#256629] dark:text-primary text-sm font-medium border border-primary/10">
                                                        <span className="material-symbols-outlined !text-[16px]">verified</span>
                                                        {cert}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {profile.farming_practices && profile.farming_practices.length > 0 && (
                                        <div>
                                            <h4 className="text-sm uppercase tracking-wide text-[#6b806c] font-bold mb-2">Farming Practices</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.farming_practices.map((practice, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-sm font-medium border border-gray-200 dark:border-gray-700">
                                                        {practice}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Active Listings (farmers only) */}
                        {isFarmer && listings.length > 0 && (
                            <section className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-[#131613] dark:text-white">Active Listings</h3>
                                    <span className="text-sm text-gray-500">{listings.length} available</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {listings.map(listing => (
                                        <Link
                                            key={listing.id}
                                            href={`/dashboard/marketplace?listing=${listing.id}`}
                                            className="group bg-white dark:bg-[#1C261E] rounded-xl border border-[#e5e7eb] dark:border-[#2f3d32] overflow-hidden hover:shadow-md transition-shadow"
                                        >
                                            <div className="h-36 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                                {listing.image_url ? (
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                        style={{ backgroundImage: `url("${listing.image_url}")` }}
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                        <span className="material-symbols-outlined text-primary/30 !text-[48px]">eco</span>
                                                    </div>
                                                )}
                                                {listing.category && (
                                                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-black/50 rounded-full text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300">
                                                        {listing.category}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{listing.crop_name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {listing.quantity_available} {listing.unit} available
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="font-bold text-primary">${listing.price_per_unit.toFixed(2)}/{listing.unit}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Crops Grown */}
                        {isFarmer && profile.crops && profile.crops.length > 0 && (
                            <section className="mb-8">
                                <h3 className="text-xl font-bold text-[#131613] dark:text-white mb-3">Crops Grown</h3>
                                <div className="bg-white dark:bg-[#1C261E] p-6 rounded-2xl border border-[#e5e7eb] dark:border-[#2f3d32]">
                                    <div className="flex flex-wrap gap-2">
                                        {profile.crops.map((crop, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eaf4ea] dark:bg-primary/20 text-[#256629] dark:text-primary text-sm font-medium border border-primary/10">
                                                <span className="material-symbols-outlined !text-[16px]">nutrition</span>
                                                {crop}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Reviews (client component for pagination) */}
                        <PublicProfileClient userId={userId} initialReviewCount={reviewData.total} />
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-96 shrink-0 space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white dark:bg-[#1C261E] rounded-2xl border border-[#e5e7eb] dark:border-[#2f3d32] shadow-sm p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-[#131613] dark:text-white">Contact {isFarmer ? 'Farmer' : 'Buyer'}</h3>
                            </div>
                            <div className="space-y-3">
                                <Link
                                    href={`/dashboard/messages?userId=${userId}`}
                                    className="w-full bg-primary hover:bg-[#256629] text-white font-bold h-12 rounded-xl transition-colors shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">chat</span>
                                    Send Message
                                </Link>
                                {isFarmer && (
                                    <Link
                                        href={`/dashboard/offer/new?farmerId=${userId}`}
                                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10 text-[#131613] dark:text-white font-semibold h-12 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">request_quote</span>
                                        Make Offer
                                    </Link>
                                )}
                            </div>

                            {/* Location */}
                            {profile.location && (
                                <div className="mt-6 pt-6 border-t border-[#e5e7eb] dark:border-[#2f3d32]">
                                    <h4 className="font-semibold text-sm text-[#131613] dark:text-white mb-2">Location</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="material-symbols-outlined !text-[18px]">location_on</span>
                                        {profile.location}
                                    </div>
                                </div>
                            )}

                            {/* Delivery Info */}
                            {isFarmer && profile.delivery_radius && (
                                <div className="mt-4 pt-4 border-t border-[#e5e7eb] dark:border-[#2f3d32] space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-[#f1f3f1] dark:bg-white/5 flex items-center justify-center text-[#6b806c]">
                                            <span className="material-symbols-outlined text-lg">local_shipping</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#131613] dark:text-white">Delivery Available</p>
                                            <p className="text-[10px] text-[#6b806c]">Within {profile.delivery_radius} miles</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contact Details */}
                            <div className="mt-4 pt-4 border-t border-[#e5e7eb] dark:border-[#2f3d32] space-y-3">
                                {profile.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-[#f1f3f1] dark:bg-white/5 flex items-center justify-center text-[#6b806c]">
                                            <span className="material-symbols-outlined text-lg">mail</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{profile.email}</span>
                                    </div>
                                )}
                                {profile.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-[#f1f3f1] dark:bg-white/5 flex items-center justify-center text-[#6b806c]">
                                            <span className="material-symbols-outlined text-lg">phone</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{profile.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
