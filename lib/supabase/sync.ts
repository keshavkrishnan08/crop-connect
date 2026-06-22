import type { SupabaseClient } from "@supabase/supabase-js";
import { type AppState, type SourcingItem, type Activity, type Delivery, SEED_FARMS } from "@/lib/store";
import type { Dish } from "@/lib/margin";

/** Build the full AppState for a user from their rows. Returns null for a brand-new account. */
export async function pullState(supabase: SupabaseClient, userId: string): Promise<AppState | null> {
    const [r, dishes, items, dels, acts] = await Promise.all([
        supabase.from("restaurants").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("dishes").select("*").eq("user_id", userId),
        supabase.from("sourcing_items").select("*").eq("user_id", userId),
        supabase.from("deliveries").select("*").eq("user_id", userId),
        supabase.from("activity").select("*").eq("user_id", userId).order("ts", { ascending: false }),
    ]);
    if (!r.data) return null;

    const delByItem: Record<string, Delivery[]> = {};
    for (const d of dels.data ?? []) (delByItem[d.item_id] ||= []).push({ id: d.id, date: d.date, qty: d.qty, status: d.status });

    const dishList: Dish[] = (dishes.data ?? []).map((d) => ({ id: d.id, name: d.name, price: Number(d.price), category: d.category, produceDriven: d.produce_driven, foodCostPct: Number(d.food_cost_pct), featured: d.featured }));
    const itemList: SourcingItem[] = (items.data ?? []).map((it) => ({
        id: it.id, crop: it.crop, unit: it.unit, qtyPerWeek: it.qty_per_week, priceCeiling: Number(it.price_ceiling), dishName: it.dish_name,
        stage: it.stage, lift: Number(it.lift), harvestWindow: it.harvest_window, farmId: it.farm_id ?? undefined,
        createdAt: it.created_at, agreedAt: it.agreed_at ?? undefined, deliveries: delByItem[it.id] ?? [],
        loi: it.attributes?.loi ?? undefined,
        allocations: it.attributes?.allocations ?? undefined,
        deliveryMeta: it.attributes?.deliveryMeta ?? undefined,
        updates: it.attributes?.updates ?? undefined,
        penalties: it.attributes?.penalties ?? undefined,
    }));
    const activity: Activity[] = (acts.data ?? []).map((a) => ({ id: a.id, text: a.text, kind: a.kind, itemId: a.item_id ?? undefined, ts: Number(a.ts) }));

    return {
        onboarded: r.data.onboarded,
        restaurant: { name: r.data.name, cuisine: r.data.cuisine, location: r.data.location, coversPerWeek: r.data.covers_per_week, distributor: r.data.distributor },
        levers: { priceLift: Number(r.data.price_lift), produceCostDelta: Number(r.data.produce_cost_delta), attachRate: Number(r.data.attach_rate) },
        farms: SEED_FARMS,
        dishes: dishList,
        items: itemList,
        activity,
    };
}

async function replaceCollection(supabase: SupabaseClient, table: string, userId: string, rows: Record<string, unknown>[]) {
    if (rows.length) await supabase.from(table).upsert(rows);
    const ids = rows.map((r) => r.id as string);
    let q = supabase.from(table).delete().eq("user_id", userId);
    if (ids.length) q = q.not("id", "in", `(${ids.join(",")})`);
    await q;
}

/** Persist the whole AppState into the user's rows (orders are derived from agreed items). */
export async function pushState(supabase: SupabaseClient, userId: string, s: AppState): Promise<void> {
    await supabase.from("restaurants").upsert({
        user_id: userId, name: s.restaurant.name, cuisine: s.restaurant.cuisine, location: s.restaurant.location,
        covers_per_week: s.restaurant.coversPerWeek, distributor: s.restaurant.distributor, onboarded: s.onboarded,
        price_lift: s.levers.priceLift, produce_cost_delta: s.levers.produceCostDelta, attach_rate: s.levers.attachRate,
        updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    await replaceCollection(supabase, "sourcing_items", userId, s.items.map((it) => ({
        id: it.id, user_id: userId, crop: it.crop, unit: it.unit, qty_per_week: it.qtyPerWeek, price_ceiling: it.priceCeiling,
        dish_name: it.dishName, stage: it.stage, lift: it.lift, harvest_window: it.harvestWindow, farm_id: it.farmId ?? null,
        created_at: it.createdAt, agreed_at: it.agreedAt ?? null, attributes: { loi: it.loi ?? null, allocations: it.allocations ?? null, deliveryMeta: it.deliveryMeta ?? null, updates: it.updates ?? null, penalties: it.penalties ?? null },
    })));

    const deliveries = s.items.flatMap((it) => it.deliveries.map((d) => ({ id: d.id, item_id: it.id, user_id: userId, date: d.date, qty: d.qty, status: d.status })));
    await replaceCollection(supabase, "deliveries", userId, deliveries);

    const orders = s.items.filter((it) => ["agreed", "delivering", "live"].includes(it.stage)).map((it) => ({
        id: "o_" + it.id, user_id: userId, item_id: it.id, farm_id: it.farmId ?? null, crop: it.crop,
        total_cost: (it.qtyPerWeek || 0) * (it.priceCeiling || 0) * 8, status: it.stage,
    }));
    await replaceCollection(supabase, "orders", userId, orders);

    await replaceCollection(supabase, "dishes", userId, s.dishes.map((d) => ({
        id: d.id, user_id: userId, name: d.name, price: d.price, category: d.category, produce_driven: d.produceDriven, food_cost_pct: d.foodCostPct, featured: d.featured,
    })));

    await replaceCollection(supabase, "activity", userId, s.activity.map((a) => ({ id: a.id, user_id: userId, text: a.text, kind: a.kind, item_id: a.itemId ?? null, ts: a.ts })));
}
