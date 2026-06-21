// ============ MARGIN MODEL ============
// The spine of the product: we raise prices, not cut costs. Everything is an
// EDITABLE ESTIMATE with visible assumptions and ranges — never fabricated certainty.

export type DishCategory = "starter" | "salad" | "main" | "side" | "special";

export const CATEGORY_LABEL: Record<DishCategory, string> = {
    starter: "Starter", salad: "Salad", main: "Main", side: "Side", special: "Special",
};

/** Category food-cost benchmarks (% of menu price). Used to estimate current margin. */
export const FOOD_COST_BENCHMARK: Record<DishCategory, number> = {
    starter: 0.30, salad: 0.27, main: 0.34, side: 0.24, special: 0.33,
};

export interface Dish {
    id: string;
    name: string;
    price: number;          // menu price, dollars
    category: DishCategory;
    produceDriven: boolean; // candidate for a local swap
    foodCostPct: number;    // estimate (editable), 0..1
    featured: boolean;      // selected to feature with a local story
}

export interface Restaurant {
    name: string;
    cuisine: string;
    location: string;
    coversPerWeek: number;
    distributor: string;
}

/** The levers the owner can drag. Conservative defaults. */
export interface Levers {
    priceLift: number;       // $ added to a featured dish's price
    produceCostDelta: number;// $ added produce cost per featured dish
    attachRate: number;      // share of covers that order a given featured dish (0..1)
}

export const DEFAULT_LEVERS: Levers = { priceLift: 3, produceCostDelta: 0.75, attachRate: 0.12 };

const WEEKS_PER_MONTH = 4.345;

export function dishCurrent(d: Dish) {
    const cost = d.price * d.foodCostPct;
    const gp = d.price - cost;
    return { cost, gp, marginPct: d.price > 0 ? (gp / d.price) * 100 : 0 };
}

export function dishModeled(d: Dish, lv: Levers) {
    const cur = dishCurrent(d);
    const newPrice = d.price + lv.priceLift;
    const newCost = cur.cost + lv.produceCostDelta;
    const newGp = newPrice - newCost;
    const incrementalGp = lv.priceLift - lv.produceCostDelta; // pure margin added per order
    return { newPrice, newCost, newGp, incrementalGp, newMarginPct: newPrice > 0 ? (newGp / newPrice) * 100 : 0 };
}

export interface Uplift {
    featured: Dish[];
    perDishMonthly: { dish: Dish; incrementalGp: number; ordersPerMonth: number; monthly: number }[];
    weeklyExpected: number;
    monthlyExpected: number;
    monthlyConservative: number;
    annualExpected: number;
    annualConservative: number;
    blendedMarginNow: number;
    blendedMarginModeled: number;
}

export function computeUplift(dishes: Dish[], r: Restaurant, lv: Levers): Uplift {
    const featured = dishes.filter((d) => d.featured);
    const ordersPerWeekPerDish = r.coversPerWeek * lv.attachRate;

    const perDishMonthly = featured.map((dish) => {
        const incrementalGp = Math.max(0, lv.priceLift - lv.produceCostDelta);
        const ordersPerMonth = ordersPerWeekPerDish * WEEKS_PER_MONTH;
        return { dish, incrementalGp, ordersPerMonth, monthly: incrementalGp * ordersPerMonth };
    });

    const monthlyExpected = perDishMonthly.reduce((s, x) => s + x.monthly, 0);
    const monthlyConservative = monthlyExpected * 0.6;

    // blended margin across all dishes (current vs if featured ones lifted)
    const all = dishes.length ? dishes : featured;
    const blendedNow = avg(all.map((d) => dishCurrent(d).marginPct));
    const blendedModeled = avg(all.map((d) => (d.featured ? dishModeled(d, lv).newMarginPct : dishCurrent(d).marginPct)));

    return {
        featured,
        perDishMonthly,
        weeklyExpected: monthlyExpected / WEEKS_PER_MONTH,
        monthlyExpected,
        monthlyConservative,
        annualExpected: monthlyExpected * 12,
        annualConservative: monthlyConservative * 12,
        blendedMarginNow: blendedNow,
        blendedMarginModeled: blendedModeled,
    };
}

function avg(xs: number[]) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }

// ---- Menu parsing (client-side heuristic for the demo — no backend) ----
const PRICE_RE = /\$?\s?(\d{1,3}(?:\.\d{2})?)\s*$/;
const PRODUCE_HINTS = ["tomato", "greens", "salad", "kale", "squash", "beet", "carrot", "corn", "pepper", "mushroom", "herb", "arugula", "spinach", "berry", "apple", "peach", "radish", "fennel", "chard", "pea", "bean", "cucumber", "eggplant", "zucchini", "garden", "seasonal", "vegetable", "roasted", "grilled veg"];

function inferCategory(name: string): DishCategory {
    const n = name.toLowerCase();
    if (/(salad|greens|caesar)/.test(n)) return "salad";
    if (/(soup|starter|appetizer|small|toast|bruschetta|crostini|dip)/.test(n)) return "starter";
    if (/(side|fries|bread)/.test(n)) return "side";
    if (/(special|feature)/.test(n)) return "special";
    return "main";
}

let parseSeed = 0;
/** Parse pasted menu text into dishes. Each non-empty line with a trailing price becomes a dish. */
export function parseMenu(text: string): Dish[] {
    const out: Dish[] = [];
    for (const raw of text.split(/\n+/)) {
        const line = raw.trim();
        if (!line) continue;
        const m = line.match(PRICE_RE);
        if (!m) continue;
        const price = parseFloat(m[1]);
        if (!price || price < 3 || price > 200) continue;
        const name = line.replace(PRICE_RE, "").replace(/[.—\-—·|]+\s*$/, "").trim();
        if (!name || name.length < 2) continue;
        const category = inferCategory(name);
        const produceDriven = PRODUCE_HINTS.some((h) => name.toLowerCase().includes(h)) || category === "salad";
        out.push({
            id: `d_${++parseSeed}_${Math.random().toString(36).slice(2, 6)}`,
            name, price, category,
            produceDriven,
            foodCostPct: FOOD_COST_BENCHMARK[category],
            featured: false,
        });
    }
    // auto-feature the top produce-driven dishes by margin upside
    const candidates = out.filter((d) => d.produceDriven).slice(0, 4);
    candidates.forEach((d) => (d.featured = true));
    return out;
}

// ---- Sample restaurants for the demo "use an example" ----
export interface SampleMenu { restaurant: Restaurant; menu: string; }

export const SAMPLES: SampleMenu[] = [
    {
        restaurant: { name: "Rosewood", cuisine: "New American", location: "Sebastopol, CA", coversPerWeek: 620, distributor: "Sysco" },
        menu: `Heirloom tomato salad, basil, stracciatella  16
Roasted beet & citrus, pistachio  14
Garden greens, sherry vinaigrette  12
Grilled local squash, salsa verde  15
Wood-grilled chicken, seasonal vegetables  29
Pan-roasted halibut, fennel  34
Hand-cut fries  8
Warm chocolate cake  11`,
    },
    {
        restaurant: { name: "Cresta", cuisine: "Italian", location: "Hudson, NY", coversPerWeek: 540, distributor: "US Foods" },
        menu: `Market greens, lemon, parmesan  13
Burrata, grilled peppers, basil  17
Roasted mushroom crostini  14
Tagliatelle, garden tomato sugo  24
Wood-fired margherita, local basil  19
Braised short rib, root vegetables  32
Seasonal vegetable side  9
Olive oil cake  10`,
    },
];
