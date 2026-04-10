import Link from "next/link";

export const metadata = {
    title: "Terms of Service | CropConnect",
    description: "CropConnect marketplace terms of service, escrow payment terms, and user agreements.",
};

export default function TermsOfServicePage() {
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
                <h1 className="text-4xl font-black text-[#131613] dark:text-white tracking-tight mb-2">Terms of Service</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-12">Last updated: April 7, 2026</p>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white mt-0">1. Agreement to Terms</h2>
                        <p>By creating an account or using CropConnect (&quot;the Platform&quot;), you agree to these Terms of Service. If you don&apos;t agree, don&apos;t use the Platform. We may update these terms from time to time &mdash; continued use after changes means you accept them.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">2. What CropConnect Is</h2>
                        <p>CropConnect is an online marketplace that connects agricultural producers (&quot;Farmers&quot;) with buyers (&quot;Buyers&quot;). We facilitate transactions between Farmers and Buyers but are not a party to the sale itself. Think of us as the infrastructure &mdash; not the vendor.</p>
                        <p>We provide:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Listing and discovery of agricultural products</li>
                            <li>Secure escrow payment processing via Stripe</li>
                            <li>Messaging between transaction participants</li>
                            <li>Reputation scoring (CropScore) and reviews</li>
                            <li>Order tracking and dispute resolution tools</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">3. Accounts &amp; Eligibility</h2>
                        <p>You must be at least 18 years old and legally able to form contracts. One account per person. You&apos;re responsible for everything that happens under your account.</p>
                        <p>You agree to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide accurate, current information during registration</li>
                            <li>Verify your email address before conducting transactions</li>
                            <li>Keep your login credentials secure and confidential</li>
                            <li>Notify us immediately of any unauthorized account access</li>
                        </ul>
                        <p>We reserve the right to suspend or terminate accounts that violate these terms, post fraudulent listings, or engage in abusive behavior.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">4. Escrow Payments &amp; Stripe</h2>
                        <p>All payments on CropConnect are processed through <strong>Stripe</strong>. By using our payment features, you also agree to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe&apos;s Terms of Service</a> and <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe&apos;s Privacy Policy</a>.</p>
                        <p><strong>How escrow works:</strong></p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li><strong>Buyer pays.</strong> Funds are held securely by Stripe &mdash; not released to the Farmer.</li>
                            <li><strong>Farmer ships.</strong> The Farmer provides tracking information and marks the order as shipped.</li>
                            <li><strong>Buyer confirms.</strong> Once the Buyer receives the goods and confirms delivery, funds are released to the Farmer minus a 5% platform fee.</li>
                            <li><strong>Auto-release.</strong> If the Buyer doesn&apos;t confirm or dispute within 7 days of shipment, funds are automatically released to the Farmer.</li>
                        </ol>

                        <p><strong>Timeouts &amp; cancellations:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Orders not paid within <strong>24 hours</strong> are automatically cancelled.</li>
                            <li>Orders not shipped within <strong>3 days</strong> of payment are cancelled and the Buyer is refunded.</li>
                            <li>Disputes not resolved within <strong>14 days</strong> result in an automatic refund to the Buyer.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">5. Platform Fee</h2>
                        <p>CropConnect charges a <strong>5% platform fee</strong> on completed transactions. This fee is deducted from the Farmer&apos;s payout when funds are released. There are no listing fees, subscription fees, or hidden charges.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">6. Farmer Responsibilities</h2>
                        <p>If you&apos;re a Farmer on CropConnect, you agree to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>List only products you actually have available and can deliver</li>
                            <li>Provide accurate descriptions, quantities, and pricing</li>
                            <li>Ship orders within <strong>3 days</strong> of receiving payment</li>
                            <li>Provide valid tracking information</li>
                            <li>Complete Stripe Connect onboarding to receive payouts</li>
                            <li>Comply with all applicable food safety and agricultural regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">7. Buyer Responsibilities</h2>
                        <p>If you&apos;re a Buyer on CropConnect, you agree to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Pay for orders promptly after committing to purchase</li>
                            <li>Confirm delivery or file a dispute within <strong>7 days</strong> of shipment</li>
                            <li>Not file false disputes or fraudulent refund claims</li>
                            <li>Leave honest, fair reviews</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">8. Disputes &amp; Refunds</h2>
                        <p>If something goes wrong with an order, Buyers can file a dispute. Here&apos;s how it works:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Disputes can be filed while funds are held or after shipment.</li>
                            <li>Filing a dispute pauses the auto-release countdown.</li>
                            <li>Our team reviews disputes and may refund the Buyer or release funds to the Farmer.</li>
                            <li>Unresolved disputes are automatically refunded after <strong>14 days</strong>.</li>
                            <li>We make final decisions on disputes at our discretion.</li>
                        </ul>
                        <p>Refunds are processed back to the original payment method via Stripe. Processing times depend on your bank or card issuer.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">9. Prohibited Conduct</h2>
                        <p>You may not:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Post fake, misleading, or fraudulent listings</li>
                            <li>Create multiple accounts to manipulate reviews or CropScore</li>
                            <li>Harass, threaten, or abuse other users</li>
                            <li>Circumvent the escrow system or arrange off-platform payments</li>
                            <li>Upload malicious files or spam content</li>
                            <li>Scrape or data-mine the Platform</li>
                            <li>Impersonate another person, farm, or business</li>
                            <li>Use the Platform for any illegal purpose</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">10. CropScore &amp; Reviews</h2>
                        <p>CropScore is our proprietary reputation system. It&apos;s calculated from transaction history, response times, review ratings, and other behavioral signals. You cannot buy, transfer, or manipulate your CropScore. We reserve the right to reset scores if we detect fraud.</p>
                        <p>Reviews must be honest and relate to actual transactions. We may remove reviews that are abusive, fraudulent, or violate these terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">11. Intellectual Property</h2>
                        <p>CropConnect&apos;s brand, design, code, and CropScore algorithm are our property. Your content (listings, photos, reviews) remains yours, but you grant us a license to display it on the Platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">12. Limitation of Liability</h2>
                        <p>CropConnect is a marketplace facilitator. We are <strong>not</strong> responsible for:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>The quality, safety, or legality of products listed</li>
                            <li>The ability of Farmers to deliver or Buyers to pay</li>
                            <li>Any loss or damage arising from transactions between users</li>
                            <li>Service interruptions, data loss, or technical failures</li>
                        </ul>
                        <p>To the maximum extent permitted by law, CropConnect&apos;s total liability to you for any claim arising from your use of the Platform shall not exceed the amount of platform fees you paid to us in the 12 months preceding the claim.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">13. Indemnification</h2>
                        <p>You agree to indemnify and hold harmless CropConnect, its officers, employees, and affiliates from any claims, losses, or damages arising from your use of the Platform, your violation of these terms, or your violation of any rights of another party.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">14. Governing Law</h2>
                        <p>These terms are governed by the laws of the State of Delaware, United States. Any disputes arising from these terms will be resolved through binding arbitration, except where prohibited by law.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">15. Contact</h2>
                        <p>Questions about these terms? Reach us at <a href="mailto:legal@cropconnect.com" className="text-primary underline">legal@cropconnect.com</a>.</p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-sm text-gray-400">
                    <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    <Link href="/" className="hover:text-primary transition-colors">Back to CropConnect</Link>
                </div>
            </main>
        </div>
    );
}
