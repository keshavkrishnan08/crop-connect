#!/usr/bin/env python3
"""Build the investor pre-read as a clean, editable .docx."""
import re
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

BRAND = RGBColor(0x23, 0x5C, 0x3A)
INK = RGBColor(0x16, 0x24, 0x1C)
GREY = RGBColor(0x5b, 0x6b, 0x60)

doc = Document()

# page + base font
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
    """Render **bold** and {N} superscript-citation markup into runs."""
    for idx, seg in enumerate(text.split("**")):
        bold = idx % 2 == 1
        for part in re.split(r"(\{[^}]*\})", seg):
            if not part:
                continue
            if part[0] == "{" and part[-1] == "}":
                r = p.add_run(part[1:-1])
                r.font.superscript = True
                r.font.size = Pt(7)
                r.font.color.rgb = BRAND
            else:
                r = p.add_run(part)
                r.bold = bold
                r.font.size = Pt(size)
                r.font.color.rgb = color

def title(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(19)
    r.font.color.rgb = INK

def heading(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(11)
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = BRAND

def para(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    runs(p, text)

def bullet(text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(3)
    runs(p, text)

def sources(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    runs(p, text, size=8.5, color=GREY)

# ---- content ----
title("CropConnect — Investor Pre-Read")

heading("Problem")
para("Independent full-service restaurants run on a net margin of about **3–5% of revenue**.{1} Food and labor alone consume roughly **60 cents of every dollar**.{1} There is almost no room to cut, so growth has to come from charging more for the same seats.")
para("Local sourcing is how kitchens do that. **38% of U.S. diners** say they are more likely to choose a restaurant that offers locally sourced food,{2} and **55%** want to know the story behind what they eat.{3} But sourcing locally by hand is a second full-time job: finding farms, vetting them, negotiating prices, writing agreements, scheduling deliveries, and covering shortfalls when a crop comes up short. An owner already working 60-hour weeks skips it. **The demand exists; the labor to capture it does not.**")

heading("Product")
para("CropConnect is an AI agent that runs local sourcing end to end. The restaurant enters one need — say, **40 lbs of heirloom tomatoes a week**. With no further work from the owner, the agent:")
bullet("ranks vetted local farms by crop, distance, reliability, and price;")
bullet("splits the order across several farms if one cannot cover the volume;")
bullet("drafts a supply contract and runs a short negotiation over quality terms (organic, grade, freshness window);")
bullet("schedules weekly deliveries through third-party logistics;")
bullet("holds the food payment in escrow and releases it to the farm only after delivery is confirmed; and")
bullet("tracks the added margin on each dish.")
para("Setup takes about **ten minutes**, and the first ingredient is free. The product is built and live today, including the agent, the contracts, the escrow, and a free instant sourcing audit any restaurant can run before signing up.")

heading("Why Now")
para("Two curves crossed. Diner demand for local has risen for years — the share of shoppers who rate ingredient transparency as important went from **69% in 2018 to 76% in 2023**.{3} And AI agents have only just made the coordination behind local sourcing cheap enough to give away as a done-for-you service. Work that used to require a salaried sourcing manager can now be run by software. This is the first moment both are true at once.")

heading("Market")
para("U.S. restaurants did about **$1.1 trillion** in sales across roughly **1 million** locations in 2024.{4} Our wedge is the independent full-service segment — the operators who both want local sourcing and lack the staff to do it. We win one metro at a time and earn density before expanding.")
para("In the **Indianapolis metro** there are roughly **4,500** restaurants; we estimate about **1,500** are target independents.{5} At a blended **$10,700** per restaurant per year, that is about **$16 million** of annual revenue available in Indianapolis alone, before a second market.{5}")

heading("Precedent")
para("This is a graveyard, and the cause of death is consistent.")
bullet("**Webvan** raised more than **$800 million** to deliver fresh groceries, built its own warehouses and truck fleet, expanded city by city, and filed for bankruptcy in 2001.{6}")
bullet("**Good Eggs** raised roughly **$50 million** to deliver local food, scaled to four cities, and in 2015 laid off most of its staff and retreated to a single market.{6}")
bullet("**Farmigo** (2016), **Door to Door Organics** (2016), and **Relay Foods** (2016) each tried to aggregate small farms and deliver the food themselves. Each shut the business down.{6}")
para("The reason was the same every time: **they owned the perishable inventory and the logistics.** Warehouses, trucks, and spoilage are cash-intensive and low-margin, and the math gets worse as you add cities. They also sold to consumers, the most price-sensitive buyer, and they expanded geography before the unit economics worked. The large distributors (Sysco, US Foods) serve scale but not small local farms; for them, “local” is a checkbox, not the product.")
para("We are different on every count: we own **no warehouses, trucks, or inventory** (the restaurant funds the food at the farm's price and delivery is third-party at cost); we sell to **restaurants on a recurring fee**, not to price-sensitive consumers; we earn **density in one metro** before expanding; and the coordination that made this unprofitable by hand is now run by an **AI agent**.")

heading("Business Model")
para("Three explicit parts:")
bullet("**Food:** billed to the restaurant at the farm's price. We make **$0** on the food itself.")
bullet("**Delivery:** passed through at third-party cost. We make **$0** on logistics.")
bullet("**Service fee:** our only revenue. A **$299** monthly base plus a per-item fee that scales with volume, blending to about **$896** per restaurant per month (about **$10,700** per year).")
para("Because our costs are software, agent compute, and a thin coordination layer, the service-fee gross margin runs about **80% at scale**. At ~$896 per month and ~80% margin, a customer contributes about **$717** per month, so even a $1,000 acquisition cost pays back in under two months (illustrative).")

heading("Moat")
bullet("**Two-sided density:** once we vet and contract a city's farms, a new entrant must rebuild the whole local supply base. More restaurants pull more farm capacity; more farms mean better fill.")
bullet("**Proprietary data:** every contract, delivery, and price trains the agent on local supply, reliability, and demand, so our matching and forecasting beat any generic tool.")
bullet("**Switching costs:** once we run a kitchen's sourcing, contracts, deliveries, and margins, replacing us means rebuilding their supply chain by hand.")

heading("Ask")
para("The product is built and live; we are **pre-revenue**. We are raising **$50,000–$100,000** on a post-money SAFE (**$4M** cap, **20%** discount, MFN). About **80%** of the round goes to sales. It funds one milestone: **15 paying kitchens and about $13,000 in monthly recurring revenue in Indianapolis within 90 days** — the proof point to raise a priced seed.")

sources("Sources.  1 — Restaurant net-margin and prime-cost benchmarks: National Restaurant Association; Restaurant365 industry benchmarks.  2 — National Restaurant Association, 2022 State of the Restaurant Industry.  3 — FMI, transparency and foodservice trends, 2023.  4 — National Restaurant Association, 2024 industry forecast.  5 — Indianapolis restaurant counts and revenue opportunity are internal estimates.  6 — Company outcomes are publicly reported: Webvan (bankruptcy, 2001); Good Eggs (layoffs and market exit, 2015); Farmigo, Door to Door Organics, and Relay Foods (ceased food operations, 2016).")
sources("Keshav Krishnan · keshavkrishnanbusiness@gmail.com · Confidential")

doc.save("pitch/cropconnect-preread.docx")
print("saved pitch/cropconnect-preread.docx")
