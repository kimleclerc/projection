/**
 * Données du jeu Vibe Match (Québec 2026), partagées par les trois routes
 * `/{fr,en,es}/canada/quebec/match`.
 *
 * Centralisé pour deux raisons. D'abord éviter de tripler la même dérivation
 * dans trois frontmatters. Ensuite et surtout : la version d'origine levait une
 * exception quand le Québec ne comptait pas exactement 127 circonscriptions.
 * Dans un build statique, cette exception ne casse pas le jeu — elle casse le
 * BUILD, donc les 7 974 pages du site. Or un redécoupage est un événement
 * prévu, pas une corruption : le Québec est déjà passé de 125 à 127 sièges.
 * On avertit donc bruyamment au build et on rend le jeu avec ce qui existe.
 */
import quebec from '../../web_data/quebec/latest.json';
import { ridingSlug } from './riding-adapters/types';

export type VibeLocale = 'fr' | 'en' | 'es';

/** Les cinq partis que le jeu classe. `qc_oth` est un résidu, pas un choix. */
const PARTY_ORDER = ['pq', 'plq', 'pcq', 'caq', 'qs'] as const;

/** Le segment « circonscription » diffère par langue, le slug non. */
const RIDING_SEGMENT: Record<VibeLocale, string> = {
  fr: 'circonscriptions',
  en: 'ridings',
  es: 'distritos',
};

/** Nombre de sièges attendu — indicatif, jamais bloquant. */
const EXPECTED_SEATS = 127;

export const runDate = quebec.meta.run_date;

export function vibeMatchParties(locale: VibeLocale) {
  return PARTY_ORDER.map((id) => {
    const party = quebec.parties.find((p) => p.party === id);
    if (!party) return null;
    return {
      id,
      // Aucun `label_es` n'existe en amont : les noms des partis québécois sont
      // des noms propres français (PQ, PLQ, QS, CAQ, PCQ), identiques en espagnol.
      shortName: locale === 'en' ? party.label_en : party.label_fr,
      color: party.color,
      voteMean: party.vote_mean,
    };
  }).filter((party): party is NonNullable<typeof party> => party !== null);
}

export function vibeMatchRidings(locale: VibeLocale) {
  const collator = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'fr';
  const seen = new Set<string>();

  const ridings = quebec.ridings
    .filter((riding) => {
      // Un doublon d'identifiant casserait le sélecteur : on l'écarte plutôt
      // que de le laisser produire deux entrées indiscernables.
      const id = String(riding.riding_id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((riding) => {
      const name = locale === 'en' ? riding.name_en : riding.name_fr;
      const slug = ridingSlug(String(riding.riding_id), riding.name_fr);
      return {
        id: String(riding.riding_id),
        name,
        href: `/${locale}/canada/quebec/${RIDING_SEGMENT[locale]}/${slug}/`,
        region: riding.region,
        urbanRural: riding.urban_rural,
        voteMean: riding.projection.vote_mean,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, collator));

  if (ridings.length !== EXPECTED_SEATS) {
    console.warn(
      `⚠ Vibe Match : ${ridings.length} circonscriptions québécoises uniques, ` +
        `${EXPECTED_SEATS} attendues. Le jeu se rend quand même — vérifier si ` +
        `c'est un redécoupage (mettre EXPECTED_SEATS à jour) ou des données ` +
        `abîmées (web_data/quebec/latest.json).`,
    );
  }

  return ridings;
}
