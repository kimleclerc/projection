// =========================================================
// ONTARIO BUDGET 2026-2027 — ENGLISH DATA
// "A Plan to Protect Ontario"
// Minister of Finance: Peter Bethlenfalvy
// Tabled: March 25, 2026
// =========================================================

const BUDGET_EN = {
  lang: "en",
  annee: "2026-2027",
  titre: "Ontario Budget 2026",
  titre_complet: "A Plan to Protect Ontario",
  date_depot: "March 25, 2026",
  ministre: "Peter Bethlenfalvy",
  status: "live",

  quote: {
    texte: "We will not only adapt to change — we will lead it. We are building to make Ontario the most competitive economy in the G7. Together, we will protect Ontario.",
    auteur: "Peter Bethlenfalvy",
    titre: "Minister of Finance, Ontario — Budget 2026",
  },

  chiffres: [
    { label: "Deficit 2026-27", valeur: "-$13.8 B", note: "Up from -$12.3 B in 2025-26 — driven by infrastructure investment", variation: "Return to surplus $0.6 B in 2028-29", direction: "down" },
    { label: "Path to balance", valeur: "2028-29", note: "Surplus of $0.6 B — one year later than 2025 Budget projected", variation: "Deficit $6.1 B in 2027-28", direction: "up" },
    { label: "Capital plan (10 yr)", valeur: "$210 B+", note: "Most ambitious provincial capital plan in Canadian history", variation: "$37 B in 2026-27 alone", direction: "up" },
    { label: "GDP growth (2025 actual)", valeur: "1.2%", note: "Better than expected — 2025 Budget projected 0.8%", variation: "1.0% projected for 2026", direction: "up" },
    { label: "Net debt-to-GDP", valeur: "~39%", note: "Remains below 40% target — strong fiscal position", variation: "Stable through medium term", direction: "neutral" },
    { label: "Tariff relief (since Apr 2025)", valeur: "~$30 B", note: "Total relief and support for workers and businesses", variation: "Protect Ontario Financing Program + deferrals", direction: "neutral" },
  ],

  secteurs: [
    {
      id: "tariffs-economy",
      titre: "Tariff Response & Economic Competitiveness",
      depenses: "~$30 B since April 2025 · $4 B Protect Ontario Account Investment Fund",
      variation: "Continued from 2025 — deepened and expanded",
      priorite: "high",
      resume: "Ontario has now committed nearly $30 billion in relief since April 2025. The new Protect Ontario Account Investment Fund ($4 B with private sector co-investment) is the signature new measure — targeting AI, defence, advanced manufacturing, life sciences and critical minerals. The Buy Ontario Act makes domestic procurement mandatory. NextStar's Windsor battery plant grand opening March 5, 2026 is the flagship EV win.",
      points: [
        "Protect Ontario Account Investment Fund: up to $4 B, partnered with a private investment manager — AI, defence, advanced manufacturing, life sciences, critical minerals",
        "NextStar Energy battery plant grand opening March 5, 2026 — 1,300 workers, 1,200 more at full capacity, $5 B investment",
        "PowerCo gigafactory St. Thomas on track — PowerCo's third and largest project globally",
        "Vianode $3.2 B synthetic graphite plant in St. Thomas — first large-scale North American facility",
        "Asahi Kasei $1.6 B lithium-ion battery separator plant in Port Colborne — production starts 2027",
        "Buy Ontario Act — mandatory domestic procurement for provincially funded projects",
        "$85 M Ontario Automotive Modernization Program (O-AMP) and OVIN for auto suppliers",
        "Ontario Together Trade Fund: additional $100 M in November 2025 — interprovincial customers, supply chain reshoring",
        "Tax deferrals: $9 B in liquidity relief April to October 2025",
        "Protect Ontario Workers Employment Response (POWER) Centres — helped nearly 15,000 workers",
        "$500 M joint investment with federal government for Algoma Steel (Ontario $100 M loan)",
      ],
      tags: ["tariffs", "auto", "EV", "battery", "manufacturing", "competitiveness", "Buy-Ontario"]
    },
    {
      id: "tax-competitiveness",
      titre: "Tax Action Plan & Competitiveness",
      depenses: "Multi-year — nearly $10 B in estimated annual cost savings for businesses",
      variation: "New multi-year Tax Action Plan announced",
      priorite: "high",
      resume: "The multi-year Tax Action Plan is positioned as Ontario's structural answer to US tariff competitiveness — the goal is making Ontario the most competitive jurisdiction in the G7. Ontario is also the first province to remove all Party-Specific Exemptions under the Canadian Free Trade Agreement, and the 'As of Right' labour mobility rules are the first in Canada.",
      points: [
        "Multi-year Tax Action Plan — attract investment, encourage growth, support job creation",
        "Nearly $10 B in estimated annual business cost savings and supports",
        "Ontario first province to remove all Party-Specific Exemptions under Canadian Free Trade Agreement (CFTA)",
        "First-in-Canada 'As of Right' labour mobility rules — break down interprovincial barriers for workers",
        "One Project, One Process framework — speeds up mining approvals (Frontier Lithium PAK, Canada Nickel Crawford, Kinross Gold Great Bear)",
        "HST rebate for new homes: remove 8% provincial portion for homes up to $1 M — up to $80,000 relief, maintained to $1.5 M",
        "Gasoline and fuel tax cuts made permanent — $2.1 B saved since July 2022",
        "Highway 407 East tolls permanently removed — saving commuters ~$7,200 annually",
        "One Fare program extended two additional years",
      ],
      tags: ["tax", "competitiveness", "G7", "trade", "labour-mobility", "HST", "housing"]
    },
    {
      id: "infrastructure-transit",
      titre: "Infrastructure & Transit",
      depenses: "$210 B+ over 10 years · Transit $63 B · Highways $31 B · $37 B in 2026-27",
      variation: "Expanded from $200 B — construction actively underway",
      priorite: "high",
      resume: "Construction is now actively underway on the major projects announced in 2025. Highway 413 has broken ground. The Finch West LRT and Eglinton Crosstown LRT have opened. Ring of Fire road construction starts June 2026 — five years ahead of schedule. The Northlander returns in 2026. Ontario has opened two new transit lines in Toronto.",
      points: [
        "Transit: $63 B over 10 years — Ontario Line (excavation at Queen Station), Scarborough Subway (first 3 stations breaking ground), Eglinton Crosstown West, Yonge North",
        "Finch West LRT and Eglinton Crosstown LRT now open",
        "Hamilton LRT and Hazel McCallion Line advancing — Brampton portion to be tunnelled",
        "Highway 413: construction started — saves drivers up to 30 min each way",
        "Bradford Bypass: construction started — saves 35 min in travel time",
        "Ring of Fire road access: construction starts June 2026, roads open November 2030 — five years ahead of schedule",
        "Northlander reinstated in 2026 — Northern Ontario to Toronto service",
        "Highway 401 tunnel expressway feasibility — fieldwork starting spring 2026",
        "Highway 69 widening Parry Sound to Sudbury; Highway 3 Essex to Leamington",
        "GO Transit: extensions to Kitchener (first-ever weekend service), Niagara, Bowmanville",
        "Nearly $1 B for 55 new TTC Line 2 subway trains manufactured in Thunder Bay",
        "$850 M to refurbish GO Transit rail cars",
      ],
      tags: ["transit", "highways", "Hwy-413", "Bradford-Bypass", "Ring-of-Fire", "Northlander", "LRT"]
    },
    {
      id: "health",
      titre: "Health Care",
      depenses: "$64 B hospitals (10 yr) · $3.4 B Primary Care Action Plan (4 yr) · $6.4 B LTC",
      variation: "Expanded hospital capital — flagship new projects announced",
      priorite: "high",
      resume: "Health capital has grown to $64 B over 10 years with nearly $50 B in capital grants — up from $56 B last year. Flagship new projects: Peter Gilgan Mississauga Hospital (largest teaching hospital in Canada), Ottawa Hospital Civic Campus, Fancsy Family Hospital Windsor. LTC: nearly 26,000 beds now approved or under construction.",
      points: [
        "$64 B health infrastructure over 10 years including nearly $50 B in capital grants",
        "Peter Gilgan Mississauga Hospital — largest teaching hospital in Canada, triples existing hospital size, serves 2.2 M people",
        "Ottawa Hospital Civic Campus — lead acute care centre for Ottawa and Eastern Ontario",
        "Fancsy Family Hospital Windsor — consolidates two hospitals, 594 beds including 101 net new",
        "South Niagara Hospital — completion summer 2028, 469 beds, 24/7 emergency and surgical services",
        "LTC: nearly 26,000 beds (164 projects) open, under construction or approved as of February 2026",
        "$3.4 B Primary Care Action Plan over 4 years — connect every Ontarian to a family doctor",
        "$965 M to Ontario Autism Program in 2026-27 including $186 M in new funding",
        "$20 M Liam Riazati Memorial Fund — concrete barriers protecting child care centres",
      ],
      tags: ["health", "hospitals", "LTC", "primary-care", "autism", "Mississauga", "Ottawa", "Windsor"]
    },
    {
      id: "education-postsecondary",
      titre: "Education & Postsecondary",
      depenses: "$30 B schools (10 yr) · $6.4 B postsecondary (new) · $66 M Classroom Supplies Fund",
      variation: "Transformative $6.4 B new postsecondary investment",
      priorite: "high",
      resume: "The signature new education measure: $6.4 B in new funding for postsecondary institutions — colleges, universities and Indigenous Institutes. This addresses the sustainability crisis hitting Ontario's PSE sector. The Classroom Supplies Fund ($750 per elementary homeroom teacher) is a direct and practical gesture for teachers. Schools capital continues at $30 B over 10 years.",
      points: [
        "$6.4 B in new postsecondary funding — ensures sustainability of colleges, universities and Indigenous Institutes",
        "$5.5 B postsecondary capital over 10 years including $2.2 B in capital grants",
        "$30 B in schools and child care capital over 10 years including $22 B in capital grants",
        "New schools: Savant Lake, Orleans (French Catholic), Kitchener (English Catholic), North York (French public), Bradford West Gwillimbury",
        "Classroom Supplies Fund: $66 M — $750 per elementary homeroom teacher per school year",
        "Ontario Electricity Rebate (OER): decreasing monthly residential bills by ~$36",
      ],
      tags: ["education", "postsecondary", "colleges", "universities", "schools", "childcare", "teachers"]
    },
    {
      id: "critical-minerals-energy",
      titre: "Critical Minerals, Energy & Ring of Fire",
      depenses: "Ring of Fire roads construction June 2026 · SMR first in G7 completed",
      variation: "Ring of Fire five years ahead of schedule — SMR milestone achieved",
      priorite: "high",
      resume: "Two historic milestones: Ontario completed the first small modular reactor (SMR) in the G7, and Ring of Fire road construction is now scheduled to begin in June 2026 — five years ahead of schedule. Three major mining projects are accelerating through the One Project, One Process framework. The $4 B Protect Ontario Account Investment Fund explicitly targets critical minerals.",
      points: [
        "First SMR in the G7 completed — Ontario leading nuclear expansion and leveraging nuclear advantage",
        "Ring of Fire road construction starts June 2026, roads open November 2030 — five years ahead of schedule",
        "Agreements with three First Nations + federal co-operation agreement to eliminate assessment duplication",
        "One Project, One Process framework: Frontier Lithium PAK, Canada Nickel Crawford, Kinross Gold Great Bear all accelerating",
        "Protect Ontario Account Investment Fund ($4 B) — critical minerals sector explicitly targeted",
        "Nuclear refurbishments: Darlington, Bruce and Pickering continuing",
        "Ontario Electricity Rebate (OER) keeping bills stable",
        "Ontario calls on federal government to match or exceed $1 B commitment for Ring of Fire infrastructure",
      ],
      tags: ["ring-of-fire", "critical-minerals", "SMR", "nuclear", "energy", "first-nations", "mining"]
    },
    {
      id: "housing",
      titre: "Housing Affordability",
      depenses: "HST rebate up to $80,000 · 1.5 M homes target · Municipal Housing Infrastructure",
      variation: "HST rebate on new homes — up to $80,000 relief",
      priorite: "high",
      resume: "The HST rebate on new homes is the signature housing measure — removing the full 8% provincial portion for homes up to $1 M, maintained to $1.5 M, providing up to $80,000 in relief. This could stimulate thousands of housing starts, support 14,000 construction jobs and add 0.2 pp to Ontario GDP growth. The 1.5 M homes target remains, but housing starts in 2025 actually declined vs projections.",
      points: [
        "HST rebate: remove full 8% provincial portion for new homes up to $1 M — up to $80,000 relief, maintained to $1.5 M",
        "Retroactive to March 20, 2025 for eligible buyers — working with federal government to expand",
        "Could stimulate thousands of housing starts, support 14,000 construction jobs, add 0.2 pp to GDP",
        "1.5 M homes by 2031 target maintained",
        "Housing starts 2025 actual: 65,400 — lower than 2025 Budget projection of 71,800",
        "Municipal Housing Infrastructure Program continues — roads and water systems for growing communities",
        "Advanced Wood Construction Action Plan — mass timber for mid-rise and prefabricated homes",
      ],
      tags: ["housing", "HST-rebate", "1.5M-homes", "construction", "affordability", "mass-timber"]
    },
    {
      id: "justice-safety",
      titre: "Public Safety, Justice & Border Security",
      depenses: "$32.5 M border security grants (2026-27) · expanded correctional capacity",
      variation: "Operation Deterrence 2.0 — significant results from 2025 launch",
      priorite: "high",
      resume: "Operation Deterrence launched January 2025 has produced concrete results: 550+ illegal firearms traced (440+ to the US), 4,152 kg of cocaine and 192 kg of fentanyl seized, 641 charges. Operation Deterrence 2.0 expands this with $32.5 M in new border security grants. Bail reform legislation proposed. Sex Offender and Trafficker Registry may become partially public.",
      points: [
        "Operation Deterrence results: 550+ illegal firearms traced, 4,152 kg cocaine, 192 kg fentanyl seized, 641 charges",
        "Operation Deterrence 2.0 — $32.5 M in 2026-27 for two new border security grant programs",
        "Proposed legislation to strengthen bail system and tighten requirements for violent repeat offenders",
        "Ontario Sex Offender and Trafficker Registry — exploring making part publicly available",
        "Historic investments in correctional capacity — guaranteed space for high-risk repeat offenders",
        "Expanded specialized bail prosecution teams",
        "Getting more police officers — reduced recruitment and training barriers",
        "Modernizing police training facilities",
        "Supporting First Nation policing services",
      ],
      tags: ["justice", "police", "border", "Operation-Deterrence", "bail", "corrections", "trafficking"]
    },
    {
      id: "affordability",
      titre: "Affordability & Cost of Living",
      depenses: "$2.1 B gas tax savings since 2022 · $36/month OER electricity rebate · 407 East tolls gone",
      variation: "Measures made permanent — new HST housing rebate",
      priorite: "high",
      resume: "Affordability measures are about locking in existing gains and adding the housing HST rebate. Gasoline tax cuts are permanent ($2.1 B saved). Highway 407 East tolls are permanently gone (~$7,200/year saved for commuters). One Fare extended two more years. The OER cuts ~$36/month from residential electricity bills. The HST housing rebate is the major new measure.",
      points: [
        "Gasoline and fuel tax cuts permanent — $2.1 B saved since July 2022",
        "Highway 407 East tolls permanently removed — ~$7,200/year savings for commuters",
        "One Fare program extended two additional years",
        "Ontario Electricity Rebate (OER) — ~$36/month reduction for typical residential consumer",
        "Low-Income Energy Assistance Program (LEAP) continues for vulnerable Ontarians",
        "HST rebate on new homes — up to $80,000 relief (see Housing section)",
        "$66 M Classroom Supplies Fund — $750 per elementary homeroom teacher",
      ],
      tags: ["affordability", "gas-tax", "407-tolls", "one-fare", "electricity", "cost-of-living"]
    },
    {
      id: "fiscal-framework",
      titre: "Fiscal Framework & Debt Management",
      depenses: "Deficit $13.8 B (2026-27) · Surplus $0.6 B (2028-29) · $47.2 B borrowing (2026-27)",
      variation: "Deficit higher than 2025 Budget projected — infrastructure-driven",
      priorite: "high",
      resume: "The 2026 deficit ($13.8 B) is higher than the 2025 Budget projected ($7.8 B) — the gap is driven by the expanded capital plan ($37 B in 2026-27) and the $5 B Protect Ontario Account pre-funding. The path to surplus in 2028-29 ($0.6 B) is maintained but depends on economic growth materializing. Ontario's strong credit ratings have produced unprecedented investor demand for Ontario debt.",
      points: [
        "Deficit 2025-26: $12.3 B (better than $14.6 B projected in 2025 Budget)",
        "Deficit 2026-27: $13.8 B — driven by $28 B provincial capital investment and pre-funding",
        "Deficit 2027-28: $6.1 B · Surplus 2028-29: $0.6 B",
        "Net debt-to-GDP remains below 40% target throughout medium term",
        "Long-term borrowing 2026-27: $47.2 B — $58.6 B completed in 2025-26",
        "Strong credit ratings — unprecedented global investor demand for Ontario debt",
        "GDP 2025 actual: 1.2% (better than 0.8% projected) — positive surprise",
        "GDP 2026 projected: 1.0% · 2027: 1.7% · 2028: 1.8%",
        "Unemployment 2025 actual: 7.7% · 2026 projected: 7.4%",
      ],
      tags: ["deficit", "debt", "fiscal", "GDP", "borrowing", "credit-rating", "surplus"]
    },
  ],

  audiences: [
    {
      id: "workers",
      titre: "Workers & Job Seekers",
      priorite: "high",
      resume: "Budget 2026 continues the aggressive tariff protection for workers. POWER Centres helped 15,000 workers in 2025. The EV battery sector now has concrete wins — NextStar opened in Windsor with 1,300 workers and more coming. The labour mobility reforms mean workers can work across provinces more easily.",
      mesures: [
        { label: "POWER Centres (laid-off workers)", valeur: "15,000 helped", note: "Since launch — referrals to Employment Ontario" },
        { label: "NextStar Windsor — jobs created", valeur: "1,300+", note: "2,500 at full capacity" },
        { label: "Gas tax savings (permanent)", valeur: "$2.1 B since 2022", note: "For workers commuting" },
        { label: "Labour mobility 'As of Right'", valeur: "First in Canada", note: "Work across provinces without re-certification" },
      ],
      tags: ["workers", "EV", "manufacturing", "tariffs", "labour-mobility", "POWER"]
    },
    {
      id: "families",
      titre: "Families",
      priorite: "high",
      resume: "New HST rebate on homes (up to $80,000) is the big family measure. Electricity bills down ~$36/month. 407 East tolls gone permanently. One Fare extended. The Liam Riazati Fund protects children in childcare centres. Autism funding gets $965 M.",
      mesures: [
        { label: "HST rebate on new homes", valeur: "Up to $80,000", note: "Homes up to $1 M · maintained to $1.5 M" },
        { label: "Electricity Rebate (OER monthly)", valeur: "~$36/month", note: "Typical residential consumer" },
        { label: "407 East toll savings (annual)", valeur: "~$7,200", note: "Permanently removed" },
        { label: "Ontario Autism Program 2026-27", valeur: "$965 M", note: "Including $186 M new funding" },
      ],
      tags: ["families", "housing", "HST", "electricity", "autism", "childcare"]
    },
    {
      id: "seniors",
      titre: "Seniors",
      priorite: "high",
      resume: "Long-term care is the defining issue — nearly 26,000 beds now approved or under construction of the 58,000 target. Primary care ($3.4 B over 4 years) benefits seniors disproportionately. The OER electricity rebate directly reduces heating costs.",
      mesures: [
        { label: "LTC beds approved/under construction", valeur: "26,000", note: "164 projects as of February 2026" },
        { label: "LTC beds target by 2028", valeur: "58,000", note: "$6.4 B since 2019" },
        { label: "Primary Care Action Plan", valeur: "$3.4 B / 4 yr", note: "Connect every Ontarian to a family doctor" },
        { label: "Electricity Rebate (OER)", valeur: "~$36/month", note: "Heating cost relief" },
      ],
      tags: ["seniors", "LTC", "primary-care", "electricity"]
    },
    {
      id: "businesses",
      titre: "Businesses & Employers",
      priorite: "high",
      resume: "Nearly $10 B in annual cost savings and supports. Tax Action Plan in multi-year mode. Buy Ontario Act creates compliance requirements but also procurement opportunities. The $4 B Protect Ontario Account Investment Fund targets high-growth sectors. One Project One Process fast-tracks mining permits.",
      mesures: [
        { label: "Annual business cost savings & supports", valeur: "~$10 B", note: "Through various programs since 2018" },
        { label: "Protect Ontario Account Investment Fund", valeur: "$4 B", note: "AI, defence, advanced manufacturing, life sciences" },
        { label: "Tax deferrals (liquidity relief)", valeur: "$9 B", note: "April–October 2025 — completed" },
        { label: "Ontario Together Trade Fund (new)", valeur: "+$100 M", note: "November 2025 — interprovincial markets" },
      ],
      tags: ["business", "tax", "investment", "Buy-Ontario", "competitiveness"]
    },
    {
      id: "homebuyers",
      titre: "Homebuyers & Renters",
      priorite: "high",
      resume: "The HST rebate is the biggest housing measure in years — up to $80,000 relief for buyers of new homes. Retroactive to March 20, 2025. Expected to stimulate thousands of housing starts and 14,000 construction jobs. Advanced Wood Construction enables faster, cheaper homebuilding with mass timber.",
      mesures: [
        { label: "HST rebate (new homes up to $1 M)", valeur: "Up to $80,000", note: "8% provincial portion removed · maintained to $1.5 M" },
        { label: "Retroactive date", valeur: "Mar 20, 2025", note: "Working with federal government to confirm" },
        { label: "Housing starts stimulus", valeur: "Thousands", note: "Expected from HST rebate" },
        { label: "Construction jobs supported", valeur: "14,000", note: "From HST rebate measure" },
      ],
      tags: ["housing", "HST-rebate", "homebuyers", "new-homes", "construction"]
    },
    {
      id: "commuters",
      titre: "Commuters & Transit Users",
      priorite: "high",
      resume: "Two new transit lines opened in Toronto. Highway 413 and Bradford Bypass under construction. 407 East tolls permanently gone. One Fare extended two more years. Northlander returns in 2026. GO Transit expanding with weekend service to Kitchener.",
      mesures: [
        { label: "Two new Toronto transit lines", valeur: "Opened 2025-26", note: "Finch West LRT + Eglinton Crosstown" },
        { label: "407 East toll savings", valeur: "~$7,200/yr", note: "Permanently removed" },
        { label: "One Fare extension", valeur: "+2 years", note: "Saves average commuter ~$1,600/year" },
        { label: "Northlander return", valeur: "2026", note: "Northern Ontario — Toronto rail service" },
      ],
      tags: ["transit", "commuters", "407", "one-fare", "GO", "LRT", "Northlander"]
    },
    {
      id: "indigenous",
      titre: "Indigenous Communities",
      priorite: "high",
      resume: "Ring of Fire is the defining moment — construction starts June 2026 with agreements with three First Nations and a federal co-operation agreement. One Project One Process has Indigenous communities engaged in three major mining projects. First Nation policing services funded. Highway partnerships with First Nations continue.",
      mesures: [
        { label: "Ring of Fire road construction", valeur: "Starts June 2026", note: "Agreements with 3 First Nations" },
        { label: "Roads opening", valeur: "November 2030", note: "Five years ahead of original schedule" },
        { label: "Federal duplication eliminated", valeur: "Co-operation agreement", note: "EA and Impact Assessment aligned" },
        { label: "First Nation highway partnerships", valeur: "Renewed", note: "Connecting communities to provincial highway network" },
      ],
      tags: ["indigenous", "ring-of-fire", "first-nations", "mining", "roads", "policing"]
    },
  ],

  parties_prenantes: [
    {
      id: "auto-ev",
      titre: "Auto Sector & EV Manufacturing",
      priorite: "high",
      resume: "The most consequential budget development for the auto sector: NextStar opened. PowerCo is on track. Vianode and Asahi Kasei are investing billions. The auto pact with the federal government protects the $5 B and $7 B battery investments. O-AMP and OVIN are funded. The supply chain is real and growing.",
      enjeux: [
        "NextStar Windsor grand opening March 5, 2026 — 2,500 jobs at full capacity: position suppliers now",
        "PowerCo St. Thomas gigafactory on track — largest PowerCo project globally: supply chain opportunity",
        "Vianode $3.2 B synthetic graphite St. Thomas — production facility timeline to track",
        "Auto pact confirmed for $5 B NextStar + $7 B PowerCo — federal commitment protected",
        "$85 M O-AMP and OVIN: assess eligibility for modernization grants",
        "Buy Ontario Act: review government procurement relationships — compliance mandatory",
      ],
      tags: ["auto", "EV", "battery", "NextStar", "PowerCo", "supply-chain"]
    },
    {
      id: "hospitals",
      titre: "Hospitals & Health Organizations",
      priorite: "high",
      resume: "Health capital grew to $64 B over 10 years with flagship new hospital announcements. Peter Gilgan Mississauga, Ottawa Civic Campus and Fancsy Family Windsor are the headline projects. LTC at 26,000 beds approved — 58,000 by 2028. Primary care ($3.4 B) will change patient flow patterns.",
      enjeux: [
        "Capital now $64 B over 10 years — confirm your hospital's capital approval and operating funding status",
        "Peter Gilgan Mississauga largest teaching hospital in Canada — implications for GTA health system structure",
        "Ottawa Hospital Civic Campus — lead acute care for Eastern Ontario: regional planning implications",
        "LTC: 164 projects at 26,000 beds — if not approved yet, advocacy for the remaining 32,000 beds is urgent",
        "Primary care $3.4 B over 4 years — more Ontarians connected to family doctors changes ED dynamics",
        "Autism: $965 M including $186 M new — confirm access for children and families in your catchment",
      ],
      tags: ["hospitals", "capital", "LTC", "primary-care", "Mississauga", "Ottawa"]
    },
    {
      id: "construction",
      titre: "Construction & Real Estate Industry",
      priorite: "high",
      resume: "The pipeline is real and active — $210 B+ over 10 years with $37 B in 2026-27. Highway 413 and Bradford Bypass are under active construction. Ring of Fire roads start June 2026. The HST rebate will stimulate housing starts. Advanced Wood Construction creates new product demand.",
      enjeux: [
        "$37 B in 2026-27 capital: highest single-year total in Ontario history — position for contracts now",
        "Transit $63 B (10 yr): Ontario Line, Scarborough Subway, LRT projects — all actively moving",
        "HST rebate stimulus: thousands of new housing starts expected — prepare for surge in residential work",
        "Advanced Wood Construction Action Plan: mass timber demand will grow — new supply chain opportunity",
        "Ring of Fire roads June 2026: specialized northern construction opportunity",
        "Labour mobility 'As of Right': workers from other provinces can be hired more easily — address trades shortage",
      ],
      tags: ["construction", "capital", "transit", "housing", "mass-timber", "Ring-of-Fire"]
    },
    {
      id: "municipalities",
      titre: "Municipalities & Regional Governments",
      priorite: "high",
      resume: "The housing HST rebate will stimulate construction activity in growing municipalities. The Buy Ontario Act affects municipal procurement that receives provincial funding. Ring of Fire road construction benefits Northern communities. Municipal Housing Infrastructure Program continues.",
      enjeux: [
        "HST rebate on new homes: residential construction surge expected — ensure planning and permitting capacity",
        "Buy Ontario Act: review procurement practices for provincially funded projects — compliance required",
        "Municipal Housing Infrastructure Program: apply for roads and water system funding",
        "Ring of Fire: First Nation-municipality co-operation on road access and economic development",
        "LRT expansions: Hamilton, Hazel McCallion Line — confirm local infrastructure readiness",
        "Gridlock costs $56 B/year now, $108 B by 2044 — provincial support for local traffic solutions needed",
      ],
      tags: ["municipalities", "housing", "Buy-Ontario", "infrastructure", "Ring-of-Fire", "transit"]
    },
    {
      id: "postsecondary",
      titre: "Colleges, Universities & Indigenous Institutes",
      priorite: "high",
      resume: "The $6.4 B in new postsecondary funding is the most significant sector investment in years — addressing the sustainability crisis directly. Combined with $5.5 B in capital over 10 years, institutions have a framework to plan. The explicit focus on preparing graduates for high-paying careers aligns with the economic competitiveness narrative.",
      enjeux: [
        "$6.4 B new funding: understand disbursement timeline and eligibility criteria for your institution",
        "$5.5 B capital over 10 years including $2.2 B in grants: submit priority capital projects",
        "Mandate: 'sustainable institutions that produce competitive G7 workforce' — align program planning",
        "Indigenous Institutes explicitly included — engagement on specific funding stream",
        "Skills alignment with Protect Ontario Account Investment Fund sectors: AI, defence, advanced manufacturing, life sciences",
        "International student policy context: federal cuts to temporary residents will affect enrolment planning",
      ],
      tags: ["postsecondary", "colleges", "universities", "indigenous-institutes", "sustainability", "skills"]
    },
    {
      id: "mining-critical-minerals",
      titre: "Mining & Critical Minerals Industry",
      priorite: "high",
      resume: "The Ring of Fire timeline acceleration (June 2026 start, November 2030 opening) is transformative. One Project One Process has three major projects accelerating. The $4 B Investment Fund explicitly targets critical minerals. SMR completion gives Ontario unique energy advantage for energy-intensive mining operations.",
      enjeux: [
        "Ring of Fire roads start June 2026: engage NOW with Three First Nations co-signatories and provincial contacts",
        "One Project One Process: Frontier Lithium, Canada Nickel, Kinross are in — apply for your project",
        "Protect Ontario Account Investment Fund ($4 B): critical minerals explicitly targeted — position to attract co-investment",
        "SMR first in G7: Ontario has energy advantage for power-intensive mining and processing operations",
        "Federal co-operation agreement eliminates EA duplication — faster project timelines",
        "Ontario calls on federal government for $1 B+ Ring of Fire match — advocate for federal commitment",
      ],
      tags: ["mining", "ring-of-fire", "critical-minerals", "SMR", "permitting", "indigenous"]
    },
    {
      id: "defence",
      titre: "Defence Industry & Aerospace",
      priorite: "high",
      resume: "Ontario is actively pursuing the Defence, Security and Resilience Bank (DSRB) headquarters for Toronto — expected to create 3,500 direct jobs. The $4 B Protect Ontario Account Investment Fund explicitly targets defence. National defence is called out as an increasingly important pillar of Canada's security and economic resilience.",
      enjeux: [
        "DSRB headquarters bid for Toronto — 3,500 direct jobs plus thousands indirect: engage in bid support",
        "Protect Ontario Account Investment Fund ($4 B): defence explicitly targeted — position for co-investment",
        "Federal defence spending increase to meet NATO commitments: Ontario's aerospace and defence cluster well-positioned",
        "One Project One Process framework: potential application for defence-related infrastructure",
        "Ring of Fire access roads: dual civilian-defence application potential",
        "SMR nuclear completion: Ontario defence/energy nexus strengthened",
      ],
      tags: ["defence", "DSRB", "Toronto", "aerospace", "NATO", "investment"]
    },
  ],

  glossaire: [
    { terme: "Protect Ontario Account Investment Fund", def: "New $4 B fund announced in Budget 2026, partnered with a private investment manager. Targets AI, defence, advanced manufacturing, life sciences, biotechnology and critical minerals. Designed to crowd in pension funds and private capital to advance Ontario's long-term economic priorities." },
    { terme: "Buy Ontario Act", def: "New legislation requiring domestically sourced goods and services in provincially funded projects. Creates compliance requirements for suppliers to government but also major procurement opportunities for Ontario businesses. Direct response to US tariff uncertainty and economic sovereignty concerns." },
    { terme: "One Project, One Process", def: "Framework launched October 2025 to speed up approvals for mining exploration, development and expansion projects. Eliminates duplication between provincial and federal processes. Three major projects already in: Frontier Lithium PAK, Canada Nickel Crawford, Kinross Gold Great Bear." },
    { terme: "Ring of Fire", def: "Chromite, nickel, copper and platinum mineral deposits in Northern Ontario's Far North. Budget 2026 accelerates road construction by 5 years — construction starts June 2026, roads open November 2030. Supported by agreements with three First Nations and federal co-operation agreement." },
    { terme: "HST rebate (new homes)", def: "Ontario removes the full 8% provincial portion of HST for eligible new homes valued at or up to $1 million — up to $80,000 in relief. Relief maintained for homes up to $1.5 M. Retroactive to March 20, 2025. Expected to stimulate thousands of housing starts and support 14,000 construction jobs." },
    { terme: "SMR (Small Modular Reactor)", def: "Ontario completed the first SMR in the G7 — a milestone in nuclear energy. Smaller, faster to build than traditional reactors. Ontario is now pursuing four new SMRs at Darlington. Provides Ontario a unique energy advantage for attracting energy-intensive industries like data centres and mining." },
    { terme: "NextStar Energy", def: "The $5 billion lithium-ion battery cell plant in Windsor, opened March 5, 2026. A joint venture of Stellantis and LG Energy Solution. More than one million battery cells produced and 1,300 workers hired at grand opening, with 1,200 more jobs when fully operational. Canada's first commercial-scale battery facility." },
    { terme: "POWER Centres", def: "Protect Ontario Workers Employment Response Centres. Launched 2025 to provide transition assistance — referrals, access to Employment Ontario programs — for workers affected by tariff-related layoffs. Helped nearly 15,000 workers in 2025." },
    { terme: "Ontario Together Trade Fund (OTTF)", def: "Fund to help Ontario businesses retool and find new markets beyond the US. Additional $100 M invested November 2025 — total now significantly larger. Supports interprovincial customers, trade resilience and supply chain reshoring." },
    { terme: "Operation Deterrence", def: "Ontario's border security framework launched January 2025. Enhanced OPP border enforcement. Results: 550+ illegal firearms traced (440+ from US), 4,152 kg cocaine seized, 192 kg fentanyl seized, 641 charges. Operation Deterrence 2.0 expands this with $32.5 M in new border security grants." },
  ],

  comparaison: {
    annee_precedente: "2025-2026",
    elements: [
      { label: "Deficit", avant: "-$14.6 B (2025 Budget forecast)", apres: "-$13.8 B (2026-27)", direction: "up" },
      { label: "2025-26 deficit (actual)", avant: "-$14.6 B (projected)", apres: "-$12.3 B (actual)", direction: "up" },
      { label: "Capital plan total (10 yr)", avant: "$200 B+", apres: "$210 B+", direction: "up" },
      { label: "Annual capital (current year)", avant: "$33 B (2025-26)", apres: "$37 B (2026-27)", direction: "up" },
      { label: "Hospital capital (10 yr)", avant: "$56 B", apres: "$64 B", direction: "up" },
      { label: "GDP growth (2025 actual)", avant: "0.8% (projected)", apres: "1.2% (actual)", direction: "up" },
      { label: "Path to balance", avant: "2027-28 ($0.2 B)", apres: "2028-29 ($0.6 B)", direction: "down" },
      { label: "LTC beds approved/construction", avant: "23,977 (Apr 2025)", apres: "26,000 (Feb 2026)", direction: "up" },
    ]
  },

  sources: {
    plan: "https://www.ontario.ca/document/2026-ontario-budget",
    bref: "https://www.ontario.ca/page/ontario-budget",
  },

  notebook: {
    url: "",
    label: "Explore the Ontario Budget Notebook",
    note: "NotebookLM by Google · Free · Google account required",
  },
};
