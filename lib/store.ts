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
}

export interface Delivery { id: string; date: string; qty: number; status: "scheduled" | "delivered" | "confirmed"; }

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
    { id: "f_teter", name: "Teter Farm", farmer: "Maria Teter", location: "Sebastopol, CA", distanceMi: 12, practices: ["Certified Organic", "No-till"], crops: ["heirloom tomato", "tomato", "greens", "pepper"], reliability: 98, priceIndex: 1.05, story: "Third-generation family farm growing dry-farmed heirloom tomatoes on the Sonoma coast." },
    { id: "f_blue", name: "Blue Oak Gardens", farmer: "Devon Hale", location: "Petaluma, CA", distanceMi: 18, practices: ["Regenerative", "Certified Naturally Grown"], crops: ["greens", "salad", "arugula", "herb"], reliability: 95, priceIndex: 1.0, story: "Small-scale market garden specializing in tender salad greens and culinary herbs." },
    { id: "f_marsh", name: "Marsh Hollow", farmer: "Ana Ruiz", location: "Healdsburg, CA", distanceMi: 22, practices: ["Organic"], crops: ["beet", "carrot", "root", "squash"], reliability: 92, priceIndex: 0.96, story: "Root crops and winter squash grown along the Russian River floodplain." },
    { id: "f_emberlu", name: "Ember & Lu", farmer: "Sam Okafor", location: "Forestville, CA", distanceMi: 15, practices: ["Spray-free"], crops: ["mushroom", "specialty mushroom", "herb"], reliability: 90, priceIndex: 1.12, story: "Indoor specialty mushroom growers — oyster, lion's mane, maitake year-round." },
    { id: "f_sunfield", name: "Sunfield Acres", farmer: "Grace Lin", location: "Santa Rosa, CA", distanceMi: 9, practices: ["Organic", "GAP Certified"], crops: ["squash", "pepper", "corn", "cucumber"], reliability: 96, priceIndex: 0.98, story: "Diversified vegetable farm, nine miles out — a reliable workhorse for summer produce." },
    { id: "f_rivergate", name: "Rivergate Orchard", farmer: "Tomás Vela", location: "Geyserville, CA", distanceMi: 28, practices: ["Organic"], crops: ["apple", "peach", "berry", "citrus"], reliability: 88, priceIndex: 1.03, story: "Heirloom fruit orchard — stone fruit in summer, apples and citrus into winter." },
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
        },
        {
            id: "s_squash", crop: "summer squash", unit: "lb", qtyPerWeek: 25, priceCeiling: 3, dishName: "Grilled local squash, salsa verde",
            stage: "matched", farmId: "f_sunfield", lift: 2, harvestWindow: "Jun–Oct",
            createdAt: wk(-1), deliveries: [],
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
        a("Scheduled 8 weekly deliveries with Blue Oak", "delivery", 60 * 48, "s_greens"),
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
    /** The autonomous loop: match the best farm, lock the agreement, schedule deliveries. */
    autoSource(itemId: string) {
        const item = state.items.find((i) => i.id === itemId);
        if (!item) return;
        const best = rankFarms(state.farms, item.crop, item.priceCeiling)[0];
        if (best) actions.chooseFarm(itemId, best.farm.id);
        actions.confirmAgreement(itemId);
        if (best) pushActivity(`Matched ${best.farm.name} for ${item.crop}`, "match", itemId);
        pushActivity(`Drafted your supply agreement`, "contract", itemId);
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

export { computeUplift };
