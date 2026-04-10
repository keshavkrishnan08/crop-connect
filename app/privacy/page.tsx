import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | CropConnect",
    description: "How CropConnect collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0D130E] font-display">
            <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-[#0D130E]/70 backdrop-blur-3xl border-b border-gray-100 dark:border-white/5 h-20 flex items-center px-6 md:px-10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft group-hover:rotate-6 transition-all duration-500">
                        <span className="material-symbols-outlined !text-[24px] font-black">spa</span>
                    </div>
                    <h2 className="text-[#131613] dark:text-white text-xl font-black tracking-tighter">CropConnect</h2>
                </Link>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
                <h1 className="text-4xl font-black text-[#131613] dark:text-white tracking-tight mb-2">Privacy Policy</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-12">Last updated: April 7, 2026</p>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white mt-0">1. What We Collect</h2>
                        <p>When you use CropConnect, we collect the following:</p>
                        <p><strong>Information you provide:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Account details: name, email, password, role (farmer/buyer)</li>
                            <li>Profile info: farm name, location, crops, bio, profile photo</li>
                            <li>Transaction data: orders, payment amounts, shipping details</li>
                            <li>Communications: messages sent through the Platform</li>
                            <li>Reviews and ratings you leave for other users</li>
                        </ul>
                        <p><strong>Information collected automatically:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Device and browser information</li>
                            <li>IP address and approximate location</li>
                            <li>Pages visited and actions taken on the Platform</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">2. How We Use Your Data</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Process transactions and facilitate the escrow payment flow</li>
                            <li>Verify your identity and prevent fraud</li>
                            <li>Calculate and display your CropScore reputation</li>
                            <li>Send order updates, shipping notifications, and account alerts</li>
                            <li>Improve the Platform, fix bugs, and develop new features</li>
                            <li>Enforce our Terms of Service and resolve disputes</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">3. Payment Data &amp; Stripe</h2>
                        <p>We use <strong>Stripe</strong> to process payments. When you pay for an order or set up payouts as a Farmer:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Your card details are sent directly to Stripe &mdash; we never see or store your full card number.</li>
                            <li>Stripe processes and stores your payment information under their <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Privacy Policy</a>.</li>
                            <li>We store transaction metadata: amounts, order IDs, payment status, and Stripe reference IDs.</li>
                            <li>Farmers using Stripe Connect share business verification data directly with Stripe.</li>
                        </ul>
                        <p>Stripe is PCI DSS Level 1 certified &mdash; the highest level of payment security certification.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">4. Data Storage</h2>
                        <p>Your data is stored in <strong>Supabase</strong> (PostgreSQL) with row-level security policies that ensure users can only access their own data. Uploaded images are stored in Supabase Storage with access controls.</p>
                        <p>We use industry-standard encryption for data in transit (TLS) and at rest. Passwords are hashed and never stored in plain text.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">5. What We Share</h2>
                        <p>We don&apos;t sell your personal data. We share information only in these cases:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>With other users:</strong> Your public profile (name, location, bio, CropScore, listings) is visible to other users. Email and phone are never shared publicly.</li>
                            <li><strong>With Stripe:</strong> Transaction and identity data needed to process payments.</li>
                            <li><strong>For legal compliance:</strong> When required by law, court order, or to protect our rights.</li>
                            <li><strong>With service providers:</strong> Hosting, analytics, and error monitoring services that help us run the Platform, under strict data processing agreements.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Access</strong> the personal data we hold about you</li>
                            <li><strong>Correct</strong> inaccurate or incomplete data via your profile settings</li>
                            <li><strong>Delete</strong> your account and associated data (email us)</li>
                            <li><strong>Export</strong> your data in a portable format</li>
                            <li><strong>Opt out</strong> of marketing communications</li>
                        </ul>
                        <p>California residents have additional rights under the CCPA. EU residents have additional rights under the GDPR. Contact us to exercise these rights.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">7. Cookies</h2>
                        <p>We use essential cookies for authentication and session management. We don&apos;t use third-party advertising cookies. Analytics cookies are used to understand how the Platform is used and improve the experience.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">8. Data Retention</h2>
                        <p>We keep your data as long as your account is active. Transaction records are retained for 7 years for tax and legal compliance. If you delete your account, we remove personal data within 30 days, except where retention is required by law.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">9. Children</h2>
                        <p>CropConnect is not intended for anyone under 18. We don&apos;t knowingly collect data from minors. If we learn we&apos;ve collected data from someone under 18, we&apos;ll delete it promptly.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">10. Changes</h2>
                        <p>We may update this policy as the Platform evolves. Material changes will be communicated via email or a prominent notice on the Platform. Your continued use after changes constitutes acceptance.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">11. Contact</h2>
                        <p>Privacy questions or data requests? Email us at <a href="mailto:privacy@cropconnect.com" className="text-primary underline">privacy@cropconnect.com</a>.</p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-sm text-gray-400">
                    <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    <Link href="/" className="hover:text-primary transition-colors">Back to CropConnect</Link>
                </div>
            </main>
        </div>
    );
}
