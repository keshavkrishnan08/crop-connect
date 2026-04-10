/** Platform fee percentage (5%) */
export const PLATFORM_FEE_PERCENT = 5;

/**
 * Escrow state machine for order lifecycle.
 *
 * Flow:
 *   awaiting_payment → funds_held → shipped_awaiting_confirmation → funds_released
 *                    ↘ payment_failed
 *                    ↘ refunded
 *   funds_held → disputed → refunded | funds_released
 *   shipped_awaiting_confirmation → disputed → refunded | funds_released
 */

export type EscrowStatus =
    | 'none'
    | 'awaiting_payment'
    | 'funds_held'
    | 'shipped_awaiting_confirmation'
    | 'funds_released'
    | 'disputed'
    | 'payment_failed'
    | 'refunded'
    | 'cancelled';

export type OrderStatus =
    | 'pending'
    | 'awaiting_payment'
    | 'funds_held'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'funds_released'
    | 'disputed'
    | 'cancelled'
    | 'payment_failed'
    | 'refunded';

/** Valid escrow transitions */
const ESCROW_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
    none: ['awaiting_payment'],
    awaiting_payment: ['funds_held', 'payment_failed', 'cancelled'],
    funds_held: ['shipped_awaiting_confirmation', 'disputed', 'refunded', 'cancelled'],
    shipped_awaiting_confirmation: ['funds_released', 'disputed'],
    funds_released: [],
    disputed: ['refunded', 'funds_released'],
    payment_failed: ['awaiting_payment', 'cancelled'],
    refunded: [],
    cancelled: [],
};

/** Valid order status transitions */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['awaiting_payment', 'cancelled'],
    awaiting_payment: ['funds_held', 'payment_failed', 'cancelled'],
    funds_held: ['shipped', 'disputed', 'refunded', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'funds_released', 'disputed'],
    delivered: ['funds_released'],
    funds_released: [],
    disputed: ['refunded', 'funds_released'],
    cancelled: [],
    payment_failed: ['awaiting_payment', 'cancelled'],
    refunded: [],
};

/** Check if an escrow transition is valid */
export function canTransitionEscrow(from: EscrowStatus, to: EscrowStatus): boolean {
    return ESCROW_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Check if an order status transition is valid */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
    return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Human-readable labels for escrow statuses */
export const ESCROW_LABELS: Record<EscrowStatus, string> = {
    none: 'No Escrow',
    awaiting_payment: 'Awaiting Payment',
    funds_held: 'Funds Held in Escrow',
    shipped_awaiting_confirmation: 'Shipped — Awaiting Confirmation',
    funds_released: 'Funds Released',
    disputed: 'Disputed',
    payment_failed: 'Payment Failed',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
};

/** Human-readable labels for order statuses */
export const ORDER_LABELS: Record<OrderStatus, string> = {
    pending: 'Pending',
    awaiting_payment: 'Awaiting Payment',
    funds_held: 'Payment Secured',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    funds_released: 'Completed',
    disputed: 'Disputed',
    cancelled: 'Cancelled',
    payment_failed: 'Payment Failed',
    refunded: 'Refunded',
};

/** Colors for escrow status badges (Tailwind classes) */
export const ESCROW_COLORS: Record<EscrowStatus, string> = {
    none: 'bg-gray-100 text-gray-700',
    awaiting_payment: 'bg-yellow-100 text-yellow-800',
    funds_held: 'bg-blue-100 text-blue-800',
    shipped_awaiting_confirmation: 'bg-purple-100 text-purple-800',
    funds_released: 'bg-green-100 text-green-800',
    disputed: 'bg-red-100 text-red-800',
    payment_failed: 'bg-red-100 text-red-700',
    refunded: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-gray-100 text-gray-600',
};
