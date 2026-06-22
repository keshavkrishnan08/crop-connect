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
para("CropConnect is an AI agent that does one thing for a restaurant: it runs local sourcing end to end — finding the farms, signing the contracts, scheduling weekly delivery, holding payment in escrow, and tracking the added margin. The owner names an ingredient and puts the dish on the menu; the software does the rest, automatically. The business is **asset-light**: we own no warehouses, trucks, or inventory, the food is billed at the farm's price, and delivery is third-party, so we earn a **software margin on a monthly service fee**, not a distribution margin. The product is **built and live, developed by the founder solo**. We are pre-revenue, raising **$50,000–$100,000** on a SAFE to land the first **15 paying kitchens in Indianapolis**.")

heading("The Opportunity")
para("Until now, running local sourcing for a restaurant required a salaried human coordinator. An AI agent can now do that work directly: it **connects a restaurant to the right local farms, drafts and negotiates custom supply contracts, and runs the ongoing services — delivery tracking, escrow payments, and reconciliation — on its own.** Software can now perform the coordination that used to require a person, which is what makes offering local sourcing profitable. That capability is recent, and it is the opportunity.")

heading("Market and Timing")
para("Independent full-service restaurants net about **3–5% of revenue**, with food and labor consuming roughly **60 cents of every dollar**.{1} Most growth has to come from charging more for the same seats, and local sourcing is a proven way to do it: **38% of U.S. diners** are more likely to choose a restaurant offering locally sourced food,{2} and the share rating ingredient transparency as important rose from **69% in 2018 to 76% in 2023**.{3} Sourcing locally by hand requires finding farms, vetting them, negotiating, contracting, scheduling, and covering shortfalls.")
para("The U.S. restaurant market is about **$1.1 trillion** across roughly **1 million** locations.{4} Of those, we estimate about **150,000 are independent full-service restaurants that would plausibly buy** — chef-driven, mid-to-upscale operators that value local sourcing — a serviceable market of roughly **$1.6 billion a year** at our pricing.{5} In the **Indianapolis** metro, of about 4,500 restaurants we estimate roughly **1,500 fit that profile**, about **$16 million a year**.{5} We start in Indianapolis and repeat the same playbook city by city; each metro is a self-contained, profitable unit. Beyond restaurants, the farm relationships and the allocation layer become a demand aggregator for growers — a **farming platform** larger than restaurant sourcing alone.")

heading("Product")
para("The restaurant enters one need — say, 40 lbs of heirloom tomatoes a week — and the agent runs the entire workflow **automatically**: it ranks vetted local farms by crop, distance, reliability, and price; splits the order across farms if one cannot cover it; drafts a contract and negotiates quality terms; schedules weekly third-party delivery; holds payment in escrow until delivery is confirmed; and tracks the added margin per dish. **This is real automation, not a manual service dressed as software** — the founder built it as a working product, live today, including a free instant audit any restaurant can run before signing up.")

heading("Business Model")
para("Revenue comes only from a monthly service fee. Food is billed at the farm's price and delivery is passed through at third-party cost, both with no markup. The fee is a **$299** base plus a per-item fee that scales with volume, blending to about **$896 per restaurant per month** (~$10,700/year). Because our costs are software, agent compute, and a thin coordination layer, the service-fee gross margin is high.")

heading("Unit Economics")
para("These are targets, not results; we are pre-revenue and will validate them against the first cohort.")
bullet("**ARPA:** ~$896/month at maturity, starting near $400 on the first ingredient and growing as items are added.")
bullet("**Gross margin:** ~80%, or about **$717/month** of gross profit per restaurant.")
bullet("**CAC: ~$850 per restaurant** — sales commission ~$400, the first ingredient serviced free (~$300 in foregone fee), and onboarding plus tasting samples ~$150.")
bullet("**Payback:** about **one to two months** at target margin.")
bullet("**Monthly churn:** assume ~3%, reflecting normal restaurant turnover; the embedded sourcing, contracts, and deliveries should make real churn lower.")
para("We treat lifetime value as a hypothesis to test with data, not a number to lead with.")

heading("Go-to-Market")
para("We win one metro at a time and earn density before expanding. The Indianapolis plan:")
bullet("**Supply first.** Pre-sign 8–12 vetted farms across the core crops so fill is guaranteed before we sell a restaurant, removing the cold-start problem.")
bullet("**Target list.** A part-time industry insider builds a list of ~150 chef-driven independents from existing relationships.")
bullet("**Outreach.** Before each conversation we run the free audit on the prospect's menu and bring a specific, quantified estimate of the margin they are leaving behind.")
bullet("**Offer and risk reversal.** First ingredient free, ten-minute setup, cancel any month. The guarantee — we find more than we cost or the month is free — is an **acquisition tool** that removes the buyer's risk and shortens the sales cycle; because the savings we find typically exceed the fee, the exposure is small.")
bullet("**Land and expand.** Start with one ingredient (~$400/month) and grow the account toward the ~$896 blended ARPA.")
bullet("**Expansion trigger.** At roughly 30–40 kitchens and 15+ farms in Indianapolis, open the next metro with the same playbook.")

heading("Why We Win")
para("Many have tried farm-to-table distribution and failed. Webvan raised more than **$800M**, built its own warehouses and trucks, expanded city by city, and went bankrupt in 2001.{6} Good Eggs raised ~$50M, scaled to four cities, and in 2015 retreated to one.{6} Farmigo, Door to Door Organics, and Relay Foods each aggregated small farms and delivered the food themselves, and each closed by 2016.{6} In every case the company owned the perishable inventory and the logistics, sold to price-sensitive consumers, and expanded before the unit economics worked. We avoid all three: we own no inventory or logistics, we sell to restaurants on a recurring fee, and we earn density in one metro before expanding.")
para("The density becomes the moat. Vetting a city's farms once forces a rival to rebuild the entire local supply base; every contract and delivery trains the agent on local supply and demand; and a kitchen that runs its sourcing, contracts, and deliveries through us would have to rebuild its supply chain by hand to leave.")

heading("Team")
para("**Keshav Krishnan**, founder. His research on the **economic cost of climate-driven migration** gave him a data-level view of how fragile long-distance food supply chains are and why regional, resilient sourcing is where the system is heading — the conviction behind CropConnect. He also **built the entire product solo**, from the agent to the contracts and escrow, which is why a working platform already exists at the pre-seed stage. Early sales are led by a **part-time industry insider** with existing restaurant relationships in the market.")
note("To complete before sending: the insider's name and relationships, and one concrete result or figure from your climate-migration research.")

heading("Status and Ask")
para("The product is built and live; we are **pre-revenue**. We are raising **$50,000–$100,000** on a post-money SAFE (**$4M** cap, **20%** discount, MFN), with about **80%** going to sales. The round funds one milestone: **15 paying kitchens and ~$13,000 in monthly recurring revenue in Indianapolis within 90 days** — the proof point to raise a priced seed.")

heading("Risks and Open Questions")
bullet("**Willingness to pay is unproven.** Being pre-revenue, we have not yet confirmed a restaurant will pay ~$896/month. Mitigation: the free audit quantifies the return before they pay, and a guarantee backs it.")
bullet("**Acquisition is unproven.** Restaurants are slow, low-tech buyers; the insider/warm-intro motion may not scale cheaply. Mitigation: start where introductions exist and measure CAC and sales-cycle from the first cohort.")
bullet("**Operational reliability.** A single missed delivery breaks trust, and coordinating perishable weekly supply is hard even asset-light. Mitigation: a backup farm stands by for every crop; escrow aligns the farm's incentive to deliver.")
bullet("**Churn.** Independent restaurants close often and run thin. Mitigation: deep switching costs once we are embedded in their sourcing and contracts.")
bullet("**Cold start / density.** The flywheel needs both farms and restaurants in a metro. Mitigation: seed the farm side first and stay in one metro until it is dense.")
bullet("**Team depth.** A solo team is key-person risk. Mitigation: this round funds the first dedicated sales hire.")

sources("Sources.  1 — Restaurant net-margin and prime-cost benchmarks: National Restaurant Association; Restaurant365 industry benchmarks.  2 — National Restaurant Association, 2022 State of the Restaurant Industry.  3 — FMI, transparency and foodservice trends, 2023.  4 — National Restaurant Association, 2024 industry forecast.  5 — U.S. and Indianapolis target-segment restaurant counts and the revenue estimates derived from them are internal estimates.  6 — Company outcomes are publicly reported: Webvan (bankruptcy, 2001); Good Eggs (layoffs and market exit, 2015); Farmigo, Door to Door Organics, and Relay Foods (ceased food operations, 2016).")

doc.save("pitch/cropconnect-preread.docx")
print("saved pitch/cropconnect-preread.docx")
