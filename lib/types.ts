// ============ DOMAIN MODEL ============
// The contract is the product. Everything orbits it.

export type Role = "farm" | "buyer";

export type Cadence = "one_time" | "weekly" | "biweekly" | "monthly";

export const CADENCE_LABEL: Record<Cadence, string> = {
    one_time: "One-time",
    weekly: "Weekly",
    biweekly: "Every 2 weeks",
    monthly: "Monthly",
};

/** Days between deliveries for each cadence (one_time → single). */
export const CADENCE_DAYS: Record<Cadence, number> = {
    one_time: 0,
    weekly: 7,
    biweekly: 14,
    monthly: 30,
};

export type ListingType = "supply" | "need";
export type ListingStatus = "active" | "paused" | "matched" | "archived";

export type ContractStatus =
    | "draft"
    | "proposed"
    | "countered"
    | "agreed"
    | "sampling"
    | "active"
    | "completed"
    | "renewed"
    | "closed";

export const CONTRACT_FLOW: ContractStatus[] = [
    "draft",
    "proposed",
    "countered",
    "agreed",
    "sampling",
    "active",
    "completed",
];

export const CONTRACT_STATUS_META: Record<
    ContractStatus,
    { label: string; tone: "neutral" | "amber" | "forest" | "sky" | "muted" }
> = {
    draft: { label: "Draft", tone: "muted" },
    proposed: { label: "Proposed", tone: "amber" },
    countered: { label: "Countered", tone: "amber" },
    agreed: { label: "Agreed", tone: "sky" },
    sampling: { label: "Sampling", tone: "amber" },
    active: { label: "Active", tone: "forest" },
    completed: { label: "Completed", tone: "neutral" },
    renewed: { label: "Renewed", tone: "forest" },
    closed: { label: "Closed", tone: "muted" },
};

export type DeliveryStatus = "scheduled" | "delivered" | "confirmed" | "missed";

export type NodeType =
    | "harvest"
    | "pack"
    | "cold_storage"
    | "pickup"
    | "transit"
    | "inspection"
    | "dropoff"
    | "delivered"
    | "custom";

export type NodeStatus = "pending" | "active" | "done" | "blocked";

// ============ ROWS ============

export interface Profile {
    id: string;
    role: Role;
    full_name: string;
    org_name: string | null;
    email: string | null;
    location_label: string | null;
    lat: number | null;
    lng: number | null;
    bio: string | null;
    avatar_url: string | null;
    crops: string[] | null; // farm: what they grow
    needs: string[] | null; // buyer: what they typically need
    website: string | null;
    phone: string | null;
    certifications: string[] | null;
    completed_contracts: number;
    renewed_contracts: number;
    deliveries_confirmed: number;
    deliveries_missed: number;
    created_at: string;
}

/** Fulfillment reliability derived from delivery history. */
export function reliability(p: Pick<Profile, "deliveries_confirmed" | "deliveries_missed">) {
    const total = (p.deliveries_confirmed ?? 0) + (p.deliveries_missed ?? 0);
    const rate = total === 0 ? null : Math.round((p.deliveries_confirmed / total) * 100);
    return { rate, total, confirmed: p.deliveries_confirmed ?? 0, missed: p.deliveries_missed ?? 0 };
}

/** Structured terms — the heart of every offer/need/contract version. */
export interface Terms {
    crop: string;
    grade: string | null;
    quantity: number; // typical / target per delivery
    quantity_min: number | null; // flexible band — lower bound (null = exact)
    quantity_max: number | null; // flexible band — upper bound
    unit: string; // lb, case, bushel, etc.
    cadence: Cadence;
    term_start: string; // ISO date
    term_end: string; // ISO date
    unit_price_cents: number;
    delivery_terms: string | null; // who delivers / location / window
    quality_terms: string | null; // spec + rejection
    // ---- flexibility / risk-sharing (the painkiller) ----
    crop_failure_clause: boolean; // forgive weather/pest shortfalls, no penalty
    opt_out_notice_days: number | null; // either party may adjust/exit with this notice
    min_commit_cycles: number | null; // firm for the first N deliveries, flexible after
    sample_first: boolean; // one sample delivery to approve before the full commitment
    notes: string | null;
}

/** Is this a flexible quantity band rather than an exact number? */
export function hasBand(t: Terms): boolean {
    return t.quantity_min != null && t.quantity_max != null && t.quantity_max > t.quantity_min;
}

export interface Listing {
    id: string;
    owner_id: string;
    type: ListingType;
    title: string;
    terms: Terms;
    price_ceiling_cents: number | null; // buyer needs only
    location_label: string | null;
    lat: number | null;
    lng: number | null;
    status: ListingStatus;
    created_at: string;
    owner?: Profile;
}

export interface ContractVersion {
    id: string;
    contract_id: string;
    version: number;
    terms: Terms;
    proposed_by: string;
    note: string | null;
    created_at: string;
}

export interface Contract {
    id: string;
    listing_id: string | null;
    farm_id: string;
    buyer_id: string;
    terms: Terms; // current agreed/proposed terms
    status: ContractStatus;
    current_version: number;
    farm_confirmed: boolean;
    buyer_confirmed: boolean;
    agreement_text: string | null; // AI-generated plain-language agreement
    created_at: string;
    updated_at: string;
    // joins
    farm?: Profile;
    buyer?: Profile;
    versions?: ContractVersion[];
    deliveries?: Delivery[];
}

export interface Delivery {
    id: string;
    contract_id: string;
    seq: number;
    scheduled_date: string;
    quantity: number;
    status: DeliveryStatus;
    is_sample: boolean;
    note: string | null;
}

export interface BoardNode {
    id: string;
    contract_id: string;
    type: NodeType;
    label: string;
    x: number;
    y: number;
    status: NodeStatus;
    meta: Record<string, unknown> | null;
    highlighted: boolean; // product currently here
}

export interface BoardEdge {
    id: string;
    contract_id: string;
    source: string;
    target: string;
    label: string | null;
}

export interface NegotiationMessage {
    id: string;
    contract_id: string;
    sender_id: string;
    kind: "message" | "counter" | "accept" | "decline" | "system";
    body: string;
    version_ref: number | null;
    created_at: string;
    sender?: Profile;
}

export interface CompletionRecord {
    id: string;
    contract_id: string;
    party_id: string;
    outcome: "completed" | "renewed" | "closed";
    rating: number | null;
    notes: string | null;
    created_at: string;
}

// ============ DERIVED ============

export interface MatchResult {
    listing: Listing;
    score: number; // 0–100
    reasons: string[];
    distanceKm: number | null;
}

export const NODE_META: Record<NodeType, { label: string; hue: number }> = {
    harvest: { label: "Harvest", hue: 142 },
    pack: { label: "Pack & grade", hue: 38 },
    cold_storage: { label: "Cold storage", hue: 205 },
    pickup: { label: "Pickup", hue: 142 },
    transit: { label: "In transit", hue: 38 },
    inspection: { label: "Inspection", hue: 330 },
    dropoff: { label: "Drop-off", hue: 205 },
    delivered: { label: "Delivered", hue: 142 },
    custom: { label: "Step", hue: 150 },
};
