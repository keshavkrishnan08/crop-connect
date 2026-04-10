"use client";

import ShippingTimeline from '@/components/ShippingTimeline';
import OrderUpdatesFeed from '@/components/OrderUpdatesFeed';
import AddOrderUpdateForm from '@/components/AddOrderUpdateForm';
import ReportButton from '@/components/ReportButton';
import CropScoreBadge from '@/components/CropScoreBadge';
import { useOrderUpdates } from '@/hooks/useOrderUpdates';
import type { Order } from '@/hooks/useOrders';

interface OrderDetailModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    isFarmer?: boolean;
    counterpartyCropScore?: number | null;
    counterpartyCropScoreTier?: string | null;
}

export default function OrderDetailModal({ order, isOpen, onClose, isFarmer = false, counterpartyCropScore, counterpartyCropScoreTier }: OrderDetailModalProps) {
    const { updates, loading: updatesLoading, addUpdate } = useOrderUpdates(isOpen ? order.id : null);

    if (!isOpen) return null;

    const counterparty = isFarmer ? order.buyer : order.farmer;
    const counterpartyName = isFarmer
        ? (order.buyer?.company_name || order.buyer?.full_name || 'Buyer')
        : (order.farmer?.farm_name || order.farmer?.full_name || 'Farmer');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white/95 dark:bg-modal-dark/95 backdrop-blur-2xl rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/[0.06] overflow-hidden animate-fade-in max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-[#131613] dark:text-white">
                                {order.listing?.crop_name || 'Order Details'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {isFarmer ? 'To' : 'From'}: {counterpartyName}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ReportButton reportType="order" targetId={order.id} />
                            <button
                            onClick={onClose}
                            className="size-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-500">close</span>
                        </button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                    {/* Order Summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Quantity</p>
                            <p className="text-lg font-bold text-[#131613] dark:text-white">{order.quantity} {order.listing?.unit || 'units'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Total</p>
                            <p className="text-lg font-bold text-primary">${order.total_price.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Tracking Info */}
                    {order.tracking_number && (
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-purple-600 !text-[18px]">package_2</span>
                                <span className="font-bold text-sm text-purple-700 dark:text-purple-300">Tracking Information</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Carrier</p>
                                    <p className="font-semibold text-[#131613] dark:text-white">{order.carrier}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Tracking #</p>
                                    <p className="font-mono font-semibold text-[#131613] dark:text-white">{order.tracking_number}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Timeline */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined !text-[18px]">timeline</span>
                            Order Timeline
                        </h3>
                        <ShippingTimeline
                            escrowStatus={order.escrow_status}
                            orderStatus={order.status}
                            createdAt={order.created_at}
                            farmerShippedAt={order.farmer_shipped_at}
                            buyerConfirmedAt={order.buyer_confirmed_at}
                            fundsReleasedAt={order.funds_released_at}
                            autoReleaseAt={order.auto_release_at}
                            disputeCreatedAt={order.dispute_created_at}
                            trackingNumber={order.tracking_number}
                            carrier={order.carrier}
                            disputeReason={order.dispute_reason}
                            estimatedDeliveryDate={order.estimated_delivery_date}
                            isFarmer={isFarmer}
                        />
                    </div>

                    {/* Counterparty Details */}
                    {counterparty && (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{isFarmer ? 'Buyer Details' : 'Farm Details'}</h4>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                                    {counterparty.profile_picture ? (
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${counterparty.profile_picture}")` }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-400 !text-[20px]">person</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm text-[#131613] dark:text-white truncate">{counterpartyName}</p>
                                        {(counterpartyCropScore !== null && counterpartyCropScore !== undefined) && (
                                            <CropScoreBadge score={counterpartyCropScore} tier={counterpartyCropScoreTier} variant="compact" />
                                        )}
                                    </div>
                                    {counterparty.location && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined !text-[12px]">location_on</span>
                                            {counterparty.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Updates Feed */}
                    {(updates.length > 0 || updatesLoading) && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined !text-[18px]">update</span>
                                Status Updates
                            </h3>
                            <OrderUpdatesFeed updates={updates} loading={updatesLoading} />
                        </div>
                    )}

                    {/* Add Update Form (farmer only, for active orders) */}
                    {isFarmer && order.escrow_status && ['funds_held', 'shipped_awaiting_confirmation'].includes(order.escrow_status) && (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800">
                            <AddOrderUpdateForm
                                onSubmit={addUpdate}
                                escrowStatus={order.escrow_status}
                            />
                        </div>
                    )}

                    {/* Escrow Details */}
                    {order.platform_fee_amount && isFarmer && (
                        <div className="text-xs text-gray-400 space-y-1">
                            <div className="flex justify-between">
                                <span>Order total</span>
                                <span>${order.total_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform fee (5%)</span>
                                <span>-${order.platform_fee_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-gray-700">
                                <span>Your payout</span>
                                <span>${(order.farmer_payout_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
