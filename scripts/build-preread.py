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
para("CropConnect is an AI agent that runs local sourcing for restaurants end to end: it finds the farms, signs the contracts, runs weekly delivery, holds payment in escrow, and tracks the added margin. The owner does two things — ask, and put the dish on the menu. Diners increasingly choose restaurants for local food, but sourcing it by hand is a second full-time job, so most independents skip it; an AI agent makes that work cheap enough to do for them. The product is built and live. We are **pre-revenue**, raising **$50,000–$100,000** on a SAFE to land the first **15 paying kitchens in Indianapolis**.")

heading("Market and Timing")
para("Independent full-service restaurants net about **3–5% of revenue**, with food and labor consuming roughly **60 cents of every dollar**.{1} There is little to cut, so growth has to come from charging more for the same seats. Local sourcing is how kitchens do that: **38% of U.S. diners** are more likely to choose a restaurant offering locally sourced food,{2} and **55%** want the story behind what they eat;{3} the share rating ingredient transparency as important rose from **69% in 2018 to 76% in 2023**.{3} The barrier is labor, not demand — doing it by hand means finding farms, vetting them, negotiating, contracting, scheduling, and covering shortfalls.")
para("Two things just became true at once: durable diner demand for local, and AI agents finally cheap enough to run that coordination as a done-for-you service. The market is large — U.S. restaurants did about **$1.1 trillion** across roughly **1 million** locations in 2024.{4}")

heading("Product")
para("The restaurant enters one need — say, 40 lbs of heirloom tomatoes a week — and the agent, with no further work from the owner: ranks vetted local farms by crop, distance, reliability, and price; splits the order across farms if one cannot cover it; drafts a contract and negotiates quality terms; schedules weekly third-party delivery; holds payment in escrow until delivery is confirmed; and tracks the added margin per dish. Setup takes about **ten minutes** and the first ingredient is free. The product, including the agent, contracts, escrow, and a free instant sourcing audit, is **built and live today**.")

heading("Business Model")
para("Our economics are deliberately asset-light, and there are only three parts. **Food** is billed to the restaurant at the farm's price — we make **$0** on it. **Delivery** is passed through at third-party cost — we make **$0** on logistics. Our only revenue is a **service fee**: a **$299** monthly base plus a per-item fee that scales with volume, blending to about **$896 per restaurant per month** (~$10,700/year). Because our costs are software, agent compute, and a thin coordination layer, the service-fee gross margin runs about **80% at scale**. At that margin a customer contributes ~**$717/month**, so even a $1,000 acquisition cost pays back in under two months (illustrative). We make software margins on a problem others tried to solve with trucks.")

heading("Go-to-Market")
para("We win **one metro at a time** and earn density before expanding. The motion is a **part-time industry insider plus warm introductions** into Indianapolis kitchens — a credibility-led, low-CAC channel rather than cold paid acquisition. The wedge is the **free instant audit**: it turns a cold kitchen into a quantified “money on the table” conversation using their own menu, and the free first ingredient removes the risk of trying. We estimate about **1,500 target independents** in the metro.{5}")

heading("Why We Win")
para("Many have tried this and failed, and the cause of death is consistent. **Webvan** raised more than **$800M**, built its own warehouses and trucks, expanded city by city, and went bankrupt in 2001.{6} **Good Eggs** raised ~$50M, scaled to four cities, and in 2015 retreated to one.{6} **Farmigo**, **Door to Door Organics**, and **Relay Foods** each tried to aggregate small farms and deliver, and each shut down by 2016.{6} They **owned the perishable inventory and the logistics**, sold to price-sensitive consumers, and expanded geography before the unit economics worked. Large distributors (Sysco, US Foods) serve scale but not small local farms; for them, “local” is a checkbox.")
para("We are different on every count, and the advantage compounds. We own **no warehouses, trucks, or inventory**; we sell to **restaurants on a recurring fee**; we earn **density in one metro** first; and an **AI agent** runs the coordination that made this unprofitable by hand. That density is the moat: vet a city's farms once and a rival must rebuild the whole local supply base. Every contract, delivery, and price also **trains the agent** on local supply and demand, and once we run a kitchen's sourcing, contracts, and deliveries, **replacing us means rebuilding their supply chain by hand**.")

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
