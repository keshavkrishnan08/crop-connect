// Compatibility algorithm for matching buyers with listings and farmers with requests

interface Location {
    lat: number;
    lng: number;
}

interface CompatibilityResult {
    score: number;
    reasons: { type: 'positive' | 'neutral' | 'warning'; message: string }[];
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(loc1: Location, loc2: Location): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Session-level cache to avoid repeated geocoding API calls
const locationCache = new Map<string, Location | null>();

// Parse location string to coordinates
async function parseLocation(locationStr: string | null): Promise<Location | null> {
    if (!locationStr) return null;

    const cacheKey = locationStr.trim().toLowerCase();
    if (locationCache.has(cacheKey)) {
        return locationCache.get(cacheKey)!;
    }

    // Try to extract coordinates if they're in the string
    const coordMatch = locationStr.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
        const result = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        locationCache.set(cacheKey, result);
        return result;
    }

    // Use Nominatim for geocoding (free, but rate limited)
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}&limit=1`,
            { headers: { 'User-Agent': 'CropConnect/1.0' } }
        );
        const data = await response.json();
        if (data && data.length > 0) {
            const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            locationCache.set(cacheKey, result);
            return result;
        }
    } catch (error) {
        // Geocoding failed
    }

    locationCache.set(cacheKey, null);
    return null;
}

// Calculate compatibility for a buyer viewing farmer listings
export async function calculateListingCompatibility(
    listing: {
        farmer_id: string;
        crop_name: string;
        category: string | null;
        price_per_unit: number;
        quantity: number;
        farmer?: {
            location: string | null;
            is_verified: boolean;
            years_farming?: number | null;
            certifications?: string[] | null;
            crop_score?: number | null;
        };
    },
    buyer: {
        location: string | null;
        preferred_categories?: string[] | null;
        budget_range?: string | null;
    }
): Promise<CompatibilityResult> {
    const reasons: CompatibilityResult['reasons'] = [];
    let score = 50; // Base score

    // Location-based scoring
    if (listing.farmer?.location && buyer.location) {
        const farmerLoc = await parseLocation(listing.farmer.location);
        const buyerLoc = await parseLocation(buyer.location);

        if (farmerLoc && buyerLoc) {
            const distance = calculateDistance(farmerLoc, buyerLoc);

            if (distance < 25) {
                score += 25;
                reasons.push({ type: 'positive', message: 'Local farmer - less than 25 miles away' });
            } else if (distance < 50) {
                score += 15;
                reasons.push({ type: 'positive', message: 'Nearby farmer - within 50 miles' });
            } else if (distance < 100) {
                score += 5;
                reasons.push({ type: 'neutral', message: `About ${Math.round(distance)} miles away` });
            } else if (distance < 200) {
                score -= 5;
                reasons.push({ type: 'warning', message: `Farmer is ${Math.round(distance)} miles away - shipping may be expensive` });
            } else {
                score -= 15;
                reasons.push({ type: 'warning', message: `Farmer is quite far (${Math.round(distance)} miles) - consider delivery logistics` });
            }
        }
    }

    // Category preference matching
    if (buyer.preferred_categories && listing.category) {
        if (buyer.preferred_categories.includes(listing.category)) {
            score += 15;
            reasons.push({ type: 'positive', message: 'Matches your preferred categories' });
        }
    }

    // Verified farmer bonus
    if (listing.farmer?.is_verified) {
        score += 10;
        reasons.push({ type: 'positive', message: 'Verified farmer with quality assurance' });
    }

    // Experience bonus
    if (listing.farmer?.years_farming) {
        if (listing.farmer.years_farming >= 10) {
            score += 10;
            reasons.push({ type: 'positive', message: `Experienced farmer with ${listing.farmer.years_farming}+ years` });
        } else if (listing.farmer.years_farming >= 5) {
            score += 5;
            reasons.push({ type: 'neutral', message: `${listing.farmer.years_farming} years of farming experience` });
        }
    }

    // Certifications bonus
    if (listing.farmer?.certifications && listing.farmer.certifications.length > 0) {
        score += 5 * Math.min(listing.farmer.certifications.length, 3);
        reasons.push({ type: 'positive', message: `${listing.farmer.certifications.length} certification(s) on file` });
    }

    // CropScore bonus (up to 15 points)
    if (listing.farmer?.crop_score != null && Number(listing.farmer.crop_score) > 0) {
        const cropScore = Number(listing.farmer.crop_score);
        const bonus = Math.round((cropScore / 100) * 15);
        score += bonus;
        if (cropScore >= 80) {
            reasons.push({ type: 'positive', message: `Elite CropScore (${cropScore}) — highly reliable` });
        } else if (cropScore >= 60) {
            reasons.push({ type: 'positive', message: `Trusted CropScore (${cropScore})` });
        } else if (cropScore >= 40) {
            reasons.push({ type: 'neutral', message: `Rising CropScore (${cropScore})` });
        }
    }

    // Price competitiveness (would need market data for real implementation)
    // For now, just add a neutral note about pricing
    if (listing.price_per_unit > 0) {
        reasons.push({ type: 'neutral', message: `Priced at $${listing.price_per_unit} per unit` });
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return { score, reasons };
}

// Calculate compatibility for a farmer viewing buyer requests
export async function calculateRequestCompatibility(
    request: {
        buyer_id: string;
        crop_name: string;
        category: string | null;
        quantity: number;
        max_price: number | null;
        needed_by: string | null;
        buyer?: {
            location: string | null;
            business_type?: string | null;
            years_in_business?: number | null;
            average_order_size?: string | null;
            preferred_categories?: string[] | null;
        };
    },
    farmer: {
        location: string | null;
        crops?: string[] | null;
        delivery_radius?: number | null;
    }
): Promise<CompatibilityResult> {
    const reasons: CompatibilityResult['reasons'] = [];
    let score = 50; // Base score

    // Location-based scoring
    if (request.buyer?.location && farmer.location) {
        const buyerLoc = await parseLocation(request.buyer.location);
        const farmerLoc = await parseLocation(farmer.location);

        if (buyerLoc && farmerLoc) {
            const distance = calculateDistance(farmerLoc, buyerLoc);
            const deliveryRadius = farmer.delivery_radius || 50;

            if (distance <= deliveryRadius) {
                score += 25;
                reasons.push({ type: 'positive', message: 'Within your delivery radius' });
            } else if (distance <= deliveryRadius * 1.5) {
                score += 10;
                reasons.push({ type: 'neutral', message: `Just outside your usual delivery area (${Math.round(distance)} miles)` });
            } else if (distance <= deliveryRadius * 2) {
                score -= 5;
                reasons.push({ type: 'warning', message: `Buyer is ${Math.round(distance)} miles away - may require special arrangements` });
            } else {
                score -= 15;
                reasons.push({ type: 'warning', message: `Buyer is quite far (${Math.round(distance)} miles) - consider delivery costs` });
            }
        }
    }

    // Crop matching
    if (farmer.crops && farmer.crops.length > 0) {
        const cropNameLower = request.crop_name.toLowerCase();
        const hasCrop = farmer.crops.some(c => c.toLowerCase().includes(cropNameLower) || cropNameLower.includes(c.toLowerCase()));

        if (hasCrop) {
            score += 20;
            reasons.push({ type: 'positive', message: 'You grow this crop!' });
        } else {
            reasons.push({ type: 'neutral', message: 'Not in your listed crops - consider if you can fulfill' });
        }
    }

    // Timeline feasibility
    if (request.needed_by) {
        const daysUntil = Math.ceil((new Date(request.needed_by).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        if (daysUntil < 3) {
            score -= 10;
            reasons.push({ type: 'warning', message: 'Urgent - needed in less than 3 days' });
        } else if (daysUntil < 7) {
            score += 5;
            reasons.push({ type: 'neutral', message: `Needed within ${daysUntil} days` });
        } else if (daysUntil < 14) {
            score += 10;
            reasons.push({ type: 'positive', message: 'Reasonable timeline - needed in about 2 weeks' });
        } else {
            score += 15;
            reasons.push({ type: 'positive', message: 'Flexible timeline - plenty of time to prepare' });
        }
    }

    // Business type bonus
    if (request.buyer?.business_type) {
        if (['restaurant', 'grocery', 'distributor'].includes(request.buyer.business_type.toLowerCase())) {
            score += 10;
            reasons.push({ type: 'positive', message: `${request.buyer.business_type} - potential repeat customer` });
        }
    }

    // Experience bonus
    if (request.buyer?.years_in_business && request.buyer.years_in_business >= 3) {
        score += 5;
        reasons.push({ type: 'positive', message: 'Established business' });
    }

    // Order size indicator
    if (request.buyer?.average_order_size) {
        reasons.push({ type: 'neutral', message: `Typical order size: ${request.buyer.average_order_size}` });
    }

    // Price offered
    if (request.max_price) {
        reasons.push({ type: 'neutral', message: `Budget: up to $${request.max_price} per unit` });
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return { score, reasons };
}

// Sort listings by compatibility score
export function sortByCompatibility<T extends { compatibilityScore?: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
}
