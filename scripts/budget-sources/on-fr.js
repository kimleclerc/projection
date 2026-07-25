// =========================================================
// BUDGET ONTARIO 2026-2027 — DONNEES FRANCAISES
// "Un plan pour proteger l'Ontario"
// Ministre des Finances : Peter Bethlenfalvy
// Depose : 25 mars 2026
// =========================================================

const BUDGET_FR = {
  lang: "fr",
  annee: "2026-2027",
  titre: "Budget Ontario 2026",
  titre_complet: "Un plan pour proteger l'Ontario",
  date_depot: "25 mars 2026",
  ministre: "Peter Bethlenfalvy",
  status: "live",

  quote: {
    texte: "Nous n'allons pas seulement nous adapter aux changements, nous allons les diriger. Nous batissons pour faire de l'Ontario l'economie la plus concurrentielle du G7. Ensemble, nous allons proteger l'Ontario.",
    auteur: "Peter Bethlenfalvy",
    titre: "Ministre des Finances de l'Ontario -- Budget 2026",
  },

  chiffres: [
    { label: "Deficit 2026-2027", valeur: "-13,8 G$", note: "En hausse vs -12,3 G$ en 2025-2026 -- investissements en infrastructure", variation: "Retour a l'excedent 0,6 G$ en 2028-2029", direction: "down" },
    { label: "Retour a l'equilibre", valeur: "2028-2029", note: "Excedent de 0,6 G$ -- un an plus tard que prevu au budget 2025", variation: "Deficit 6,1 G$ en 2027-2028", direction: "up" },
    { label: "Plan capital (10 ans)", valeur: "210 G$+", note: "Le plus ambitieux plan capital provincial de l'histoire canadienne", variation: "37 G$ en 2026-2027 seulement", direction: "up" },
    { label: "Croissance du PIB reel (2025)", valeur: "1,2 %", note: "Mieux que prevu -- budget 2025 projetait 0,8 %", variation: "1,0 % projete pour 2026", direction: "up" },
    { label: "Dette nette/PIB", valeur: "~39 %", note: "Demeure sous la cible de 40 % -- bonne position fiscale", variation: "Stable a moyen terme", direction: "neutral" },
    { label: "Aide tarifaire (depuis avr. 2025)", valeur: "~30 G$", note: "Soutien total pour travailleurs et entreprises", variation: "Programme financement Proteger l'Ontario + reports", direction: "neutral" },
  ],

  secteurs: [
    {
      id: "tarifs-economie",
      titre: "Reponse aux tarifs et competitivite economique",
      depenses: "~30 G$ depuis avril 2025 · 4 G$ Fonds d'investissement Compte Proteger l'Ontario",
      variation: "Continu depuis 2025 -- approfondi et elargi",
      priorite: "haute",
      resume: "L'Ontario a engage pres de 30 milliards de dollars de mesures de soutien depuis avril 2025. Le nouveau Fonds d'investissement Compte Proteger l'Ontario (4 G$ avec co-investissement prive) est la mesure phare -- ciblant l'IA, la defense, la fabrication avancee, les sciences de la vie et les mineraux critiques. La Loi d'achat ontario rend l'approvisionnement national obligatoire. L'ouverture de l'usine de batteries NextStar le 5 mars 2026 est la grande victoire du VE.",
      points: [
        "Fonds d'investissement Compte Proteger l'Ontario : jusqu'a 4 G$, gere avec un gestionnaire prive -- IA, defense, fabrication avancee, sciences de la vie, mineraux critiques",
        "Grande ouverture de l'usine de batteries NextStar le 5 mars 2026 -- 1 300 travailleurs, 1 200 de plus a pleine capacite, investissement de 5 G$",
        "Usine PowerCo a St. Thomas en bonne voie -- le plus grand projet de PowerCo a l'echelle mondiale",
        "Vianode investit 3,2 G$ pour une usine de graphite synthetique a St. Thomas -- premiere installation nord-americaine a grande echelle",
        "Asahi Kasei investit 1,6 G$ pour une usine de separateurs de batteries a Port Colborne -- production en 2027",
        "Loi d'achat Ontario -- approvisionnement national obligatoire pour les projets finances par la province",
        "85 M$ pour le Programme de modernisation du secteur automobile (O-AMP) et l'OVIN",
        "Fonds Ontario ensemble commercial : 100 M$ supplementaires en novembre 2025",
        "Reports d'impots : 9 G$ de liquidites d'avril a octobre 2025",
        "Centres POWER : ont aide pres de 15 000 travailleurs licencies",
        "500 M$ d'investissement conjoint federal-provincial pour Algoma Steel (100 M$ du pret provincial)",
      ],
      tags: ["tarifs", "automobile", "VE", "batteries", "fabrication", "competitivite", "achat-Ontario"]
    },
    {
      id: "competitivite-fiscale",
      titre: "Plan d'action fiscal et competitivite",
      depenses: "Pluriannuel -- pres de 10 G$ en economies annuelles estimees pour les entreprises",
      variation: "Nouveau plan d'action fiscal pluriannuel annonce",
      priorite: "haute",
      resume: "Le plan d'action fiscal pluriannuel est presente comme la reponse structurelle de l'Ontario a la competitivite face aux tarifs americains. L'Ontario est aussi la premiere province a supprimer toutes ses exemptions specifiques aux parties dans le cadre de l'Accord de libre-echange canadien, et les regles de mobilite de la main-d'oeuvre sont les premieres au Canada.",
      points: [
        "Plan d'action fiscal pluriannuel -- attirer les investissements, favoriser la croissance, appuyer la creation d'emplois",
        "Pres de 10 G$ en economies et soutiens annuels estimes pour les entreprises",
        "Ontario premiere province a supprimer toutes ses exemptions specifiques aux parties dans l'ALEC",
        "Regles de mobilite de la main-d'oeuvre 'de plein droit' -- premieres au Canada",
        "Cadre Un projet, Un processus -- accelere les approbations minieres (Frontier Lithium PAK, Canada Nickel Crawford, Kinross Gold Great Bear)",
        "Remise de la TVH sur les nouvelles maisons : supprimer la portion provinciale de 8 % sur les maisons jusqu'a 1 M$ -- jusqu'a 80 000 $ de soulagement, maintenu jusqu'a 1,5 M$",
        "Reductions de la taxe sur l'essence et les carburants rendues permanentes -- 2,1 G$ economises depuis juillet 2022",
        "Peages de l'autoroute 407 Est definitif supprimes -- economies d'environ 7 200 $/an pour les navetteurs",
        "Programme Une seule tarification prolonge de deux annees supplementaires",
      ],
      tags: ["impot", "competitivite", "G7", "commerce", "mobilite-main-oeuvre", "TVH", "logement"]
    },
    {
      id: "infrastructure-transport",
      titre: "Infrastructures et transport en commun",
      depenses: "210 G$+ sur 10 ans · Transport en commun 63 G$ · Routes 31 G$ · 37 G$ en 2026-2027",
      variation: "Elargi depuis 200 G$ -- construction activement en cours",
      priorite: "haute",
      resume: "La construction est maintenant activement en cours sur les grands projets annonces en 2025. L'autoroute 413 a commence sa construction. Le TLR Finch Ouest et le TLR Croix de Lumiere ont ouvert. La construction des routes de la Ceinture de feu commence en juin 2026 -- cinq ans avant le calendrier. Le Northlander revient en 2026.",
      points: [
        "Transport en commun : 63 G$ sur 10 ans -- Ontario Line (excavation a la station Queen), Scarborough (3 premieres stations), Eglinton Ouest, Yonge Nord",
        "TLR Finch Ouest et TLR Croix de Lumiere maintenant ouverts",
        "TLR Hamilton et Ligne Hazel McCallion en cours -- portion de Brampton a etre mise en tunnel",
        "Autoroute 413 : construction commencee -- economie jusqu'a 30 min par trajet",
        "Contournement de Bradford : construction commencee -- economie de 35 min",
        "Routes de la Ceinture de feu : construction en juin 2026, routes ouvertes en novembre 2030 -- cinq ans avant le calendrier",
        "Northlander retabli en 2026 -- service ferroviaire Nord de l'Ontario -- Toronto",
        "Etude de faisabilite tunnel autoroute 401 -- travaux de terrain au printemps 2026",
        "Elargissement autoroute 69 Parry Sound -- Sudbury ; autoroute 3 Essex -- Leamington",
        "GO Transit : extensions vers Kitchener (premier service de fin de semaine), Niagara, Bowmanville",
        "Pres de 1 G$ pour 55 nouvelles rames de metro de la ligne 2 de la TTC fabriquees a Thunder Bay",
        "850 M$ pour la remise en etat des voitures de train GO",
      ],
      tags: ["transport-en-commun", "routes", "autoroute-413", "contournement-Bradford", "ceinture-de-feu", "Northlander", "TLR"]
    },
    {
      id: "sante",
      titre: "Soins de sante",
      depenses: "64 G$ hopitaux (10 ans) · 3,4 G$ Plan d'action soins primaires (4 ans) · 6,4 G$ SLD",
      variation: "Capital hospitalier elargi -- grands projets phares annonces",
      priorite: "haute",
      resume: "Le capital en sante est passe a 64 G$ sur 10 ans avec pres de 50 G$ en subventions capital. Projets phares : hopital Peter Gilgan Mississauga (plus grand hopital d'enseignement au Canada), Campus civique de l'Hopital d'Ottawa, hopital Fancsy Windsor. SLD : pres de 26 000 lits approuves ou en construction.",
      points: [
        "64 G$ d'infrastructure de sante sur 10 ans dont pres de 50 G$ en subventions capital",
        "Hopital Peter Gilgan Mississauga -- plus grand hopital d'enseignement au Canada, triple la taille actuelle, dessert 2,2 M de personnes",
        "Campus civique de l'Hopital d'Ottawa -- centre de soins actifs principal pour Ottawa et l'Est de l'Ontario",
        "Hopital de la famille Fancsy Windsor -- consolide deux hopitaux, 594 lits dont 101 nets nouveaux",
        "Nouvel hopital Niagara Sud -- ouverture ete 2028, 469 lits, services 24/7",
        "SLD : pres de 26 000 lits (164 projets) ouverts, en construction ou approuves en fevrier 2026",
        "Plan d'action soins primaires de 3,4 G$ sur 4 ans -- connecter chaque Ontarien a un medecin de famille",
        "965 M$ pour le Programme ontarien des services en autisme en 2026-2027 dont 186 M$ de nouveaux fonds",
        "20 M$ Fonds commemoratif Liam Riazati -- barrieres de beton protectrices pour les centres de garde",
      ],
      tags: ["sante", "hopitaux", "SLD", "soins-primaires", "autisme", "Mississauga", "Ottawa", "Windsor"]
    },
    {
      id: "education-postsecondaire",
      titre: "Education et enseignement postsecondaire",
      depenses: "30 G$ ecoles (10 ans) · 6,4 G$ postsecondaire (nouveaux) · 66 M$ Fonds fournitures scolaires",
      variation: "6,4 G$ de nouveaux fonds pour le postsecondaire -- investissement transformateur",
      priorite: "haute",
      resume: "La mesure phare en education : 6,4 G$ de nouveaux fonds pour les etablissements postsecondaires -- colleges, universites et instituts autochtones. Cela repond directement a la crise de viabilite du secteur. Le Fonds de fournitures pour la classe (750 $ par enseignant de classe homeroom au primaire) est un geste direct pour les enseignants.",
      points: [
        "6,4 G$ de nouveaux fonds pour le postsecondaire -- assure la viabilite des colleges, universites et instituts autochtones",
        "5,5 G$ en capital postsecondaire sur 10 ans dont 2,2 G$ en subventions capital",
        "30 G$ en capital scolaire et services de garde sur 10 ans dont 22 G$ en subventions capital",
        "Nouvelles ecoles : Lac Savant, Orleans (catholique francais), Kitchener (catholique anglais), North York (public francais), Bradford West Gwillimbury",
        "Fonds de fournitures pour la classe : 66 M$ -- 750 $ par enseignant de classe homeroom au primaire par annee scolaire",
        "Remise pour l'electricite de l'Ontario (REO) : reduction des factures mensuelles residentielles d'environ 36 $",
      ],
      tags: ["education", "postsecondaire", "colleges", "universites", "ecoles", "services-de-garde", "enseignants"]
    },
    {
      id: "mineraux-critiques-energie",
      titre: "Mineraux critiques, energie et Ceinture de feu",
      depenses: "Construction routes Ceinture de feu juin 2026 · Premier RPM du G7 complete",
      variation: "Ceinture de feu cinq ans en avance -- RPM historique accompli",
      priorite: "haute",
      resume: "Deux jalons historiques : l'Ontario a complete le premier reacteur de petite taille modulaire (RPM) du G7, et la construction des routes de la Ceinture de feu est maintenant prevue pour juin 2026 -- cinq ans avant le calendrier. Trois grands projets miniers accelerent via le cadre Un projet, Un processus.",
      points: [
        "Premier RPM du G7 complete -- l'Ontario mene l'expansion nucleaire",
        "Construction routes Ceinture de feu juin 2026, routes ouvertes novembre 2030 -- cinq ans avant le calendrier",
        "Accords avec trois Premieres Nations + accord de cooperation federal pour eliminer la duplication des evaluations",
        "Cadre Un projet, Un processus : Frontier Lithium PAK, Canada Nickel Crawford, Kinross Gold Great Bear en cours",
        "Fonds d'investissement Compte Proteger l'Ontario (4 G$) -- mineraux critiques explicitement cibles",
        "Remises a neuf nucleaires : Darlington, Bruce et Pickering en cours",
        "REO maintient les factures d'electricite stables",
        "Ontario demande au gouvernement federal d'egaler ou de depasser l'engagement de 1 G$ pour l'infrastructure de la Ceinture de feu",
      ],
      tags: ["ceinture-de-feu", "mineraux-critiques", "RPM", "nucleaire", "energie", "premieres-nations", "mines"]
    },
    {
      id: "logement",
      titre: "Abordabilite du logement",
      depenses: "Remise TVH jusqu'a 80 000 $ · Objectif 1,5 M logements · Infrastructure municipale habilitante",
      variation: "Remise TVH sur nouvelles maisons -- jusqu'a 80 000 $ de soulagement",
      priorite: "haute",
      resume: "La remise de TVH sur les nouvelles maisons est la mesure phare -- supprimer la totalite de la portion provinciale de 8 % pour les maisons jusqu'a 1 M$, maintenue jusqu'a 1,5 M$, jusqu'a 80 000 $ de soulagement. Pourrait stimuler des milliers de mises en chantier et 14 000 emplois en construction.",
      points: [
        "Remise TVH : supprimer la portion provinciale de 8 % pour les nouvelles maisons jusqu'a 1 M$ -- jusqu'a 80 000 $ de soulagement, maintenu jusqu'a 1,5 M$",
        "Retroactive au 20 mars 2025 pour les acquereurs admissibles -- en collaboration avec le gouvernement federal",
        "Pourrait stimuler des milliers de mises en chantier, soutenir 14 000 emplois en construction, ajouter 0,2 pp au PIB",
        "Objectif de 1,5 million de logements d'ici 2031 maintenu",
        "Mises en chantier 2025 reelles : 65 400 -- inferieures aux previsions du budget 2025 de 71 800",
        "Programme d'infrastructure municipale de logement se poursuit",
        "Plan d'action pour la construction en bois d'oeuvre avance -- bois massif pour les immeubles a etages et prefabriques",
      ],
      tags: ["logement", "remise-TVH", "1,5M-logements", "construction", "abordabilite", "bois-massif"]
    },
    {
      id: "justice-securite",
      titre: "Securite publique, justice et securite frontaliere",
      depenses: "32,5 M$ subventions securite frontaliere (2026-2027) · capacite correctionnelle elargie",
      variation: "Operation Dissuasion 2.0 -- resultats significatifs depuis le lancement de 2025",
      priorite: "haute",
      resume: "L'Operation Dissuasion lancee en janvier 2025 a produit des resultats concrets : 550+ armes illegales retracees (440+ provenant des Etats-Unis), 4 152 kg de cocaine et 192 kg de fentanyl saisis, 641 accusations. L'Operation Dissuasion 2.0 elargit cela avec 32,5 M$ en nouvelles subventions de securite frontaliere.",
      points: [
        "Resultats de l'Operation Dissuasion : 550+ armes illegales retracees, 4 152 kg cocaine, 192 kg fentanyl saisis, 641 accusations",
        "Operation Dissuasion 2.0 -- 32,5 M$ en 2026-2027 pour deux nouveaux programmes de subventions a la securite frontaliere",
        "Legislation proposee pour renforcer le systeme de cautionnement et resserrer les exigences pour les recidivistes violents",
        "Registre des delinquants sexuels et des trafiquants de l'Ontario -- exploration de l'accessibilite partielle au public",
        "Investissements historiques dans la capacite correctionnelle -- place garantie pour les recidivistes a haut risque",
        "Equipes specialisees de poursuite pour le cautionnement elargies",
        "Formation d'un plus grand nombre de policiers -- obstacles reduits au recrutement et a la formation",
        "Services de police des Premieres Nations appuyes",
      ],
      tags: ["justice", "police", "frontiere", "Operation-Dissuasion", "cautionnement", "etablissements", "traite-personnes"]
    },
    {
      id: "abordabilite",
      titre: "Abordabilite et cout de la vie",
      depenses: "2,1 G$ economies taxe essence depuis 2022 · ~36 $/mois REO · Peages 407 Est supprimes",
      variation: "Mesures rendues permanentes -- nouvelle remise TVH sur logement",
      priorite: "haute",
      resume: "Les mesures d'abordabilite consistent a consolider les gains existants et ajouter la remise TVH sur le logement. Reductions de la taxe sur l'essence permanentes (2,1 G$ economises). Peages de la 407 Est definitif supprimes (~7 200 $/an). Programme Une seule tarification prolonge de deux ans. La REO reduit d'environ 36 $/mois les factures d'electricite residentielles.",
      points: [
        "Reductions de la taxe sur l'essence et les carburants permanentes -- 2,1 G$ economises depuis juillet 2022",
        "Peages autoroute 407 Est definitif supprimes -- ~7 200 $/an d'economies pour les navetteurs",
        "Programme Une seule tarification prolonge de deux annees supplementaires",
        "Remise pour l'electricite de l'Ontario (REO) -- reduction d'environ 36 $/mois pour le consommateur residentiel typique",
        "Programme d'aide a l'energie pour les personnes a faible revenu (PAEBFR) se poursuit",
        "Remise TVH sur les nouvelles maisons -- jusqu'a 80 000 $ de soulagement (voir section Logement)",
        "66 M$ Fonds de fournitures pour la classe -- 750 $ par enseignant de classe homeroom au primaire",
      ],
      tags: ["abordabilite", "taxe-essence", "peages-407", "une-seule-tarification", "electricite", "cout-de-la-vie"]
    },
    {
      id: "cadre-budgetaire",
      titre: "Cadre budgetaire et gestion de la dette",
      depenses: "Deficit 13,8 G$ (2026-2027) · Excedent 0,6 G$ (2028-2029) · 47,2 G$ emprunt (2026-2027)",
      variation: "Deficit plus eleve que prevu au budget 2025 -- capital-driven",
      priorite: "haute",
      resume: "Le deficit de 2026 (13,8 G$) est plus eleve que prevu par le budget 2025 (7,8 G$) -- l'ecart est imputable au plan capital elargi (37 G$ en 2026-2027) et au pre-financement de 5 G$ du Compte Proteger l'Ontario. La trajectoire vers l'excedent en 2028-2029 (0,6 G$) est maintenue. Les cotes de credit solides de l'Ontario ont produit une demande sans precedent des investisseurs mondiaux.",
      points: [
        "Deficit 2025-2026 : 12,3 G$ (mieux que les 14,6 G$ projetes au budget 2025)",
        "Deficit 2026-2027 : 13,8 G$ -- imputable a 28 G$ d'investissements provinciaux en capital",
        "Deficit 2027-2028 : 6,1 G$ · Excedent 2028-2029 : 0,6 G$",
        "Dette nette/PIB demeure sous la cible de 40 % tout au long du moyen terme",
        "Emprunts a long terme 2026-2027 : 47,2 G$ -- 58,6 G$ completes en 2025-2026",
        "Cotes de credit solides -- demande mondiale sans precedent pour la dette ontarienne",
        "PIB 2025 reel : 1,2 % (mieux que 0,8 % projete) -- bonne surprise",
        "PIB 2026 projete : 1,0 % · 2027 : 1,7 % · 2028 : 1,8 %",
        "Chomage 2025 reel : 7,7 % · 2026 projete : 7,4 %",
      ],
      tags: ["deficit", "dette", "budgetaire", "PIB", "emprunts", "cote-credit", "excedent"]
    },
  ],

  audiences: [
    {
      id: "travailleurs",
      titre: "Travailleurs et chercheurs d'emploi",
      priorite: "haute",
      resume: "Le budget 2026 continue la protection agressive contre les tarifs. Les Centres POWER ont aide 15 000 travailleurs en 2025. Le secteur des batteries VE a maintenant des victoires concretes -- NextStar a ouvert a Windsor avec 1 300 travailleurs. Les regles de mobilite de la main-d'oeuvre permettent aux travailleurs de travailler plus facilement dans d'autres provinces.",
      mesures: [
        { label: "Centres POWER (travailleurs licencies)", valeur: "15 000 aides", note: "Depuis le lancement -- renvois a Emploi Ontario" },
        { label: "NextStar Windsor -- emplois crees", valeur: "1 300+", note: "2 500 a pleine capacite" },
        { label: "Economies taxe essence (permanentes)", valeur: "2,1 G$ depuis 2022", note: "Pour les travailleurs qui navettent" },
        { label: "Mobilite main-d'oeuvre 'de plein droit'", valeur: "Premiere au Canada", note: "Travailler dans d'autres provinces sans recertification" },
      ],
      tags: ["travailleurs", "VE", "fabrication", "tarifs", "mobilite-main-oeuvre", "POWER"]
    },
    {
      id: "familles",
      titre: "Familles",
      priorite: "haute",
      resume: "La nouvelle remise TVH sur les maisons (jusqu'a 80 000 $) est la grande mesure pour les familles. Factures d'electricite reduites d'environ 36 $/mois. Peages 407 Est supprimes definitivement. Une seule tarification prolonge. Le Fonds Liam Riazati protege les enfants dans les centres de garde. L'autisme obtient 965 M$.",
      mesures: [
        { label: "Remise TVH sur nouvelles maisons", valeur: "Jusqu'a 80 000 $", note: "Maisons jusqu'a 1 M$ · maintenu jusqu'a 1,5 M$" },
        { label: "Remise electricite (REO mensuelle)", valeur: "~36 $/mois", note: "Consommateur residentiel typique" },
        { label: "Economies peages 407 Est (annuelles)", valeur: "~7 200 $", note: "Supprimes definitivement" },
        { label: "Programme ontarien services en autisme 2026-2027", valeur: "965 M$", note: "Dont 186 M$ de nouveaux fonds" },
      ],
      tags: ["familles", "logement", "TVH", "electricite", "autisme", "services-de-garde"]
    },
    {
      id: "aines",
      titre: "Aines",
      priorite: "haute",
      resume: "Les soins de longue duree sont l'enjeu determinant -- pres de 26 000 lits maintenant approuves ou en construction sur l'objectif de 58 000. Les soins primaires (3,4 G$ sur 4 ans) beneficient de maniere disproportionnee aux aines. La REO reduit directement les couts de chauffage.",
      mesures: [
        { label: "Lits SLD approuves ou en construction", valeur: "26 000", note: "164 projets en fevrier 2026" },
        { label: "Cible lits SLD d'ici 2028", valeur: "58 000", note: "6,4 G$ depuis 2019" },
        { label: "Plan d'action soins primaires", valeur: "3,4 G$ / 4 ans", note: "Connecter chaque Ontarien a un medecin" },
        { label: "Remise electricite (REO)", valeur: "~36 $/mois", note: "Reduction couts de chauffage" },
      ],
      tags: ["aines", "SLD", "soins-primaires", "electricite"]
    },
    {
      id: "entreprises",
      titre: "Entreprises et employeurs",
      priorite: "haute",
      resume: "Pres de 10 G$ en economies et soutiens annuels. Plan d'action fiscal en mode pluriannuel. La Loi d'achat Ontario cree des obligations de conformite mais aussi des occasions d'approvisionnement. Le Fonds d'investissement de 4 G$ cible les secteurs a forte croissance.",
      mesures: [
        { label: "Economies et soutiens annuels estimes", valeur: "~10 G$", note: "Via divers programmes depuis 2018" },
        { label: "Fonds d'investissement Compte Proteger l'Ontario", valeur: "4 G$", note: "IA, defense, fabrication avancee, sciences de la vie" },
        { label: "Reports d'impots (liquidites)", valeur: "9 G$", note: "Avril-octobre 2025 -- complete" },
        { label: "Fonds Ontario ensemble commercial (nouveau)", valeur: "+100 M$", note: "Novembre 2025 -- marches interprovinciaux" },
      ],
      tags: ["entreprises", "impot", "investissement", "achat-Ontario", "competitivite"]
    },
    {
      id: "acheteurs-maisons",
      titre: "Acheteurs de maisons",
      priorite: "haute",
      resume: "La remise TVH est la plus grande mesure de logement depuis des annees -- supprimer la totalite de la portion provinciale de 8 % pour les maisons jusqu'a 1 M$, jusqu'a 80 000 $ de soulagement. Retroactive au 20 mars 2025. Devrait stimuler des milliers de mises en chantier et 14 000 emplois en construction.",
      mesures: [
        { label: "Remise TVH (nouvelles maisons jusqu'a 1 M$)", valeur: "Jusqu'a 80 000 $", note: "Portion provinciale de 8 % supprimee · maintenu jusqu'a 1,5 M$" },
        { label: "Date retroactive", valeur: "20 mars 2025", note: "En collaboration avec le gouvernement federal" },
        { label: "Stimulus mises en chantier", valeur: "Des milliers", note: "Attendu de la remise TVH" },
        { label: "Emplois en construction soutenus", valeur: "14 000", note: "De la mesure de remise TVH" },
      ],
      tags: ["logement", "remise-TVH", "acheteurs", "nouvelles-maisons", "construction"]
    },
    {
      id: "navetteurs",
      titre: "Navetteurs et usagers du transport en commun",
      priorite: "haute",
      resume: "Deux nouvelles lignes de transport en commun ont ouvert a Toronto. L'autoroute 413 et le contournement de Bradford sont en construction. Peages 407 Est supprimes definitivement. Une seule tarification prolonge de deux ans. Le Northlander revient en 2026. GO Transit s'etend avec service de fin de semaine vers Kitchener.",
      mesures: [
        { label: "Deux nouvelles lignes Toronto", valeur: "Ouvertes 2025-2026", note: "TLR Finch Ouest + TLR Croix de Lumiere" },
        { label: "Economies peages 407 Est", valeur: "~7 200 $/an", note: "Supprimes definitivement" },
        { label: "Prolongation Une seule tarification", valeur: "+2 ans", note: "Economies ~1 600 $/an pour le navetteur moyen" },
        { label: "Retour du Northlander", valeur: "2026", note: "Service ferroviaire Nord de l'Ontario -- Toronto" },
      ],
      tags: ["transport-en-commun", "navetteurs", "407", "une-seule-tarification", "GO", "TLR", "Northlander"]
    },
    {
      id: "autochtones",
      titre: "Communautes autochtones",
      priorite: "haute",
      resume: "La Ceinture de feu est le moment determinant -- construction en juin 2026 avec des accords avec trois Premieres Nations et un accord de cooperation federal. Un projet, Un processus engage des communautes autochtones dans trois grands projets miniers. Services de police des Premieres Nations finances.",
      mesures: [
        { label: "Construction routes Ceinture de feu", valeur: "Debut juin 2026", note: "Accords avec 3 Premieres Nations" },
        { label: "Ouverture des routes", valeur: "Novembre 2030", note: "Cinq ans avant le calendrier initial" },
        { label: "Duplication federale eliminee", valeur: "Accord de cooperation", note: "EE et Evaluation d'impact alignees" },
        { label: "Partenariats routiers avec Premieres Nations", valeur: "Renouveles", note: "Connexion des communautes au reseau routier provincial" },
      ],
      tags: ["autochtones", "ceinture-de-feu", "premieres-nations", "mines", "routes", "police"]
    },
  ],

  parties_prenantes: [
    {
      id: "secteur-auto-ve",
      titre: "Secteur automobile et fabrication VE",
      priorite: "haute",
      resume: "Le developpement le plus determinant du budget pour le secteur automobile : NextStar a ouvert. PowerCo est en bonne voie. Vianode et Asahi Kasei investissent des milliards. Le pacte automobile avec le gouvernement federal protege les investissements de 5 G$ et 7 G$.",
      enjeux: [
        "Grande ouverture NextStar Windsor 5 mars 2026 -- 2 500 emplois a pleine capacite : positionner les fournisseurs maintenant",
        "Usine PowerCo St. Thomas en bonne voie -- plus grand projet PowerCo a l'echelle mondiale : occasion pour la chaine d'approvisionnement",
        "Graphite synthetique Vianode 3,2 G$ St. Thomas -- suivre le calendrier de production",
        "Pacte automobile confirme pour NextStar 5 G$ + PowerCo 7 G$ -- engagement federal protege",
        "85 M$ O-AMP et OVIN : evaluer l'admissibilite aux subventions de modernisation",
        "Loi d'achat Ontario : examiner les relations d'approvisionnement gouvernementales -- conformite obligatoire",
      ],
      tags: ["automobile", "VE", "batteries", "NextStar", "PowerCo", "chaine-approvisionnement"]
    },
    {
      id: "hopitaux",
      titre: "Hopitaux et organisations de sante",
      priorite: "haute",
      resume: "Le capital en sante est passe a 64 G$ sur 10 ans avec de grands nouveaux projets. Peter Gilgan Mississauga, Campus civique Ottawa et Fancsy Family Windsor sont les projets phares. SLD a 26 000 lits approuves. Les soins primaires (3,4 G$) changeront les schemas de flux de patients.",
      enjeux: [
        "Capital maintenant a 64 G$ sur 10 ans -- confirmer l'approbation capital de votre hopital et le financement operationnel",
        "Peter Gilgan Mississauga plus grand hopital d'enseignement au Canada -- implications pour la structure du systeme de sante GTA",
        "Campus civique Hopital Ottawa -- soins actifs principaux pour l'Est de l'Ontario : implications de planification regionale",
        "SLD : 164 projets a 26 000 lits -- si pas encore approuve, le plaidoyer pour les 32 000 lits restants est urgent",
        "Soins primaires 3,4 G$ sur 4 ans -- plus d'Ontariens connectes a des medecins de famille change les dynamiques aux urgences",
        "Autisme : 965 M$ dont 186 M$ nouveaux -- confirmer l'acces pour les enfants et familles de votre territoire",
      ],
      tags: ["hopitaux", "capital", "SLD", "soins-primaires", "Mississauga", "Ottawa"]
    },
    {
      id: "construction",
      titre: "Industrie de la construction et de l'immobilier",
      priorite: "haute",
      resume: "Le pipeline est reel et actif -- 210 G$+ sur 10 ans avec 37 G$ en 2026-2027. L'autoroute 413 et le contournement de Bradford sont en construction active. Les routes de la Ceinture de feu commencent en juin 2026. La remise TVH va stimuler les mises en chantier. La Construction en bois avance cree une nouvelle demande de produits.",
      enjeux: [
        "37 G$ en 2026-2027 : total annuel le plus eleve de l'histoire de l'Ontario -- se positionner pour les contrats maintenant",
        "Transport en commun 63 G$ (10 ans) : Ontario Line, Subway Scarborough, projets TLR -- tous activement en mouvement",
        "Stimulus remise TVH : des milliers de nouvelles mises en chantier attendues -- se preparer pour une hausse du travail residentiel",
        "Plan d'action Construction en bois avance : demande de bois massif va croitre -- nouvelle occasion de chaine d'approvisionnement",
        "Routes Ceinture de feu juin 2026 : occasion specialisee de construction nordique",
        "Mobilite main-d'oeuvre 'de plein droit' : les travailleurs des autres provinces peuvent etre embauches plus facilement",
      ],
      tags: ["construction", "capital", "transport-en-commun", "logement", "bois-massif", "ceinture-de-feu"]
    },
    {
      id: "mines-mineraux",
      titre: "Industrie miniere et mineraux critiques",
      priorite: "haute",
      resume: "L'acceleration du calendrier de la Ceinture de feu (debut juin 2026, ouverture novembre 2030) est transformatrice. Un projet, Un processus a trois grands projets en cours d'acceleration. Le Fonds d'investissement de 4 G$ cible explicitement les mineraux critiques. Le premier RPM du G7 donne a l'Ontario un avantage energetique unique.",
      enjeux: [
        "Routes Ceinture de feu debut juin 2026 : s'engager MAINTENANT avec les trois Premieres Nations cosignataires et les contacts provinciaux",
        "Un projet, Un processus : Frontier Lithium, Canada Nickel, Kinross sont dans le programme -- postuler pour votre projet",
        "Fonds d'investissement Compte Proteger l'Ontario (4 G$) : mineraux critiques explicitement cibles -- se positionner pour attirer le co-investissement",
        "Premier RPM du G7 : l'Ontario a un avantage energetique pour les operations minieres et de traitement energivores",
        "Accord de cooperation federal elimine la duplication des EA -- delais de projet plus courts",
        "Ontario demande a Ottawa d'egaler 1 G$+ pour la Ceinture de feu -- defendre l'engagement federal",
      ],
      tags: ["mines", "ceinture-de-feu", "mineraux-critiques", "RPM", "permis", "autochtones"]
    },
    {
      id: "postsecondaire-secteur",
      titre: "Colleges, universites et instituts autochtones",
      priorite: "haute",
      resume: "Les 6,4 G$ de nouveaux fonds pour le postsecondaire sont l'investissement sectoriel le plus important depuis des annees -- s'attaquant directement a la crise de viabilite. Combine a 5,5 G$ en capital sur 10 ans, les etablissements ont un cadre pour planifier.",
      enjeux: [
        "6,4 G$ de nouveaux fonds : comprendre l'echeancier de versement et les criteres d'admissibilite pour votre etablissement",
        "5,5 G$ de capital sur 10 ans dont 2,2 G$ en subventions : soumettre les projets capital prioritaires",
        "Mandat : 'etablissements viables qui produisent une main-d'oeuvre competitive du G7' -- aligner la planification des programmes",
        "Instituts autochtones explicitement inclus -- engagement sur le flux de financement specifique",
        "Alignement des competences avec les secteurs du Fonds d'investissement : IA, defense, fabrication avancee, sciences de la vie",
        "Contexte politique immigration : reductions federales des residents temporaires affectera la planification des inscriptions",
      ],
      tags: ["postsecondaire", "colleges", "universites", "instituts-autochtones", "viabilite", "competences"]
    },
    {
      id: "defense",
      titre: "Industrie de la defense et aerospatiale",
      priorite: "haute",
      resume: "L'Ontario cherche activement le siege de la Banque de defense, securite et resilience (BDSR) pour Toronto -- devrait creer 3 500 emplois directs. Le Fonds d'investissement de 4 G$ cible explicitement la defense. La defense nationale est identifiee comme un pilier de plus en plus important.",
      enjeux: [
        "Candidature siege BDSR pour Toronto -- 3 500 emplois directs plus des milliers indirects : appuyer la candidature",
        "Fonds d'investissement Compte Proteger l'Ontario (4 G$) : defense explicitement ciblee -- se positionner pour le co-investissement",
        "Hausse des depenses de defense federales pour atteindre les engagements OTAN : grappe aerospatiale et defense de l'Ontario bien positionnee",
        "Cadre Un projet, Un processus : application potentielle pour l'infrastructure liee a la defense",
        "Routes d'acces Ceinture de feu : double application civile-defense potentielle",
        "Completion RPM nucleaire : nexus defense/energie de l'Ontario renforce",
      ],
      tags: ["defense", "BDSR", "Toronto", "aerospatiale", "OTAN", "investissement"]
    },
  ],

  glossaire: [
    { terme: "Fonds d'investissement Compte Proteger l'Ontario", def: "Nouveau fonds de 4 G$ annonce dans le budget 2026, gere en partenariat avec un gestionnaire de placement prive. Cible l'IA, la defense, la fabrication avancee, les sciences de la vie, la biotechnologie et les mineraux critiques. Concu pour attirer les fonds de pension et le capital prive." },
    { terme: "Loi d'achat Ontario", def: "Nouvelle legislation exigeant des biens et services d'approvisionnement national dans les projets finances par la province. Cree des obligations de conformite pour les fournisseurs gouvernementaux mais aussi d'importantes occasions d'approvisionnement pour les entreprises ontariennes." },
    { terme: "Un projet, Un processus", def: "Cadre lance en octobre 2025 pour accelerer les approbations pour les projets miniers. Elimine la duplication entre les processus provinciaux et federaux. Trois grands projets deja inscrits : Frontier Lithium PAK, Canada Nickel Crawford, Kinross Gold Great Bear." },
    { terme: "Ceinture de feu", def: "Gisements de chromite, nickel, cuivre et platine dans le Grand Nord de l'Ontario. Le budget 2026 accelere la construction des routes de 5 ans -- debut juin 2026, routes ouvertes novembre 2030. Soutenu par des accords avec trois Premieres Nations et un accord de cooperation federal." },
    { terme: "Remise TVH (nouvelles maisons)", def: "L'Ontario supprime la totalite de la portion provinciale de TVH de 8 % pour les nouvelles maisons admissibles d'au plus un million de dollars -- jusqu'a 80 000 $ de soulagement. Maintenu pour les maisons jusqu'a 1,5 M$. Retroactive au 20 mars 2025. Devrait stimuler des milliers de mises en chantier et soutenir 14 000 emplois en construction." },
    { terme: "RPM (Reacteur de petite taille modulaire)", def: "L'Ontario a complete le premier RPM du G7 -- une etape historique dans l'energie nucleaire. Plus petits et plus rapides a construire que les reacteurs traditionnels. L'Ontario poursuit maintenant quatre nouveaux RPM a Darlington. Donne a l'Ontario un avantage energetique unique pour attirer les industries energivores." },
    { terme: "NextStar Energy", def: "L'usine de batteries lithium-ion de 5 G$ a Windsor, ouverte le 5 mars 2026. Coentreprise de Stellantis et LG Energy Solution. Plus d'un million de cellules de batterie produites et 1 300 travailleurs embauchees a l'ouverture, 1 200 de plus a pleine capacite. Premiere installation de batteries a echelle commerciale au Canada." },
    { terme: "Centres POWER", def: "Centres de reponse a l'emploi Proteger les travailleurs ontariens. Lances en 2025 pour fournir une aide de transition -- renvois, acces aux programmes d'Emploi Ontario -- aux travailleurs touches par les licenciements lies aux tarifs. Ont aide pres de 15 000 travailleurs en 2025." },
    { terme: "Fonds Ontario ensemble commercial (FOEC)", def: "Fonds pour aider les entreprises ontariennes a se reconvertir et a trouver de nouveaux marches au-dela des Etats-Unis. 100 M$ supplementaires investis en novembre 2025. Soutient les clients interprovinciaux, la resilience commerciale et le rapatriement de la chaine d'approvisionnement." },
    { terme: "Operation Dissuasion", def: "Cadre de securite frontaliere de l'Ontario lance en janvier 2025. Application frontaliere renforcee de la PPO. Resultats : 550+ armes illegales retracees (440+ des Etats-Unis), 4 152 kg de cocaine saisis, 192 kg de fentanyl saisis, 641 accusations. L'Operation Dissuasion 2.0 elargit cela avec 32,5 M$ en nouvelles subventions de securite frontaliere." },
  ],

  comparaison: {
    annee_precedente: "2025-2026",
    elements: [
      { label: "Deficit", avant: "-14,6 G$ (prevision budget 2025)", apres: "-13,8 G$ (2026-2027)", direction: "up" },
      { label: "Deficit 2025-2026 (reel)", avant: "-14,6 G$ (projete)", apres: "-12,3 G$ (reel)", direction: "up" },
      { label: "Plan capital total (10 ans)", avant: "200 G$+", apres: "210 G$+", direction: "up" },
      { label: "Capital annuel (annee en cours)", avant: "33 G$ (2025-2026)", apres: "37 G$ (2026-2027)", direction: "up" },
      { label: "Capital hospitalier (10 ans)", avant: "56 G$", apres: "64 G$", direction: "up" },
      { label: "Croissance PIB reel (2025 reel)", avant: "0,8 % (projete)", apres: "1,2 % (reel)", direction: "up" },
      { label: "Retour a l'equilibre", avant: "2027-2028 (0,2 G$)", apres: "2028-2029 (0,6 G$)", direction: "down" },
      { label: "Lits SLD approuves/construction", avant: "23 977 (avr. 2025)", apres: "26 000 (fev. 2026)", direction: "up" },
    ]
  },

  sources: {
    plan: "https://www.ontario.ca/fr/document/budget-de-lontario-2026",
    bref: "https://www.ontario.ca/fr/page/budget-de-lontario",
  },

  notebook: {
    url: "",
    label: "Explorer le notebook du budget Ontario",
    note: "NotebookLM par Google · Gratuit · Compte Google requis",
  },
};
