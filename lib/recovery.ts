// Profit Recovery — the money the agent finds across invoices, waste, and the menu.
// Shared by the recovery hub and the three detail pages so every number agrees.
import type { Dish, Levers } from "@/lib/margin";

const WEEKS = 4.345;

export interface InvoiceLine { item: string; vendor: string; qty: number; unit: string; billed: number; benchmark: number }
export const INVOICE_LINES: InvoiceLine[] = [
    { item: "Roma tomatoes", vendor: "Sysco", qty: 60, unit: "lb", billed: 1.84, benchmark: 1.52 },
    { item: "Yellow onions", vendor: "Sysco", qty: 50, unit: "lb", billed: 0.71, benchmark: 0.68 },
    { item: "Chicken breast", vendor: "US Foods", qty: 80, unit: "lb", billed: 3.49, benchmark: 2.95 },
    { item: "Olive oil", vendor: "Sysco", qty: 6, unit: "gal", billed: 38.0, benchmark: 37.5 },
    { item: "Mixed greens", vendor: "US Foods", qty: 24, unit: "case", billed: 26.4, benchmark: 22.0 },
    { item: "Heavy cream", vendor: "Sysco", qty: 12, unit: "qt", billed: 4.1, benchmark: 4.05 },
    { item: "Russet potatoes", vendor: "Sysco", qty: 100, unit: "lb", billed: 0.82, benchmark: 0.79 },
    { item: "Lemons", vendor: "US Foods", qty: 18, unit: "case", billed: 41.0, benchmark: 34.0 },
];
export const isOvercharged = (l: InvoiceLine) => l.billed - l.benchmark > l.benchmark * 0.05;

export interface ParItem { name: string; unit: string; ordered: number; used: number; suggested: number; cost: number; trend: string }
export const PAR_ITEMS: ParItem[] = [
    { name: "Heirloom tomatoes", unit: "lb", ordered: 50, used: 41, suggested: 44, cost: 4.5, trend: "steady" },
    { name: "Salad greens", unit: "lb", ordered: 40, used: 30, suggested: 33, cost: 6.0, trend: "up next week" },
    { name: "Summer squash", unit: "lb", ordered: 35, used: 22, suggested: 26, cost: 3.0, trend: "down" },
    { name: "Specialty mushrooms", unit: "lb", ordered: 18, used: 17, suggested: 18, cost: 9.0, trend: "steady" },
    { name: "Beets", unit: "lb", ordered: 30, used: 19, suggested: 22, cost: 3.0, trend: "down" },
    { name: "Peaches", unit: "case", ordered: 12, used: 8, suggested: 9, cost: 28, trend: "weekend spike" },
];

/** $/mo of invoice overcharges caught. */
export function invoiceFound(): number {
    return Math.round(INVOICE_LINES.filter(isOvercharged).reduce((s, l) => s + (l.billed - l.benchmark) * l.qty, 0) * WEEKS);
}
/** $/mo of waste removed by following suggested pars (60% of current waste). */
export function wasteFound(): number {
    const weekly = PAR_ITEMS.reduce((s, it) => s + Math.max(0, it.ordered - it.used) * it.cost, 0);
    return Math.round(weekly * WEEKS * 0.6);
}
/** $/mo recovered by repricing the worst-margin local dishes. */
export function menuFound(dishes: Dish[], covers: number, lv: Levers): number {
    const ordersPerDishMonth = covers * lv.attachRate * WEEKS;
    const fixable = Math.min(2, Math.max(1, dishes.filter((d) => d.produceDriven).length));
    return Math.round(ordersPerDishMonth * 1.25 * fixable * 0.5);
}

export function recoverySummary(dishes: Dish[], covers: number, lv: Levers) {
    const invoice = invoiceFound();
    const waste = wasteFound();
    const menu = menuFound(dishes, covers, lv);
    return { invoice, waste, menu, total: invoice + waste + menu };
}
