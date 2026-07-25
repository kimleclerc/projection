// =========================================================
// CANADA FEDERAL BUDGET 2025 — ENGLISH DATA
// "Canada Strong"
// Minister of Finance: François-Philippe Champagne
// Prime Minister: Mark Carney
// Tabled: November 4, 2025
// =========================================================

const BUDGET_EN = {
  lang: "en",
  annee: "2025-2026",
  titre: "Federal Budget 2025",
  titre_complet: "Canada Strong",
  date_depot: "November 4, 2025",
  ministre: "François-Philippe Champagne",
  premier_ministre: "Mark Carney",
  status: "live",

  quote: {
    texte: "We won't transform our economy easily or in a few months — it will take some sacrifices and some time. But we will build this country like never before. We are the true north, strong and free.",
    auteur: "Mark Carney",
    titre: "Prime Minister of Canada — Budget 2025",
  },

  chiffres: [
    { label: "Deficit 2025-26", valeur: "-$78.3 B", note: "~2.5% of GDP — nearly double last year's forecast", variation: "Narrows to $56.6 B by 2029-30", direction: "down" },
    { label: "New spending (5 yr)", valeur: "$141 B", note: "Partially offset by $60 B in savings", variation: "Defence, infrastructure, housing, tax cuts", direction: "neutral" },
    { label: "Capital plan (5 yr)", valeur: "$280 B", note: "Infrastructure $115 B · Productivity $110 B", variation: "Largest federal capital plan in history", direction: "up" },
    { label: "Defence (5 yr)", valeur: "$81.8 B", note: "NATO 2% target met this year — 5% by 2035", variation: "+$72 B in new money", direction: "up" },
    { label: "Net debt-to-GDP", valeur: "~42%", note: "Lowest in the G7 · AAA credit rating maintained", variation: "Rises slightly to ~43% from 2026-27", direction: "down" },
    { label: "Public service cuts", valeur: "40,000 jobs", note: "~10% of federal workforce by 2029", variation: "$60 B in total savings over 5 years", direction: "neutral" },
  ],

  secteurs: [
    {
      id: "tariff-response",
      titre: "US Tariff Response & Trade Diversification",
      depenses: "$5 B Strategic Response Fund · $5 B Trade Diversification Corridors Fund · $1 B Regional Development",
      variation: "New — central theme of budget 2025",
      priorite: "high",
      resume: "The trade war with the United States is the organizing crisis of this budget. Canada has lost ~30,000 manufacturing jobs since early 2025. The response is a blend of direct sector support, trade corridor investment and diversification away from US dependence. The goal: double non-US exports within a decade. The credibility of that goal depends entirely on the infrastructure and regulatory speed to move Canadian goods to new markets.",
      points: [
        "$5 B Strategic Response Fund — retooling, expansion, new market access for tariff-hit sectors (auto, steel, forestry, agriculture, seafood)",
        "$1 B over 3 years to Regional Development Agencies for tariff-impacted sectors",
        "$5 B Trade Diversification Corridors Fund — ports, airports, rail, road, digital trade infrastructure",
        "Target: double non-US exports within a decade",
        "Buy Canadian Policy — Crown corporations required to prioritize domestic suppliers",
        "85% of Canadian trade with the US remains tariff-free — best deal of any US trading partner",
        "Business marginal effective tax rate (METR) lowered from 15.6% to 13.2% — competitiveness signal",
        "Luxury taxes eliminated (aircraft over $100K, boats over $250K) and underused housing tax scrapped",
      ],
      tags: ["tariffs", "trade", "US", "manufacturing", "diversification", "exports", "Buy-Canadian"]
    },
    {
      id: "nation-building",
      titre: "Nation-Building Infrastructure",
      depenses: "$280 B capital (5 yr) · $51 B Build Communities Strong (10 yr) · $5 B Trade Corridors",
      variation: "Most ambitious federal infrastructure plan in Canadian history",
      priorite: "high",
      resume: "Nation-building is Carney's signature — a deliberate echo of the CPR era. The Major Projects Office (MPO) is the delivery vehicle, launched in August 2025 to fast-track projects of national interest. The Alto High-Speed Rail (Toronto to Quebec City, 1,000 km, 300 km/h) is the flagship. The Arctic Economic and Security Corridor doubles as civilian infrastructure and military deterrence. This is the budget that bets on building as economic policy.",
      points: [
        "Major Projects Office (MPO) — fast-tracks nation-building projects, streamlines regulatory approvals",
        "Alto High-Speed Rail — Toronto to Quebec City, ~1,000 km, 300 km/h, cuts travel time in half",
        "Arctic Economic and Security Corridor — all-weather roads, deepwater ports, energy corridors, dual civilian/military use",
        "Port of Churchill Plus — expanded trade corridor, upgraded rail, ice-breaking marine capacity",
        "Build Communities Strong Fund — $51 B over 10 years for local infrastructure (housing-enabling transport, water, health)",
        "$5 B Health Infrastructure Fund within BCSF — hospitals, ERs, urgent care, medical schools",
        "$5 B Trade Diversification Corridors Fund — port, airport and rail infrastructure for non-US export routes",
        "$1 B Arctic Infrastructure Fund — northern airports, seaports, highways, Indigenous partnerships",
        "$213.8 M Major Projects Office operational funding over 5 years",
      ],
      tags: ["infrastructure", "rail", "HSR", "Arctic", "MPO", "ports", "nation-building"]
    },
    {
      id: "defence-sovereignty",
      titre: "Defence & Sovereignty",
      depenses: "$81.8 B over 5 years (~$72 B new money)",
      variation: "Largest Canadian defence investment in decades",
      priorite: "high",
      resume: "The single most dramatic investment in Budget 2025. Canada meets NATO's 2% of GDP target this year for the first time — and promises 5% by 2035. The Defence Industrial Strategy bets that defence spending becomes an economic driver, not just a security cost. The $925.6 M sovereign AI infrastructure, $334.3 M quantum technologies and new cyber defence capabilities signal that modern defence is inseparable from tech sovereignty.",
      points: [
        "$20.4 B over 5 years to recruit and retain Canadian Armed Forces — generational pay raises, health care",
        "$19.0 B over 5 years to repair/sustain CAF capabilities and defence infrastructure",
        "$10.9 B over 5 years for CAF, DND and CSE digital infrastructure including cyber defence",
        "$17.9 B over 5 years for new military capabilities — vehicles, counter-drone, logistics",
        "$6.6 B Defence Industrial Strategy — domestic production capacity, supply chain resilience",
        "$4.6 B R&D, capital access, supply chain within Defence Industrial Strategy",
        "New Defence Investment Agency — streamlines procurement, removes duplicative approvals",
        "$925.6 M sovereign public AI infrastructure for Canadian researchers and companies",
        "$334.3 M over 5 years in dual-use quantum technologies",
        "$182.6 M new sovereign space-launch capability",
        "Canadian Coast Guard transferred to Department of National Defence",
      ],
      tags: ["defence", "NATO", "military", "sovereignty", "AI", "quantum", "cyber", "Arctic"]
    },
    {
      id: "productivity-innovation",
      titre: "Productivity, Innovation & Clean Economy",
      depenses: "$110 B productivity/competitiveness (5 yr) · $1.3 B international researchers · $925 M AI",
      variation: "Productivity Super-Deduction is the flagship tax measure",
      priorite: "high",
      resume: "Canada's productivity gap with the US has widened for a decade. The Productivity Super-Deduction is Carney's signature tax measure — immediate write-off of manufacturing buildings plus accelerated depreciation on machinery, equipment and digital tools including AI. The clean economy tax credits (Clean Technology, Clean Electricity, Clean Hydrogen) move from promise to practice. The oil and gas emissions cap is effectively abandoned in favour of CCS and methane regulations.",
      points: [
        "Productivity Super-Deduction — immediate write-off for manufacturing/processing buildings, accelerated depreciation on machinery, equipment, AI tools",
        "New capital cost allowance for LNG equipment and related buildings",
        "SR&ED enhanced — 35% credit limit raised to $4.5 M, refundable credit extended to small public corps",
        "Clean Technology ITC — operational since March 28, 2023, extended to December 31, 2034",
        "Clean Electricity, Clean Hydrogen, Clean Technology Manufacturing ITCs — advancing",
        "Oil and gas emissions cap effectively abandoned — CCS, methane regulations and market mechanisms instead",
        "$925.6 M sovereign AI infrastructure — secure Canadian supercomputing capacity",
        "$1.3 B to attract international researchers to Canadian universities",
        "TechStat — national AI/tech measurement program",
        "New Office of Digital Transformation — government-wide AI adoption",
        "Target: lower METR from 15.6% to 13.2% to make Canada more competitive than the US",
      ],
      tags: ["productivity", "innovation", "AI", "clean-tech", "tax-credits", "LNG", "CCS", "SR&ED"]
    },
    {
      id: "housing",
      titre: "Housing & Community Infrastructure",
      depenses: "$25 B housing measures (5 yr) · $13 B Build Canada Homes · $80 B Canada Mortgage Bond limit",
      variation: "Supply-side focus — Build Canada Homes is the signature program",
      priorite: "high",
      resume: "Housing gets $25 B in new measures over five years — significant but facing a crisis of enormous scale. Build Canada Homes ($13 B) channels federal capital and low-cost financing into purpose-built rental and affordable units. The $80 B expanded Canada Mortgage Bond limit is the real multiplier — it unlocks private capital for multi-unit construction. The key question: can the skilled trades supply actually deliver the units?",
      points: [
        "Build Canada Homes — $13 B initial federal funding, leverages public and private capital",
        "Canada Mortgage Bond limit expanded to $80 B/year — unlocks private financing for multi-unit rentals",
        "$25 B total housing-related measures over 5 years",
        "Low-cost financing for builders, incentives for purpose-built rental construction",
        "Skilled construction workforce initiatives — trades immigration, training",
        "Build Communities Strong Fund — $51 B over 10 years includes housing-enabling infrastructure",
        "Canada Infrastructure Bank Indigenous infrastructure target: raised from $1 B to $3 B",
        "Underused housing tax eliminated — simplify tax system, reduce vacancy",
        "Rental protection and supportive housing also funded within the $25 B envelope",
      ],
      tags: ["housing", "rental", "affordable", "Build-Canada-Homes", "CMB", "construction", "trades"]
    },
    {
      id: "fiscal-framework",
      titre: "Fiscal Framework & Expenditure Review",
      depenses: "$78.3 B deficit 2025-26 · $60 B in savings over 5 years · 40,000 public service cuts",
      variation: "New capital budgeting framework — first of its kind in Canada",
      priorite: "high",
      resume: "The new capital budgeting framework is Carney's most consequential institutional innovation — separating day-to-day operational spending from long-term capital investment. The logic: a hospital built today generates value for 50 years; accounting for it the same way as a staple budget obscures the investment. The operational budget will balance within three years. The capital deficit is justified as nation-building. Whether rating agencies and markets accept this framing is the central fiscal risk.",
      points: [
        "New capital budgeting framework — separates operational spending from capital investment (first in Canada)",
        "Operational budget to balance within 3 years",
        "Total federal deficit: $78.3 B (2025-26) → $65 B (2026-27) → $57 B (2029-30)",
        "$60 B in total savings over 5 years ($13 B annually by 2028-29)",
        "40,000 public service cuts — return to 'sustainable level' by 2029",
        "Direct program expense growth capped under 1%/year (down from 8% average over past decade)",
        "ESDC projected to achieve 15% savings via AI automation, reduced footprint, program consolidation",
        "Canada's net debt-to-GDP: ~42% — lowest in the G7 · AAA credit rating (one of only 2 G7 members)",
        "Fall budget cycle permanent — spring economic statement replaces spring budget",
      ],
      tags: ["deficit", "fiscal-framework", "capital-budgeting", "expenditure-review", "public-service", "debt"]
    },
    {
      id: "affordability-tax",
      titre: "Affordability & Tax Relief",
      depenses: "Middle-class tax cut · Carbon price eliminated · Automatic tax filing for 5.5 M Canadians",
      variation: "Carbon price elimination is the biggest affordability measure",
      priorite: "high",
      resume: "The consumer carbon price elimination (~18¢/L savings on gas) is the most tangible affordability measure for most Canadians. The middle-class tax cut (first bracket from 15% to 14%) saves two-income families up to $840/year. The automatic tax filing for 5.5 million low-income non-filers is a quiet but potentially transformative policy — ensuring people receive benefits they're entitled to without navigating the system.",
      points: [
        "Consumer carbon price eliminated — ~18¢/L savings on gasoline in most provinces",
        "First tax bracket reduced: 15% → 14.5% (2025) → 14% (2026) — saves up to $840/year for two-income families",
        "Automatic federal tax filing for up to 5.5 M low-income non-filers by 2028",
        "National School Food Program made permanent — 400,000 children, ~$800/year savings for families",
        "Luxury taxes eliminated — aircraft over $100K and boats over $250K",
        "Canada Student Grant extended (temporary increases for 2025-26)",
        "Old Age Security and GIS: payments continue — forecasts revised downward (fewer recipients than projected)",
      ],
      tags: ["affordability", "tax-cut", "carbon-price", "school-food", "benefits", "OAS", "GIS"]
    },
    {
      id: "indigenous",
      titre: "Indigenous Communities & Reconciliation",
      depenses: "$2.3 B clean water (3 yr) · $2.8 B urban/rural/northern housing (confirmed) · $1 B Arctic Fund",
      variation: "Water systems and Arctic investment are key new commitments",
      priorite: "high",
      resume: "Clean water for First Nations gets $2.3 B over three years — a real commitment after years of boil-water advisories. The Arctic Infrastructure Fund ($1 B) has Indigenous partnership opportunities built in. However, Indigenous organizations noted the budget cuts to ISC and CIRNAC, the absence of new housing money beyond the 2022 commitment, and uncertainty about Jordan's Principle funding beyond 2025-26.",
      points: [
        "$2.3 B over 3 years to strengthen clean water access for First Nations",
        "$2.8 B confirmed for urban, rural and northern Indigenous housing (from 2022 commitment)",
        "$1 B Arctic Infrastructure Fund — Indigenous partnership opportunities explicitly included",
        "Canada Infrastructure Bank: Indigenous infrastructure target raised from $1 B to $3 B",
        "$10.1 M over 3 years for Indigenous consultations on fast-tracked major projects",
        "First Nations Child and Family Services — $348.4 M in Supplementary Estimates",
        "First Nations Water and Wastewater Enhanced Program renewed",
        "Concern: ISC and CIRNAC budgets cut — $425 B+ estimated gap to close infrastructure needs",
      ],
      tags: ["indigenous", "first-nations", "clean-water", "Arctic", "housing", "Jordan's-Principle"]
    },
    {
      id: "immigration",
      titre: "Immigration & Talent",
      depenses: "$1.3 B international researchers · Pathway for 33,000 temporary workers",
      variation: "Sharp reduction in temporary residents — selective expansion of skilled/research talent",
      priorite: "high",
      resume: "The immigration chapter is two stories in one. The overall volume drops sharply — temporary residents fall from 673,650 to 385,000. But high-value talent gets a green carpet: $1.3 B to recruit 1,000+ international researchers, accelerated pathways for skilled tradespeople, and a one-time program for 33,000 temporary workers to become permanent residents. Canada is being selective, not closed.",
      points: [
        "Temporary resident admissions cut: 673,650 (2025) → 385,000 (2026)",
        "Permanent resident targets stable at 380,000/year (down from 395,000 in 2025)",
        "One-time program: 33,000 temporary workers accelerated to permanent residency (2026-27)",
        "$1.3 B to attract 1,000+ highly qualified international researchers",
        "Strategy to recognize more vocational qualifications for skilled trades",
        "Broader talent attraction strategy linked to productivity and innovation goals",
        "Immigration framed as 'taking back control' — rebalancing volume vs. quality",
      ],
      tags: ["immigration", "talent", "researchers", "skilled-trades", "temporary-workers", "permanent-residency"]
    },
    {
      id: "energy-environment",
      titre: "Energy, Environment & Climate",
      depenses: "Clean economy ITCs · LNG CCA · Carbon capture emphasis",
      variation: "Oil and gas emissions cap abandoned — CCS replaces mandated caps",
      priorite: "high",
      resume: "Canada's climate policy pivots under Carney. The consumer carbon price is gone. The oil and gas emissions cap is effectively scrapped — replaced by enhanced methane regulations and a commitment to carbon capture and storage (CCS) at scale. Clean economy tax credits (Clean Technology, Clean Electricity, Clean Hydrogen) continue and expand. LNG gets a new capital cost allowance. Canada is positioning itself as an 'energy superpower' — producing and exporting, not just transitioning.",
      points: [
        "Consumer carbon price eliminated — provinces with their own systems retain them",
        "Oil and gas emissions cap effectively abandoned — replaced by CCS, methane regulations, market mechanisms",
        "New LNG capital cost allowance — investment signal for liquefied natural gas infrastructure",
        "Clean Technology ITC extended to December 31, 2034",
        "Clean Electricity, Clean Hydrogen, Clean Technology Manufacturing ITCs advancing",
        "Carbon capture and storage (CCS) technologies emphasized as key climate tool",
        "$214 M for critical mineral projects",
        "Canada positioned as energy superpower — production, transformation, export",
        "2 Billion Trees program funding cut",
        "Canada Greener Homes Grant funding cut",
      ],
      tags: ["energy", "climate", "LNG", "CCS", "carbon-price", "clean-tech", "oil-gas", "critical-minerals"]
    },
    {
      id: "health-social",
      titre: "Health, Social Services & CBC",
      depenses: "$5 B Health Infrastructure Fund (3 yr) · $150 M CBC/Radio-Canada",
      variation: "Health infrastructure significant — social programs restrained",
      priorite: "high",
      resume: "Health infrastructure gets a dedicated $5 B fund within Build Communities Strong for hospitals, ERs and medical schools. Social program growth is restrained — capped under 1%/year. The $150 M boost to CBC/Radio-Canada is notable, as is the mandate to investigate Canadian participation in Eurovision. ODSP/provincial social assistance: no direct federal role but income supports maintained.",
      points: [
        "$5 B Health Infrastructure Fund over 3 years — hospitals, emergency rooms, urgent care, medical schools",
        "$150 M to CBC/Radio-Canada — maintaining public broadcaster in tariff/sovereignty context",
        "National School Food Program made permanent — 400,000 children",
        "Direct program expenses capped under 1%/year — meaningful restraint on social program growth",
        "Old Age Security and GIS: maintained — forecasts revised (fewer recipients than projected)",
        "Canada Student Grant extended for 2025-26",
        "Fertility treatment investigation into Eurovision participation ($undefined) — cultural sovereignty signal",
        "Automatic tax filing: 5.5 M low-income non-filers gain access to benefits they're entitled to",
      ],
      tags: ["health", "hospitals", "CBC", "school-food", "OAS", "GIS", "social-programs"]
    },
  ],

  audiences: [
    {
      id: "workers",
      titre: "Workers & Manufacturing Employees",
      priorite: "high",
      resume: "Budget 2025 is directly responding to the tariff-driven job losses (~30,000 manufacturing jobs since early 2025, unemployment peaking at 7.2%). The Strategic Response Fund and Regional Development Agency support are the immediate lifelines. Skills retraining and the trades immigration strategy are the medium-term response.",
      mesures: [
        { label: "Strategic Response Fund (tariff-hit sectors)", valeur: "$5 B", note: "Retooling, new market access" },
        { label: "Middle-class tax cut (two-income families)", valeur: "Up to $840/yr", note: "First bracket 15% → 14% by 2026" },
        { label: "Consumer carbon price eliminated", valeur: "~18¢/L savings", note: "Gas prices" },
        { label: "Skilled trades — vocational qualification recognition", valeur: "New policy", note: "Reduce barriers to work" },
      ],
      tags: ["workers", "manufacturing", "tariffs", "skills", "tax-cut"]
    },
    {
      id: "families",
      titre: "Families",
      priorite: "high",
      resume: "Families benefit from the carbon price elimination (gas savings), the income tax cut, the permanent school food program and the automatic benefit filing for low-income non-filers. Build Canada Homes addresses housing supply. The cumulative affordability signal is real but spread across multiple measures rather than one flagship program.",
      mesures: [
        { label: "Carbon price eliminated", valeur: "~18¢/L on gas", note: "Immediate household savings" },
        { label: "Tax cut (first bracket)", valeur: "Up to $840/yr", note: "Two-income families by 2026" },
        { label: "National School Food Program", valeur: "~$800/yr savings", note: "400,000 children — permanent" },
        { label: "Automatic tax filing", valeur: "5.5 M Canadians", note: "Low-income non-filers get benefits automatically" },
      ],
      tags: ["families", "affordability", "carbon-price", "school-food", "tax-cut"]
    },
    {
      id: "seniors",
      titre: "Seniors",
      priorite: "high",
      resume: "Old Age Security and GIS are maintained. Budget forecasts were revised — fewer recipients and lower average benefits than projected, reducing the fiscal pressure. The carbon price elimination directly reduces heating and transportation costs. Health infrastructure ($5 B) will benefit seniors disproportionately through hospital and long-term care improvements.",
      mesures: [
        { label: "OAS & GIS", valeur: "Maintained", note: "Forecasts revised — fewer recipients than projected" },
        { label: "Carbon price eliminated", valeur: "~18¢/L savings", note: "Heating oil and gas savings" },
        { label: "Health infrastructure fund", valeur: "$5 B (3 yr)", note: "Hospitals, ERs, care facilities" },
        { label: "Automatic tax filing", valeur: "Eligible seniors", note: "Low-income non-filers benefit automatically" },
      ],
      tags: ["seniors", "OAS", "GIS", "health", "affordability"]
    },
    {
      id: "businesses",
      titre: "Businesses & Investors",
      priorite: "high",
      resume: "Budget 2025 is explicitly pro-investment — METR reduction, Productivity Super-Deduction, clean economy ITCs, and a $280 B capital pipeline as a guaranteed market. The Buy Canadian Policy creates compliance requirements for businesses selling to government. The Major Projects Office creates predictable timelines for major infrastructure projects.",
      mesures: [
        { label: "METR reduction", valeur: "15.6% → 13.2%", note: "More competitive than the US" },
        { label: "Productivity Super-Deduction", valeur: "Immediate write-off", note: "Manufacturing buildings, machinery, AI" },
        { label: "Capital pipeline (5 yr)", valeur: "$280 B", note: "Government procurement market" },
        { label: "SR&ED enhanced", valeur: "$4.5 M limit", note: "35% credit, extended to small public corps" },
      ],
      tags: ["business", "investment", "tax", "procurement", "innovation"]
    },
    {
      id: "defence-industry",
      titre: "Defence Industry & Tech Sector",
      priorite: "high",
      resume: "The $81.8 B defence investment over five years is the single largest sector opportunity in this budget. The Defence Industrial Strategy explicitly prioritizes building domestic capacity — not just buying foreign equipment. The $6.6 B for Canadian defence businesses, $925 M sovereign AI infrastructure and $334 M quantum technologies create a decade-long opportunity for Canadian defence and tech firms.",
      mesures: [
        { label: "Total defence investment (5 yr)", valeur: "$81.8 B", note: "~$72 B new money" },
        { label: "Defence Industrial Strategy", valeur: "$6.6 B (5 yr)", note: "Domestic production, supply chains" },
        { label: "Sovereign AI infrastructure", valeur: "$925.6 M", note: "Canadian supercomputing capacity" },
        { label: "Quantum technologies (dual-use)", valeur: "$334.3 M (5 yr)", note: "Defence + civilian applications" },
      ],
      tags: ["defence", "AI", "quantum", "procurement", "sovereignty"]
    },
    {
      id: "municipalities",
      titre: "Municipalities & Local Governments",
      priorite: "high",
      resume: "Build Communities Strong ($51 B over 10 years) is the most significant federal municipal infrastructure program in a generation. Local governments will access funding for housing-enabling transport, water, wastewater and health facilities. The $5 B dedicated Health Infrastructure Fund within BCSF is significant for hospital and urgent care construction.",
      mesures: [
        { label: "Build Communities Strong Fund", valeur: "$51 B (10 yr)", note: "Housing, transport, water, health" },
        { label: "Health Infrastructure Fund", valeur: "$5 B (3 yr)", note: "Within BCSF — hospitals, ERs" },
        { label: "Trade Diversification Corridors", valeur: "$5 B (7 yr)", note: "Port, airport, rail infrastructure" },
        { label: "Provincial/territorial stream", valeur: "$17.2 B (10 yr)", note: "Housing, health, education infrastructure" },
      ],
      tags: ["municipalities", "infrastructure", "housing", "water", "health"]
    },
  ],

  parties_prenantes: [
    {
      id: "manufacturing-auto",
      titre: "Manufacturing & Auto Sector",
      priorite: "high",
      resume: "The $5 B Strategic Response Fund and $1 B Regional Development Agency support are the immediate tools. The Productivity Super-Deduction and METR reduction are the structural improvements. The Buy Canadian Policy creates both opportunity (government procurement) and compliance burden (supply chain review). The key medium-term question: can Canada actually diversify export markets, or is US dependence structural?",
      enjeux: [
        "Strategic Response Fund ($5 B): understand eligibility — retooling, expansion and new market access are funded",
        "Productivity Super-Deduction: major opportunity for eligible capital investments in manufacturing buildings and equipment",
        "METR reduction (15.6% → 13.2%): benchmark against US rates and model investment decisions accordingly",
        "Buy Canadian Policy: review federal supply chain relationships — compliance is mandatory for Crown corp contracts",
        "Trade Diversification Corridors ($5 B): advocate for your sector's specific trade infrastructure needs",
        "Regional Development Agencies ($1 B): fastest path to direct support for smaller manufacturers",
      ],
      tags: ["manufacturing", "auto", "tariffs", "tax", "Buy-Canadian", "procurement"]
    },
    {
      id: "defence-contractors",
      titre: "Defence Industry & Aerospace",
      priorite: "high",
      resume: "The $81.8 B over 5 years is unprecedented. The Defence Industrial Strategy ($6.6 B) explicitly builds Canadian capacity rather than defaulting to foreign procurement. The new Defence Investment Agency streamlines procurement. The sovereign AI ($925 M) and quantum ($334 M) investments are direct opportunities for Canadian tech firms in dual-use applications.",
      enjeux: [
        "Defence Industrial Strategy ($6.6 B): position early in the consultation process — it explicitly targets domestic firms",
        "Defence Investment Agency: new procurement body — understand the new rules of engagement early",
        "F-35 and major equipment programs: $17.9 B for new capabilities — which Canadian firms benefit?",
        "Cyber defence ($10.9 B digital infrastructure): significant opportunity for Canadian cybersecurity companies",
        "Arctic Economic and Security Corridor: major construction and logistics opportunities",
        "Sovereign AI ($925 M): Canadian companies can access new supercomputing infrastructure for development",
      ],
      tags: ["defence", "aerospace", "procurement", "AI", "cyber", "Arctic"]
    },
    {
      id: "construction-housing",
      titre: "Construction & Real Estate Industry",
      priorite: "high",
      resume: "The scale is extraordinary — $280 B in capital spending over 5 years, plus Build Communities Strong ($51 B over 10). The constraint is not funding but capacity: the skilled trades shortage is the binding constraint on delivery. The one-time 33,000 permanent residency acceleration for temp workers is a direct response. Build Canada Homes ($13 B) is the core housing play.",
      enjeux: [
        "Build Canada Homes ($13 B + $80 B CMB expansion): position to participate in purpose-built rental and affordable development",
        "Major Projects Office: understand the project selection criteria — 'national interest' projects get regulatory fast-tracking",
        "Build Communities Strong ($51 B/10 yr): local infrastructure contracts — housing-enabling water, transit, health",
        "Trades workforce: 33,000 temp worker pathway to PR — opportunity to secure skilled labour pipeline",
        "Productivity Super-Deduction: applies to construction equipment — model the tax benefit for capital decisions",
        "Arctic Infrastructure Fund ($1 B): specialized northern construction opportunities",
      ],
      tags: ["construction", "housing", "Build-Canada-Homes", "trades", "MPO", "Arctic"]
    },
    {
      id: "energy-sector",
      titre: "Energy Sector & Natural Resources",
      priorite: "high",
      resume: "The oil and gas emissions cap is effectively scrapped — a significant regulatory relief. LNG gets a new capital cost allowance. The CCS emphasis signals the government's view: produce and export, but invest in clean-up technologies. Clean economy ITCs (Clean Electricity, Hydrogen, Clean Tech Manufacturing) create investment incentives across the energy spectrum. The 'energy superpower' framing is both opportunity and pressure to deliver.",
      enjeux: [
        "Oil and gas emissions cap abandoned: understand the new regulatory framework — CCS and methane regs replace mandated caps",
        "LNG CCA: new capital cost allowance signals federal support for LNG infrastructure investment",
        "Clean Technology ITC extended to 2034: plan multi-year capex cycles around this incentive",
        "CCS at scale: federal emphasis creates market opportunity — position Canadian CCS technology and services",
        "Critical minerals ($214 M): align with federal priorities for project approvals through MPO",
        "Arctic Economic and Security Corridor: dual-use energy corridor investment opportunities",
      ],
      tags: ["energy", "LNG", "CCS", "oil-gas", "clean-energy", "critical-minerals"]
    },
    {
      id: "health-organizations",
      titre: "Health Sector & Hospitals",
      priorite: "high",
      resume: "The $5 B Health Infrastructure Fund is the most direct federal signal to the health sector in years. It funds hospitals, ERs, urgent care and medical schools — capital, not operations. The indirect effects of Build Communities Strong on community health infrastructure are significant. Federal operational health spending is restrained under the 1%/year cap.",
      enjeux: [
        "Health Infrastructure Fund ($5 B/3 yr): apply immediately — capital for hospitals, ERs, urgent care and medical schools",
        "Build Communities Strong: understand the health-facility eligibility within the $51 B fund",
        "Primary care: $1.3 B for international researchers addresses physician supply — long-term pipeline",
        "Automatic tax filing for 5.5 M Canadians: more people will access health-related benefits — prepare for increased uptake",
        "ESDC AI automation: federal health benefit delivery becoming more digital — prepare integration",
        "Operational spending cap (under 1%/year): federal health transfers will not grow rapidly — advocate for provincial allocation",
      ],
      tags: ["health", "hospitals", "infrastructure", "primary-care", "benefits"]
    },
    {
      id: "indigenous-organizations",
      titre: "Indigenous Organizations & First Nations",
      priorite: "high",
      resume: "Clean water ($2.3 B) is real and significant. The Arctic Infrastructure Fund ($1 B) and the increased Canada Infrastructure Bank target ($3 B for Indigenous infrastructure) are positive signals. But Indigenous organizations are right to flag the ISC/CIRNAC cuts, the absence of new housing money beyond 2022 commitments, and the uncertainty about Jordan's Principle funding beyond 2025-26.",
      enjeux: [
        "Clean water program ($2.3 B/3 yr): confirm application process and timeline for your community",
        "Arctic Infrastructure Fund ($1 B): Indigenous partnership requirements — engage MPO early",
        "Canada Infrastructure Bank target ($3 B for Indigenous): understand eligibility criteria for community-owned projects",
        "Jordan's Principle: no guaranteed funding beyond 2025-26 — urgent advocacy for multi-year commitment",
        "ISC/CIRNAC cuts: identify which specific programs are cut and their impact on community services",
        "Major Projects fast-tracking: $10.1 M for Indigenous consultations — ensure your community is in the process",
      ],
      tags: ["indigenous", "clean-water", "Arctic", "Jordan's-Principle", "housing", "consultation"]
    },
    {
      id: "tech-innovation",
      titre: "Technology & Innovation Sector",
      priorite: "high",
      resume: "Budget 2025 explicitly positions Canada as a technology sovereignty play. Sovereign AI ($925 M), quantum ($334 M), defence tech ($6.6 B Industrial Strategy) and the METR reduction create a significant opportunity for Canadian tech firms. The $1.3 B for international researchers and the talent attraction strategy address the skills supply constraint. The Office of Digital Transformation will be a major government customer for Canadian tech.",
      enjeux: [
        "Sovereign AI infrastructure ($925 M): access to Canadian supercomputing — apply to the program early",
        "Quantum technologies ($334 M dual-use): link defence and civilian applications for maximum funding eligibility",
        "SR&ED enhanced: $4.5 M limit, extended to small public corps — model the impact on your R&D spending",
        "METR reduction (15.6% → 13.2%): significant improvement for capital-intensive tech companies",
        "Office of Digital Transformation: major procurement customer for AI and digital solutions",
        "International researchers ($1.3 B): recruit now — federal incentives support bringing top talent to Canada",
      ],
      tags: ["tech", "AI", "quantum", "SR&ED", "innovation", "talent"]
    },
  ],

  glossaire: [
    { terme: "Capital budgeting framework", def: "Canada's new approach to federal accounting, introduced in Budget 2025. Separates day-to-day operational spending (salaries, programs) from long-term capital investment (infrastructure, defence equipment). The operational budget will balance within 3 years. Capital deficits are treated as investment, not waste. A first for Canada — similar to how businesses account for capital assets." },
    { terme: "Productivity Super-Deduction", def: "Budget 2025's signature business tax measure. Allows companies to immediately write off the full cost of manufacturing and processing buildings, plus accelerated depreciation on machinery, equipment and digital tools including AI. Designed to make Canada's investment environment more competitive than the US." },
    { terme: "Major Projects Office (MPO)", def: "Created by PM Carney in August 2025 to fast-track projects of 'national interest' through streamlined regulatory approvals. Projects qualify if they strengthen sovereignty, provide economic benefits, respect Indigenous interests, and contribute to clean growth. The Alto High-Speed Rail and Arctic Corridor are early flagship projects." },
    { terme: "Build Canada Homes", def: "Federal program investing $13 B to 'supercharge' housing supply through low-cost financing for builders, incentives for purpose-built rental construction, and skilled workforce expansion. Works alongside the $80 B expanded Canada Mortgage Bond limit to leverage private capital for multi-unit housing." },
    { terme: "METR (Marginal Effective Tax Rate)", def: "A measure of the true tax burden on a new investment, accounting for all corporate taxes. Budget 2025 aims to lower Canada's METR from 15.6% to 13.2% — the stated goal is to be more competitive than the US for attracting investment." },
    { terme: "Clean economy ITCs", def: "A suite of federal investment tax credits for clean technology: Clean Technology ITC (in effect since 2023), Clean Electricity ITC, Clean Hydrogen ITC and Clean Technology Manufacturing ITC. All advancing in Budget 2025. They provide a percentage of capital cost as a tax credit for qualifying investments." },
    { terme: "SR&ED (Scientific Research & Experimental Development)", def: "Canada's main R&D tax incentive program. Budget 2025 enhances it: the 35% enhanced credit expenditure limit raised to $4.5 M, and the refundable credit extended to small public corporations. A key tool for tech and manufacturing companies investing in innovation." },
    { terme: "Arctic Economic and Security Corridor", def: "A suite of all-weather land and port-to-port infrastructure projects in Canada's North. Dual purpose: strengthens military deterrence and sovereignty; enables civilian economic development including critical minerals and trade. Includes deepwater ports, all-season roads, energy corridors and ice-breaking capacity." },
    { terme: "Buy Canadian Policy", def: "New federal procurement policy requiring Crown corporations to prioritize Canadian suppliers, goods and services when domestic options are available. Designed to use government purchasing power as a tool to counter tariff impacts and build Canadian industrial capacity." },
    { terme: "Net debt-to-GDP", def: "Canada's federal net debt expressed as a percentage of annual GDP. At ~42%, Canada has the lowest net debt-to-GDP ratio in the G7 and is one of only two G7 members to maintain a AAA credit rating. This fiscal position is cited as Canada's key advantage in responding to the tariff crisis with large-scale investment." },
  ],

  comparaison: {
    annee_precedente: "2024-2025",
    elements: [
      { label: "Federal deficit", avant: "$42 B (previous Liberal forecast)", apres: "-$78.3 B", direction: "down" },
      { label: "Defence spending", avant: "~1% of GDP", apres: "2% of GDP (NATO target met)", direction: "up" },
      { label: "Capital plan scope (5 yr)", avant: "~$100 B range", apres: "$280 B", direction: "up" },
      { label: "Consumer carbon price", avant: "Active (~$65/tonne)", apres: "Eliminated", direction: "neutral" },
      { label: "Federal public service", avant: "~430,000 positions", apres: "-40,000 by 2029 (~10%)", direction: "neutral" },
      { label: "First tax bracket", avant: "15%", apres: "14.5% (2025) → 14% (2026)", direction: "up" },
      { label: "Net debt-to-GDP", avant: "~42%", apres: "~42-43%", direction: "down" },
    ]
  },

  sources: {
    plan: "https://budget.canada.ca/2025/report-rapport/pdf/budget-2025.pdf",
    bref: "https://budget.canada.ca/2025/home-accueil-en.html",
  },

  notebook: {
    url: "",
    label: "Explore the Federal Budget Notebook",
    note: "NotebookLM by Google · Free · Google account required",
  },
};
