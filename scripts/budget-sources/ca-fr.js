// =========================================================
// BUDGET FÉDÉRAL DU CANADA 2025 — DONNÉES FRANÇAISES
// « Un Canada fort »
// Ministre des Finances : François-Philippe Champagne
// Premier ministre : Mark Carney
// Déposé : 4 novembre 2025
// =========================================================

const BUDGET_FR = {
  lang: "fr",
  annee: "2025-2026",
  titre: "Budget fédéral 2025",
  titre_complet: "Un Canada fort",
  date_depot: "4 novembre 2025",
  ministre: "François-Philippe Champagne",
  premier_ministre: "Mark Carney",
  status: "live",

  quote: {
    texte: "Nous ne transformerons pas notre économie facilement ni en quelques mois — il faudra quelques sacrifices et du temps. Mais nous allons bâtir ce pays comme jamais auparavant. Nous sommes le vrai nord, fort et libre.",
    auteur: "Mark Carney",
    titre: "Premier ministre du Canada — Budget 2025",
  },

  chiffres: [
    { label: "Déficit 2025-2026", valeur: "-78,3 G$", note: "~2,5 % du PIB — presque le double des prévisions de l'an dernier", variation: "Se réduit à 56,6 G$ d'ici 2029-2030", direction: "down" },
    { label: "Nouvelles dépenses (5 ans)", valeur: "141 G$", note: "Compensées en partie par 60 G$ d'économies", variation: "Défense, infrastructure, logement, réductions d'impôt", direction: "neutral" },
    { label: "Plan capital (5 ans)", valeur: "280 G$", note: "Infrastructure 115 G$ · Productivité 110 G$", variation: "Le plus grand plan capital fédéral de l'histoire", direction: "up" },
    { label: "Défense (5 ans)", valeur: "81,8 G$", note: "Cible OTAN de 2 % atteinte cette année — 5 % d'ici 2035", variation: "+72 G$ en nouveaux fonds", direction: "up" },
    { label: "Dette nette/PIB", valeur: "~42 %", note: "La plus basse du G7 · Cote de crédit AAA maintenue", variation: "Hausse légère à ~43 % à partir de 2026-2027", direction: "down" },
    { label: "Réductions dans la fonction publique", valeur: "40 000 postes", note: "~10 % de l'effectif fédéral d'ici 2029", variation: "60 G$ d'économies totales sur 5 ans", direction: "neutral" },
  ],

  secteurs: [
    {
      id: "reponse-tarifs",
      titre: "Réponse aux tarifs américains et diversification commerciale",
      depenses: "5 G$ Fonds de réponse stratégique · 5 G$ Corridors de diversification · 1 G$ Agences régionales",
      variation: "Nouveau — thème central du budget 2025",
      priorite: "haute",
      resume: "La guerre commerciale avec les États-Unis est la crise organisatrice de ce budget. Le Canada a perdu ~30 000 emplois manufacturiers depuis le début de 2025. La réponse combine soutien sectoriel direct, investissement dans les corridors commerciaux et diversification loin de la dépendance américaine. L'objectif : doubler les exportations non américaines en une décennie. La crédibilité de cet objectif repose entièrement sur la capacité à construire l'infrastructure et à accélérer les processus réglementaires.",
      points: [
        "5 G$ Fonds de réponse stratégique — reconversion, expansion, accès à de nouveaux marchés pour les secteurs touchés (auto, acier, forêts, agriculture, fruits de mer)",
        "1 G$ sur 3 ans aux Agences de développement régional pour les secteurs touchés par les tarifs",
        "5 G$ Fonds pour les corridors de diversification des échanges — ports, aéroports, rail, routes, infrastructure numérique",
        "Objectif : doubler les exportations non américaines en une décennie",
        "Politique d'achat canadien — les sociétés d'État doivent prioriser les fournisseurs canadiens",
        "85 % du commerce canadien avec les États-Unis demeure sans droits — la meilleure entente de tout partenaire commercial des États-Unis",
        "Réduction du TEMI (taux d'imposition effectif marginal) de 15,6 % à 13,2 %",
        "Taxes de luxe éliminées (aéronefs >100 000 $, bateaux >250 000 $) et taxe sur les logements sous-utilisés supprimée",
      ],
      tags: ["tarifs", "commerce", "États-Unis", "fabrication", "diversification", "exportations", "achat-canadien"]
    },
    {
      id: "nation-building",
      titre: "Infrastructure nationale et grands projets",
      depenses: "280 G$ capital (5 ans) · 51 G$ Bâtir des communautés fortes (10 ans) · 5 G$ Corridors",
      variation: "Le plan d'infrastructure fédéral le plus ambitieux de l'histoire canadienne",
      priorite: "haute",
      resume: "Les grands projets nationaux sont la signature de Carney — un écho délibéré à l'ère du Canadien Pacifique. Le Bureau des grands projets (BGP) est le véhicule de livraison, créé en août 2025 pour accélérer les projets d'intérêt national. Le train à grande vitesse Alto (Toronto—Québec, ~1 000 km, 300 km/h) est le projet phare. Le Corridor économique et de sécurité de l'Arctique a une double vocation civile et militaire.",
      points: [
        "Bureau des grands projets (BGP) — accélère l'approbation réglementaire des projets d'intérêt national",
        "Train à grande vitesse Alto — Toronto à Québec, ~1 000 km, 300 km/h, divise le temps de trajet par deux",
        "Corridor économique et de sécurité de l'Arctique — routes tout-temps, ports en eau profonde, corridors énergétiques, usage civil et militaire",
        "Port of Churchill Plus — corridor commercial élargi, voie ferrée modernisée, capacité de brise-glace",
        "Fonds Bâtir des communautés fortes — 51 G$ sur 10 ans pour l'infrastructure locale (transport habilitant, eau, santé)",
        "Fonds pour l'infrastructure en santé — 5 G$ sur 3 ans (dans FBCF) — hôpitaux, urgences, soins primaires, facultés de médecine",
        "Fonds pour les corridors de diversification des échanges — 5 G$ sur 7 ans",
        "Fonds pour l'infrastructure arctique — 1 G$ — aéroports, ports, routes, partenariats autochtones",
        "Bureau des grands projets — 213,8 M$ de financement opérationnel sur 5 ans",
      ],
      tags: ["infrastructure", "TGV", "Arctique", "BGP", "ports", "grands-projets"]
    },
    {
      id: "defense-souverainete",
      titre: "Défense et souveraineté",
      depenses: "81,8 G$ sur 5 ans (~72 G$ en nouveaux fonds)",
      variation: "Le plus grand investissement en défense canadien depuis des décennies",
      priorite: "haute",
      resume: "L'investissement le plus spectaculaire du budget 2025. Le Canada atteint la cible de 2 % du PIB de l'OTAN cette année pour la première fois — et s'engage à 5 % d'ici 2035. La Stratégie industrielle de défense parie que les dépenses de défense deviennent un moteur économique, pas seulement un coût de sécurité. Les 925,6 M$ pour l'IA souveraine, les 334,3 M$ pour les technologies quantiques et les nouvelles capacités de cyberdéfense signalent que la défense moderne est indissociable de la souveraineté technologique.",
      points: [
        "20,4 G$ sur 5 ans pour recruter et retenir les Forces armées canadiennes — augmentations salariales générationnelles",
        "19,0 G$ sur 5 ans pour réparer/soutenir les capacités des FAC et l'infrastructure de défense",
        "10,9 G$ sur 5 ans pour l'infrastructure numérique des FAC, MDN et CST — cyberdéfense",
        "17,9 G$ sur 5 ans pour de nouvelles capacités militaires — véhicules, contre-drones, logistique",
        "6,6 G$ Stratégie industrielle de défense — capacité de production nationale, résilience des chaînes d'approvisionnement",
        "Nouvelle Agence d'investissement en défense — simplifie l'approvisionnement",
        "925,6 M$ infrastructure d'IA souveraine pour les chercheurs et entreprises canadiens",
        "334,3 M$ sur 5 ans en technologies quantiques à double usage",
        "182,6 M$ nouvelle capacité de lancement spatial souverain",
        "Garde côtière canadienne transférée au ministère de la Défense nationale",
      ],
      tags: ["défense", "OTAN", "militaire", "souveraineté", "IA", "quantique", "cybersécurité", "Arctique"]
    },
    {
      id: "productivite-innovation",
      titre: "Productivité, innovation et économie propre",
      depenses: "110 G$ productivité/compétitivité (5 ans) · 1,3 G$ chercheurs internationaux · 925 M$ IA",
      variation: "Super-déduction pour la productivité — mesure fiscale phare",
      priorite: "haute",
      resume: "L'écart de productivité du Canada par rapport aux États-Unis s'est creusé depuis une décennie. La super-déduction pour la productivité est la mesure fiscale phare de Carney — déduction immédiate des bâtiments de fabrication et amortissement accéléré sur les machines, équipements et outils numériques incluant l'IA. Le plafond d'émissions pétrole/gaz est effectivement abandonné au profit du CSC et des règlements sur le méthane.",
      points: [
        "Super-déduction pour la productivité — déduction immédiate pour les bâtiments de fabrication, amortissement accéléré sur machines, équipements, IA",
        "Nouveau dégrèvement pour le coût en capital des équipements GNL et bâtiments connexes",
        "RS&DE bonifiée — plafond de crédit à 35 % relevé à 4,5 M$, crédit remboursable étendu aux petites sociétés publiques",
        "Crédit d'impôt pour les technologies propres — en vigueur depuis mars 2023, prolongé jusqu'en 2034",
        "Crédits pour électricité propre, hydrogène propre, fabrication de technologies propres — en avancement",
        "Plafond d'émissions pétrole/gaz effectivement abandonné — CSC, règlements méthane et mécanismes de marché en remplacement",
        "925,6 M$ infrastructure d'IA souveraine — supercalcul canadien sécurisé",
        "1,3 G$ pour attirer des chercheurs internationaux dans les universités canadiennes",
        "TechStat — programme national de mesure de l'IA et de la technologie",
        "Nouveau Bureau de la transformation numérique — adoption de l'IA dans l'ensemble du gouvernement",
        "Objectif : réduire le TEMI de 15,6 % à 13,2 % pour être plus compétitif que les États-Unis",
      ],
      tags: ["productivité", "innovation", "IA", "technologies-propres", "crédits-impôt", "GNL", "CSC", "RS&DE"]
    },
    {
      id: "logement",
      titre: "Logement et infrastructure communautaire",
      depenses: "25 G$ mesures de logement (5 ans) · 13 G$ Construire des logements au Canada · 80 G$ Obligation hypothécaire",
      variation: "Accent sur l'offre — Construire des logements au Canada est le programme phare",
      priorite: "haute",
      resume: "Le logement reçoit 25 G$ en nouvelles mesures sur cinq ans — important mais face à une crise d'une ampleur considérable. Construire des logements au Canada (13 G$) canalise le capital fédéral et le financement à faible coût vers les locatifs et les logements abordables à vocation spécifique. L'expansion du plafond de l'Obligation hypothécaire du Canada à 80 G$/an est le vrai multiplicateur — elle débloque le capital privé pour la construction multilogements.",
      points: [
        "Construire des logements au Canada — 13 G$ de financement fédéral initial, effet de levier sur le capital public et privé",
        "Plafond de l'Obligation hypothécaire du Canada élargi à 80 G$/an — débloque le financement privé pour les loyers multilogements",
        "25 G$ au total en mesures de logement sur 5 ans",
        "Financement à faible coût pour les constructeurs, incitatifs pour la construction locative à vocation spécifique",
        "Initiatives pour la main-d'œuvre en construction — immigration en métiers, formation",
        "Fonds Bâtir des communautés fortes — 51 G$ sur 10 ans incluant l'infrastructure habilitante pour le logement",
        "Cible de la Banque de l'infrastructure du Canada pour les communautés autochtones : de 1 G$ à 3 G$",
        "Taxe sur les logements sous-utilisés éliminée — simplifier le système fiscal, réduire les vacances",
      ],
      tags: ["logement", "locatif", "abordable", "Construire-logements", "OHC", "construction", "métiers"]
    },
    {
      id: "cadre-budgetaire",
      titre: "Cadre budgétaire et revue des dépenses",
      depenses: "Déficit 78,3 G$ · 60 G$ d'économies sur 5 ans · 40 000 coupes dans la fonction publique",
      variation: "Nouveau cadre de comptabilité du capital — une première au Canada",
      priorite: "haute",
      resume: "Le nouveau cadre de comptabilité du capital est l'innovation institutionnelle la plus déterminante de Carney — séparer les dépenses opérationnelles courantes des investissements en capital à long terme. La logique : un hôpital construit aujourd'hui génère de la valeur pendant 50 ans ; le comptabiliser de la même façon qu'un timbre masque l'investissement. Le budget opérationnel s'équilibrera dans trois ans. Le déficit de capital est justifié comme investissement dans la nation.",
      points: [
        "Nouveau cadre de comptabilité du capital — sépare les dépenses opérationnelles des investissements capital (première canadienne)",
        "Budget opérationnel en équilibre dans 3 ans",
        "Déficit fédéral total : 78,3 G$ (2025-2026) → 65 G$ (2026-2027) → 56,6 G$ (2029-2030)",
        "60 G$ d'économies totales sur 5 ans (13 G$ annuellement d'ici 2028-2029)",
        "40 000 coupes dans la fonction publique — retour à un 'niveau durable' d'ici 2029",
        "Croissance des dépenses directes de programme plafonnée sous 1 %/an (vs 8 % en moyenne dernière décennie)",
        "EDSC prévu à 15 % d'économies via automatisation IA, réduction d'empreinte, consolidation de programmes",
        "Dette nette/PIB du Canada : ~42 % — la plus basse du G7 · Cote AAA (seulement 2 membres du G7)",
        "Cycle budgétaire d'automne permanent — l'énoncé économique de printemps remplace le budget de printemps",
      ],
      tags: ["déficit", "cadre-budgétaire", "comptabilité-capital", "revue-dépenses", "fonction-publique", "dette"]
    },
    {
      id: "abordabilite-fiscalite",
      titre: "Abordabilité et allègements fiscaux",
      depenses: "Réduction d'impôt classe moyenne · Taxe carbone éliminée · Déclaration automatique pour 5,5 M de Canadiens",
      variation: "Élimination de la taxe carbone — la plus grande mesure d'abordabilité",
      priorite: "haute",
      resume: "L'élimination de la taxe carbone sur les consommateurs (~18 ¢/L d'économies à l'essence) est la mesure d'abordabilité la plus tangible pour la plupart des Canadiens. La réduction d'impôt pour la classe moyenne (premier palier de 15 % à 14 %) fait économiser jusqu'à 840 $/an aux familles à deux revenus. La déclaration automatique pour 5,5 millions de non-déclarants à faible revenu est discrète mais potentiellement transformatrice.",
      points: [
        "Taxe carbone sur les consommateurs éliminée — ~18 ¢/L d'économies à l'essence dans la plupart des provinces",
        "Premier palier d'imposition réduit : 15 % → 14,5 % (2025) → 14 % (2026) — jusqu'à 840 $/an pour les familles à deux revenus",
        "Déclaration fédérale automatique pour jusqu'à 5,5 M de non-déclarants à faible revenu d'ici 2028",
        "Programme national d'alimentation scolaire rendu permanent — 400 000 enfants, ~800 $/an d'économies pour les familles",
        "Taxes de luxe éliminées — aéronefs > 100 000 $ et bateaux > 250 000 $",
        "Bourse canadienne pour étudiants prolongée (hausses temporaires pour 2025-2026)",
        "SV et SRG : maintenues — prévisions révisées à la baisse (moins de bénéficiaires que prévu)",
      ],
      tags: ["abordabilité", "réduction-impôt", "taxe-carbone", "alimentation-scolaire", "prestations", "SV", "SRG"]
    },
    {
      id: "autochtones",
      titre: "Communautés autochtones et réconciliation",
      depenses: "2,3 G$ eau potable (3 ans) · 2,8 G$ logement confirmé · 1 G$ Fonds arctique",
      variation: "Eau potable et investissements arctiques sont les nouveaux engagements clés",
      priorite: "haute",
      resume: "L'eau potable pour les Premières Nations (2,3 G$) est réelle et significative. Le Fonds pour l'infrastructure arctique (1 G$) inclut explicitement des possibilités de partenariat autochtone. Cependant, les organisations autochtones ont noté les coupes à SPPCC et à RCAANC, l'absence de nouveaux fonds pour le logement au-delà des engagements de 2022, et l'incertitude concernant le financement du Principe de Jordan après 2025-2026.",
      points: [
        "2,3 G$ sur 3 ans pour renforcer l'accès à l'eau potable des Premières Nations",
        "2,8 G$ confirmés pour le logement autochtone urbain, rural et nordique (engagement de 2022)",
        "1 G$ Fonds pour l'infrastructure arctique — possibilités de partenariat autochtones explicitement incluses",
        "Cible de la Banque de l'infrastructure du Canada pour les communautés autochtones : de 1 G$ à 3 G$",
        "10,1 M$ sur 3 ans pour les consultations autochtones sur les grands projets accélérés",
        "Services aux enfants et aux familles des Premières Nations — 348,4 M$ dans les budgets supplémentaires",
        "Programme d'alimentation en eau des Premières Nations renouvelé",
        "Préoccupation : coupes à SPPCC et RCAANC — écart estimé à 425 G$+ pour combler les besoins infrastructurels",
      ],
      tags: ["autochtones", "premières-nations", "eau-potable", "Arctique", "logement", "Principe-Jordan"]
    },
    {
      id: "immigration",
      titre: "Immigration et attraction de talents",
      depenses: "1,3 G$ chercheurs internationaux · Voie accélérée pour 33 000 travailleurs temporaires",
      variation: "Réduction marquée des résidents temporaires — expansion sélective des talents qualifiés",
      priorite: "haute",
      resume: "Le chapitre de l'immigration raconte deux histoires. Le volume global diminue fortement — les résidents temporaires passent de 673 650 à 385 000. Mais les talents de haute valeur reçoivent un traitement de faveur : 1,3 G$ pour recruter 1 000+ chercheurs internationaux, voies accélérées pour les gens de métier, et programme ponctuel pour 33 000 travailleurs à devenir résidents permanents. Le Canada est sélectif, pas fermé.",
      points: [
        "Admissions de résidents temporaires réduites : 673 650 (2025) → 385 000 (2026)",
        "Cibles de résidents permanents stables à 380 000/an (en baisse vs 395 000 en 2025)",
        "Programme ponctuel : 33 000 travailleurs temporaires accélérés vers la résidence permanente (2026-2027)",
        "1,3 G$ pour attirer 1 000+ chercheurs internationaux hautement qualifiés",
        "Stratégie de reconnaissance des qualifications professionnelles pour les gens de métier",
        "Stratégie d'attraction des talents liée aux objectifs de productivité et d'innovation",
        "Immigration recadrée comme 'reprendre le contrôle' — rééquilibrage volume vs qualité",
      ],
      tags: ["immigration", "talents", "chercheurs", "métiers", "travailleurs-temporaires", "résidence-permanente"]
    },
    {
      id: "energie-environnement",
      titre: "Énergie, environnement et transition climatique",
      depenses: "Crédits d'impôt pour l'économie propre · DCC pour le GNL · Accent sur le CSC",
      variation: "Plafond d'émissions pétrole/gaz abandonné — le CSC remplace les plafonds imposés",
      priorite: "haute",
      resume: "La politique climatique du Canada pivote sous Carney. La taxe carbone sur les consommateurs est supprimée. Le plafond d'émissions pétrole/gaz est effectivement abandonné — remplacé par le renforcement des règlements sur le méthane et l'engagement envers la captation et le stockage du carbone (CSC) à grande échelle. Les crédits d'impôt pour l'économie propre continuent et s'élargissent. Le GNL bénéficie d'un nouveau DCC. Le Canada se positionne comme une 'superpuissance énergétique'.",
      points: [
        "Taxe carbone sur les consommateurs éliminée — les provinces avec leurs propres systèmes les maintiennent",
        "Plafond d'émissions pétrole/gaz effectivement abandonné — CSC, règlements méthane, mécanismes de marché",
        "Nouveau dégrèvement pour le coût en capital des équipements GNL — signal d'investissement pour l'infrastructure GNL",
        "Crédit d'impôt pour les technologies propres prolongé jusqu'au 31 décembre 2034",
        "Crédits électricité propre, hydrogène propre, fabrication de technologies propres en avancement",
        "Captation et stockage du carbone (CSC) à grande échelle — outil climatique clé selon le gouvernement",
        "214 M$ pour les projets de minéraux critiques",
        "Canada positionné comme superpuissance énergétique — production, transformation, exportation",
        "Financement du programme 2 milliards d'arbres réduit",
        "Subvention Maisons plus vertes du Canada réduite",
      ],
      tags: ["énergie", "GNL", "CSC", "pétrole-gaz", "technologies-propres", "taxe-carbone", "minéraux-critiques"]
    },
    {
      id: "sante-social",
      titre: "Santé, services sociaux et CBC",
      depenses: "5 G$ Fonds infrastructure santé (3 ans) · 150 M$ CBC/Radio-Canada",
      variation: "Infrastructure en santé significative — programmes sociaux contraints",
      priorite: "haute",
      resume: "L'infrastructure en santé bénéficie d'un fonds dédié de 5 G$ dans le cadre de Bâtir des communautés fortes pour les hôpitaux, les urgences et les facultés de médecine. La croissance des programmes sociaux est contrainte — plafonnée sous 1 %/an. La hausse de 150 M$ pour CBC/Radio-Canada est notable. Les revenus de la déclaration automatique permettront à des millions de personnes à faible revenu d'accéder aux avantages auxquels elles ont droit.",
      points: [
        "5 G$ Fonds pour l'infrastructure en santé sur 3 ans — hôpitaux, urgences, soins urgents, facultés de médecine",
        "150 M$ à CBC/Radio-Canada — maintien du diffuseur public dans un contexte tarifaire et de souveraineté",
        "Programme national d'alimentation scolaire rendu permanent — 400 000 enfants",
        "Dépenses directes de programme plafonnées sous 1 %/an — vraie contrainte sur la croissance des programmes sociaux",
        "SV et SRG : maintenues — prévisions révisées (moins de bénéficiaires que projeté)",
        "Bourse canadienne pour étudiants prolongée pour 2025-2026",
        "Déclaration automatique : 5,5 M de Canadiens à faible revenu accèdent aux avantages auxquels ils ont droit",
      ],
      tags: ["santé", "hôpitaux", "CBC", "alimentation-scolaire", "SV", "SRG", "programmes-sociaux"]
    },
  ],

  audiences: [
    {
      id: "travailleurs",
      titre: "Travailleurs et employés du secteur manufacturier",
      priorite: "haute",
      resume: "Le budget 2025 répond directement aux pertes d'emplois liées aux tarifs (~30 000 emplois manufacturiers perdus depuis le début de 2025, chômage atteignant 7,2 %). Le Fonds de réponse stratégique et le soutien des Agences de développement régional sont les bouées de sauvetage immédiates. La requalification professionnelle et la stratégie d'immigration en métiers constituent la réponse à moyen terme.",
      mesures: [
        { label: "Fonds de réponse stratégique (secteurs touchés)", valeur: "5 G$", note: "Reconversion, nouveaux marchés" },
        { label: "Réduction d'impôt classe moyenne (familles à deux revenus)", valeur: "Jusqu'à 840 $/an", note: "Premier palier 15 % → 14 % d'ici 2026" },
        { label: "Taxe carbone sur les consommateurs éliminée", valeur: "~18 ¢/L", note: "Économies à l'essence" },
        { label: "Reconnaissance des qualifications professionnelles", valeur: "Nouvelle politique", note: "Réduire les obstacles au travail" },
      ],
      tags: ["travailleurs", "fabrication", "tarifs", "compétences", "réduction-impôt"]
    },
    {
      id: "familles",
      titre: "Familles",
      priorite: "haute",
      resume: "Les familles bénéficient de l'élimination de la taxe carbone (économies à l'essence), de la réduction d'impôt sur le revenu, du programme d'alimentation scolaire permanent et de la déclaration automatique pour les non-déclarants à faible revenu. Construire des logements au Canada s'attaque à l'offre de logements. Le signal d'abordabilité cumulatif est réel mais réparti sur plusieurs mesures.",
      mesures: [
        { label: "Taxe carbone éliminée", valeur: "~18 ¢/L à l'essence", note: "Économies immédiates pour les ménages" },
        { label: "Réduction d'impôt (premier palier)", valeur: "Jusqu'à 840 $/an", note: "Familles à deux revenus d'ici 2026" },
        { label: "Programme alimentation scolaire", valeur: "~800 $/an", note: "400 000 enfants — permanent" },
        { label: "Déclaration automatique", valeur: "5,5 M de Canadiens", note: "Non-déclarants à faible revenu reçoivent des prestations automatiquement" },
      ],
      tags: ["familles", "abordabilité", "taxe-carbone", "alimentation-scolaire", "réduction-impôt"]
    },
    {
      id: "aines",
      titre: "Aînés",
      priorite: "haute",
      resume: "La Sécurité de la vieillesse et le SRG sont maintenus. Les prévisions budgétaires ont été révisées à la baisse — moins de bénéficiaires et prestation mensuelle moyenne inférieure à ce qui était projeté, réduisant la pression fiscale. L'élimination de la taxe carbone réduit directement les coûts de chauffage et de transport. L'infrastructure en santé (5 G$) bénéficiera de manière disproportionnée aux aînés.",
      mesures: [
        { label: "SV et SRG", valeur: "Maintenues", note: "Prévisions révisées — moins de bénéficiaires que projeté" },
        { label: "Taxe carbone éliminée", valeur: "~18 ¢/L", note: "Économies sur l'huile de chauffage et l'essence" },
        { label: "Fonds pour l'infrastructure en santé", valeur: "5 G$ (3 ans)", note: "Hôpitaux, urgences, soins" },
        { label: "Déclaration automatique", valeur: "Aînés admissibles", note: "Non-déclarants à faible revenu bénéficient automatiquement" },
      ],
      tags: ["aînés", "SV", "SRG", "santé", "abordabilité"]
    },
    {
      id: "entreprises",
      titre: "Entreprises et investisseurs",
      priorite: "haute",
      resume: "Le budget 2025 est explicitement pro-investissement — réduction du TEMI, super-déduction pour la productivité, crédits d'impôt pour l'économie propre et un pipeline capital de 280 G$ comme marché garanti. La politique d'achat canadien crée des obligations de conformité pour les entreprises qui vendent au gouvernement.",
      mesures: [
        { label: "Réduction du TEMI", valeur: "15,6 % → 13,2 %", note: "Plus compétitif que les États-Unis" },
        { label: "Super-déduction pour la productivité", valeur: "Déduction immédiate", note: "Bâtiments de fabrication, machines, IA" },
        { label: "Pipeline capital (5 ans)", valeur: "280 G$", note: "Marché d'approvisionnement gouvernemental" },
        { label: "RS&DE bonifiée", valeur: "Plafond 4,5 M$", note: "Crédit à 35 %, étendu aux petites sociétés publiques" },
      ],
      tags: ["entreprises", "investissement", "impôt", "approvisionnement", "innovation"]
    },
    {
      id: "industrie-defense",
      titre: "Industrie de la défense et secteur technologique",
      priorite: "haute",
      resume: "Les 81,8 G$ sur 5 ans en défense constituent la plus grande occasion sectorielle de ce budget. La Stratégie industrielle de défense priorise explicitement le renforcement de la capacité nationale — pas seulement l'achat d'équipement étranger. Les 6,6 G$ pour les entreprises canadiennes de défense, les 925 M$ d'infrastructure d'IA souveraine et les 334 M$ de technologies quantiques créent une occasion décennale.",
      mesures: [
        { label: "Investissement total en défense (5 ans)", valeur: "81,8 G$", note: "~72 G$ en nouveaux fonds" },
        { label: "Stratégie industrielle de défense", valeur: "6,6 G$ (5 ans)", note: "Production nationale, chaînes d'approvisionnement" },
        { label: "Infrastructure d'IA souveraine", valeur: "925,6 M$", note: "Supercalcul canadien" },
        { label: "Technologies quantiques (double usage)", valeur: "334,3 M$ (5 ans)", note: "Applications défense + civiles" },
      ],
      tags: ["défense", "IA", "quantique", "approvisionnement", "souveraineté"]
    },
    {
      id: "municipalites",
      titre: "Municipalités et gouvernements locaux",
      priorite: "haute",
      resume: "Bâtir des communautés fortes (51 G$ sur 10 ans) est le programme d'infrastructure municipal fédéral le plus important d'une génération. Les gouvernements locaux auront accès au financement pour le transport habilitant pour le logement, l'eau, les eaux usées et les installations de santé.",
      mesures: [
        { label: "Fonds Bâtir des communautés fortes", valeur: "51 G$ (10 ans)", note: "Logement, transport, eau, santé" },
        { label: "Fonds pour l'infrastructure en santé", valeur: "5 G$ (3 ans)", note: "Dans FBCF — hôpitaux, urgences" },
        { label: "Corridors de diversification des échanges", valeur: "5 G$ (7 ans)", note: "Infrastructure portuaire, aéroportuaire, ferroviaire" },
        { label: "Volet provinces et territoires", valeur: "17,2 G$ (10 ans)", note: "Logement, santé, infrastructure éducative" },
      ],
      tags: ["municipalités", "infrastructure", "logement", "eau", "santé"]
    },
  ],

  parties_prenantes: [
    {
      id: "fabrication-automobile",
      titre: "Fabrication et secteur automobile",
      priorite: "haute",
      resume: "Le Fonds de réponse stratégique (5 G$) et le soutien des Agences de développement régional (1 G$) sont les outils immédiats. La super-déduction pour la productivité et la réduction du TEMI sont les améliorations structurelles. La politique d'achat canadien crée à la fois des occasions (approvisionnement gouvernemental) et des obligations de conformité.",
      enjeux: [
        "Fonds de réponse stratégique (5 G$) : comprendre l'admissibilité — reconversion, expansion et accès à nouveaux marchés sont financés",
        "Super-déduction pour la productivité : grande occasion pour les investissements en capital admissibles",
        "Réduction du TEMI (15,6 % → 13,2 %) : comparer aux taux américains et modéliser les décisions d'investissement",
        "Politique d'achat canadien : revoir les relations de chaîne d'approvisionnement fédérales — la conformité est obligatoire",
        "Corridors de diversification des échanges (5 G$) : défendre les besoins spécifiques en infrastructure commerciale de votre secteur",
        "Agences de développement régional (1 G$) : voie la plus rapide pour un soutien direct aux PME",
      ],
      tags: ["fabrication", "automobile", "tarifs", "impôt", "achat-canadien", "approvisionnement"]
    },
    {
      id: "entrepreneurs-defense",
      titre: "Industrie de défense et aérospatiale",
      priorite: "haute",
      resume: "Les 81,8 G$ sur 5 ans sont sans précédent. La Stratégie industrielle de défense (6,6 G$) construit explicitement la capacité canadienne plutôt que de recourir par défaut aux achats étrangers. La nouvelle Agence d'investissement en défense simplifie l'approvisionnement. L'IA souveraine (925 M$) et le quantique (334 M$) sont des occasions directes pour les entreprises technologiques canadiennes.",
      enjeux: [
        "Stratégie industrielle de défense (6,6 G$) : se positionner tôt dans le processus de consultation — elle cible explicitement les firmes nationales",
        "Agence d'investissement en défense : nouveau responsable de l'approvisionnement — comprendre les nouvelles règles du jeu tôt",
        "F-35 et grands programmes d'équipement : 17,9 G$ pour de nouvelles capacités — quelles entreprises canadiennes en bénéficient?",
        "Cyberdéfense (10,9 G$ infrastructure numérique) : occasion importante pour les entreprises canadiennes de cybersécurité",
        "Corridor économique et de sécurité de l'Arctique : grandes occasions de construction et de logistique",
        "IA souveraine (925 M$) : les entreprises canadiennes peuvent accéder à la nouvelle infrastructure de supercalcul",
      ],
      tags: ["défense", "aérospatiale", "approvisionnement", "IA", "cyber", "Arctique"]
    },
    {
      id: "construction-immobilier",
      titre: "Industrie de la construction et de l'immobilier",
      priorite: "haute",
      resume: "L'envergure est extraordinaire — 280 G$ en capital sur 5 ans, plus Bâtir des communautés fortes (51 G$ sur 10 ans). La contrainte n'est pas le financement mais la capacité : la pénurie de main-d'œuvre en métiers est la contrainte liant la livraison. Le programme ponctuel de résidence permanente pour 33 000 travailleurs temporaires est une réponse directe. Construire des logements au Canada (13 G$) est le jeu central pour le logement.",
      enjeux: [
        "Construire des logements au Canada (13 G$ + expansion OHC à 80 G$) : se positionner pour la construction locative à vocation spécifique",
        "Bureau des grands projets : comprendre les critères de sélection des projets — les projets d'intérêt national bénéficient d'une accélération réglementaire",
        "Bâtir des communautés fortes (51 G$/10 ans) : contrats d'infrastructure locale — eau habilitant le logement, transit, santé",
        "Main-d'œuvre en métiers : programme ponctuel pour 33 000 RP — occasion de sécuriser un pipeline de main-d'œuvre qualifiée",
        "Super-déduction pour la productivité : s'applique aux équipements de construction — modéliser l'avantage fiscal",
        "Fonds pour l'infrastructure arctique (1 G$) : occasions spécialisées de construction nordique",
      ],
      tags: ["construction", "logement", "Construire-logements", "métiers", "BGP", "Arctique"]
    },
    {
      id: "secteur-energie",
      titre: "Secteur de l'énergie et des ressources naturelles",
      priorite: "haute",
      resume: "Le plafond d'émissions pétrole/gaz est effectivement abandonné — un allègement réglementaire significatif. Le GNL bénéficie d'un nouveau DCC. L'accent sur le CSC signale que le gouvernement voit l'avenir comme : produire et exporter, mais investir dans les technologies de nettoyage. Les crédits d'impôt pour l'économie propre créent des incitatifs sur tout le spectre énergétique.",
      enjeux: [
        "Plafond d'émissions pétrole/gaz abandonné : comprendre le nouveau cadre réglementaire — CSC et règlements méthane remplacent les plafonds imposés",
        "DCC pour le GNL : nouveau dégrèvement pour le coût en capital — signal de soutien fédéral aux investissements en infrastructure GNL",
        "Crédit d'impôt technologies propres prolongé à 2034 : planifier les cycles de dépenses en capital pluriannuels autour de cet incitatif",
        "CSC à grande échelle : l'accent fédéral crée une occasion de marché — positionner les technologies et services CSC canadiens",
        "Minéraux critiques (214 M$) : aligner avec les priorités fédérales pour les approbations via le BGP",
        "Corridor économique et de sécurité de l'Arctique : occasions d'investissement dans les corridors énergétiques à double usage",
      ],
      tags: ["énergie", "GNL", "CSC", "pétrole-gaz", "énergie-propre", "minéraux-critiques"]
    },
    {
      id: "organisations-sante",
      titre: "Organisations de santé et hôpitaux",
      priorite: "haute",
      resume: "Le Fonds pour l'infrastructure en santé de 5 G$ est le signal fédéral le plus direct au secteur de la santé depuis des années. Il finance les hôpitaux, les urgences, les soins urgents et les facultés de médecine — du capital, pas des opérations. Les effets indirects de Bâtir des communautés fortes sur l'infrastructure de santé communautaire sont significatifs.",
      enjeux: [
        "Fonds pour l'infrastructure en santé (5 G$/3 ans) : postuler immédiatement — capital pour hôpitaux, urgences et facultés de médecine",
        "Bâtir des communautés fortes : comprendre l'admissibilité des installations de santé dans le fonds de 51 G$",
        "Soins primaires : 1,3 G$ pour chercheurs internationaux — pipeline d'approvisionnement en médecins à long terme",
        "Déclaration automatique pour 5,5 M de Canadiens : davantage de gens accéderont aux prestations — se préparer pour une demande accrue",
        "Automatisation IA à EDSC : prestation des avantages fédéraux plus numérique — préparer l'intégration",
        "Plafond des dépenses de programme (sous 1 %/an) : les transferts fédéraux en santé ne croîtront pas rapidement — défendre l'allocation provinciale",
      ],
      tags: ["santé", "hôpitaux", "infrastructure", "soins-primaires", "prestations"]
    },
    {
      id: "organisations-autochtones",
      titre: "Organisations autochtones et Premières Nations",
      priorite: "haute",
      resume: "L'eau potable (2,3 G$) est réelle et significative. Le Fonds pour l'infrastructure arctique (1 G$) et la cible accrue de la Banque de l'infrastructure du Canada (3 G$ pour les communautés autochtones) sont des signaux positifs. Mais les organisations autochtones ont raison de signaler les coupes à SPPCC et RCAANC, l'absence de nouveaux fonds pour le logement au-delà des engagements de 2022, et l'incertitude sur le Principe de Jordan au-delà de 2025-2026.",
      enjeux: [
        "Eau potable (2,3 G$/3 ans) : confirmer le processus de demande et l'échéancier pour votre communauté",
        "Fonds pour l'infrastructure arctique (1 G$) : exigences de partenariat autochtone — s'engager tôt avec le BGP",
        "Cible de la Banque de l'infrastructure du Canada (3 G$) : comprendre les critères d'admissibilité pour les projets détenus par les communautés",
        "Principe de Jordan : aucun financement garanti au-delà de 2025-2026 — plaidoyer urgent pour un engagement pluriannuel",
        "Coupes à SPPCC/RCAANC : identifier quels programmes spécifiques sont coupés et leur impact sur les services communautaires",
        "Accélération des grands projets : 10,1 M$ pour les consultations autochtones — s'assurer que votre communauté est dans le processus",
      ],
      tags: ["autochtones", "eau-potable", "Arctique", "Principe-Jordan", "logement", "consultation"]
    },
    {
      id: "tech-innovation-org",
      titre: "Secteur technologique et de l'innovation",
      priorite: "haute",
      resume: "Le budget 2025 positionne explicitement le Canada comme un acteur de souveraineté technologique. L'IA souveraine (925 M$), le quantique (334 M$), la tech de défense (6,6 G$ Stratégie industrielle) et la réduction du TEMI créent une occasion significative pour les firmes technologiques canadiennes. Les 1,3 G$ pour les chercheurs internationaux et la stratégie d'attraction de talents s'attaquent à la contrainte d'offre en compétences.",
      enjeux: [
        "Infrastructure d'IA souveraine (925 M$) : accès au supercalcul canadien — postuler au programme tôt",
        "Technologies quantiques (334 M$ double usage) : lier les applications de défense et civiles pour maximiser l'admissibilité au financement",
        "RS&DE bonifiée : plafond 4,5 M$, étendu aux petites sociétés publiques — modéliser l'impact sur vos dépenses en R&D",
        "Réduction du TEMI (15,6 % → 13,2 %) : amélioration significative pour les entreprises technologiques à forte intensité en capital",
        "Bureau de la transformation numérique : grand client d'approvisionnement pour les solutions d'IA et numériques",
        "Chercheurs internationaux (1,3 G$) : recruter maintenant — les incitatifs fédéraux soutiennent l'attraction de talents au Canada",
      ],
      tags: ["tech", "IA", "quantique", "RS&DE", "innovation", "talents"]
    },
  ],

  glossaire: [
    { terme: "Cadre de comptabilité du capital", def: "Nouvelle approche canadienne de la comptabilité fédérale, introduite dans le budget 2025. Sépare les dépenses opérationnelles courantes (salaires, programmes) des investissements en capital à long terme (infrastructure, équipement de défense). Le budget opérationnel s'équilibrera dans 3 ans. Les déficits de capital sont traités comme des investissements. Une première au Canada — similaire à la façon dont les entreprises comptabilisent les actifs immobilisés." },
    { terme: "Super-déduction pour la productivité", def: "Mesure fiscale phare du budget 2025 pour les entreprises. Permet aux sociétés de déduire immédiatement le coût total des bâtiments de fabrication et de transformation, plus l'amortissement accéléré sur les machines, équipements et outils numériques incluant l'IA. Conçue pour rendre l'environnement d'investissement canadien plus compétitif que celui des États-Unis." },
    { terme: "Bureau des grands projets (BGP)", def: "Créé par le PM Carney en août 2025 pour accélérer les projets d'intérêt national via des approbations réglementaires simplifiées. Les projets sont qualifiés s'ils renforcent la souveraineté, procurent des avantages économiques, respectent les intérêts autochtones et contribuent à la croissance propre. Le TGV Alto et le Corridor arctique sont les projets phares." },
    { terme: "Construire des logements au Canada", def: "Programme fédéral investissant 13 G$ pour stimuler l'offre de logements via un financement à faible coût pour les constructeurs, des incitatifs pour la construction locative à vocation spécifique, et l'expansion de la main-d'œuvre en construction qualifiée. Combiné au plafond élargi de l'OHC à 80 G$/an pour mobiliser le capital privé pour la construction multilogements." },
    { terme: "TEMI (Taux d'imposition effectif marginal)", def: "Mesure du vrai fardeau fiscal sur un nouvel investissement, tenant compte de tous les impôts sur les sociétés. Le budget 2025 vise à réduire le TEMI du Canada de 15,6 % à 13,2 % — l'objectif déclaré est d'être plus compétitif que les États-Unis pour attirer les investissements." },
    { terme: "Crédits d'impôt pour l'économie propre", def: "Une suite de crédits d'impôt à l'investissement fédéraux pour les technologies propres : crédit pour les technologies propres (en vigueur depuis 2023), crédit pour l'électricité propre, crédit pour l'hydrogène propre et crédit pour la fabrication de technologies propres. Tous avancent dans le budget 2025." },
    { terme: "RS&DE (Recherche scientifique et développement expérimental)", def: "Principal programme d'incitatifs fiscaux à la R&D du Canada. Le budget 2025 le bonifie : plafond du crédit amélioré à 35 % relevé à 4,5 M$, crédit remboursable étendu aux petites sociétés publiques. Outil clé pour les entreprises technologiques et manufacturières investissant dans l'innovation." },
    { terme: "Corridor économique et de sécurité de l'Arctique", def: "Suite de projets d'infrastructure tout-temps entre terres et ports dans le Nord canadien. Double vocation : renforce la dissuasion militaire et la souveraineté ; permet le développement économique civil incluant les minéraux critiques et le commerce. Comprend des ports en eau profonde, des routes tout-temps, des corridors énergétiques et une capacité de brise-glace." },
    { terme: "Politique d'achat canadien", def: "Nouvelle politique fédérale d'approvisionnement obligeant les sociétés d'État à prioriser les fournisseurs, biens et services canadiens lorsque des options nationales sont disponibles. Conçue pour utiliser le pouvoir d'achat gouvernemental comme outil pour contrer les impacts tarifaires et renforcer la capacité industrielle canadienne." },
    { terme: "Dette nette/PIB", def: "Dette nette fédérale du Canada exprimée en pourcentage du PIB annuel. À ~42 %, le Canada a le ratio dette nette/PIB le plus bas du G7 et est l'un des deux seuls membres du G7 à maintenir une cote de crédit AAA. Cette position fiscale est citée comme l'avantage clé du Canada pour répondre à la crise tarifaire par des investissements à grande échelle." },
  ],

  comparaison: {
    annee_precedente: "2024-2025",
    elements: [
      { label: "Déficit fédéral", avant: "42 G$ (prévision libérale précédente)", apres: "-78,3 G$", direction: "down" },
      { label: "Dépenses de défense", avant: "~1 % du PIB", apres: "2 % du PIB (cible OTAN atteinte)", direction: "up" },
      { label: "Envergure du plan capital (5 ans)", avant: "~100 G$", apres: "280 G$", direction: "up" },
      { label: "Taxe carbone sur les consommateurs", avant: "Active (~65 $/tonne)", apres: "Éliminée", direction: "neutral" },
      { label: "Fonction publique fédérale", avant: "~430 000 postes", apres: "-40 000 d'ici 2029 (~10 %)", direction: "neutral" },
      { label: "Premier palier d'imposition", avant: "15 %", apres: "14,5 % (2025) → 14 % (2026)", direction: "up" },
      { label: "Dette nette/PIB", avant: "~42 %", apres: "~42-43 %", direction: "down" },
    ]
  },

  sources: {
    plan: "https://budget.canada.ca/2025/report-rapport/pdf/budget-2025.pdf",
    bref: "https://budget.canada.ca/2025/home-accueil-fr.html",
  },

  notebook: {
    url: "",
    label: "Explorer le notebook du budget fédéral",
    note: "NotebookLM par Google · Gratuit · Compte Google requis",
  },
};
