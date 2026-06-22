"use client";

import * as React from "react";
import { type Dish, type Restaurant, type Levers, DEFAULT_LEVERS, parseMenu, SAMPLES, computeUplift } from "@/lib/margin";
import { uid } from "@/lib/utils";

// ============ CONCRETE SOURCING FLOW ============
// The spine of the app: every locally-sourced ingredient moves through a real
// pipeline. Not input→result — a flow with stages, farms, contracts, deliveries.

export type Stage = "requested" | "matched" | "agreed" | "delivering" | "live";
export const STAGES: Stage[] = ["requested", "matched", "agreed", "delivering", "live"];
export const STAGE_LABEL: Record<Stage, string> = {
    requested: "Requested", matched: "Farm chosen", agreed: "Under contract", delivering: "Delivering", live: "Live on menu",
};

export interface Farm {
    id: string;
    name: string;
    location: string;
    distanceMi: number;
    practices: string[];
    story: string;
    crops: string[];
    reliability: number; // 0..100
    priceIndex: number;  // 1.0 = market; <1 cheaper
    farmer: string;
    region?: "N" | "S" | "E" | "W" | "C"; // direction from the city (Indianapolis)
}

export interface Delivery { id: string; date: string; qty: number; status: "scheduled" | "delivered" | "confirmed"; }

// ---- LOI / contract negotiation ----
export type LoiParty = "you" | "farm" | "agent";
export interface QualityTerm { id: string; label: string; status: "accepted" | "countered"; note: string; priceDelta: number }
export interface LoiNote { id: string; by: LoiParty; text: string; ts: number }
export interface LOI {
    status: "review" | "signed";
    pricePerUnit: number;
    cadence: string;
    qualityTerms: QualityTerm[];
    log: LoiNote[];
    signedAt?: string;
}
export interface QualityOption { id: string; label: string; priceDelta: number; detail: string }
export const QUALITY_OPTIONS: QualityOption[] = [
    { id: "organic", label: "Certified Organic", priceDelta: 0.3, detail: "Only certified-organic product." },
    { id: "nongmo", label: "Non-GMO", priceDelta: 0, detail: "No genetically modified seed." },
    { id: "grade1", label: "Grade No. 1 only", priceDelta: 0.2, detail: "Top visual and size grade." },
    { id: "harvest48", label: "Harvested within 48h", priceDelta: 0.1, detail: "Freshness window on every drop." },
    { id: "coldchain", label: "Cold chain to your door", priceDelta: 0.15, detail: "Temperature held end to end." },
    { id: "gap", label: "Food-safety docs (GAP)", priceDelta: 0, detail: "Audited paperwork on file." },
    { id: "variety", label: "Lock a single variety", priceDelta: 0.05, detail: "No substitutions across the season." },
];

export interface SourcingItem {
    id: string;
    crop: string;
    unit: string;
    qtyPerWeek: number;
    priceCeiling: number;
    dishName: string;
    stage: Stage;
    farmId?: string;
    lift: number;            // story price lift on the dish ($)
    harvestWindow: string;
    deliveries: Delivery[];
    createdAt: string;
    agreedAt?: string;
    loi?: LOI;               // preliminary agreement / negotiation
    allocations?: Allocation[]; // volume split across farms (lead farm is farmId)
}

export interface Allocation { farmId: string; qty: number }
/** Rough weekly capacity per farm, derived from reliability. */
export function farmCapacity(farm: Farm): number { return Math.round(45 + Math.max(0, farm.reliability - 86) * 6); }
/** Split a weekly quantity across ranked farms by capacity. */
export function allocateAcrossFarms(ranked: { farm: Farm }[], qty: number): Allocation[] {
    let remaining = qty; const out: Allocation[] = [];
    for (const r of ranked) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, farmCapacity(r.farm));
        if (take > 0) { out.push({ farmId: r.farm.id, qty: take }); remaining -= take; }
    }
    return out;
}

/** Negotiated price = base + accepted quality deltas. */
export function loiPrice(loi: LOI): number {
    return loi.pricePerUnit + loi.qualityTerms.reduce((s, t) => s + t.priceDelta, 0);
}

export type ActivityKind = "match" | "contract" | "delivery" | "story" | "system";
export interface Activity { id: string; text: string; kind: ActivityKind; itemId?: string; ts: number }

export interface AppState {
    onboarded: boolean;
    restaurant: Restaurant;
    dishes: Dish[];
    levers: Levers;
    farms: Farm[];
    items: SourcingItem[];
    activity: Activity[];
}

// ---- seed ----
export const SEED_FARMS: Farm[] = [
    { id: "f_teter", name: "Teter Organic Farm", farmer: "Maria Teter", location: "Noblesville, IN", region: "N", distanceMi: 22, practices: ["Certified Organic", "No-till"], crops: ["heirloom tomato", "tomato", "greens", "pepper"], reliability: 98, priceIndex: 1.05, story: "Family organic farm north of the city, known for heirloom tomatoes." },
    { id: "f_blue", name: "Growing Places Indy", farmer: "Devon Hale", location: "Indianapolis, IN", region: "C", distanceMi: 6, practices: ["Regenerative", "Certified Naturally Grown"], crops: ["greens", "salad", "arugula", "herb"], reliability: 95, priceIndex: 1.0, story: "Urban market garden a few miles from downtown, salad greens and herbs." },
    { id: "f_marsh", name: "Wild Ginger Farm", farmer: "Ana Ruiz", location: "Martinsville, IN", region: "S", distanceMi: 24, practices: ["Organic"], crops: ["beet", "carrot", "root", "squash"], reliability: 92, priceIndex: 0.96, story: "Root crops and squash from the hills south of Indianapolis." },
    { id: "f_emberlu", name: "Hoosier Mushroom Co.", farmer: "Sam Okafor", location: "Brownsburg, IN", region: "W", distanceMi: 18, practices: ["Spray-free"], crops: ["mushroom", "specialty mushroom", "herb"], reliability: 90, priceIndex: 1.12, story: "Indoor specialty mushroom growers west of the city, year-round." },
    { id: "f_sunfield", name: "Sunfield Acres", farmer: "Grace Lin", location: "Greenwood, IN", region: "S", distanceMi: 14, practices: ["Organic", "GAP Certified"], crops: ["squash", "pepper", "corn", "cucumber"], reliability: 96, priceIndex: 0.98, story: "Diversified vegetable farm just south, a reliable summer workhorse." },
    { id: "f_rivergate", name: "Tuttle Orchards", farmer: "Tomás Vela", location: "Greenfield, IN", region: "E", distanceMi: 26, practices: ["Organic"], crops: ["apple", "peach", "berry", "pumpkin"], reliability: 88, priceIndex: 1.03, story: "Heirloom fruit orchard east of the city, apples and peaches." },
];

// ---- Special of the week: the agent drafts a ready-to-run menu special ----
export interface WeekSpecial { id: string; crop: string; unit: string; price: number; farmId: string; dishName: string; description: string }
export const WEEK_SPECIALS: WeekSpecial[] = [
    { id: "sp_tom", crop: "heirloom tomato", unit: "lb", price: 16, farmId: "f_teter", dishName: "Teter Farm Heirloom Tomato Toast", description: "Vine-ripened heirlooms from Teter Organic in Noblesville, whipped stracciatella, basil oil, sourdough." },
    { id: "sp_squash", crop: "summer squash", unit: "lb", price: 15, farmId: "f_sunfield", dishName: "Wood-Grilled Sunfield Squash", description: "Greenwood summer squash over coals, salsa verde, toasted pepitas, a squeeze of lime." },
    { id: "sp_peach", crop: "peach", unit: "case", price: 14, farmId: "f_rivergate", dishName: "Tuttle Orchard Peach & Burrata", description: "Greenfield peaches at peak, torn burrata, hot honey, mint, flaky salt." },
    { id: "sp_mush", crop: "specialty mushroom", unit: "lb", price: 17, farmId: "f_emberlu", dishName: "Hoosier Mushroom Toast", description: "Lion's mane and oyster from Hoosier Mushroom Co., taleggio, thyme, confit garlic." },
    { id: "sp_beet", crop: "beet", unit: "lb", price: 13, farmId: "f_marsh", dishName: "Wild Ginger Roasted Beets", description: "Martinsville beets roasted in their skins, citrus, pistachio, whipped chèvre." },
    { id: "sp_greens", crop: "salad greens", unit: "lb", price: 13, farmId: "f_blue", dishName: "Growing Places Little Gems", description: "Just-cut little gems from a downtown garden, buttermilk dill, charred lemon, breadcrumb." },
];

function seedItems(): SourcingItem[] {
    const today = new Date();
    const wk = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n * 7); return d.toISOString().slice(0, 10); };
    return [
        {
            id: "s_tom", crop: "heirloom tomato", unit: "lb", qtyPerWeek: 40, priceCeiling: 4.5, dishName: "Heirloom tomato salad, basil, stracciatella",
            stage: "live", farmId: "f_teter", lift: 3, harvestWindow: "Jun–Sep",
            createdAt: wk(-6), agreedAt: wk(-5),
            deliveries: [
                { id: uid("dl"), date: wk(-4), qty: 40, status: "confirmed" },
                { id: uid("dl"), date: wk(-3), qty: 38, status: "confirmed" },
                { id: uid("dl"), date: wk(-2), qty: 42, status: "confirmed" },
                { id: uid("dl"), date: wk(-1), qty: 40, status: "confirmed" },
                { id: uid("dl"), date: wk(0), qty: 40, status: "delivered" },
                { id: uid("dl"), date: wk(1), qty: 40, status: "scheduled" },
            ],
            loi: { status: "signed", pricePerUnit: 4.5, cadence: "Weekly", qualityTerms: [{ id: "organic", label: "Certified Organic", status: "accepted", note: "Included, no change", priceDelta: 0 }], log: [{ id: uid("ln"), by: "agent", text: "Matched Teter Organic Farm, drafted and signed the terms.", ts: today.getTime() }], signedAt: wk(-5) },
        },
        {
            id: "s_greens", crop: "salad greens", unit: "lb", qtyPerWeek: 30, priceCeiling: 6, dishName: "Garden greens, sherry vinaigrette",
            stage: "delivering", farmId: "f_blue", lift: 2, harvestWindow: "Year-round",
            createdAt: wk(-3), agreedAt: wk(-2),
            deliveries: [
                { id: uid("dl"), date: wk(-1), qty: 30, status: "confirmed" },
                { id: uid("dl"), date: wk(0), qty: 30, status: "scheduled" },
                { id: uid("dl"), date: wk(1), qty: 30, status: "scheduled" },
            ],
            loi: { status: "signed", pricePerUnit: 6, cadence: "Weekly", qualityTerms: [], log: [{ id: uid("ln"), by: "agent", text: "Matched Growing Places Indy, drafted and signed the terms.", ts: today.getTime() }], signedAt: wk(-2) },
        },
        {
            id: "s_squash", crop: "summer squash", unit: "lb", qtyPerWeek: 25, priceCeiling: 3, dishName: "Grilled local squash, salsa verde",
            stage: "matched", farmId: "f_sunfield", lift: 2, harvestWindow: "Jun–Oct",
            createdAt: wk(-1), deliveries: [],
            loi: { status: "review", pricePerUnit: 3, cadence: "Weekly", qualityTerms: [], log: [{ id: uid("ln"), by: "agent", text: "I matched Sunfield Acres and drafted the terms. Review them, add any quality guidelines you want, and sign when you are ready.", ts: today.getTime() }] },
        },
    ];
}

function seed(): AppState {
    const sample = SAMPLES[0];
    return {
        onboarded: true,
        restaurant: sample.restaurant,
        dishes: parseMenu(sample.menu),
        levers: DEFAULT_LEVERS,
        farms: SEED_FARMS,
        items: seedItems(),
        activity: seedActivity(),
    };
}

function seedActivity(): Activity[] {
    const now = Date.now();
    const a = (text: string, kind: ActivityKind, minsAgo: number, itemId?: string): Activity => ({ id: uid("a"), text, kind, itemId, ts: now - minsAgo * 60000 });
    return [
        a("Confirmed this week's heirloom tomato delivery", "delivery", 90, "s_tom"),
        a("Tomato salad is live on your menu", "story", 60 * 26, "s_tom"),
        a("Scheduled 8 weekly deliveries with Growing Places Indy", "delivery", 60 * 48, "s_greens"),
        a("Drafted your supply agreement for salad greens", "contract", 60 * 49, "s_greens"),
        a("Matched Sunfield Acres for summer squash", "match", 60 * 70, "s_squash"),
    ];
}

// ---- store (no deps; useSyncExternalStore) ----
const KEY = "cropconnect:v1";
let state: AppState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* noop */ } }

// ---- remote persistence (Supabase, per authenticated account) ----
let remoteSink: ((s: AppState) => Promise<void> | void) | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleRemotePush() {
    if (!remoteSink) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => { pushTimer = null; remoteSink?.(state); }, 600);
}
/** Register a sink that persists state to the signed-in account. Pass null to detach. */
export function setRemoteSink(fn: ((s: AppState) => Promise<void> | void) | null) { remoteSink = fn; }
/** Load state pulled from the account into the store without echoing it back. */
export function hydrateRemote(s: AppState) { state = s; persist(); emit(); }
/** Push the latest state to the account right now (e.g. before navigating away). */
export function flushRemote() { if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; } return remoteSink?.(state); }
function emit() { listeners.forEach((l) => l()); }
function set(updater: (s: AppState) => AppState) { state = updater(state); persist(); emit(); scheduleRemotePush(); }
function pushActivity(text: string, kind: ActivityKind, itemId?: string) {
    set((s) => ({ ...s, activity: [{ id: uid("a"), text, kind, itemId, ts: Date.now() }, ...s.activity].slice(0, 40) }));
}

function hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) state = { ...seed(), ...JSON.parse(raw) };
    } catch { /* noop */ }
}

export function useStore<T>(selector: (s: AppState) => T): T {
    hydrate();
    return React.useSyncExternalStore(
        (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
        () => selector(state),
        () => selector(state),
    );
}

export function getState() { return state; }

// ---- actions ----
export const actions = {
    reset() { set(() => seed()); },
    completeOnboarding(restaurant: Restaurant, dishes: Dish[]) { set((s) => ({ ...s, onboarded: true, restaurant, dishes })); },
    setLevers(lv: Partial<Levers>) { set((s) => ({ ...s, levers: { ...s.levers, ...lv } })); },
    setDishes(dishes: Dish[]) { set((s) => ({ ...s, dishes })); },

    createNeed(input: { crop: string; unit: string; qtyPerWeek: number; priceCeiling: number; dishName: string; harvestWindow?: string }) {
        const item: SourcingItem = {
            id: uid("s"), ...input, harvestWindow: input.harvestWindow || "Seasonal",
            stage: "requested", lift: 3, deliveries: [], createdAt: new Date().toISOString().slice(0, 10),
        };
        set((s) => ({ ...s, items: [item, ...s.items] }));
        pushActivity(`New request opened for ${input.crop}`, "system", item.id);
        return item.id;
    },
    logActivity(text: string, kind: ActivityKind, itemId?: string) { pushActivity(text, kind, itemId); },
    /** The autonomous loop: match the best farm and draft a preliminary agreement (LOI) to review. */
    autoSource(itemId: string) {
        const item = state.items.find((i) => i.id === itemId);
        if (!item) return;
        const ranked = rankFarms(state.farms, item.crop, item.priceCeiling);
        const best = ranked[0];
        const allocations = allocateAcrossFarms(ranked, item.qtyPerWeek);
        if (best) actions.chooseFarm(itemId, best.farm.id);
        set((s) => ({ ...s, items: s.items.map((i) => i.id === itemId ? { ...i, allocations } : i) }));
        actions.draftLoi(itemId);
        if (best) pushActivity(`Matched ${best.farm.name} for ${item.crop}`, "match", itemId);
        if (allocations.length > 1) pushActivity(`Split ${item.qtyPerWeek} ${item.unit} across ${allocations.length} farms to cover the volume`, "match", itemId);
        pushActivity(`Drafted a preliminary agreement, ready for your review`, "contract", itemId);
    },
    /** The agent drafts the LOI: terms ready to sign, open to negotiation. */
    draftLoi(itemId: string) {
        set((s) => ({
            ...s, items: s.items.map((i) => {
                if (i.id !== itemId) return i;
                const farm = s.farms.find((f) => f.id === i.farmId);
                const loi: LOI = {
                    status: "review", pricePerUnit: i.priceCeiling || 0, cadence: "Weekly", qualityTerms: [],
                    log: [{ id: uid("ln"), by: "agent", text: `I matched ${farm?.name ?? "a local farm"} and drafted the terms. Review them, add any quality guidelines you want, and sign when you are ready.`, ts: Date.now() }],
                };
                return { ...i, stage: "matched", loi };
            }),
        }));
    },
    /** Restaurant requests a quality guideline; the agent underwrites and the farm responds. */
    requestQualityTerm(itemId: string, optionId: string) {
        const opt = QUALITY_OPTIONS.find((o) => o.id === optionId); if (!opt) return;
        const item = state.items.find((i) => i.id === itemId);
        const farm = state.farms.find((f) => f.id === item?.farmId);
        const alreadyMeets = !!farm && ((optionId === "organic" && farm.practices.some((p) => /organic/i.test(p))) || (optionId === "gap" && farm.reliability >= 92) || optionId === "nongmo");
        const status: QualityTerm["status"] = alreadyMeets || opt.priceDelta === 0 ? "accepted" : "countered";
        const priceDelta = alreadyMeets ? 0 : opt.priceDelta;
        set((s) => ({
            ...s, items: s.items.map((i) => {
                if (i.id !== itemId || !i.loi || i.loi.qualityTerms.some((t) => t.id === optionId)) return i;
                const now = Date.now();
                const term: QualityTerm = { id: optionId, label: opt.label, status, note: priceDelta ? `+$${opt.priceDelta.toFixed(2)}/${i.unit}` : "Included, no change", priceDelta };
                const log: LoiNote[] = [...i.loi.log,
                { id: uid("ln"), by: "you", text: `Requested ${opt.label}.`, ts: now },
                { id: uid("ln"), by: "agent", text: priceDelta ? `${farm?.name ?? "The farm"} can meet this for +$${opt.priceDelta.toFixed(2)}/${i.unit}. Added to the terms.` : `${farm?.name ?? "The farm"} already meets this. Added at no extra cost.`, ts: now + 1 }];
                return { ...i, loi: { ...i.loi, qualityTerms: [...i.loi.qualityTerms, term], log } };
            }),
        }));
        pushActivity(`Negotiated ${opt.label} into the ${item?.crop} agreement`, "contract", itemId);
    },
    removeQualityTerm(itemId: string, termId: string) {
        set((s) => ({ ...s, items: s.items.map((i) => i.id === itemId && i.loi ? { ...i, loi: { ...i.loi, qualityTerms: i.loi.qualityTerms.filter((t) => t.id !== termId) } } : i) }));
    },
    /** Both sides accept: the LOI becomes an official contract and deliveries schedule. */
    signContract(itemId: string) {
        const item = state.items.find((i) => i.id === itemId);
        if (!item || !item.loi) return;
        const finalPrice = loiPrice(item.loi);
        const farm = state.farms.find((f) => f.id === item.farmId);
        set((s) => ({ ...s, items: s.items.map((i) => i.id === itemId && i.loi ? { ...i, priceCeiling: finalPrice, loi: { ...i.loi, status: "signed", signedAt: new Date().toISOString().slice(0, 10) } } : i) }));
        actions.confirmAgreement(itemId);
        pushActivity(`Contract signed with ${farm?.name ?? "the farm"} for ${item.crop}`, "contract", itemId);
        pushActivity(`Scheduled 8 weekly deliveries`, "delivery", itemId);
    },
    chooseFarm(itemId: string, farmId: string) {
        set((s) => ({ ...s, items: s.items.map((i) => i.id === itemId ? { ...i, farmId, stage: "matched" } : i) }));
    },
    confirmAgreement(itemId: string) {
        set((s) => ({
            ...s, items: s.items.map((i) => {
                if (i.id !== itemId) return i;
                const today = new Date();
                const deliveries: Delivery[] = Array.from({ length: 8 }, (_, k) => {
                    const d = new Date(today); d.setDate(d.getDate() + (k + 1) * 7);
                    return { id: uid("dl"), date: d.toISOString().slice(0, 10), qty: i.qtyPerWeek, status: "scheduled" as const };
                });
                return { ...i, stage: "agreed", agreedAt: today.toISOString().slice(0, 10), deliveries };
            }),
        }));
    },
    advanceDelivery(itemId: string, deliveryId: string) {
        set((s) => ({
            ...s, items: s.items.map((i) => {
                if (i.id !== itemId) return i;
                const deliveries = i.deliveries.map((d) => d.id === deliveryId ? { ...d, status: (d.status === "scheduled" ? "delivered" : "confirmed") as Delivery["status"] } : d);
                const anyConfirmed = deliveries.some((d) => d.status === "confirmed");
                const anyMoving = deliveries.some((d) => d.status !== "scheduled");
                let stage = i.stage;
                if (anyConfirmed) stage = "live";
                else if (anyMoving) stage = "delivering";
                return { ...i, deliveries, stage };
            }),
        }));
    },
    setItemLift(itemId: string, lift: number) { set((s) => ({ ...s, items: s.items.map((i) => i.id === itemId ? { ...i, lift } : i) })); },
    removeItem(itemId: string) { set((s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) })); },
};

// ---- selectors / derived ----
export function rankFarms(farms: Farm[], crop: string, priceCeiling: number) {
    const tokens = crop.toLowerCase().split(/\s+/);
    return farms
        .map((f) => {
            const cropMatch = f.crops.some((c) => tokens.some((t) => c.includes(t) || t.includes(c.split(" ")[0]))) ? 1 : 0.15;
            const dist = Math.max(0, 1 - f.distanceMi / 60);
            const price = priceCeiling ? Math.max(0, 1 - Math.max(0, f.priceIndex - 1)) : 0.5;
            const score = Math.round((cropMatch * 55 + (f.reliability / 100) * 22 + dist * 13 + price * 10));
            const reasons: string[] = [];
            if (cropMatch === 1) reasons.push(`Grows ${crop}`);
            if (f.distanceMi <= 20) reasons.push(`${f.distanceMi} mi away`);
            if (f.reliability >= 95) reasons.push(`${f.reliability}% reliable`);
            if (f.priceIndex <= 1) reasons.push("At or under market");
            return { farm: f, score: Math.min(100, score), reasons: reasons.slice(0, 3) };
        })
        .sort((a, b) => b.score - a.score);
}

export function farmById(id?: string): Farm | undefined { return state.farms.find((f) => f.id === id); }

/** Realized + modeled monthly margin uplift from live/delivering sourcing. */
export function marginRollup(s: AppState) {
    const inc = Math.max(0, s.levers.priceLift - s.levers.produceCostDelta);
    const ordersPerMonthPerItem = s.restaurant.coversPerWeek * s.levers.attachRate * 4.345;
    const liveItems = s.items.filter((i) => i.stage === "live");
    const modeledItems = s.items.filter((i) => ["agreed", "delivering", "live"].includes(i.stage));
    const realizedMonthly = liveItems.length * inc * ordersPerMonthPerItem;
    const modeledMonthly = modeledItems.length * inc * ordersPerMonthPerItem;
    const confirmedDeliveries = s.items.reduce((n, i) => n + i.deliveries.filter((d) => d.status === "confirmed").length, 0);
    return { realizedMonthly, modeledMonthly, realizedAnnual: realizedMonthly * 12, liveCount: liveItems.length, modeledCount: modeledItems.length, confirmedDeliveries };
}

// ---- agent roadmap (custom, recomputed each render) ----
export interface RoadmapStep { id: string; title: string; detail: string; done: boolean; href: string; cta: string }
export function agentRoadmap(s: AppState): RoadmapStep[] {
    const hasItems = s.items.length > 0;
    const anyAgreed = s.items.some((i) => ["agreed", "delivering", "live"].includes(i.stage));
    const anyLive = s.items.some((i) => i.stage === "live");
    const hasMenu = s.dishes.length > 0;
    const enough = s.items.length >= 3;
    return [
        { id: "menu", title: "Finish your setup", detail: "Add your kitchen and menu so Sage can price.", done: hasMenu, href: "/app/onboarding", cta: "Set up" },
        { id: "first", title: "Source your first ingredient", detail: "Name one thing. The agent runs the rest.", done: hasItems, href: "/app/sourcing/new", cta: "Source it" },
        { id: "agree", title: "Let the agreement run", detail: "Sage drafted the terms with the farm.", done: anyAgreed, href: "/app/sourcing", cta: "See the board" },
        { id: "live", title: "Put it on the menu", detail: "Go live and start earning the margin.", done: anyLive, href: "/app/story", cta: "Get the story" },
        { id: "scale", title: "Add two more ingredients", detail: "Sage runs them in parallel.", done: enough, href: "/app/sourcing/new", cta: "Add more" },
        { id: "margin", title: "Review your margin lift", detail: "See what local is earning you.", done: anyLive, href: "/app/margins", cta: "Open Margins" },
    ];
}

// ---- escrow / order tracking ----
export type EscrowStatus = "pending" | "funded" | "held" | "releasing";
export const ESCROW_LABEL: Record<EscrowStatus, string> = { pending: "Not funded", funded: "Funded", held: "Held in escrow", releasing: "Releasing on delivery" };
export function orderEscrow(item: SourcingItem) {
    const weekly = (item.qtyPerWeek || 0) * (item.priceCeiling || 0);
    const confirmed = item.deliveries.filter((d) => d.status === "confirmed").length;
    const scheduled = item.deliveries.filter((d) => d.status === "scheduled").length;
    const delivered = item.deliveries.filter((d) => d.status === "delivered").length;
    let status: EscrowStatus = "pending";
    if (item.stage === "live") status = "releasing";
    else if (item.stage === "delivering") status = "held";
    else if (item.stage === "agreed") status = "funded";
    return { weekly, released: confirmed * weekly, held: (scheduled + delivered) * weekly, status, confirmed, scheduled, delivered };
}

// ---- deals (local supply opportunities surfaced by the agent) ----
export interface Deal { id: string; farmId: string; crop: string; unit: string; price: number; qtyAvail: number; window: string; blurb: string; sourced: boolean }
export function computeDeals(s: AppState): Deal[] {
    const sourcedCrops = new Set(s.items.map((i) => i.crop.toLowerCase()));
    const seeds = [
        { farmId: "f_teter", crop: "heirloom tomato", unit: "lb", price: 4.2, qty: 120, window: "Jun–Sep", blurb: "Surplus dry-farmed crop, priced under market this week." },
        { farmId: "f_blue", crop: "salad greens", unit: "lb", price: 5.5, qty: 80, window: "Year-round", blurb: "Standing weekly cut. Lock a season rate now." },
        { farmId: "f_sunfield", crop: "summer squash", unit: "lb", price: 2.6, qty: 150, window: "Jun–Oct", blurb: "Peak volume. Strong margin on a grilled side." },
        { farmId: "f_marsh", crop: "beets", unit: "lb", price: 3.0, qty: 90, window: "Sep–Feb", blurb: "Storage crop. Reliable all winter long." },
        { farmId: "f_emberlu", crop: "specialty mushroom", unit: "lb", price: 9.0, qty: 40, window: "Year-round", blurb: "Oyster and lion's mane. A premium plate driver." },
        { farmId: "f_rivergate", crop: "stone fruit", unit: "case", price: 28, qty: 30, window: "Jun–Aug", blurb: "Tree-ripened peaches. Short window, high demand." },
    ];
    return seeds.map((d, i) => ({ id: "deal_" + i, farmId: d.farmId, crop: d.crop, unit: d.unit, price: d.price, qtyAvail: d.qty, window: d.window, blurb: d.blurb, sourced: sourcedCrops.has(d.crop.toLowerCase()) }));
}

export { computeUplift };
