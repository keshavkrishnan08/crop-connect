"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════ */

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.unobserve(el); } }, { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }); o.observe(el); return () => o.disconnect(); }, []);
    return <div ref={ref} className={`transition-all duration-[900ms] ease-out ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
    const [c, setC] = useState(0); const ref = useRef<HTMLSpanElement>(null); const s = useRef(false);
    useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting && !s.current) { s.current = true; const d = 2200, t0 = performance.now(); const step = (now: number) => { const p = Math.min((now - t0) / d, 1); setC(Math.floor((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); } }, { threshold: 0.5 }); o.observe(el); return () => o.disconnect(); }, [end]);
    return <span ref={ref}>{prefix}{c.toLocaleString()}{suffix}</span>;
}

function ProgressBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
    const [v, setV] = useState(false); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.unobserve(el); } }, { threshold: 0.5 }); o.observe(el); return () => o.disconnect(); }, []);
    return <div ref={ref} className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color} transition-all duration-[1.5s] ease-out`} style={{ width: v ? `${value}%` : "0%", transitionDelay: `${delay}ms` }} /></div>;
}

/* ═══════════════════════════════════════════════════════
   CUSTOM FEATURE VISUALS — no icons, full components
   ═══════════════════════════════════════════════════════ */

function MarketplaceVisual() {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="relative flex items-stretch justify-between gap-4">
                {/* Farmers */}
                <div className="flex-1 space-y-2.5">
                    {["Organic Wheat", "Heirloom Tomatoes", "Raw Honey"].map((crop, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-white dark:bg-white/[0.04] rounded-xl px-3 py-2.5 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="size-2.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-[11px] font-bold text-[#131613] dark:text-gray-200 truncate">{crop}</span>
                        </div>
                    ))}
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary text-center mt-3">Farmers</div>
                </div>

                {/* Center hub */}
                <div className="flex flex-col items-center justify-center px-2">
                    <svg viewBox="0 0 60 120" className="w-10 h-24 text-gray-200 dark:text-white/10">
                        {[20, 40, 60, 80, 100].map((_, i) => <React.Fragment key={i}><line x1="0" y1={15 + i * 20} x2="25" y2={60} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" /><line x1="35" y1={60} x2="60" y2={15 + i * 20} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" /></React.Fragment>)}
                    </svg>
                    <div className="bg-primary text-white text-[8px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap shadow-glow">5% fee</div>
                </div>

                {/* Buyers */}
                <div className="flex-1 space-y-2.5">
                    {["Farm & Table Co.", "Portland Bakery", "FreshMart"].map((buyer, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-white dark:bg-white/[0.04] rounded-xl px-3 py-2.5 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="size-2.5 rounded-full bg-accent flex-shrink-0" />
                            <span className="text-[11px] font-bold text-[#131613] dark:text-gray-200 truncate">{buyer}</span>
                        </div>
                    ))}
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-accent text-center mt-3">Buyers</div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-6 text-[10px] font-bold">
                    <span className="text-primary">You keep <span className="text-lg font-black">95%</span></span>
                    <span className="text-gray-300 dark:text-gray-600">vs</span>
                    <span className="text-gray-400 line-through">Traditional: 60%</span>
                </div>
            </div>
        </div>
    );
}

function EscrowVisual() {
    const [vis, setVis] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.unobserve(el); } }, { threshold: 0.3 }); o.observe(el); return () => o.disconnect(); }, []);

    const steps = [
        { label: "Buyer Pays", detail: "$2,400.00", symbol: "$", done: true },
        { label: "Funds Held", detail: "In escrow", symbol: "\u{1F512}", done: true },
        { label: "Farmer Ships", detail: "Tracking active", symbol: "\u{1F69A}", done: true },
        { label: "Buyer Confirms", detail: "Quality verified", symbol: "\u{2713}", done: false },
    ];

    return (
        <div ref={ref} className="w-full max-w-md mx-auto">
            <div className="flex items-start justify-between relative">
                {/* Progress line behind steps */}
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-100 dark:bg-white/10 rounded-full">
                    <div className={`h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-[2s] ease-out ${vis ? "w-[75%]" : "w-0"}`} />
                </div>

                {steps.map((s, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center text-center w-1/4">
                        <div className={`size-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${vis && (i < 3) ? "bg-primary text-white shadow-glow scale-100" : vis && i === 3 ? "bg-blue-500/10 text-blue-500 border-2 border-blue-500/30 scale-100" : "bg-gray-100 dark:bg-white/5 text-gray-400 scale-90"}`} style={{ transitionDelay: `${i * 300}ms` }}>
                            {s.symbol}
                        </div>
                        <div className="mt-3 space-y-0.5">
                            <div className="text-[10px] font-black text-[#131613] dark:text-white">{s.label}</div>
                            <div className="text-[9px] font-medium text-gray-400">{s.detail}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-500/10">
                <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-black">7d</div>
                <div className="text-[11px]"><span className="font-bold text-[#131613] dark:text-white">Auto-release in 7 days</span><span className="text-gray-400"> if buyer doesn&apos;t respond</span></div>
            </div>
        </div>
    );
}

function CropScoreVisual() {
    const [vis, setVis] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const c = 2 * Math.PI * 52;
    useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.unobserve(el); } }, { threshold: 0.3 }); o.observe(el); return () => o.disconnect(); }, []);

    const factors = [
        { label: "Delivery Reliability", value: 96, color: "bg-primary" },
        { label: "Produce Quality", value: 94, color: "bg-emerald-500" },
        { label: "Response Time", value: 88, color: "bg-blue-500" },
        { label: "Transaction History", value: 91, color: "bg-amber-500" },
    ];

    return (
        <div ref={ref} className="w-full max-w-sm mx-auto flex flex-col items-center gap-8">
            <div className="relative">
                <svg viewBox="0 0 120 120" className="w-36 h-36">
                    <defs><linearGradient id="csg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2E7D32" /><stop offset="100%" stopColor="#66BB6A" /></linearGradient></defs>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-white/10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#csg)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={vis ? c - (92 / 100) * c : c} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                    <text x="60" y="55" textAnchor="middle" className="fill-[#131613] dark:fill-white" fontSize="30" fontWeight="900">{vis ? 92 : 0}</text>
                    <text x="60" y="73" textAnchor="middle" className="fill-gray-400" fontSize="7.5" fontWeight="700" letterSpacing="0.15em">CROPSCORE</text>
                </svg>
            </div>

            <div className="w-full space-y-3.5">
                {factors.map((f, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-[#131613] dark:text-gray-200">{f.label}</span>
                            <span className="font-black text-[#131613] dark:text-white">{vis ? f.value : 0}%</span>
                        </div>
                        <ProgressBar value={f.value} color={f.color} delay={i * 200} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function RequestsVisual() {
    return (
        <div className="w-full max-w-sm mx-auto space-y-3">
            {/* Request card */}
            <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 dark:from-purple-500/10 dark:to-purple-500/5 border border-purple-500/15 rounded-2xl p-5 space-y-3">
                <div className="inline-block bg-purple-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md">Open Request</div>
                <h4 className="text-[#131613] dark:text-white text-sm font-black">500 lbs Organic Winter Wheat</h4>
                <div className="flex gap-4 text-[10px] font-bold text-gray-500">
                    <span>Budget: <span className="text-[#131613] dark:text-white">$3.20/lb</span></span>
                    <span>By: <span className="text-[#131613] dark:text-white">Mar 15</span></span>
                </div>
                <div className="text-[10px] font-bold text-purple-500">3 farmer responses</div>
            </div>

            {/* Responses */}
            {[
                { farm: "Jenkins Farm", score: 94, price: "$2.85/lb", date: "Mar 12", best: true },
                { farm: "Green Valley", score: 88, price: "$3.00/lb", date: "Mar 14", best: false },
                { farm: "Sunrise Acres", score: 82, price: "$3.15/lb", date: "Mar 13", best: false },
            ].map((r, i) => (
                <div key={i} className={`rounded-xl px-4 py-3 flex items-center justify-between border ${r.best ? "bg-primary/5 border-primary/20 dark:bg-primary/10" : "bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5"}`}>
                    <div>
                        <div className="text-[11px] font-black text-[#131613] dark:text-white flex items-center gap-2">
                            {r.farm}
                            {r.best && <span className="text-[7px] bg-primary text-white px-1.5 py-0.5 rounded font-black uppercase">Best Match</span>}
                        </div>
                        <div className="text-[9px] font-bold text-gray-400 mt-0.5">Score: {r.score} &middot; Delivers {r.date}</div>
                    </div>
                    <div className="text-sm font-black text-[#131613] dark:text-white">{r.price}</div>
                </div>
            ))}
        </div>
    );
}

function MessagingVisual() {
    return (
        <div className="w-full max-w-sm mx-auto bg-white dark:bg-[#1a2c15] rounded-2xl border border-gray-100 dark:border-white/5 shadow-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/5">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">SJ</div>
                <div><div className="text-xs font-black text-[#131613] dark:text-white">Sarah Jenkins</div><div className="text-[9px] font-bold text-primary">Organic Farmer &middot; Score 94</div></div>
                <div className="ml-auto size-2 rounded-full bg-green-400" />
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 min-h-[180px]">
                <div className="flex justify-start"><div className="bg-gray-50 dark:bg-white/5 rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[80%]"><p className="text-[11px] font-medium text-[#131613] dark:text-gray-200">Hi! I have 200lbs of organic wheat available this week. Interested?</p></div></div>
                <div className="flex justify-end"><div className="bg-primary text-white rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[80%]"><p className="text-[11px] font-medium">Definitely. What&apos;s your price per pound?</p></div></div>
                <div className="flex justify-start"><div className="bg-gray-50 dark:bg-white/5 rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[80%]"><p className="text-[11px] font-medium text-[#131613] dark:text-gray-200">$3.10/lb for bulk. I can ship by Thursday with tracking.</p></div></div>
                <div className="flex justify-end"><div className="bg-primary text-white rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[80%]"><p className="text-[11px] font-medium">Deal. Creating the escrow order now.</p></div></div>
            </div>

            {/* Input */}
            <div className="px-4 pb-4"><div className="h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center px-3.5 text-[11px] text-gray-400 font-medium border border-gray-100 dark:border-white/5">Type a message...</div></div>
        </div>
    );
}

function LogisticsVisual() {
    const steps = [
        { label: "Picked Up", detail: "Jenkins Farm, OR", time: "Mar 10, 9:15 AM", done: true },
        { label: "In Transit", detail: "Pacific Ag Freight", time: "Mar 11, 2:30 PM", done: true },
        { label: "Out for Delivery", detail: "Portland Metro", time: "Mar 12, 8:00 AM", active: true },
        { label: "Delivered", detail: "Estimated 2:00 PM", time: "Mar 12", done: false },
    ];
    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="bg-white dark:bg-[#1a2c15] rounded-2xl border border-gray-100 dark:border-white/5 shadow-card p-5">
                <div className="flex justify-between items-center mb-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">CRP-2024-0847</div>
                    <div className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">Live Tracking</div>
                </div>
                <div className="space-y-0">
                    {steps.map((s, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`size-3 rounded-full flex-shrink-0 ${s.done ? "bg-primary" : s.active ? "bg-primary animate-pulse" : "bg-gray-200 dark:bg-white/10"}`} />
                                {i < 3 && <div className={`w-px flex-1 min-h-[40px] ${s.done ? "bg-primary/30" : "bg-gray-200 dark:bg-white/10"}`} />}
                            </div>
                            <div className="pb-5">
                                <div className="text-[11px] font-black text-[#131613] dark:text-white">{s.label}</div>
                                <div className="text-[10px] font-medium text-gray-400 mt-0.5">{s.detail}</div>
                                <div className="text-[9px] font-bold text-gray-300 dark:text-gray-500 mt-0.5">{s.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const overviewItems = [
    { n: "01", title: "Direct Marketplace", desc: "Sell directly to buyers. Keep 95% of every sale.", accent: "bg-primary" },
    { n: "02", title: "Escrow Payments", desc: "Every transaction protected. Funds held until delivery.", accent: "bg-blue-500" },
    { n: "03", title: "CropScore", desc: "Reputation system that builds trust through data.", accent: "bg-amber-500" },
    { n: "04", title: "Produce Requests", desc: "Buyers post needs. Farmers compete to fill them.", accent: "bg-purple-500" },
    { n: "05", title: "Direct Messaging", desc: "Negotiate, share photos, build relationships.", accent: "bg-cyan-500" },
    { n: "06", title: "Smart Logistics", desc: "Integrated shipping, pickups, and live tracking.", accent: "bg-orange-500" },
];

const comparisonRows = [
    { name: "Direct Farmer Connection", cc: true, ws: false, ot: "partial" as const },
    { name: "Escrow Payment Protection", cc: true, ws: false, ot: false },
    { name: "Quality Reputation System", cc: true, ws: false, ot: false },
    { name: "Transparent Pricing", cc: true, ws: false, ot: "partial" as const },
    { name: "Integrated Logistics", cc: true, ws: true, ot: false },
    { name: "Produce Request System", cc: true, ws: false, ot: false },
    { name: "Real-time Messaging", cc: true, ws: false, ot: "partial" as const },
    { name: "Zero Listing Fees", cc: true, ws: false, ot: false },
    { name: "Auto-Release Protection", cc: true, ws: false, ot: false },
    { name: "Mobile-First Platform", cc: true, ws: false, ot: true },
];

const testimonials = [
    { quote: "I keep 35% more per sale now. The escrow system means I never worry about getting paid, and the CropScore has brought me repeat buyers I never would have found.", author: "Sarah Jenkins", role: "Organic Wheat Farmer, Oregon", initials: "SJ" },
    { quote: "The produce request system changed everything. I post what I need, three farmers respond within a day, and I pick the best match. CropScore makes the decision easy.", author: "David Ross", role: "Artisan Baker, Portland", initials: "DR" },
    { quote: "We switched from two wholesalers to CropConnect. Saved 20% on sourcing, produce quality improved, and we can actually track every shipment in real time.", author: "Marcus Thorne", role: "Supply Chain Manager, Seattle", initials: "MT" },
];

const faqs = [
    { q: "What exactly is CropConnect?", a: "CropConnect is a digital marketplace that connects farmers directly with restaurants, grocers, and food businesses. You list crops or post produce requests, negotiate directly, and trade with escrow-protected payments. We handle the payments, quality verification via CropScore, and logistics integration. Think of it as the farmer's marketplace with built-in trust." },
    { q: "How does escrow payment work?", a: "When a buyer places an order, their payment is held securely by CropConnect. The farmer ships with a tracking number. The buyer inspects the delivery and confirms quality. Only then do funds release to the farmer (minus 5% fee). If the buyer doesn't respond within 7 days, funds auto-release to protect the farmer." },
    { q: "What does it cost?", a: "Joining is free for both farmers and buyers. We charge 5% only on completed transactions. That covers escrow protection, payment processing, CropScore, dispute mediation, and platform maintenance. No listing fees. No monthly fees. No hidden charges." },
    { q: "What is CropScore and how is it calculated?", a: "CropScore is a 0-100 reputation rating updated after every transaction. It weights four factors: delivery reliability (30%), produce quality (30%), response time (20%), and transaction history (20%). Scores decay over time so they always reflect recent performance. Higher scores get better visibility in search results." },
    { q: "What happens if there's a problem with my order?", a: "The buyer can file a dispute before funds release. This pauses the auto-release timer and notifies both parties. Our team reviews the evidence — shipping proof, delivery photos, messages — and mediates a resolution. Funds are either released to the farmer or refunded to the buyer." },
    { q: "Can I sell small quantities?", a: "Yes. CropConnect supports everything from 10-pound artisanal batches to 10,000-pound bulk orders. You set your own minimums, pricing tiers, and delivery schedules. Many of our most active sellers started small and scaled as they built their buyer network." },
];

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Home() {
    const [faqOpen, setFaqOpen] = useState<number | null>(null);
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [subscribeError, setSubscribeError] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => { const f = () => setScrolled(window.scrollY > 60); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault(); if (!email) return; setSubscribing(true); setSubscribeError(null);
        try { const { error } = await supabase.from("newsletter_subscriptions").insert({ email: email.trim().toLowerCase() }); if (error) { if (error.code === "23505") setSubscribeError("Already subscribed!"); else throw error; } else { setSubscribed(true); setEmail(""); setTimeout(() => setSubscribed(false), 5000); } } catch { setSubscribeError("Something went wrong."); } finally { setSubscribing(false); }
    };

    const yr = new Date().getFullYear();

    const Cell = ({ v }: { v: boolean | "partial" }) => {
        if (v === true) return <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><svg viewBox="0 0 24 24" className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></div>;
        if (v === "partial") return <div className="size-7 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto"><svg viewBox="0 0 24 24" className="size-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="3"><line x1="6" y1="12" x2="18" y2="12" /></svg></div>;
        return <div className="size-7 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto"><svg viewBox="0 0 24 24" className="size-3.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></div>;
    };

    /* ─── Section header helper ─── */
    const SH = ({ tag, heading, sub, light = false }: { tag: string; heading: React.ReactNode; sub?: string; light?: boolean }) => (
        <div className="flex flex-col items-center text-center space-y-5 mb-14 md:mb-20">
            <span className={`font-black uppercase tracking-[0.35em] text-[10px] ${light ? "text-primary/80" : "text-primary"}`}>{tag}</span>
            <h2 className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter ${light ? "text-white" : "text-[#131613] dark:text-white"}`}>{heading}</h2>
            {sub && <p className={`text-base md:text-lg max-w-2xl font-medium leading-relaxed ${light ? "text-gray-400" : "text-gray-500 dark:text-[#a3b2a4]"}`}>{sub}</p>}
        </div>
    );

    /* ─── Feature section helper ─── */
    const FS = ({ n, tag, tagColor, heading, desc, points, visual, reverse = false }: { n: string; tag: string; tagColor: string; heading: React.ReactNode; desc: string; points: string[]; visual: React.ReactNode; reverse?: boolean }) => (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center ${reverse ? "lg:[direction:rtl]" : ""}`}>
            <Reveal className={reverse ? "lg:[direction:ltr]" : ""}>
                <div className="space-y-8 relative">
                    <div className="absolute -top-8 -left-4 text-[120px] md:text-[160px] font-black text-gray-50 dark:text-white/[0.02] leading-none select-none pointer-events-none">{n}</div>
                    <div className="relative z-10 space-y-5">
                        <div className={`inline-block h-1 w-10 rounded-full ${tagColor}`} />
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{tag}</div>
                        <h3 className="text-[#131613] dark:text-white text-2xl md:text-4xl font-black tracking-tight">{heading}</h3>
                        <p className="text-gray-500 dark:text-[#a3b2a4] text-sm md:text-base font-medium leading-relaxed">{desc}</p>
                    </div>
                    <div className="relative z-10 space-y-3">
                        {points.map((p, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className={`size-1.5 rounded-full ${tagColor} mt-2 flex-shrink-0`} />
                                <p className="text-[#131613] dark:text-gray-200 text-sm font-medium">{p}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Reveal>
            <Reveal delay={200} className={reverse ? "lg:[direction:ltr]" : ""}>{visual}</Reveal>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D130E] font-display selection:bg-primary/20">

            {/* ═══════ HEADER ═══════ */}
            <header className={`fixed top-0 z-[100] w-full transition-all duration-500 ${scrolled ? "bg-white/80 dark:bg-[#0D130E]/80 backdrop-blur-2xl shadow-sm border-b border-gray-100 dark:border-white/5" : "bg-transparent"}`}>
                <div className="section-zoom h-20 md:h-24 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft group-hover:rotate-6 transition-all duration-500">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="size-5"><path d="M12 22v-9" /><path d="M8 3.5C8.5 7 10 10 12 13" /><path d="M16 3.5C15.5 7 14 10 12 13" /><path d="M5.5 8C7.5 9 10 11 12 13" /><path d="M18.5 8C16.5 9 14 11 12 13" /></svg>
                        </div>
                        <h2 className={`text-xl font-black tracking-tighter transition-colors ${scrolled ? "text-[#131613] dark:text-white" : "text-white"}`}>CropConnect</h2>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-10">
                        {[["Overview", "#overview"], ["Features", "#features"], ["Compare", "#compare"], ["FAQ", "#faq"]].map(([l, h]) => (
                            <a key={l} href={h} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary hover:-translate-y-0.5 ${scrolled ? "text-gray-400 dark:text-[#a3b2a4]" : "text-white/60"}`}>{l}</a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4 md:gap-6">
                        <Link className={`hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary ${scrolled ? "text-gray-400" : "text-white/60"}`} href="/auth/login">Login</Link>
                        <Link href="/auth/signup" className="button-base bg-primary text-white shadow-glow hover:bg-primary-dark hover:-translate-y-0.5 text-[10px]">Join Free</Link>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`lg:hidden p-2 ${scrolled ? "text-[#131613] dark:text-white" : "text-white"}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-6">{mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>}</svg>
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0D130E] border-b border-gray-100 dark:border-white/5 shadow-lg animate-fade-in"><nav className="flex flex-col p-6 space-y-4">{["Overview", "Features", "Compare", "FAQ"].map(l => <a key={l} className="text-[#131613] dark:text-white text-sm font-bold py-2 hover:text-primary transition-colors" href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}>{l}</a>)}</nav></div>}
            </header>

            <main className="flex flex-col w-full">

                {/* ═══ 1. PROBLEM ═══ */}
                <section className="relative bg-[#0A0C0A] pt-32 md:pt-40 pb-16 md:pb-24 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <div className="section-zoom relative z-10">
                        <Reveal>
                            <div className="max-w-3xl mx-auto text-center space-y-6 mb-14 md:mb-20">
                                <span className="text-red-400/80 font-black uppercase tracking-[0.35em] text-[10px]">The Problem</span>
                                <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter">Agriculture&apos;s supply chain is <span className="text-red-400 italic">failing everyone</span></h2>
                                <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed">Farmers lose revenue to middlemen. Buyers can&apos;t verify quality. Nobody has payment protection. The system is broken.</p>
                            </div>
                        </Reveal>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                            {[
                                { stat: "40%", title: "Revenue Lost", desc: "Middlemen capture the lion's share between farm and table" },
                                { stat: "$0", title: "Payment Safety", desc: "No escrow, no protection, no recourse when deals go wrong" },
                                { stat: "Zero", title: "Quality Proof", desc: "No standardized system to verify produce before purchase" },
                                { stat: "5+", title: "Vendors to Juggle", desc: "Fragmented logistics across unreliable carriers" },
                            ].map((p, i) => (
                                <Reveal key={i} delay={i * 80}>
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6 space-y-3 hover:bg-white/[0.05] transition-colors">
                                        <div className="text-white text-3xl md:text-4xl font-black tracking-tight">{p.stat}</div>
                                        <h3 className="text-white text-xs font-black uppercase tracking-wider">{p.title}</h3>
                                        <p className="text-gray-600 text-[11px] font-medium leading-relaxed">{p.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 2. HERO ═══ */}
                <section className="relative w-full min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0 scale-105"><video autoPlay loop muted playsInline className="w-full h-full object-cover"><source src="https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-field-of-wheat-4054-large.mp4" type="video/mp4" /></video><div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" /></div>
                    <div className="relative z-20 w-full max-w-[1200px] px-8 text-center py-24">
                        <Reveal><div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10"><span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75" /><span className="relative rounded-full h-2 w-2 bg-primary" /></span>The Solution</div></Reveal>
                        <Reveal delay={100}><h1 className="text-white text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black heading-tight mb-8">The Farm-to-Buyer<br /><span className="text-primary italic">Marketplace</span></h1></Reveal>
                        <Reveal delay={200}><p className="text-gray-300 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto mb-14 leading-relaxed">List your crops. Find verified buyers. Trade with <span className="text-white font-bold">escrow-protected payments</span> and a reputation system that rewards quality. No middlemen. No risk.</p></Reveal>
                        <Reveal delay={300}>
                            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16 md:mb-24">
                                <Link href="/auth/signup" className="button-base bg-primary text-white shadow-glow hover:bg-primary-dark hover:-translate-y-1 group text-xs">Start Selling — It&apos;s Free <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span></Link>
                                <Link href="/discover" className="button-base bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#131613] text-xs">Start Buying</Link>
                            </div>
                        </Reveal>
                        <Reveal delay={500}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-3xl mx-auto">
                                {[{ v: 2400, s: "+", l: "Active Farmers" }, { v: 1200, s: "+", l: "Verified Buyers" }, { v: 12, p: "$", s: "M+", l: "Total Traded" }, { v: 98, s: "%", l: "Satisfaction" }].map((st, i) => (
                                    <div key={i} className={`bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-5 ${i % 2 === 0 ? "animate-float-slow" : "animate-float-slow-delayed"}`}>
                                        <div className="text-white text-2xl md:text-3xl font-black tracking-tight"><Counter end={st.v} prefix={st.p} suffix={st.s} /></div>
                                        <div className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em] mt-1">{st.l}</div>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══ 3. PLATFORM OVERVIEW (broad) ═══ */}
                <section id="overview" className="py-24 md:py-36 bg-[#FDFDFD] dark:bg-[#0D130E]">
                    <div className="section-zoom">
                        <Reveal><SH tag="Platform Overview" heading={<>Six systems, <span className="text-primary italic">one platform</span></>} sub="CropConnect handles every step of agricultural trade — from discovery to delivery. Here's what's inside." /></Reveal>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            {overviewItems.map((item, i) => (
                                <Reveal key={i} delay={i * 60}>
                                    <a href="#features" className="group block bento-card !p-6 md:!p-8 hover:!shadow-glow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`h-1 w-8 rounded-full ${item.accent}`} />
                                            <span className="text-gray-200 dark:text-white/[0.05] text-3xl font-black">{item.n}</span>
                                        </div>
                                        <h3 className="text-[#131613] dark:text-white text-base md:text-lg font-black mb-2">{item.title}</h3>
                                        <p className="text-gray-500 dark:text-[#a3b2a4] text-sm font-medium leading-relaxed">{item.desc}</p>
                                        <div className="mt-4 text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Learn more &darr;</div>
                                    </a>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 4-9. INDIVIDUAL FEATURE DEEP DIVES ═══ */}
                <div id="features">

                    {/* 4. Direct Marketplace */}
                    <section className="py-20 md:py-32 bg-[#F7F9F7] dark:bg-[#111811]">
                        <div className="section-zoom">
                            <FS n="01" tag="Direct Marketplace" tagColor="bg-primary" reverse={false}
                                heading={<>Skip the middlemen.<br /><span className="text-primary italic">Keep your revenue.</span></>}
                                desc="Traditional supply chains take 30-40% of your sale price. CropConnect removes every intermediary. You sell directly to the buyer. They buy directly from you. The only fee: a flat 5% that covers the entire platform."
                                points={["Set your own prices based on real market data", "Full control over who you sell to and when", "Build direct relationships that last season after season"]}
                                visual={<MarketplaceVisual />}
                            />
                        </div>
                    </section>

                    {/* 5. Escrow Payments */}
                    <section className="py-20 md:py-32 bg-[#FDFDFD] dark:bg-[#0D130E]">
                        <div className="section-zoom">
                            <FS n="02" tag="Escrow Payments" tagColor="bg-blue-500" reverse={true}
                                heading={<>Every payment protected.<br /><span className="text-blue-500 italic">Every time.</span></>}
                                desc="When a buyer places an order, payment is held in escrow by CropConnect. The farmer ships. The buyer inspects and confirms. Only then do funds release. If anything goes wrong, our dispute team mediates."
                                points={["Funds held securely until delivery is confirmed by the buyer", "7-day auto-release protects farmers from unresponsive buyers", "One-click dispute filing with photo evidence and team mediation"]}
                                visual={<EscrowVisual />}
                            />
                        </div>
                    </section>

                    {/* 6. CropScore */}
                    <section className="py-20 md:py-32 bg-[#F7F9F7] dark:bg-[#111811]">
                        <div className="section-zoom">
                            <FS n="03" tag="CropScore Reputation" tagColor="bg-amber-500" reverse={false}
                                heading={<>Your reputation,<br /><span className="text-amber-500 italic">quantified.</span></>}
                                desc="CropScore is a proprietary 0-100 rating that tracks delivery reliability, produce quality, response time, and transaction history. It decays over time so it always reflects recent performance. Higher scores mean more visibility and more trust."
                                points={["Updated automatically after every completed transaction", "Weighted factors: delivery 30%, quality 30%, response 20%, history 20%", "Top scorers featured prominently in marketplace search results"]}
                                visual={<CropScoreVisual />}
                            />
                        </div>
                    </section>

                    {/* 7. Produce Requests */}
                    <section className="py-20 md:py-32 bg-[#FDFDFD] dark:bg-[#0D130E]">
                        <div className="section-zoom">
                            <FS n="04" tag="Produce Requests" tagColor="bg-purple-500" reverse={true}
                                heading={<>Post what you need.<br /><span className="text-purple-500 italic">Let farmers compete.</span></>}
                                desc="Buyers post exactly what they're looking for — crop type, quantity, budget, and delivery timeline. Verified farmers respond with their best offers. Compare CropScores, prices, and delivery dates. Pick the best fit."
                                points={["Specify exact quantities, quality standards, and delivery windows", "Receive competitive offers from multiple verified farmers", "Compare responses by price, CropScore, and delivery speed"]}
                                visual={<RequestsVisual />}
                            />
                        </div>
                    </section>

                    {/* 8. Messaging */}
                    <section className="py-20 md:py-32 bg-[#F7F9F7] dark:bg-[#111811]">
                        <div className="section-zoom">
                            <FS n="05" tag="Direct Messaging" tagColor="bg-cyan-500" reverse={false}
                                heading={<>Talk directly.<br /><span className="text-cyan-500 italic">Trade confidently.</span></>}
                                desc="No more phone tag or email chains. Message any farmer or buyer directly through CropConnect. Negotiate terms, share photos of your harvest, discuss delivery logistics — all in one thread tied to your trade history."
                                points={["Instant messaging with full conversation history", "Share images and documents inline", "Every thread connected to your trading relationship"]}
                                visual={<MessagingVisual />}
                            />
                        </div>
                    </section>

                    {/* 9. Smart Logistics */}
                    <section className="py-20 md:py-32 bg-[#FDFDFD] dark:bg-[#0D130E]">
                        <div className="section-zoom">
                            <FS n="06" tag="Smart Logistics" tagColor="bg-orange-500" reverse={true}
                                heading={<>Farm to doorstep.<br /><span className="text-orange-500 italic">Tracked.</span></>}
                                desc="Get integrated shipping quotes from verified agricultural carriers. Schedule pickups directly from your dashboard. Buyers track orders in real-time with automatic status updates at every stage of delivery."
                                points={["Instant quotes from agricultural shipping partners", "One-click pickup scheduling from your farm", "Real-time tracking from pickup through delivery"]}
                                visual={<LogisticsVisual />}
                            />
                        </div>
                    </section>
                </div>

                {/* ═══ 10. WHAT YOU GET ═══ */}
                <section className="py-24 md:py-36 bg-[#F7F9F7] dark:bg-[#111811]">
                    <div className="section-zoom">
                        <Reveal><SH tag="What You Get" heading={<>Everything to succeed — <span className="text-gradient-gold">on both sides</span></>} /></Reveal>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            {[
                                { title: "For Farmers", sub: "Sell direct. Keep more. Grow your business.", color: "from-primary to-green-500", items: ["Digital storefront with full pricing control", "CropScore reputation that builds buyer trust", "Escrow-guaranteed payment on every sale", "Market data to price crops competitively", "Integrated shipping and pickup scheduling", "Direct buyer relationships and messaging"] },
                                { title: "For Buyers", sub: "Source fresh. Verify quality. Pay safely.", color: "from-blue-600 to-cyan-500", items: ["Verified farm-fresh produce with origin tracking", "Produce request system — farmers compete for you", "CropScore ratings to find reliable suppliers", "Escrow protection — pay only for what you receive", "Real-time order tracking from farm to door", "Direct messaging with every farmer"] },
                            ].map((side, si) => (
                                <Reveal key={si} delay={si * 150}>
                                    <div className="bento-card !p-0 overflow-hidden h-full">
                                        <div className={`bg-gradient-to-r ${side.color} px-8 md:px-10 py-6`}>
                                            <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-wider">{side.title}</h3>
                                            <p className="text-white/70 text-sm font-medium mt-1">{side.sub}</p>
                                        </div>
                                        <div className="p-6 md:p-8 space-y-4">
                                            {side.items.map((item, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`size-5 flex-shrink-0 mt-0.5 ${si === 0 ? "text-primary" : "text-blue-500"}`}><polyline points="20 6 9 17 4 12" /></svg>
                                                    <span className="text-sm font-medium text-[#131613] dark:text-gray-200">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 11. COMPARISON ═══ */}
                <section id="compare" className="py-24 md:py-36 bg-[#FDFDFD] dark:bg-[#0D130E]">
                    <div className="section-zoom">
                        <Reveal><SH tag="See The Difference" heading={<>Why farmers <span className="text-primary italic">switch</span> to us</>} /></Reveal>
                        <Reveal delay={200}>
                            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                                <table className="w-full min-w-[600px] border-collapse">
                                    <thead><tr>
                                        <th className="text-left py-5 px-4 md:px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 w-[40%]">Feature</th>
                                        <th className="py-5 px-3 md:px-4 w-[20%]"><div className="bg-primary/10 rounded-2xl py-3 px-2"><div className="text-primary text-[10px] font-black uppercase tracking-wider">CropConnect</div></div></th>
                                        <th className="py-5 px-3 md:px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 w-[20%]">Wholesale<br />Markets</th>
                                        <th className="py-5 px-3 md:px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 w-[20%]">Other<br />Platforms</th>
                                    </tr></thead>
                                    <tbody>{comparisonRows.map((r, i) => (
                                        <tr key={i} className={`border-t border-gray-100 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/[0.02] ${i % 2 === 0 ? "bg-white/30 dark:bg-white/[0.01]" : ""}`}>
                                            <td className="py-4 px-4 md:px-6 text-sm font-bold text-[#131613] dark:text-white">{r.name}</td>
                                            <td className="py-4 px-3 text-center"><Cell v={r.cc} /></td>
                                            <td className="py-4 px-3 text-center"><Cell v={r.ws} /></td>
                                            <td className="py-4 px-3 text-center"><Cell v={r.ot} /></td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </Reveal>
                        <Reveal delay={400}>
                            <div className="mt-10 md:mt-14 bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/10">
                                <div><h4 className="text-[#131613] dark:text-white font-black text-base">10 out of 10 features. No other platform comes close.</h4><p className="text-gray-500 text-sm font-medium mt-1">All included free. You only pay 5% on completed trades.</p></div>
                                <Link href="/auth/signup" className="button-base bg-primary text-white shadow-glow hover:bg-primary-dark hover:-translate-y-0.5 text-[10px] whitespace-nowrap">Get Started Free</Link>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══ 12. CTA BANNER ═══ */}
                <section className="py-24 md:py-36 bg-[#131613] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="section-zoom relative z-10 text-center">
                        <Reveal>
                            <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
                                <div className="size-20 rounded-3xl bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined !text-[40px] text-primary">agriculture</span>
                                </div>
                                <h2 className="text-white text-4xl md:text-5xl font-black tracking-tighter">The future of farm-to-table is <span className="text-primary italic">direct</span>.</h2>
                                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">No middlemen. No markups. Just farmers and buyers trading directly with escrow protection, reputation scoring, and real-time tracking.</p>
                                <Link href="/auth/signup" className="button-base bg-primary text-white shadow-glow hover:bg-primary-dark hover:-translate-y-0.5 text-sm px-8 py-4">Start Trading Free</Link>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══ 13. TESTIMONIALS ═══ */}
                <section className="py-24 md:py-36 bg-[#F7F9F7] dark:bg-[#111811]">
                    <div className="section-zoom">
                        <Reveal><SH tag="Real Results" heading={<>Trusted by <span className="text-gradient-primary">thousands</span></>} /></Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {testimonials.map((t, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div className="bento-card !p-8 md:!p-10 flex flex-col justify-between h-full group">
                                        <div>
                                            <div className="flex gap-0.5 mb-6">{[1, 2, 3, 4, 5].map(j => <svg key={j} viewBox="0 0 20 20" className="size-4 text-accent" fill="currentColor"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.28l-4.77 2.43.91-5.32L2.27 6.62l5.34-.78z" /></svg>)}</div>
                                            <p className="text-[#131613] dark:text-gray-200 text-base md:text-lg font-medium leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                                        </div>
                                        <div className="flex items-center gap-4 pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
                                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">{t.initials}</div>
                                            <div><p className="text-[#131613] dark:text-white font-black text-sm">{t.author}</p><p className="text-primary font-bold text-[10px] uppercase tracking-wider">{t.role}</p></div>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 14. FAQ ═══ */}
                <section id="faq" className="py-24 md:py-36 bg-[#FDFDFD] dark:bg-[#0D130E]">
                    <div className="max-w-[800px] mx-auto px-6 md:px-8">
                        <Reveal><SH tag="FAQ" heading={<>Common <span className="text-primary italic">questions</span></>} /></Reveal>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <Reveal key={i} delay={i * 50}>
                                    <div className="bg-white dark:bg-[#1a2c15] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-card hover:shadow-soft transition-all">
                                        <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <span className="text-sm md:text-base font-black text-[#131613] dark:text-white pr-6 tracking-tight">{faq.q}</span>
                                            <span className={`text-primary text-xl font-black transition-transform duration-500 flex-shrink-0 ${faqOpen === i ? "rotate-45" : ""}`}>+</span>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-500 ${faqOpen === i ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                            <div className="px-6 md:px-8 pb-6"><p className="text-gray-500 dark:text-[#a3b2a4] text-sm font-medium leading-relaxed border-t border-gray-100 dark:border-white/5 pt-5">{faq.a}</p></div>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 15. FINAL CTA ═══ */}
                <section className="py-24 md:py-36 bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                    <div className="section-zoom relative z-10 text-center">
                        <Reveal>
                            <div className="max-w-3xl mx-auto space-y-8">
                                <h2 className="text-white text-3xl md:text-5xl lg:text-7xl font-black heading-tight">Ready to grow<br />your <span className="text-accent italic">business</span>?</h2>
                                <p className="text-green-50/80 text-base md:text-xl font-medium leading-relaxed max-w-lg mx-auto">Join thousands already trading on CropConnect. Sign up takes 2 minutes. Your first listing is free. You only pay when you sell.</p>
                                <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
                                    <Link href="/auth/signup" className="button-base bg-white text-primary shadow-premium hover:bg-green-50 hover:-translate-y-1 group text-xs">Create Free Account <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span></Link>
                                    <Link href="/discover" className="button-base bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 text-xs">Explore Marketplace</Link>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            {/* ═══════ FOOTER ═══════ */}
            <footer className="bg-[#131613] text-white pt-24 md:pt-32 pb-12 md:pb-16">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="section-zoom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-24">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="size-11 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="size-5"><path d="M12 22v-9" /><path d="M8 3.5C8.5 7 10 10 12 13" /><path d="M16 3.5C15.5 7 14 10 12 13" /><path d="M5.5 8C7.5 9 10 11 12 13" /><path d="M18.5 8C16.5 9 14 11 12 13" /></svg>
                                </div>
                                <h2 className="text-xl font-black tracking-tighter">CropConnect</h2>
                            </div>
                            <p className="text-[#a3b2a4] text-sm max-w-sm font-medium leading-relaxed">The direct farm-to-buyer marketplace. Escrow-protected payments, CropScore reputation, and integrated logistics in one platform.</p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Platform</h4>
                            <ul className="space-y-4 text-sm font-medium text-[#a3b2a4]">
                                <li><Link className="hover:text-white transition-colors" href="/discover">Discover</Link></li>
                                <li><Link className="hover:text-white transition-colors" href="/auth/signup">Join as Farmer</Link></li>
                                <li><Link className="hover:text-white transition-colors" href="/auth/signup">Join as Buyer</Link></li>
                                <li><a className="hover:text-white transition-colors" href="#overview">How It Works</a></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Stay Updated</h4>
                            <p className="text-[#a3b2a4] text-sm font-medium">Weekly market insights and platform news.</p>
                            <form onSubmit={handleSubscribe} className="relative">
                                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 pr-24 font-bold text-xs text-white outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-gray-600" placeholder="your@email.com" required />
                                <button type="submit" disabled={subscribing} className="absolute right-2 top-2 h-10 px-5 bg-primary text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50">{subscribing ? "..." : "Join"}</button>
                                {subscribed && <p className="absolute -bottom-7 left-0 text-primary font-black text-[10px] uppercase tracking-widest animate-fade-in">Subscribed!</p>}
                                {subscribeError && <p className="absolute -bottom-7 left-0 text-amber-400 font-black text-[10px] uppercase tracking-widest animate-fade-in">{subscribeError}</p>}
                            </form>
                        </div>
                    </div>
                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[#a3b2a4] font-bold text-[9px] uppercase tracking-[0.25em]">
                        <p>&copy; {yr} CropConnect. All rights reserved.</p>
                        <div className="flex gap-8"><Link href="/privacy" className="opacity-50 hover:opacity-100 transition-opacity">Privacy</Link><Link href="/terms" className="opacity-50 hover:opacity-100 transition-opacity">Terms</Link><a href="mailto:support@cropconnect.com" className="opacity-50 hover:opacity-100 transition-opacity">Contact</a></div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
