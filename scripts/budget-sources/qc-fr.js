// =========================================================
// BUDGET QUÉBEC 2026-2027 — ANALYSE INDÉPENDANTE
// Source : Budget en bref, Plan budgétaire, Communiqués — 18 mars 2026
// Ministre des Finances : Eric Girard
// Analyse : Kim Leclerc, AUCOIN Stratégie & Communication
// =========================================================

const BUDGET = {
  annee: "2026-2027",
  titre: "Un budget responsable, centré sur les priorités des Québécois",
  date_depot: "18 mars 2026",
  ministre: "Eric Girard",
  tag: "Un budget responsable",

  chiffres: [
    {
      label: "Déficit 2026-2027 (Loi équilibre budgétaire)",
      valeur: "-8,6 G$",
      note: "Après versements au Fonds des générations · chiffre cité dans les médias",
      variation: "Amélioration vs -9,9 G$ en 2025-2026",
      direction: "up"
    },
    {
      label: "Déficit comptable 2026-2027",
      valeur: "-6,3 G$",
      note: "Avant versements au Fonds des générations · 0,9 % du PIB",
      variation: "Révisé à la baisse de 861 M$ vs mars 2025",
      direction: "up"
    },
    {
      label: "Nouvelles initiatives (5 ans)",
      valeur: "9,6 G$",
      note: "1,7 G$ transformation économique + 4,3 G$ missions État + 3,6 G$ gestes ciblés",
      variation: "Budget sobre mais ciblé",
      direction: "up"
    },
    {
      label: "Dette nette",
      valeur: "38,8 % du PIB",
      note: "Au 31 mars 2026 · Baisse de 4,1 pts vs mars 2019",
      variation: "Cible : 35,5 % en 2032-2033 · 32,5 % en 2037-2038",
      direction: "neutral"
    },
    {
      label: "Croissance du PIB réel",
      valeur: "1,1 %",
      note: "Prévision 2026 · Après 0,8 % en 2025",
      variation: "1,4 % prévu pour 2027",
      direction: "up"
    },
    {
      label: "Plan québécois des infrastructures",
      valeur: "167 G$",
      note: "PQI 2026-2036 · Rehaussement de plus de 5 G$ sur six ans",
      variation: "71 % pour maintien des infrastructures existantes",
      direction: "up"
    },
  ],

  secteurs: [
    {
      id: "sante-services-sociaux",
      titre: "Santé et services sociaux",
      depenses: "2,2 G$ (nouvelles initiatives sur 5 ans)",
      variation: "Priorité no 1 du budget",
      priorite: "haute",
      resume: "Le plus gros poste de nouvelles dépenses. Le gouvernement mise sur la consolidation du réseau public et l'accès à la première ligne plutôt que sur de grandes réformes. Pour les organisations de santé, c'est une stabilisation bienvenue — mais les pressions sur les effectifs restent entières.",
      points: [
        "Consolider l'offre de soins et de services dans le réseau public — signal de continuité, pas de révolution",
        "Renforcer l'accès à la première ligne : médecins de famille, GMF, infirmières praticiennes",
        "Réduire les listes d'attente en chirurgie — un engagement récurrent, les indicateurs seront à surveiller",
        "Soutien aux personnes proches aidantes : Plan d'action 2026-2031 complété",
        "Programme d'aide aux RPA prolongé — limite l'effet des hausses de primes d'assurance sur les résidences privées pour aînés",
      ],
      tags: ["santé", "services-sociaux", "aînés", "RPA", "proches-aidants", "première-ligne"]
    },
    {
      id: "securite-justice",
      titre: "Sécurité publique et justice",
      depenses: "1,1 G$ (sur 5 ans)",
      variation: "Hausse significative vs budgets précédents",
      priorite: "haute",
      resume: "Un des postes en plus forte croissance relative. Le gouvernement répond à la montée des crimes organisés, des cyberattaques et de la violence armée. Pour les corps policiers et les acteurs judiciaires, c'est un signal fort d'investissement après des années de sous-financement.",
      points: [
        "Consolider la prévention et l'intervention en sécurité publique — nouvelles ressources pour les corps policiers",
        "Lutte contre les violences armées : équipes spécialisées, renseignement criminel",
        "Cybersécurité gouvernementale : protection des systèmes de l'État",
        "Renforcer l'accès aux services de justice — réduction des délais judiciaires",
        "Contexte : hausse du crime organisé et des cybermenaces justifie cet investissement",
      ],
      tags: ["sécurité-publique", "justice", "cybersécurité", "crimes-armés", "police"]
    },
    {
      id: "education",
      titre: "Éducation",
      depenses: "639 M$ (sur 5 ans)",
      variation: "Accent sur la réussite et l'attractivité de la profession",
      priorite: "haute",
      resume: "Un budget d'urgence autant que de vision : on comble des besoins criants d'espaces scolaires tout en cherchant à attirer et retenir les enseignants. La pénurie de main-d'œuvre en éducation reste le vrai enjeu structurant non résolu.",
      points: [
        "Favoriser la réussite éducative des élèves — soutien individualisé, lutte au décrochage",
        "Combler les besoins urgents et temporaires d'espaces scolaires — réponse à la croissance démographique",
        "Attirer la main-d'œuvre dans le réseau : mesures d'attractivité pour les enseignants et le personnel de soutien",
        "Plafonner à 3 % la croissance de la taxe scolaire en 2026 — soulagement direct pour les propriétaires",
      ],
      tags: ["éducation", "enseignants", "réussite-éducative", "taxe-scolaire", "espaces-scolaires"]
    },
    {
      id: "enseignement-superieur",
      titre: "Enseignement supérieur et main-d'œuvre",
      depenses: "392 M$ (sur 5 ans)",
      variation: "Accent sur le génie, TI et intégration en emploi",
      priorite: "haute",
      resume: "Le gouvernement mise sur les filières stratégiques — génie et TI — pour répondre aux besoins de transformation économique. L'intégration au marché du travail des immigrants et des personnes éloignées de l'emploi est aussi priorisée. Les universités et cégeps attendent des signaux plus forts sur le financement de base.",
      points: [
        "150 M$ pour la promotion et valorisation du génie et des TI — réponse directe à la pénurie",
        "132 M$ pour prolonger les allocations d'aide à l'emploi",
        "Intégration au marché du travail des personnes immigrantes",
        "Développement de la main-d'œuvre autochtone",
        "45 M$ pour la recherche universitaire",
        "Formation des éducatrices en services de garde",
      ],
      tags: ["enseignement-supérieur", "cégep", "université", "génie", "TI", "immigration", "emploi"]
    },
    {
      id: "transformation-economique",
      titre: "Transformation économique et entreprises",
      depenses: "1,7 G$ (sur 5 ans)",
      variation: "Réponse au nouveau contexte commercial mondial",
      priorite: "haute",
      resume: "Le budget mise sur l'adaptation plutôt que la protection. Le gouvernement veut être catalyseur de l'investissement privé, pas une bouée de sauvetage. Les entreprises qui investissent dans des secteurs d'avenir seront soutenues; celles qui attendent des subventions de survie seront déçues.",
      points: [
        "410 M$ pour favoriser l'investissement dans les secteurs d'avenir — catalyseur privé, pas de chèques en blanc",
        "Maintien des sièges sociaux stratégiques au Québec — repreneuriat inclus",
        "Filière des minéraux critiques et stratégiques renforcée — capitalisation additionnelle jusqu'à 2 G$",
        "Fonds de 500 M$ en garanties de prêt pour la participation des communautés autochtones à des projets économiques",
        "Projet de loi no 5 : accélération des autorisations pour les projets prioritaires d'envergure nationale",
        "283 M$ pour soutenir la chaîne d'innovation et l'adoption de technologies de pointe",
      ],
      tags: ["économie", "investissement", "minéraux-critiques", "autochtones", "projets-majeurs", "innovation"]
    },
    {
      id: "pme-regions",
      titre: "PME et régions",
      depenses: "581 M$ (sur 5 ans)",
      variation: "Accent sur le forestier et le bioalimentaire",
      priorite: "haute",
      resume: "Les régions ressources reçoivent un signal clair, surtout le secteur forestier frappé par les tarifs américains sur le bois d'œuvre. Ce n'est pas un chèque en blanc — c'est une réponse ciblée aux crises sectorielles. Les PME en général bénéficient d'un environnement d'affaires amélioré via l'accélération des projets.",
      points: [
        "365 M$ en réponse aux difficultés du secteur forestier — conflit du bois d'œuvre avec les États-Unis",
        "Développement du secteur bioalimentaire et compétitivité agricole",
        "Accélération du développement touristique — investissements dans les attraits",
        "Financement des initiatives de développement économique régional",
        "Zones d'innovation : Technum Québec et District de la construction innovante poursuivis",
      ],
      tags: ["PME", "régions", "forêt", "bois-d'œuvre", "bioalimentaire", "tourisme", "zones-innovation"]
    },
    {
      id: "logement",
      titre: "Logement et accès au toit",
      depenses: "741 M$ (sur 5 ans)",
      variation: "Réponse partielle à la crise du logement",
      priorite: "haute",
      resume: "1 000 logements abordables — c'est mieux que rien, mais très en deçà des besoins. Le gouvernement cible les ménages les plus vulnérables plutôt que le marché en général. Pour les promoteurs et les organismes de logement communautaire, c'est un signal positif mais insuffisant face à l'ampleur de la crise.",
      points: [
        "Construction de 1 000 logements abordables",
        "Sécuriser l'accès à un toit pour les ménages les plus vulnérables",
        "Adaptation et rénovation du parc de logements existant",
        "Programme LogisVert bonifié — lien entre logement et efficacité énergétique",
        "Angle manquant : pas de mesures pour le marché locatif privé ni pour l'accès à la propriété",
      ],
      tags: ["logement", "logement-abordable", "itinérance", "LogisVert", "rénovation"]
    },
    {
      id: "familles-cout-vie",
      titre: "Familles et coût de la vie",
      depenses: "846 M$ (dans 2,4 G$ soutien aux Québécois)",
      variation: "Mesures concrètes et immédiates",
      priorite: "haute",
      resume: "Les deux mesures phares sont concrètes et visibles : 5 000 nouvelles places en garderie subventionnées et le plafond de 3 % sur la taxe scolaire. Ce sont des engagements qui touchent directement le portefeuille des familles. La déclaration automatique de revenus pour les personnes vulnérables est une innovation importante.",
      points: [
        "5 000 places de garde non subventionnées converties en places subventionnées — impact direct dès 2026-2027",
        "Taxe scolaire plafonnée à 3 % de croissance pour 2026 — répit pour les propriétaires",
        "Déclaration automatique de revenus pour certaines clientèles vulnérables — versement automatique des aides fiscales",
        "Appui aux banques alimentaires et organismes communautaires",
      ],
      tags: ["familles", "garderies", "CPE", "taxe-scolaire", "coût-de-la-vie", "aide-fiscale"]
    },
    {
      id: "itinerance-sante-mentale",
      titre: "Itinérance, santé mentale et violence conjugale",
      depenses: "264 M$ itinérance/SM + 260 M$ violences conjugales",
      variation: "Reconnaissance officielle de crises sociales",
      priorite: "haute",
      resume: "Le gouvernement reconnaît officiellement l'ampleur des crises d'itinérance, de santé mentale et de violence conjugale avec des sommes substantielles. Pour les organismes communautaires sur le terrain, c'est une bouffée d'air — mais la pérennité du financement et les délais de mise en œuvre seront déterminants.",
      points: [
        "264 M$ pour l'itinérance et la santé mentale — services de proximité et hébergement d'urgence",
        "260 M$ pour lutter contre les violences conjugale et sexuelle",
        "Rehaussement du soutien aux maisons d'hébergement pour femmes victimes de violence",
        "257 M$ pour renforcer les services aux personnes vulnérables via les organismes communautaires",
      ],
      tags: ["itinérance", "santé-mentale", "violence-conjugale", "organismes-communautaires", "hébergement"]
    },
    {
      id: "culture-medias",
      titre: "Culture, médias et patrimoine",
      depenses: "429 M$ + 217 M$ (sur 5 ans)",
      variation: "Signal fort pour le secteur audiovisuel et les médias",
      priorite: "moyenne",
      resume: "Le secteur culturel et médiatique reçoit un signal fort et bienvenu. Le crédit d'impôt pour les médias d'information est une nouveauté importante qui reconnaît la crise de l'industrie. L'appui à l'audiovisuel via la SODEC et Télé-Québec consolide l'écosystème existant.",
      points: [
        "268 M$ pour l'industrie audiovisuelle (SODEC, Télé-Québec) — maintien de l'écosystème",
        "Nouveau crédit d'impôt pour les médias d'information québécois — aide directe aux médias en crise",
        "Financement de la culture à l'école maintenu (119 M$) — sorties scolaires et activités culturelles",
        "Modernisation du réseau des bibliothèques du Québec",
        "Préservation du patrimoine : Biosphère, Maison St-Pierre, Maison René-Lévesque",
      ],
      tags: ["culture", "médias", "audiovisuel", "SODEC", "patrimoine", "bibliothèques", "crédit-impôt"]
    },
    {
      id: "environnement-climat",
      titre: "Environnement et changements climatiques",
      depenses: "584 M$ (sur 5 ans, dans résilience communautés)",
      variation: "Nouvelles mesures d'adaptation",
      priorite: "moyenne",
      resume: "Le budget mise sur l'adaptation plutôt que la seule atténuation. Le volet adaptation de Rénoclimat et la bonification de LogisVert sont des mesures pratiques qui touchent directement les propriétaires. Ce n'est pas un budget vert — c'est un budget qui intègre le climat comme enjeu transversal.",
      points: [
        "Nouveau volet adaptation du programme Rénoclimat — aide aux propriétaires pour se préparer aux aléas climatiques",
        "Programme LogisVert bonifié — intersection logement abordable et efficacité énergétique",
        "Actions de protection de l'environnement poursuivies dans le cadre des communautés",
        "Lien avec le PQI : 71 % des investissements en maintien — moins de nouvelles constructions énergivores",
      ],
      tags: ["environnement", "changements-climatiques", "Rénoclimat", "LogisVert", "adaptation"]
    },
    {
      id: "infrastructures-pqi",
      titre: "Infrastructures (PQI 2026-2036)",
      depenses: "167 G$ sur 10 ans (+5 G$ sur 6 ans vs PQI précédent)",
      variation: "8e hausse consécutive — record historique",
      priorite: "haute",
      resume: "Le PQI de 167 G$ est le plus important de l'histoire du Québec. Le signal stratégique est clair : 71 % va au maintien des actifs existants, pas à de nouvelles constructions. Pour l'industrie de la construction, c'est un carnet de commandes garanti. Pour les citoyens, c'est la réfection des hôpitaux, des routes et des écoles vieillissants.",
      points: [
        "167 G$ sur 10 ans — hausse de 5 G$ sur 6 ans vs PQI 2025-2035",
        "71 % pour le maintien du parc (105,8 G$) — rénovation plutôt que nouvelles constructions",
        "Secteurs prioritaires : santé/SS, éducation, transport collectif, réseau routier, numérique",
        "19,4 G$ d'investissements annuels en 2026-2027 — maintien à des niveaux historiquement élevés",
        "Deux nouveaux projets majeurs à l'étude : Hôpital Sainte-Croix (Drummondville) et Hôpital de Maria",
        "405 projets de 20 M$+ mis en service depuis 2019-2020, dont 91 en 2025-2026",
      ],
      tags: ["PQI", "infrastructures", "construction", "rénovation", "santé", "transport", "numérique"]
    },
    {
      id: "transports-mobilite",
      titre: "Transports et mobilité durable",
      depenses: "Inclus dans PQI 167 G$ — transport collectif et routier prioritaires",
      variation: "Secteur prioritaire du PQI",
      priorite: "haute",
      resume: "Le transport collectif et le réseau routier sont explicitement nommés comme secteurs prioritaires du PQI 2026-2036. Les grands projets structurants se poursuivent. Pour les usagers du transport en commun, la réfection des réseaux existants prime sur le développement de nouveaux tracés.",
      points: [
        "Transport collectif : développement de réseaux structurants + réfection des réseaux existants",
        "Réseau routier : réfection prioritaire des infrastructures vieillissantes",
        "Secteur transports maritime, aérien, ferroviaire : maintien et remplacement d'équipements",
        "Transformation numérique des organismes publics incluse dans les secteurs prioritaires du PQI",
      ],
      tags: ["transport", "mobilité", "transport-collectif", "routes", "PQI"]
    },
    {
      id: "situation-financiere",
      titre: "Situation financière — trajectoire budgétaire",
      depenses: "Déficit en amélioration constante",
      variation: "Mieux que prévu en 2025-2026",
      priorite: "haute",
      resume: "La bonne nouvelle : le déficit 2025-2026 est révisé à -7,7 G$ (vs -11,4 G$ prévu). C'est une amélioration de 3,8 G$ grâce à une meilleure gestion des dépenses et une croissance du PIB nominal plus forte que prévu. La trajectoire vers l'équilibre en 2029-2030 est maintenue. Le Québec affiche un des déficits les plus bas en proportion du PIB au Canada (-1,2 %).",
      points: [
        "Déficit 2026-2027 : -8,6 G$ selon Loi sur l'équilibre budgétaire / -6,3 G$ comptable (0,9 % du PIB)",
        "Déficit 2025-2026 révisé à -9,9 G$ (Loi) / -7,7 G$ (comptable) — amélioration de ~3,7 G$ vs prévisions mars 2025",
        "Trajectoire Loi : -9,9 G$ (25-26) → -8,6 G$ (26-27) → -5,7 G$ (27-28) → -1,5 G$ (28-29) → +0,4 G$ (29-30)",
        "Retour à l'équilibre maintenu pour 2029-2030 — trajectoire confirmée",
        "Provision pour éventualités : 8,0 G$ sur cinq ans · Écarts à résorber : 750 M$ en 27-28, ~2 G$/an ensuite",
        "Québec parmi les provinces avec le déficit le plus bas en % du PIB (-1,2 % vs moyenne -1,7 %)",
        "PIB réel : 0,8 % en 2025, 1,1 % en 2026, 1,4 % en 2027",
        "Pouvoir d'achat 2018-2024 : +9,2 % au Québec vs +5,1 % en Ontario",
        "Note importante : les écarts à résorber (~2 G$/an après 27-28) ont fait sourciller le vérificateur général",
      ],
      tags: ["finances-publiques", "déficit", "dette", "PIB", "équilibre-budgétaire", "trajectoire"]
    },
  ],

  audiences: [
    {
      id: "familles",
      titre: "Familles avec enfants",
      priorite: "haute",
      resume: "Ce budget est concret pour les familles : 5 000 nouvelles places de garderie subventionnées dès 2026-2027, la taxe scolaire plafonnée à 3 % et des investissements en réussite éducative. C'est un budget qui adresse le coût de la vie directement.",
      mesures: [
        { label: "Nouvelles places CPE subventionnées", valeur: "5 000", note: "Dès 2026-2027 — plus du double de l'an dernier" },
        { label: "Plafond croissance taxe scolaire", valeur: "3 %", note: "Pour 2026 — répit pour les propriétaires" },
        { label: "Réussite éducative", valeur: "639 M$", note: "Sur 5 ans — espaces, attractivité, soutien élèves" },
      ],
      tags: ["famille", "garderies", "CPE", "taxe-scolaire", "éducation"]
    },
    {
      id: "aines",
      titre: "Aînés et proches aidants",
      priorite: "haute",
      resume: "Le budget reconnaît la réalité des proches aidants avec un plan d'action financé et protège les aînés en RPA contre les hausses de primes d'assurance. Les ressources en santé de première ligne visent aussi à mieux soutenir le maintien à domicile.",
      mesures: [
        { label: "Plan proches aidants 2026-2031", valeur: "Complété", note: "Financement confirmé pour 5 ans" },
        { label: "Programme aide RPA", valeur: "Prolongé", note: "Limite la hausse des primes d'assurance" },
        { label: "Santé première ligne", valeur: "2,2 G$ (5 ans)", note: "Accès renforcé aux soins" },
      ],
      tags: ["aînés", "proches-aidants", "RPA", "première-ligne", "maintien-domicile"]
    },
    {
      id: "entrepreneurs-pme",
      titre: "Entrepreneurs et PME",
      priorite: "haute",
      resume: "Le gouvernement veut être catalyseur, pas tuteur. Les PME dans les secteurs d'avenir ont accès à du financement et à un environnement d'affaires accéléré. Le secteur forestier reçoit une aide directe face aux tarifs américains. Ce n'est pas un budget de subventions générales — les entreprises qui transforment leur modèle sont prioritaires.",
      mesures: [
        { label: "Projets d'investissement secteurs d'avenir", valeur: "410 M$", note: "Catalyseur pour l'investissement privé" },
        { label: "PME régions + forêt", valeur: "581 M$", note: "Dont 365 M$ pour le secteur forestier" },
        { label: "Loi no 5 — accélération projets majeurs", valeur: "Adoptée", note: "Processus simplifié et prévisible" },
      ],
      tags: ["PME", "entrepreneurs", "investissement", "forêt", "secteurs-avenir"]
    },
    {
      id: "travailleurs",
      titre: "Travailleurs et chercheurs d'emploi",
      priorite: "haute",
      resume: "Le budget mise sur la formation dans les domaines en demande — génie, TI, construction — et prolonge l'aide à l'emploi. Les travailleurs immigrants et autochtones reçoivent un soutien spécifique à l'intégration. Le défi de la pénurie de main-d'œuvre est reconnu mais les solutions restent partielles.",
      mesures: [
        { label: "Promotion du génie et des TI", valeur: "150 M$", note: "Formation et valorisation des filières stratégiques" },
        { label: "Allocations d'aide à l'emploi", valeur: "132 M$", note: "Prolongation du programme" },
        { label: "Intégration immigrants + autochtones", valeur: "Inclus dans 392 M$", note: "Mesures spécifiques d'intégration" },
      ],
      tags: ["travailleurs", "emploi", "formation", "génie", "TI", "immigrants", "autochtones"]
    },
    {
      id: "locataires",
      titre: "Locataires et personnes en difficulté de logement",
      priorite: "haute",
      resume: "1 000 logements abordables, c'est mieux que rien mais bien insuffisant face à la crise. Le budget cible les ménages les plus vulnérables. Les locataires du marché privé ne voient pas de mesures directes sur les loyers. L'itinérance reçoit 264 M$ — un signal sérieux.",
      mesures: [
        { label: "Nouveaux logements abordables", valeur: "1 000", note: "Construction ciblée sur les ménages vulnérables" },
        { label: "Itinérance et santé mentale", valeur: "264 M$", note: "Services, hébergement d'urgence" },
        { label: "LogisVert bonifié", valeur: "Inclus dans 584 M$", note: "Rénovation et adaptation énergétique" },
      ],
      tags: ["locataires", "logement-abordable", "itinérance", "LogisVert", "ménages-vulnérables"]
    },
    {
      id: "etudiants",
      titre: "Étudiants et jeunes",
      priorite: "moyenne",
      resume: "Le budget cible les filières en demande — génie, TI — et maintient les aides existantes. Pas de réforme de l'aide financière aux études, mais des mesures pour la culture à l'école et la réussite éducative. Les étudiants qui visent les secteurs stratégiques ont des incitatifs clairs.",
      mesures: [
        { label: "Génie et TI — valorisation", valeur: "150 M$", note: "Bourses, promotion, valorisation des filières" },
        { label: "Recherche universitaire", valeur: "45 M$", note: "Appui à la recherche fondamentale et appliquée" },
        { label: "Culture à l'école", valeur: "119 M$", note: "Sorties culturelles, activités artistiques maintenues" },
      ],
      tags: ["étudiants", "jeunes", "génie", "TI", "recherche", "bourses"]
    },
    {
      id: "organismes-communautaires",
      titre: "Organismes communautaires",
      priorite: "haute",
      resume: "Un budget qui reconnaît enfin le rôle central des organismes communautaires dans la réponse aux crises sociales. Violence conjugale, itinérance, banques alimentaires, services aux vulnérables — les sommes sont significatives. L'enjeu sera la pérennité et la rapidité de déploiement.",
      mesures: [
        { label: "Violence conjugale et sexuelle", valeur: "260 M$", note: "Maisons d'hébergement et services spécialisés" },
        { label: "Itinérance et santé mentale", valeur: "264 M$", note: "Services de proximité et hébergement" },
        { label: "Banques alimentaires + services vulnérables", valeur: "257 M$", note: "Appui aux organismes de terrain" },
      ],
      tags: ["organismes-communautaires", "violence-conjugale", "itinérance", "banques-alimentaires", "vulnérables"]
    },
    {
      id: "industrie-culturelle",
      titre: "Acteurs de l'industrie culturelle et médiatique",
      priorite: "moyenne",
      resume: "Un budget généreux pour la culture et les médias. Le nouveau crédit d'impôt pour les médias d'information est une innovation majeure qui reconnaît la crise du secteur. L'audiovisuel et la SODEC sont consolidés. C'est un signal que le gouvernement veut préserver l'écosystème culturel québécois face au numérique.",
      mesures: [
        { label: "Audiovisuel (SODEC, Télé-Québec)", valeur: "268 M$", note: "Appui à la production québécoise" },
        { label: "Crédit d'impôt médias d'information", valeur: "Nouveau", note: "Reconnaissance officielle de la crise des médias" },
        { label: "Culture + patrimoine (total)", valeur: "429 M$ + 217 M$", note: "Enveloppes séparées mais complémentaires" },
      ],
      tags: ["culture", "médias", "audiovisuel", "SODEC", "crédit-impôt", "patrimoine"]
    },
    {
      id: "autochtones",
      titre: "Communautés autochtones",
      priorite: "moyenne",
      resume: "Une des budgets les plus significatifs pour les Premières Nations en termes de participation économique. Le fonds de 500 M$ en garanties de prêt pour participer à des projets économiques est une nouveauté structurante. L'amélioration des services publics et l'intégration en emploi complètent le tableau.",
      mesures: [
        { label: "Fonds garanties de prêt — projets économiques", valeur: "500 M$", note: "Participation financière aux projets économiques" },
        { label: "Amélioration services publics autochtones", valeur: "Inclus dans 1 G$ communautés", note: "Consolidation des services" },
        { label: "Développement main-d'œuvre autochtone", valeur: "Inclus dans 392 M$", note: "Formation et intégration en emploi" },
      ],
      tags: ["autochtones", "Premières-Nations", "projets-économiques", "services-publics", "emploi"]
    },
  ],

  parties_prenantes: [
    {
      id: "associations-patronales",
      titre: "Associations patronales et chambres de commerce",
      priorite: "haute",
      resume: "Un budget qui reconnaît les défis de compétitivité sans verser dans le protectionnisme. L'accélération des autorisations (Loi no 5), le soutien aux secteurs d'avenir et la capitalisation des fonds d'investissement sont des gains concrets. Le financement de l'innovation et des zones d'innovation poursuit la vision de transformation économique.",
      enjeux: [
        "Loi no 5 sur l'accélération des projets : suivre les modalités réglementaires d'application",
        "Secteurs d'avenir : critères d'admissibilité au 410 M$ à décortiquer — quels secteurs sont prioritaires?",
        "Minéraux critiques : capitalisation de 2 G$ — opportunités pour les entreprises de la chaîne de valeur",
        "Innovation et adoption de l'IA : 283 M$ — accès aux programmes à surveiller",
        "Maintien des sièges sociaux : mécanisme de repreneuriat à préciser",
      ],
      tags: ["patronal", "compétitivité", "investissement", "innovation", "projets-majeurs"]
    },
    {
      id: "secteur-sante",
      titre: "Réseau de la santé et des services sociaux",
      priorite: "haute",
      resume: "Les 2,2 G$ sur 5 ans représentent une injection significative mais non révolutionnaire. Santé Québec est consolidée comme structure de gouvernance. Les priorités (première ligne, chirurgies, proches aidants, RPA) correspondent aux revendications du milieu. L'enjeu reste la capacité à livrer avec les effectifs disponibles.",
      enjeux: [
        "Renforcement de la première ligne : opportunité pour les GMF, IPS et CLSC de réclamer des ressources",
        "Réduction listes d'attente chirurgicales : indicateurs à surveiller — le gouvernement devra rendre des comptes",
        "Plan proches aidants 2026-2031 : modalités de financement des organismes de soutien à préciser",
        "RPA : prolongation du programme d'aide — répit temporaire, pas de solution structurelle",
        "PQI santé : projets majeurs (Hôpital Sainte-Croix, Hôpital de Maria) — occasions de lobbying pour d'autres projets",
      ],
      tags: ["santé", "réseau", "Santé-Québec", "première-ligne", "RPA", "proches-aidants"]
    },
    {
      id: "secteur-construction",
      titre: "Industrie de la construction",
      priorite: "haute",
      resume: "Le PQI de 167 G$ est la meilleure nouvelle de ce budget pour l'industrie. Les 19,4 G$ annuels en 2026-2027 maintiennent un rythme historiquement élevé. La Loi no 5 simplifie les autorisations. Le District de la construction innovante et les 283 M$ pour l'innovation dans la construction sont des signaux directs au secteur.",
      enjeux: [
        "PQI 167 G$ sur 10 ans : carnet de commandes garanti — se positionner dès maintenant sur les appels d'offres",
        "71 % en maintien d'actifs : spécialisation en rénovation et réfection plutôt que nouvelles constructions",
        "Loi no 5 : simplification des autorisations — surveiller les règlements d'application",
        "District de la construction innovante : nouvelle zone d'innovation à cibler",
        "Offensive formation en construction : opportunités pour les syndicats et associations",
        "Pénurie de main-d'œuvre : toujours le facteur limitant no 1 malgré les investissements",
      ],
      tags: ["construction", "PQI", "appels-offres", "innovation-construction", "main-d'œuvre"]
    },
    {
      id: "milieu-education",
      titre: "Milieu de l'éducation (syndicats, commissions scolaires)",
      priorite: "haute",
      resume: "Le budget répond à deux revendications clés : attractivité de la profession et besoins d'espace. Le 639 M$ sur 5 ans est significatif. La taxe scolaire plafonnée est une mesure de relations publiques autant que fiscale. Les négociations syndicales restent l'enjeu structurant non résolu.",
      enjeux: [
        "Attractivité de la main-d'œuvre : quelles mesures concrètes? Salaires, conditions, reconnaissance?",
        "Besoins urgents d'espaces scolaires : modalités de financement des constructions modulaires vs permanentes",
        "Réussite éducative : continuité des programmes existants ou nouvelles initiatives?",
        "Taxe scolaire plafonnée à 3 % : impact sur la capacité d'investissement des centres de services scolaires",
      ],
      tags: ["éducation", "syndicats", "commission-scolaire", "attractivité", "espaces-scolaires"]
    },
    {
      id: "milieu-municipal",
      titre: "Municipalités et organisations régionales",
      priorite: "haute",
      resume: "Les municipalités reçoivent des signaux positifs sur les infrastructures locales (445 M$) et le développement régional. La Loi no 5 simplifie les projets d'envergure. Mais les relations financières permanentes (pacte fiscal) restent à négocier — ce budget ne règle pas le financement structurel des villes.",
      enjeux: [
        "445 M$ pour infrastructures locales : modalités de transfert aux municipalités à préciser",
        "Vitalité de la métropole : Montréal reçoit un signal de soutien — nature des projets à surveiller",
        "Transport collectif dans le PQI : sociétés de transport comme Santé Québec reçoivent des signaux positifs",
        "Résilience climatique : programme Rénoclimat volet adaptation — rôle des villes dans la mise en œuvre",
        "Pacte fiscal : toujours en suspens — prochain rendez-vous stratégique pour l'UMQ et la FQM",
      ],
      tags: ["municipalités", "régions", "infrastructure-locale", "transport-collectif", "pacte-fiscal"]
    },
    {
      id: "secteur-forestier",
      titre: "Industrie forestière",
      priorite: "haute",
      resume: "Le budget reconnaît officiellement la crise du secteur forestier liée aux tarifs américains sur le bois d'œuvre. Les 365 M$ sur 5 ans sont la réponse directe. C'est substantiel — mais c'est une réponse de court terme à un conflit qui s'annonce durable. La transformation et la diversification restent les vraies solutions à long terme.",
      enjeux: [
        "365 M$ : quelles entreprises sont admissibles? PME locales vs grandes entreprises intégrées?",
        "Conflit bois d'œuvre : le budget ne règle pas le différend commercial — aide palliative à court terme",
        "Communautés forestières : engagement maintenu — importance pour les régions ressources",
        "Diversification de l'industrie : transformation des produits forestiers, bois d'ingénierie, biomasse",
        "Lien avec la main-d'œuvre : pénurie de travailleurs forestiers reste un enjeu parallèle",
      ],
      tags: ["forêt", "bois-d'œuvre", "tarifs-américains", "régions-ressources", "transformation"]
    },
    {
      id: "organismes-communautaires-pp",
      titre: "Organismes communautaires et d'aide sociale",
      priorite: "haute",
      resume: "Un des budgets les plus généreux pour le milieu communautaire depuis des années. Violence conjugale, itinérance, santé mentale, banques alimentaires — les sommes sont réelles et substantielles. L'enjeu sera l'accès concret aux fonds, la bureaucratie et la pérennité au-delà des 5 ans.",
      enjeux: [
        "260 M$ violence conjugale : mécanisme de financement des maisons d'hébergement à préciser",
        "264 M$ itinérance/SM : distinction entre hébergement d'urgence et services de suivi à long terme",
        "Déclaration automatique de revenus : occasion pour les organismes de s'assurer que les clients accèdent à leurs droits",
        "Pérennité : les enveloppes de 5 ans devront être renouvelées — commencer le travail de lobbying maintenant",
        "Organismes communautaires : 257 M$ — modalités de financement des organismes locaux vs régionaux",
      ],
      tags: ["communautaire", "violence-conjugale", "itinérance", "santé-mentale", "financement"]
    },
    {
      id: "industrie-culturelle-pp",
      titre: "Industries culturelles et médias",
      priorite: "moyenne",
      resume: "Le nouveau crédit d'impôt pour les médias d'information est historique — c'est la première mesure fiscale directe pour aider les médias québécois face à la crise numérique. L'audiovisuel est consolidé. Les institutions patrimoniales (Biosphère, musées, bibliothèques) reçoivent des signaux positifs.",
      enjeux: [
        "Crédit d'impôt médias : critères d'admissibilité — médias numériques incluris? Taille minimale?",
        "SODEC et audiovisuel : 268 M$ — répartition entre cinéma, télé, web, gaming à surveiller",
        "Bibliothèques : modernisation du réseau — opportunité pour les municipalités de co-investir",
        "Patrimoine : Biosphère, Maison René-Lévesque — signaux positifs pour les institutions patrimoniales",
        "Culture à l'école : 119 M$ — opportunité pour les artistes d'accéder aux écoles",
      ],
      tags: ["culture", "médias", "crédit-impôt", "SODEC", "patrimoine", "audiovisuel"]
    },
    {
      id: "secteur-innovation-tech",
      titre: "Secteur technologique et innovant",
      priorite: "haute",
      resume: "Le budget envoie un signal fort aux entreprises tech et innovantes : zones d'innovation, IA, quantique, adoption technologique. La disparition du CRIC est remplacée par des mesures plus ciblées. Le Québec veut rester attractif pour les talents et l'investissement en R&D malgré la concurrence internationale.",
      enjeux: [
        "283 M$ pour l'innovation : chaîne d'innovation, technologies de pointe, productivité dans la construction",
        "IA et technologies quantiques : zones d'innovation comme Technum Québec à Bromont",
        "Plus de 90 M$ pour l'écosystème de l'innovation en attente de la nouvelle Stratégie d'ici 2028",
        "Adoption de l'IA : mesures d'accompagnement pour les PME traditionnelles",
        "Capital de risque : capitalisation de 2 G$ des fonds d'investissement — accès pour les scale-ups",
      ],
      tags: ["technologie", "innovation", "IA", "quantique", "zones-innovation", "R&D"]
    },
  ],

  comparaison: {
    annee_precedente: "2025-2026",
    elements: [
      { label: "Déficit (Loi équilibre budgétaire)", avant: "-13,6 G$ (prévu)", apres: "-8,6 G$", direction: "up" },
      { label: "Déficit comptable", avant: "-11,4 G$ (prévu)", apres: "-6,3 G$", direction: "up" },
      { label: "Déficit 2025-2026 révisé (Loi)", avant: "-13,6 G$ (mars 2025)", apres: "-9,9 G$ (révisé)", direction: "up" },
      { label: "Nouvelles initiatives (5 ans)", avant: "12,3 G$", apres: "9,6 G$", direction: "down" },
      { label: "PIB réel (croissance)", avant: "1,1 %", apres: "1,1 % (2026)", direction: "neutral" },
      { label: "PQI", avant: "164 G$ (2025-2035)", apres: "167 G$ (2026-2036)", direction: "up" },
      { label: "Places garderie converties", avant: "1 000", apres: "5 000", direction: "up" },
      { label: "Dette nette (% PIB)", avant: "38,7 %", apres: "38,8 %", direction: "down" },
      { label: "Retour à l'équilibre prévu", avant: "2029-2030", apres: "2029-2030 (confirmé)", direction: "neutral" },
    ]
  }
};
