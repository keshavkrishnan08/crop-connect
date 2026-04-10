/**
 * Carrier tracking URL generator
 * Returns a direct link to the carrier's tracking page for a given tracking number.
 */

const CARRIER_URLS: Record<string, (tracking: string) => string> = {
    usps: (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`,
    ups: (t) => `https://www.ups.com/track?tracknum=${t}`,
    fedex: (t) => `https://www.fedex.com/fedextrack/?trknbr=${t}`,
    dhl: (t) => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${t}`,
    "amazon logistics": (t) => `https://track.amazon.com/tracking/${t}`,
    ontrac: (t) => `https://www.ontrac.com/tracking/?number=${t}`,
    lasership: (t) => `https://www.lasership.com/track/${t}`,
    // Agricultural / regional carriers
    "pacific ag freight": (t) => `#tracking-${t}`,
    "farm express": (t) => `#tracking-${t}`,
    other: (t) => `https://www.google.com/search?q=track+package+${t}`,
};

export function getTrackingUrl(carrier: string, trackingNumber: string): string {
    const key = carrier.toLowerCase().trim();
    const generator = CARRIER_URLS[key] || CARRIER_URLS.other;
    return generator(trackingNumber.trim());
}

export function getCarrierDisplayName(carrier: string): string {
    const names: Record<string, string> = {
        usps: "USPS",
        ups: "UPS",
        fedex: "FedEx",
        dhl: "DHL",
        ontrac: "OnTrac",
        lasership: "LaserShip",
    };
    return names[carrier.toLowerCase().trim()] || carrier;
}

export const SUPPORTED_CARRIERS = [
    { value: "usps", label: "USPS" },
    { value: "ups", label: "UPS" },
    { value: "fedex", label: "FedEx" },
    { value: "dhl", label: "DHL" },
    { value: "ontrac", label: "OnTrac" },
    { value: "other", label: "Other Carrier" },
];
