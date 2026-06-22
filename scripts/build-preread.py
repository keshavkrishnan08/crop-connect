#!/usr/bin/env python3
"""Build the investor pre-read as a clean, editable .docx — memo format."""
import re
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

BRAND = RGBColor(0x23, 0x5C, 0x3A)
INK = RGBColor(0x16, 0x24, 0x1C)
GREY = RGBColor(0x5b, 0x6b, 0x60)

doc = Document()
s = doc.sections[0]
s.top_margin = s.bottom_margin = Inches(0.8)
s.left_margin = s.right_margin = Inches(0.9)
normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(10.5)
normal.font.color.rgb = INK
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.12

def runs(p, text, size=10.5, color=INK):
    for idx, seg in enumerate(text.split("**")):
        bold = idx % 2 == 1
        for part in re.split(r"(\{[^}]*\})", seg):
            if not part:
                continue
            if part[0] == "{" and part[-1] == "}":
                r = p.add_run(part[1:-1]); r.font.superscript = True; r.font.size = Pt(7); r.font.color.rgb = BRAND
            else:
                r = p.add_run(part); r.bold = bold; r.font.size = Pt(size); r.font.color.rgb = color

def title(text):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(12)
    r = p.add_run(text); r.bold = True; r.font.size = Pt(19); r.font.color.rgb = INK

def heading(text):
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(11); p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text); r.bold = True; r.font.size = Pt(12); r.font.color.rgb = BRAND

def para(text):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY; runs(p, text)

def bullet(text):
    p = doc.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(3); runs(p, text)

def note(text):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(4); runs(p, text, size=9.5, color=GREY)

def sources(text):
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(14); runs(p, text, size=8.5, color=GREY)

# ---- content (memo format) ----
title("CropConnect — Investor Pre-Read")

heading("Summary")
para("CropConnect is an AI agent that runs local sourcing for restaurants end to end: it finds the farms, signs the contracts, runs weekly delivery, holds payment in escrow, and tracks the added margin. The owner names an ingredient and puts the dish on the menu; the agent does the rest. Diners increasingly choose restaurants for local food, while sourcing it by hand remains a second full-time job most independents skip. The product is built and live. We are **pre-revenue**, raising **$50,000–$100,000** on a SAFE to land the first **15 paying kitchens in Indianapolis**.")

heading("Market and Timing")
para("Independent full-service restaurants net about **3–5% of revenue**, with food and labor consuming roughly **60 cents of every dollar**.{1} Most growth therefore has to come from charging more for the same seats, and local sourcing is a proven way to do it: **38% of U.S. diners** are more likely to choose a restaurant offering locally sourced food,{2} **55%** want the story behind their food,{3} and the share rating ingredient transparency as important rose from **69% in 2018 to 76% in 2023**.{3} Sourcing locally by hand means finding farms, vetting them, negotiating, contracting, scheduling, and covering shortfalls, so most independents do not.")
para("Durable diner demand for local and AI agents cheap enough to run that coordination as a service have arrived together for the first time. The U.S. restaurant market is large: about **$1.1 trillion** across roughly **1 million** locations in 2024.{4}")

heading("Product")
para("The restaurant enters one need — say, 40 lbs of heirloom tomatoes a week — and the agent, with no further work from the owner: ranks vetted local farms by crop, distance, reliability, and price; splits the order across farms if one cannot cover it; drafts a contract and negotiates quality terms; schedules weekly third-party delivery; holds payment in escrow until delivery is confirmed; and tracks the added margin per dish. Setup takes about **ten minutes** and the first ingredient is free. The product, including the agent, contracts, escrow, and a free instant sourcing audit, is **built and live today**.")

heading("Business Model")
para("Revenue comes only from a monthly service fee. The food is billed to the restaurant at the farm's price and delivery is contracted to third parties at cost, so both pass through with no markup. The service fee is a **$299** base plus a per-item fee that scales with volume, blending to about **$896 per restaurant per month** (~$10,700 per year). Our own costs are software, agent compute, and a thin coordination layer.")

heading("Unit Economics")
para("Targets and assumptions below; we are pre-revenue and will replace them with measured numbers from the first cohort.")
bullet("**ARPA:** ~$896/month (~$10,700/year), starting near $400 on the first ingredient and rising as items are added.")
bullet("**Gross margin:** ~80% at scale, or about **$717/month** of gross profit per restaurant.")
bullet("**CAC target:** **$800–$1,200** (insider commission, one onboarding visit, tasting samples).")
bullet("**Payback:** about **1–2 months**.")
bullet("**Assumed monthly logo churn:** ~3% (roughly a 30-month average customer life), reflecting normal restaurant turnover.")
bullet("**Implied LTV (gross profit):** ~$20,000+, for an LTV/CAC well above 10× if these hold.")

heading("Go-to-Market")
para("We win one metro at a time and earn density before expanding. The Indianapolis plan is specific:")
bullet("**Supply first.** Pre-sign 8–12 vetted local farms across the core crops so fill is guaranteed before we sell a single restaurant. This removes the cold-start problem.")
bullet("**Target list.** A part-time industry insider builds a list of ~150 chef-driven independent restaurants most likely to value local sourcing, drawn from existing relationships.")
bullet("**Outreach.** Before each conversation we run the free audit on the prospect's public menu and bring a specific, quantified estimate of the margin they are leaving behind.")
bullet("**Offer.** First ingredient free, ten-minute setup, cancel any month, backed by a guarantee.")
bullet("**Land and expand.** Start with one ingredient (~$400/month) and grow the account as the agent proves itself, toward the ~$896 blended ARPA.")
bullet("**Expansion trigger.** Once Indianapolis reaches roughly 30–40 kitchens and 15+ farms, open the next metro with the same playbook.")
para("The target segment in the metro is about **1,500 independents**.{5}")

heading("Why We Win")
para("Many have tried farm-to-table distribution and failed. Webvan raised more than **$800M**, built its own warehouses and trucks, expanded city by city, and went bankrupt in 2001.{6} Good Eggs raised ~$50M, scaled to four cities, and in 2015 retreated to one.{6} Farmigo, Door to Door Organics, and Relay Foods each aggregated small farms and delivered the food themselves, and each closed by 2016.{6} In every case the company owned the perishable inventory and the logistics, sold to price-sensitive consumers, and expanded geography before the unit economics worked. Large distributors serve scale rather than small local farms.")
para("CropConnect owns no warehouses, trucks, or inventory; sells to restaurants on a recurring fee; earns density in one metro before expanding; and runs the coordination with an AI agent. That density is the moat. Vetting a city's farms once forces a rival to rebuild the entire local supply base, every contract and delivery trains the agent on local supply and demand, and a kitchen that runs its sourcing, contracts, and deliveries through us would have to rebuild its supply chain by hand to leave.")

heading("Team")
para("**Keshav Krishnan**, founder. [Add one or two lines on your relevant background: industry exposure, technical build of the product, and any prior ventures.] Early sales are led by a **part-time industry insider** with existing restaurant relationships in the market.")
note("To complete before sending: founder background, and the insider's name/relationships.")

heading("Status and Ask")
para("The product is **built and live**; we are **pre-revenue**. We are raising **$50,000–$100,000** on a post-money SAFE (**$4M** cap, **20%** discount, MFN), with about **80%** going to sales. The round funds one milestone: **15 paying kitchens and ~$13,000 in monthly recurring revenue in Indianapolis within 90 days** — the proof point to raise a priced seed.")

heading("Risks and Open Questions")
bullet("**Willingness to pay is unproven.** Being pre-revenue, we have not yet confirmed a restaurant will pay ~$896/month. Mitigation: the free audit quantifies ROI before they pay, and a guarantee backs it.")
bullet("**Acquisition is unproven.** Restaurants are slow, low-tech buyers; the insider/warm-intro motion may not scale cheaply. Mitigation: start where introductions exist and measure CAC and sales-cycle from the first cohort.")
bullet("**Operational reliability.** A single missed delivery breaks trust, and coordinating perishable weekly supply is hard even asset-light. Mitigation: a backup farm stands by for every crop; escrow aligns the farm's incentive to deliver.")
bullet("**Churn.** Independent restaurants close often and run thin. Mitigation: deep switching costs once we are embedded in their sourcing and contracts.")
bullet("**Cold start / density.** The flywheel needs both farms and restaurants in a metro. Mitigation: seed the farm side first and stay in one metro until it is dense.")
bullet("**Team depth.** A small team is key-person risk. Mitigation: this round funds the first dedicated sales hire.")

sources("Sources.  1 — Restaurant net-margin and prime-cost benchmarks: National Restaurant Association; Restaurant365 industry benchmarks.  2 — National Restaurant Association, 2022 State of the Restaurant Industry.  3 — FMI, transparency and foodservice trends, 2023.  4 — National Restaurant Association, 2024 industry forecast.  5 — Indianapolis restaurant counts and target-segment figures are internal estimates.  6 — Company outcomes are publicly reported: Webvan (bankruptcy, 2001); Good Eggs (layoffs and market exit, 2015); Farmigo, Door to Door Organics, and Relay Foods (ceased food operations, 2016).")
sources("Keshav Krishnan · keshavkrishnanbusiness@gmail.com · Confidential")

doc.save("pitch/cropconnect-preread.docx")
print("saved pitch/cropconnect-preread.docx")
