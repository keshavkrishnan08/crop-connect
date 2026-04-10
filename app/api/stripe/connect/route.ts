import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
    try {
        // Authenticate — user can only create their own Stripe Connect account
        const auth = await requireAuth(req);
        if (auth.error) return auth.error;
        const userId = auth.user.id;

        // Check if farmer already has a Stripe account
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_account_id, stripe_onboarding_complete, full_name, email')
            .eq('id', userId)
            .single();

        if (profileError) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        let accountId = profile.stripe_account_id;

        if (!accountId) {
            // Create a new Stripe Connect Express account
            const account = await stripe.accounts.create({
                type: 'express',
                metadata: { supabase_user_id: userId },
                ...(profile.email ? { email: profile.email } : {}),
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            // Store the account ID
            await supabaseAdmin
                .from('profiles')
                .update({ stripe_account_id: accountId })
                .eq('id', userId);
        }

        // Create an account link for onboarding
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!appUrl) {
            return NextResponse.json(
                { error: 'Server misconfigured — NEXT_PUBLIC_APP_URL not set' },
                { status: 500 }
            );
        }
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${appUrl}/dashboard/farmer/settings?stripe=refresh`,
            return_url: `${appUrl}/dashboard/farmer/settings?stripe=complete`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Stripe Connect error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
