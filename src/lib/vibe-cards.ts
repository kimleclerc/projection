/**
 * Le paquet du jeu Vibe Match — la couche ÉDITORIALE.
 *
 * Séparation volontaire : ce fichier ne porte que des mots. Les poids vivent
 * dans `web_data/quebec/vibe_calibration.json`, dérivés des tableaux croisés
 * Léger et réactualisés à chaque rapport. Une carte se réécrit ici sans
 * toucher au modèle ; un poids se recalibre là-bas sans toucher au texte.
 *
 * Le champ `id` fait le joint : il doit correspondre à une entrée de la
 * calibration, sinon la carte vaut zéro — ce qui est le comportement voulu
 * pour les cartes d'ambiance, qui n'ont volontairement aucun poids mesuré.
 *
 * Pourquoi ce paquet-là. Chaque carte a été retenue sur deux critères : son
 * pouvoir discriminant mesuré, et son ORTHOGONALITÉ aux a priori gratuits.
 * La circonscription encode déjà l'axe rural/urbain et la région ; la langue
 * de navigation encode déjà le clivage francophone. Une carte qui redit ça ne
 * gagne rien. C'est ce qui a écarté « Le français, faut le défendre »
 * (r = +0,93 avec l'axe rural/urbain) et la sécurité publique (r = +0,85 avec
 * la région de Québec) — les deux cartes les plus délicates du lot étaient
 * aussi les moins additives, donc leur retrait ne coûte presque rien.
 */

import type { Card, Locale } from './vibe-engine';

export interface VibeCard extends Card {
  text: Record<Locale, string>;
  /** Habillage visuel, sans effet sur le score. */
  tone: 'paper' | 'red' | 'blue' | 'ink';
}

export const CARDS: VibeCard[] = [
  // ── Ouverture : aucune valeur prédictive, et c'est le but ────────────────
  //
  // Trois fonctions. Poser le ton — un jeu qui s'ouvre sur la souveraineté
  // n'est plus un jeu. Ancrer le geste avant que les questions ne pèsent.
  // Et brouiller la triche : le choix des cartes suivantes étant adaptatif,
  // quelqu'un qui cherche à viser un parti ne sait pas ce qui vient.
  //
  // Leurs réponses partent quand même dans la calibration : si la boucle D1
  // révèle qu'une carte d'ambiance sépare vraiment, elle recevra un poids
  // mesuré sans qu'une ligne de code change ici.
  {
    id: 'warmup:tims',
    warmup: true,
    tone: 'paper',
    text: {
      fr: 'J’aime Tim Hortons.',
      en: 'I like Tim Hortons.',
      es: 'Me gusta Tim Hortons.',
    },
  },
  {
    id: 'warmup:pickup',
    warmup: true,
    tone: 'ink',
    text: {
      fr: 'Un pickup, c’est pratique.',
      en: 'A pickup truck just makes sense.',
      es: 'Una camioneta es práctica.',
    },
  },

  // ── Le cœur : poids mesurés, classés par pouvoir discriminant ────────────

  // Écart 4,39 — la carte la plus forte du jeu, et de loin. 75,5 % des
  // péquistes sont souverainistes contre 3,7 % des libéraux, poolé sur cinq
  // sondages (n = 3 975). Répondre OUI va CONTRE la souveraineté, d'où la
  // polarité inversée.
  {
    id: 'sovereignty:pour',
    polarity: -1,
    tone: 'red',
    text: {
      fr: 'J’aime le Canada.',
      en: 'I like Canada.',
      es: 'Me gusta Canadá.',
    },
  },

  // Écart 1,91 — la seule carte quasi orthogonale à TOUS les a priori
  // (r = −0,07 avec la langue, −0,04 avec la région). Elle fait aussi ce que
  // la souveraineté ne sait pas faire : séparer le PQ de QS. 17 % des
  // péquistes citent le référendum comme enjeu déterminant, contre 1 % des
  // solidaires — souverainistes en valeur, pas en priorité.
  {
    id: 'issue_salience:referendum',
    tone: 'blue',
    text: {
      fr: 'Un référendum, il faudrait le tenir.',
      en: 'We should actually hold a referendum.',
      es: 'Habría que celebrar un referéndum.',
    },
  },

  // Écart 1,87 — 28 % des solidaires citent l'environnement contre 2 % des
  // conservateurs. Le contraste le plus net de la batterie après la
  // souveraineté.
  {
    id: 'issue_salience:environnement',
    tone: 'paper',
    text: {
      fr: 'Le climat, j’y pense pour vrai.',
      en: 'The climate is genuinely on my mind.',
      es: 'El clima me preocupa de verdad.',
    },
  },

  // Écart 0,82 — la signature conservatrice : 25 % des électeurs du PCQ
  // citent le fonctionnement de l'État contre 8 % des solidaires.
  {
    id: 'issue_salience:etat',
    tone: 'ink',
    text: {
      fr: 'L’État est trop gros et trop lent.',
      en: 'The state is too big and too slow.',
      es: 'El Estado es demasiado grande y lento.',
    },
  },

  // Écart 0,75.
  {
    id: 'issue_salience:education',
    tone: 'blue',
    text: {
      fr: 'L’école, c’est là qu’il faut mettre l’argent.',
      en: 'Schools are where the money should go.',
      es: 'La escuela es donde hay que poner el dinero.',
    },
  },

  // Écart 0,73 — déjà présente dans le jeu d'origine, et c'était l'une des
  // deux seules cartes que l'intuition avait bien visées.
  {
    id: 'issue_salience:fiscalite',
    tone: 'ink',
    text: {
      fr: 'Je paye trop d’impôts.',
      en: 'I pay too much tax.',
      es: 'Pago demasiados impuestos.',
    },
  },

  // Écart 0,66.
  {
    id: 'issue_salience:economie',
    tone: 'red',
    text: {
      fr: 'Ce qui compte, c’est que l’économie roule.',
      en: 'What matters is keeping the economy moving.',
      es: 'Lo que importa es que la economía funcione.',
    },
  },

  // ── Respiration : mesurées mais faibles, elles cassent le rythme ─────────
  // Assez réelles pour ne rien gaspiller, assez douces pour relâcher.
  {
    id: 'issue_salience:logement',
    tone: 'paper',
    text: {
      fr: 'Se loger est devenu impossible.',
      en: 'Finding a place to live has become impossible.',
      es: 'Encontrar vivienda se ha vuelto imposible.',
    },
  },
  {
    id: 'issue_salience:transports',
    tone: 'blue',
    text: {
      fr: 'Se déplacer ici, c’est une corvée.',
      en: 'Getting around here is a chore.',
      es: 'Moverse por aquí es una lata.',
    },
  },
];

/** Ordre d'ouverture garanti : les cartes d'ambiance d'abord, telles quelles. */
export const WARMUP_COUNT = CARDS.filter((c) => c.warmup).length;

export function cardText(card: VibeCard, locale: Locale): string {
  return card.text[locale] ?? card.text.fr;
}
