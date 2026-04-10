import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        // Authenticate — user can only check their own Stripe status
        const auth = await requireAuth(req);
        if (auth.error) return auth.error;
        const userId = auth.user.id;

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_account_id, stripe_onboarding_complete')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        if (!profile.stripe_account_id) {
            return NextResponse.json({
                connected: false,
                payoutsEnabled: false,
                chargesEnabled: false,
            });
        }

        // Check the account status on Stripe
        const account = await stripe.accounts.retrieve(profile.stripe_account_id);

        const connected = !!account.details_submitted;
        const payoutsEnabled = !!account.payouts_enabled;
        const chargesEnabled = !!account.charges_enabled;

        // Update onboarding status if newly completed
        if (connected && !profile.stripe_onboarding_complete) {
            await supabaseAdmin
                .from('profiles')
                .update({ stripe_onboarding_complete: true })
                .eq('id', userId);
        }

        return NextResponse.json({
            connected,
            payoutsEnabled,
            chargesEnabled,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Stripe Connect status error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
