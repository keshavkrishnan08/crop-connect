"use client";

import { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export default function StripePaymentForm({ amount, onSuccess, onError }: StripePaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/buyer`,
            },
            redirect: 'if_required',
        });

        if (error) {
            if (error.type === 'card_error' || error.type === 'validation_error') {
                setMessage(error.message || 'Payment failed');
                onError(error.message || 'Payment failed');
            } else {
                setMessage('An unexpected error occurred.');
                onError('An unexpected error occurred');
            }
            setIsProcessing(false);
        } else {
            // Payment succeeded without redirect
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">Secure Escrow Payment</span>
                </div>
                <p className="text-xs text-green-700">
                    Your payment of <strong>${amount.toFixed(2)}</strong> will be held securely in escrow until you confirm delivery.
                </p>
            </div>

            <PaymentElement
                options={{
                    layout: 'tabs',
                }}
            />

            {message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Pay ${amount.toFixed(2)} Securely
                    </>
                )}
            </button>

            <p className="text-center text-xs text-gray-500">
                Powered by Stripe. Your payment details are encrypted and secure.
            </p>
        </form>
    );
}
