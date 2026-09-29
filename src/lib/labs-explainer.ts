// VoteScope Labs — « La physique d'une élection » : page d'explication,
// trois langues. Chaque section : titre, paragraphes, encadré « D'où ça vient ».
import type { Locale } from './labs';

export const EXPLAINER_SLUG: Record<Locale, string> = {
  fr: 'comment-ca-marche',
  en: 'how-it-works',
  es: 'como-funciona',
};

type Section = {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  origin?: { label: string; text: string };
  figure?: 'sphere' | 'transport' | 'register';
  caption?: string;
};

type Explainer = {
  title: string;
  description: string;
  kicker: string;
  h1: string;
  dek: string;
  sections: Section[];
  honestyTitle: string;
  honesty: string[];
  readMore: string;
  back: string;
  cta: string;
  linkLabel: string;
};

export const EXPLAINER: Record<Locale, Explainer> = {
  fr: {
    title: 'La physique d’une élection — comment fonctionne VoteScope Labs',
    description: 'Sphères, courbure, qubits : pourquoi notre moteur expérimental emprunte les mathématiques de la relativité et de la physique quantique pour projeter une élection, expliqué simplement.',
    kicker: 'VoteScope Labs · Comment ça marche',
    h1: 'La physique d’une élection',
    dek: 'Une élection, c’est des millions de décisions qui se figent le même soir. Pour la prévoir, VoteScope Labs emprunte des outils nés pour décrire l’espace courbe, guider des fusées vers la Lune et calculer le monde quantique. Voici comment, et pourquoi, sans une seule équation.',
    sections: [
      {
        id: 'des',
        kicker: '1 · Le point de départ',
        title: 'Lancer les dés 50 000 fois',
        body: [
          'La plupart des projections électorales, dont notre projection de référence, fonctionnent comme un casino. On imagine l’élection des dizaines de milliers de fois, en tirant au hasard les erreurs possibles des sondages, puis on compte : dans combien de ces univers tel parti gagne-t-il?',
          'C’est simple, robuste et remarquablement efficace. Mais c’est une approximation : même avec 50 000 tirages, il reste du bruit. Et surtout, la méthode ne dit rien de la forme de l’opinion elle-même. Le Labs pose une autre question : et si l’on pouvait calculer directement, au lieu de tirer au sort?',
        ],
        origin: {
          label: 'D’où ça vient',
          text: 'En 1946, à Los Alamos, le mathématicien Stanislaw Ulam, convalescent, joue au solitaire et se demande quelles sont ses chances de gagner. Plutôt que de faire le calcul, impossible, il se dit qu’il suffirait de jouer des centaines de parties et de compter. John von Neumann en fait une méthode de calcul pour la physique nucléaire; son collègue Nicholas Metropolis la baptise « Monte Carlo », en clin d’œil à un oncle d’Ulam qui empruntait de l’argent pour aller jouer au casino.',
        },
      },
      {
        id: 'sphere',
        kicker: '2 · La forme de l’opinion',
        title: 'Un électorat est un point sur une sphère',
        body: [
          'Prenez des intentions de vote : 40 % pour un parti, 35 % pour un autre, 25 % pour le reste. Ces trois nombres font toujours 100 %. On pourrait les dessiner comme un point dans un triangle. Le Labs fait une chose étrange : il prend la racine carrée de chaque part. Soudain, le triangle devient un morceau de sphère, comme une pelure d’orange.',
          'Pourquoi? Parce que sur cette sphère, l’incertitude d’un sondage a la même taille dans toutes les directions. Sur un triangle ordinaire, un parti à 3 % et un parti à 40 % ne « tremblent » pas de la même façon d’un sondage à l’autre. Sur la sphère, si. Un seul réglage décrit donc l’erreur de tous les partis, petits et grands.',
          'Autre conséquence : bouger de 2 points n’a pas la même signification partout. Passer de 2 % à 4 %, c’est doubler; passer de 40 % à 42 %, c’est un détail. La sphère le sait d’instinct : la distance entre deux électorats y mesure à quel point on pourrait les distinguer avec des sondages.',
        ],
        figure: 'sphere',
        caption: 'Deux partis : les parts de vote vivent sur la droite; leurs racines carrées vivent sur un quart de cercle. Près des bords (un parti presque absent), un petit pas sur le cercle correspond à très peu de points de vote.',
        origin: {
          label: 'D’où ça vient',
          text: 'En 1945, le statisticien indien C. R. Rao, 24 ans, montre que l’ensemble des lois de probabilité possède une géométrie : on peut y mesurer des distances et des courbes, comme sur une surface. C’est la naissance de la « géométrie de l’information ». En 1981, le physicien William Wootters découvre que cette distance statistique est exactement l’angle entre deux états en mécanique quantique, où les probabilités sont, elles aussi, des carrés.',
        },
      },
      {
        id: 'courbure',
        kicker: '3 · La courbure',
        title: 'Transporter une flèche sur un monde courbe',
        body: [
          'Une expérience de pensée. Debout sur l’équateur, vous tenez une flèche qui pointe vers le nord. Vous marchez vers le pôle Nord sans jamais tourner la flèche, puis vous redescendez le long d’un autre méridien, et vous revenez à votre point de départ par l’équateur. Surprise : votre flèche a tourné, alors que vous ne l’avez jamais tournée. C’est la signature de la courbure.',
          'Le Labs a le même problème. Le mouvement provincial des sondages est une flèche : tel parti monte, tel autre recule. Pour savoir ce que ce mouvement veut dire dans une circonscription précise, il faut transporter la flèche jusqu’à elle, sur la sphère, sans la déformer. On appelle ça le transport parallèle.',
          'Le résultat n’est ni un swing uniforme (les mêmes points partout), ni un swing proportionnel : c’est la géométrie qui décide. Un parti fort gagne ou perd plus de points là où il est fort; un nouveau parti peut apparaître là où il n’existait pas.',
        ],
        figure: 'transport',
        caption: 'Une flèche transportée sans jamais tourner le long d’un triangle tracé sur une sphère revient tournée : c’est la courbure. Le Labs transporte de la même façon le mouvement provincial jusqu’à chaque circonscription.',
        origin: {
          label: 'D’où ça vient',
          text: 'En 1854, Bernhard Riemann imagine des espaces courbes de n’importe quelle dimension. Soixante ans plus tard, Albert Einstein s’en sert pour la relativité générale : la gravité n’est plus une force, mais la courbure de l’espace-temps. En 1917, Tullio Levi-Civita précise comment déplacer un vecteur sans le tordre sur un espace courbe, le transport parallèle, exactement l’outil que le Labs utilise.',
        },
      },
      {
        id: 'apollo',
        kicker: '4 · Suivre l’opinion au jour le jour',
        title: 'Naviguer comme Apollo',
        body: [
          'Les sondages arrivent un à un, chacun avec sa marge d’erreur et les habitudes de son sondeur. Pour en tirer la position la plus probable de l’électorat, le Labs utilise un filtre de Kalman, adapté à la sphère : à chaque nouveau sondage, il corrige sa position estimée, en tenant compte de la fiabilité de la mesure et du temps écoulé.',
          'Il retire aussi le biais propre à chaque sondeur, et il ne laisse pas un sondeur qui publie tous les jours dicter la moyenne à lui seul. Les réglages ne sont pas choisis à la main : on les estime sur les sondages eux-mêmes. Une leçon est tombée : l’opinion n’a pas d’élan. Une tendance d’une semaine ne se prolonge pas d’elle-même.',
        ],
        origin: {
          label: 'D’où ça vient',
          text: 'En 1960, l’ingénieur Rudolf Kálmán publie une méthode pour estimer la position d’un système à partir de mesures imparfaites. La même année, il la présente à Stanley Schmidt, à la NASA, dont l’équipe cherche à guider les vaisseaux Apollo vers la Lune avec des ordinateurs minuscules. Le filtre de Kalman naviguera jusqu’à la Lune; il guide aujourd’hui les avions, les GPS et les téléphones.',
        },
      },
      {
        id: 'quantique',
        kicker: '5 · Les sondages comme des mesures',
        title: 'La règle de Born',
        body: [
          'En physique quantique, un système est décrit par des « amplitudes », et la probabilité d’un résultat est le carré de son amplitude. C’est la règle de Born. Les racines carrées de la sphère de la section 2 sont exactement ça : des amplitudes dont le carré redonne les parts de vote.',
          'Le Labs traite donc chaque sondage comme une mesure d’un état de l’électorat. En regroupant tous les sondages, on obtient ce que les physiciens appellent une matrice de densité. Si tous les sondeurs disaient la même chose, elle serait « pure ». Plus ils se contredisent, plus elle est mélangée, et l’entropie de von Neumann mesure ce désaccord.',
          'Et le soir du vote, l’électorat « s’effondre » sur un résultat. Sur neuf élections canadiennes depuis 2015, le parti qui menait dans les sondages a toujours fait mieux le soir même, et les petits partis moins bien. Le Labs l’intègre avec un seul nombre, estimé sur les seules élections passées : au moment de la mesure, les parts se concentrent légèrement vers les partis dominants.',
        ],
        origin: {
          label: 'D’où ça vient',
          text: 'En 1926, Max Born propose que la fonction d’onde de Schrödinger ne décrit pas une particule, mais la probabilité de la trouver : il faut en prendre le carré. L’idée lui vaudra le prix Nobel en 1954. Depuis les années 2000, des chercheurs en sciences cognitives utilisent ces mathématiques pour décrire des décisions humaines qui défient les probabilités classiques.',
        },
      },
      {
        id: 'qubits',
        kicker: '6 · Compter les sièges',
        title: 'Des qubits au lieu des dés',
        body: [
          'Chaque circonscription devient un petit registre, comme un qubit : ses amplitudes donnent les chances de chaque parti d’y gagner. L’ensemble de la province est l’assemblage de tous ces registres, et le nombre de sièges d’un parti se lit sur un compteur relié à chacun d’eux.',
          'Un ordinateur quantique « mesurerait » ce compteur pour obtenir la distribution des sièges. Nous n’en avons pas besoin : la structure du problème permet de faire exactement le même calcul sur un ordinateur ordinaire, circonscription par circonscription. Nous l’avons vérifié : un vrai circuit quantique, simulé avec la bibliothèque qiskit d’IBM, donne la même distribution au milliardième près.',
          'Résultat : aucune part de hasard dans le décompte des sièges, et un calcul complet en quelques secondes. Seuls les grands chocs communs, comme une erreur nationale de tous les sondeurs, sont parcourus sur une grille régulière plutôt que tirés au hasard.',
        ],
        figure: 'register',
        caption: 'Chaque circonscription est un registre dont les amplitudes donnent les chances de chaque camp. Le compteur de sièges s’obtient exactement, sans un seul tirage au sort.',
        origin: {
          label: 'D’où ça vient',
          text: 'Le mot « qubit » apparaît en 1995, sous la plume du physicien Benjamin Schumacher. La grille régulière qui remplace le hasard pour les chocs communs vient d’Ilya Sobol, un mathématicien soviétique qui, en 1967, invente des suites de points réparties plus uniformément que le hasard.',
        },
      },
      {
        id: 'regions',
        kicker: '7 · La carte',
        title: 'Des poupées russes géographiques',
        body: [
          'Les sondeurs publient souvent des résultats par région, mais chacun à sa façon : le « Montréal » de l’un est la région métropolitaine, celui d’un autre inclut toute la banlieue, un troisième publie l’île seule. Le Labs découpe le Québec en treize morceaux élémentaires (l’île, Laval, les couronnes, la région de Québec…) et reconstitue chaque région de sondeur comme un assemblage de ces morceaux.',
          'Les morceaux s’emboîtent comme des poupées russes : chacun appartient à un bloc, chaque bloc à une grande zone. Quand un morceau est peu mesuré, il emprunte l’information de son bloc et de sa zone. Et chaque sondage est comparé à lui-même : ce qu’il dit d’une région, contre ce que sa propre moyenne provinciale laissait prévoir. Ses habitudes de sondeur s’annulent; il ne reste que la géographie.',
        ],
      },
    ],
    honestyTitle: 'Ce que ce n’est pas',
    honesty: [
      'Les électeurs ne sont pas des particules quantiques, et une élection n’a rien à voir avec la gravité. Le Labs emprunte des mathématiques, pas des lois de la nature : il se trouve que les outils inventés pour l’espace courbe et le monde quantique sont aussi les outils naturels des probabilités.',
      'Le Labs n’est pas encore meilleur que notre projection de référence : rejouées la veille du vote, les élections passées donnent des écarts comparables, parfois en faveur de l’un, parfois de l’autre. C’est justement pour ça qu’il tourne à côté, chaque nuit, avec les mêmes sondages. Quand les deux moteurs s’accordent, le signal est solide. Quand ils divergent, c’est là qu’il faut regarder.',
    ],
    readMore: 'Pour aller plus loin',
    back: 'Retour aux projections Labs',
    cta: 'Voir ce que le Labs projette',
    linkLabel: 'Lire l’explication complète',
  },
  en: {
    title: 'The physics of an election — how VoteScope Labs works',
    description: 'Spheres, curvature, qubits: why our experimental engine borrows the mathematics of relativity and quantum physics to forecast an election, explained simply.',
    kicker: 'VoteScope Labs · How it works',
    h1: 'The physics of an election',
    dek: 'An election is millions of decisions that freeze on the same night. To forecast it, VoteScope Labs borrows tools that were born to describe curved space, guide rockets to the Moon and compute the quantum world. Here is how, and why, without a single equation.',
    sections: [
      {
        id: 'dice',
        kicker: '1 · The starting point',
        title: 'Rolling the dice 50,000 times',
        body: [
          'Most election forecasts, our reference forecast included, work like a casino. You imagine the election tens of thousands of times, randomly drawing the possible polling errors, then you count: in how many of those universes does a given party win?',
          'It is simple, robust and remarkably effective. But it is an approximation: even with 50,000 draws, some noise remains. Above all, it says nothing about the shape of opinion itself. Labs asks a different question: what if we could compute directly instead of drawing lots?',
        ],
        origin: {
          label: 'Where it comes from',
          text: 'In 1946, at Los Alamos, mathematician Stanislaw Ulam, recovering from an illness, was playing solitaire and wondered about his odds of winning. Rather than attempt the impossible calculation, he realized he could simply play hundreds of games and count. John von Neumann turned it into a computing method for nuclear physics; his colleague Nicholas Metropolis named it “Monte Carlo”, a nod to an uncle of Ulam’s who borrowed money to go gambling.',
        },
      },
      {
        id: 'sphere',
        kicker: '2 · The shape of opinion',
        title: 'An electorate is a point on a sphere',
        body: [
          'Take voting intentions: 40% for one party, 35% for another, 25% for the rest. Those three numbers always add up to 100%. You could draw them as a point in a triangle. Labs does something odd: it takes the square root of each share. Suddenly the triangle becomes a piece of a sphere, like an orange peel.',
          'Why? Because on that sphere, a poll’s uncertainty has the same size in every direction. On an ordinary triangle, a party at 3% and a party at 40% do not “wobble” the same way from one poll to the next. On the sphere, they do. A single setting therefore describes the error of every party, big and small.',
          'Another consequence: a 2-point move does not mean the same thing everywhere. Going from 2% to 4% is doubling; going from 40% to 42% is a detail. The sphere knows this by instinct: the distance between two electorates measures how well polls could tell them apart.',
        ],
        figure: 'sphere',
        caption: 'Two parties: vote shares live on the straight line; their square roots live on a quarter circle. Near the edges (a party that is almost absent), a small step along the circle means very few points of vote.',
        origin: {
          label: 'Where it comes from',
          text: 'In 1945, the 24-year-old Indian statistician C. R. Rao showed that the set of probability distributions has a geometry: you can measure distances and curves on it, as on a surface. That was the birth of “information geometry”. In 1981, physicist William Wootters found that this statistical distance is exactly the angle between two states in quantum mechanics, where probabilities are squares too.',
        },
      },
      {
        id: 'curvature',
        kicker: '3 · Curvature',
        title: 'Carrying an arrow across a curved world',
        body: [
          'A thought experiment. Standing on the equator, you hold an arrow pointing north. You walk to the North Pole without ever turning the arrow, walk back down along another meridian, and return to your starting point along the equator. Surprise: your arrow has rotated, even though you never turned it. That is the signature of curvature.',
          'Labs faces the same problem. The province-wide polling movement is an arrow: this party rises, that one falls. To know what that movement means in one specific riding, the arrow has to be carried there, across the sphere, without distortion. This is called parallel transport.',
          'The result is neither a uniform swing (the same points everywhere) nor a proportional swing: geometry decides. A party gains or loses more points where it is strong; a new party can appear where it did not exist.',
        ],
        figure: 'transport',
        caption: 'An arrow carried without ever turning around a triangle drawn on a sphere comes back rotated: that is curvature. Labs carries the province-wide movement to each riding the same way.',
        origin: {
          label: 'Where it comes from',
          text: 'In 1854, Bernhard Riemann imagined curved spaces of any dimension. Sixty years later, Albert Einstein used them for general relativity: gravity is no longer a force but the curvature of space-time. In 1917, Tullio Levi-Civita worked out how to move a vector across a curved space without twisting it, parallel transport, exactly the tool Labs uses.',
        },
      },
      {
        id: 'apollo',
        kicker: '4 · Tracking opinion day by day',
        title: 'Navigating like Apollo',
        body: [
          'Polls arrive one by one, each with its margin of error and its pollster’s habits. To extract the most likely position of the electorate, Labs uses a Kalman filter adapted to the sphere: with each new poll, it corrects its estimated position, weighing how reliable the measurement is and how much time has passed.',
          'It also removes each pollster’s own lean, and it does not let a pollster that publishes every day dictate the average on its own. The settings are not picked by hand: they are estimated from the polls themselves. One lesson emerged: opinion has no momentum. A one-week trend does not carry itself forward.',
        ],
        origin: {
          label: 'Where it comes from',
          text: 'In 1960, engineer Rudolf Kálmán published a method to estimate the state of a system from imperfect measurements. That same year he presented it to Stanley Schmidt at NASA, whose team was trying to guide Apollo spacecraft to the Moon with tiny onboard computers. The Kalman filter went on to navigate to the Moon; today it guides aircraft, GPS and phones.',
        },
      },
      {
        id: 'quantum',
        kicker: '5 · Polls as measurements',
        title: 'The Born rule',
        body: [
          'In quantum physics, a system is described by “amplitudes”, and the probability of an outcome is the square of its amplitude. That is the Born rule. The square roots on the sphere in section 2 are exactly that: amplitudes whose squares give back the vote shares.',
          'So Labs treats each poll as a measurement of the state of the electorate. Pooling all the polls gives what physicists call a density matrix. If every pollster said the same thing, it would be “pure”. The more they contradict each other, the more mixed it becomes, and the von Neumann entropy measures that disagreement.',
          'And on election night, the electorate “collapses” onto an outcome. In nine Canadian elections since 2015, the party leading in the polls always did better on the night, and smaller parties did worse. Labs builds this in with a single number, estimated from past elections only: at the moment of measurement, shares concentrate slightly toward the dominant parties.',
        ],
        origin: {
          label: 'Where it comes from',
          text: 'In 1926, Max Born proposed that Schrödinger’s wave function does not describe a particle but the probability of finding it: you have to square it. The idea earned him the Nobel Prize in 1954. Since the 2000s, cognitive scientists have used this mathematics to describe human decisions that defy classical probability.',
        },
      },
      {
        id: 'qubits',
        kicker: '6 · Counting seats',
        title: 'Qubits instead of dice',
        body: [
          'Each riding becomes a small register, like a qubit: its amplitudes give each party’s chances of winning there. The whole province is the assembly of all those registers, and a party’s seat count is read on a counter wired to each of them.',
          'A quantum computer would “measure” that counter to get the seat distribution. We do not need one: the structure of the problem lets us do exactly the same calculation on an ordinary computer, riding by riding. We checked: a real quantum circuit, simulated with IBM’s qiskit library, gives the same distribution to the billionth.',
          'The result: no randomness at all in the seat count, and a complete calculation in seconds. Only the large common shocks, such as a nationwide error by every pollster, are walked through on a regular grid rather than drawn at random.',
        ],
        figure: 'register',
        caption: 'Each riding is a register whose amplitudes give each side’s chances. The seat counter is obtained exactly, without a single random draw.',
        origin: {
          label: 'Where it comes from',
          text: 'The word “qubit” appeared in 1995, coined by physicist Benjamin Schumacher. The regular grid that replaces chance for the common shocks comes from Ilya Sobol, a Soviet mathematician who in 1967 invented sequences of points spread more evenly than randomness.',
        },
      },
      {
        id: 'regions',
        kicker: '7 · The map',
        title: 'Geographic nesting dolls',
        body: [
          'Pollsters often publish results by region, each in their own way: one firm’s “Montreal” is the metropolitan area, another’s includes all the suburbs, a third publishes the island alone. Labs cuts Quebec into thirteen elementary pieces (the island, Laval, the suburban rings, the Quebec City area…) and rebuilds each pollster’s region as an assembly of those pieces.',
          'The pieces nest like Russian dolls: each belongs to a block, each block to a large zone. When a piece is rarely measured, it borrows information from its block and its zone. And each poll is compared with itself: what it says about a region, versus what its own province-wide numbers predicted. Its pollster habits cancel out; only the geography remains.',
        ],
      },
    ],
    honestyTitle: 'What this is not',
    honesty: [
      'Voters are not quantum particles, and an election has nothing to do with gravity. Labs borrows mathematics, not laws of nature: it turns out that the tools invented for curved space and the quantum world are also the natural tools of probability.',
      'Labs is not yet better than our reference forecast: replayed the day before the vote, past elections show comparable errors, sometimes favouring one, sometimes the other. That is exactly why it runs alongside, every night, on the same polls. When the two engines agree, the signal is solid. When they diverge, that is where to look.',
    ],
    readMore: 'Further reading',
    back: 'Back to the Labs forecasts',
    cta: 'See what Labs projects',
    linkLabel: 'Read the full explanation',
  },
  es: {
    title: 'La física de una elección — cómo funciona VoteScope Labs',
    description: 'Esferas, curvatura, qubits: por qué nuestro motor experimental toma prestadas las matemáticas de la relatividad y de la física cuántica para proyectar una elección, explicado de forma sencilla.',
    kicker: 'VoteScope Labs · Cómo funciona',
    h1: 'La física de una elección',
    dek: 'Una elección son millones de decisiones que se congelan la misma noche. Para preverla, VoteScope Labs toma prestadas herramientas nacidas para describir el espacio curvo, guiar cohetes hasta la Luna y calcular el mundo cuántico. Así es como funciona, y por qué, sin una sola ecuación.',
    sections: [
      {
        id: 'dados',
        kicker: '1 · El punto de partida',
        title: 'Tirar los dados 50 000 veces',
        body: [
          'La mayoría de las proyecciones electorales, incluida nuestra proyección de referencia, funcionan como un casino. Se imagina la elección decenas de miles de veces, sorteando los posibles errores de las encuestas, y luego se cuenta: ¿en cuántos de esos universos gana tal partido?',
          'Es sencillo, robusto y notablemente eficaz. Pero es una aproximación: incluso con 50 000 sorteos queda ruido. Y sobre todo, no dice nada de la forma de la opinión en sí. Labs se hace otra pregunta: ¿y si pudiéramos calcular directamente en lugar de sortear?',
        ],
        origin: {
          label: 'De dónde viene',
          text: 'En 1946, en Los Álamos, el matemático Stanislaw Ulam, convaleciente, jugaba al solitario y se preguntaba cuáles eran sus probabilidades de ganar. En lugar de intentar el cálculo imposible, pensó que bastaba con jugar cientos de partidas y contar. John von Neumann lo convirtió en un método de cálculo para la física nuclear; su colega Nicholas Metropolis lo llamó «Montecarlo», en alusión a un tío de Ulam que pedía dinero prestado para ir al casino.',
        },
      },
      {
        id: 'esfera',
        kicker: '2 · La forma de la opinión',
        title: 'Un electorado es un punto sobre una esfera',
        body: [
          'Tome unas intenciones de voto: 40 % para un partido, 35 % para otro, 25 % para el resto. Esos tres números siempre suman 100 %. Podrían dibujarse como un punto dentro de un triángulo. Labs hace algo extraño: toma la raíz cuadrada de cada porcentaje. De repente, el triángulo se convierte en un trozo de esfera, como una cáscara de naranja.',
          '¿Por qué? Porque sobre esa esfera, la incertidumbre de una encuesta tiene el mismo tamaño en todas las direcciones. En un triángulo corriente, un partido al 3 % y otro al 40 % no «tiemblan» igual de una encuesta a otra. Sobre la esfera, sí. Un solo ajuste describe entonces el error de todos los partidos, grandes y pequeños.',
          'Otra consecuencia: moverse 2 puntos no significa lo mismo en todas partes. Pasar del 2 % al 4 % es duplicar; pasar del 40 % al 42 % es un detalle. La esfera lo sabe por instinto: la distancia entre dos electorados mide hasta qué punto las encuestas podrían distinguirlos.',
        ],
        figure: 'sphere',
        caption: 'Dos partidos: los porcentajes de voto viven sobre la recta; sus raíces cuadradas, sobre un cuarto de círculo. Cerca de los bordes (un partido casi ausente), un pequeño paso sobre el círculo equivale a muy pocos puntos de voto.',
        origin: {
          label: 'De dónde viene',
          text: 'En 1945, el estadístico indio C. R. Rao, de 24 años, demostró que el conjunto de las distribuciones de probabilidad tiene una geometría: se pueden medir distancias y curvas, como sobre una superficie. Así nació la «geometría de la información». En 1981, el físico William Wootters descubrió que esa distancia estadística es exactamente el ángulo entre dos estados en mecánica cuántica, donde las probabilidades también son cuadrados.',
        },
      },
      {
        id: 'curvatura',
        kicker: '3 · La curvatura',
        title: 'Transportar una flecha sobre un mundo curvo',
        body: [
          'Un experimento mental. De pie sobre el ecuador, sostiene una flecha que apunta al norte. Camina hasta el Polo Norte sin girar nunca la flecha, baja por otro meridiano y vuelve al punto de partida siguiendo el ecuador. Sorpresa: la flecha ha girado, aunque usted nunca la giró. Es la firma de la curvatura.',
          'Labs tiene el mismo problema. El movimiento provincial de las encuestas es una flecha: un partido sube, otro retrocede. Para saber qué significa ese movimiento en una circunscripción concreta, hay que transportar la flecha hasta allí, sobre la esfera, sin deformarla. Se llama transporte paralelo.',
          'El resultado no es ni un swing uniforme (los mismos puntos en todas partes) ni un swing proporcional: decide la geometría. Un partido gana o pierde más puntos donde es fuerte; un partido nuevo puede aparecer donde no existía.',
        ],
        figure: 'transport',
        caption: 'Una flecha transportada sin girarla nunca a lo largo de un triángulo dibujado sobre una esfera vuelve girada: es la curvatura. Labs transporta del mismo modo el movimiento provincial hasta cada circunscripción.',
        origin: {
          label: 'De dónde viene',
          text: 'En 1854, Bernhard Riemann imaginó espacios curvos de cualquier dimensión. Sesenta años después, Albert Einstein los usó para la relatividad general: la gravedad ya no es una fuerza, sino la curvatura del espacio-tiempo. En 1917, Tullio Levi-Civita precisó cómo mover un vector sin torcerlo sobre un espacio curvo, el transporte paralelo, exactamente la herramienta que usa Labs.',
        },
      },
      {
        id: 'apolo',
        kicker: '4 · Seguir la opinión día a día',
        title: 'Navegar como el Apolo',
        body: [
          'Las encuestas llegan una a una, cada una con su margen de error y los hábitos de su encuestadora. Para extraer la posición más probable del electorado, Labs usa un filtro de Kalman adaptado a la esfera: con cada nueva encuesta corrige su posición estimada, teniendo en cuenta la fiabilidad de la medición y el tiempo transcurrido.',
          'También elimina el sesgo propio de cada encuestadora y no deja que una que publica a diario dicte sola el promedio. Los ajustes no se eligen a mano: se estiman a partir de las propias encuestas. Surgió una lección: la opinión no tiene inercia. Una tendencia de una semana no se prolonga por sí sola.',
        ],
        origin: {
          label: 'De dónde viene',
          text: 'En 1960, el ingeniero Rudolf Kálmán publicó un método para estimar el estado de un sistema a partir de mediciones imperfectas. Ese mismo año lo presentó a Stanley Schmidt, en la NASA, cuyo equipo buscaba guiar las naves Apolo hasta la Luna con ordenadores diminutos. El filtro de Kalman navegó hasta la Luna; hoy guía aviones, GPS y teléfonos.',
        },
      },
      {
        id: 'cuantica',
        kicker: '5 · Las encuestas como mediciones',
        title: 'La regla de Born',
        body: [
          'En física cuántica, un sistema se describe con «amplitudes», y la probabilidad de un resultado es el cuadrado de su amplitud. Es la regla de Born. Las raíces cuadradas de la esfera de la sección 2 son exactamente eso: amplitudes cuyo cuadrado devuelve los porcentajes de voto.',
          'Labs trata así cada encuesta como una medición del estado del electorado. Al reunir todas las encuestas se obtiene lo que los físicos llaman una matriz de densidad. Si todas las encuestadoras dijeran lo mismo, sería «pura». Cuanto más se contradicen, más mezclada es, y la entropía de von Neumann mide ese desacuerdo.',
          'Y la noche de la elección, el electorado «colapsa» en un resultado. En nueve elecciones canadienses desde 2015, el partido que encabezaba las encuestas siempre obtuvo más esa noche, y los partidos pequeños menos. Labs lo integra con un solo número, estimado solo con elecciones pasadas: en el momento de la medición, los porcentajes se concentran ligeramente hacia los partidos dominantes.',
        ],
        origin: {
          label: 'De dónde viene',
          text: 'En 1926, Max Born propuso que la función de onda de Schrödinger no describe una partícula, sino la probabilidad de encontrarla: hay que elevarla al cuadrado. La idea le valió el Premio Nobel en 1954. Desde los años 2000, investigadores en ciencias cognitivas usan estas matemáticas para describir decisiones humanas que desafían la probabilidad clásica.',
        },
      },
      {
        id: 'qubits',
        kicker: '6 · Contar los escaños',
        title: 'Qubits en lugar de dados',
        body: [
          'Cada circunscripción se convierte en un pequeño registro, como un qubit: sus amplitudes dan las probabilidades de cada partido de ganar allí. Toda la provincia es el ensamblaje de esos registros, y el número de escaños de un partido se lee en un contador conectado a cada uno de ellos.',
          'Un ordenador cuántico «mediría» ese contador para obtener la distribución de escaños. No lo necesitamos: la estructura del problema permite hacer exactamente el mismo cálculo en un ordenador corriente, circunscripción por circunscripción. Lo comprobamos: un verdadero circuito cuántico, simulado con la biblioteca qiskit de IBM, da la misma distribución hasta la milmillonésima.',
          'Resultado: ningún azar en el recuento de escaños y un cálculo completo en segundos. Solo los grandes choques comunes, como un error nacional de todas las encuestadoras, se recorren sobre una malla regular en lugar de sortearse.',
        ],
        figure: 'register',
        caption: 'Cada circunscripción es un registro cuyas amplitudes dan las probabilidades de cada bando. El contador de escaños se obtiene exactamente, sin un solo sorteo.',
        origin: {
          label: 'De dónde viene',
          text: 'La palabra «qubit» aparece en 1995, acuñada por el físico Benjamin Schumacher. La malla regular que sustituye al azar para los choques comunes viene de Ilya Sobol, un matemático soviético que en 1967 inventó sucesiones de puntos repartidas de forma más uniforme que el azar.',
        },
      },
      {
        id: 'regiones',
        kicker: '7 · El mapa',
        title: 'Muñecas rusas geográficas',
        body: [
          'Las encuestadoras publican a menudo resultados por región, cada una a su manera: el «Montreal» de una es el área metropolitana, el de otra incluye toda la periferia, una tercera publica solo la isla. Labs divide Quebec en trece piezas elementales (la isla, Laval, las coronas, la región de Quebec…) y reconstruye cada región de encuestadora como un ensamblaje de esas piezas.',
          'Las piezas encajan como muñecas rusas: cada una pertenece a un bloque, cada bloque a una gran zona. Cuando una pieza está poco medida, toma información de su bloque y de su zona. Y cada encuesta se compara consigo misma: lo que dice de una región, frente a lo que su propio promedio provincial hacía prever. Sus hábitos de encuestadora se anulan; solo queda la geografía.',
        ],
      },
    ],
    honestyTitle: 'Lo que no es',
    honesty: [
      'Los votantes no son partículas cuánticas, y una elección no tiene nada que ver con la gravedad. Labs toma prestadas matemáticas, no leyes de la naturaleza: resulta que las herramientas inventadas para el espacio curvo y el mundo cuántico son también las herramientas naturales de la probabilidad.',
      'Labs todavía no es mejor que nuestra proyección de referencia: repetidas la víspera de la votación, las elecciones pasadas muestran errores comparables, a veces a favor de uno, a veces del otro. Precisamente por eso funciona al lado, cada noche, con las mismas encuestas. Cuando los dos motores coinciden, la señal es sólida. Cuando divergen, ahí hay que mirar.',
    ],
    readMore: 'Para saber más',
    back: 'Volver a las proyecciones Labs',
    cta: 'Ver lo que proyecta Labs',
    linkLabel: 'Leer la explicación completa',
  },
};

export const EXPLAINER_REFERENCES = [
  { label: 'C. R. Rao (1945) — Information and the accuracy attainable in the estimation of statistical parameters', url: 'https://link.springer.com/chapter/10.1007/978-1-4612-0919-5_15' },
  { label: 'W. K. Wootters (1981) — Statistical distance and Hilbert space', url: 'https://link.aps.org/doi/10.1103/PhysRevD.23.357' },
  { label: 'N. Metropolis (1987) — The beginning of the Monte Carlo method', url: 'https://mcnp.lanl.gov/pdf_files/Article_1987_LAS_Metropolis_125--130.pdf' },
  { label: 'NASA — Discovery of the Kalman filter as a practical tool for aerospace', url: 'https://ntrs.nasa.gov/api/citations/19860003843/downloads/19860003843.pdf' },
  { label: 'F. Dubois — On quantum models for opinion and voting intention polls', url: 'https://arxiv.org/abs/2411.13593' },
  { label: 'Lin, Wang & Hong — The Poisson multinomial distribution in voting theory', url: 'https://arxiv.org/abs/2201.04237' },
];
