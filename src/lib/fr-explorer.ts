// Sélection du scénario hero et des vedettes de l'explorateur présidentiel —
// extraite de FranceDesk.astro pour être partagée avec la page embed
// (/​{locale}/embed/france-scenarios). La logique éditoriale vit ici une
// seule fois : tout ajustement s'applique au desk ET aux iframes.
import { toScenarioCard, type FrScenario, type Locale, type ScenarioCard } from './fr-pres';

export interface HeroPick {
  heroScenario: FrScenario;
  heroId: string;
  /** Candidat d'extrême droite officiellement déclaré (fiche data_sheets), si présent. */
  rnDeclared: any | undefined;
}

/* MISE EN AVANT DU CANDIDAT RN DÉCLARÉ (éditorial, data-driven) : au juillet
 * 2026 c'est Marine Le Pen, pas Bardella. Le hero features le casting vedette
 * LE PLUS SONDÉ qui inclut le candidat d'extrême droite officiellement
 * déclaré. Si une décision de justice rebascule la candidature (Bardella),
 * le hero suit automatiquement — aucune valeur codée en dur. Repli sur le
 * scénario par défaut du modèle si aucun RN déclaré. */
export function pickHeroScenario(
  scenarios: FrScenario[],
  candidates: any[],
  defaultId: string,
): HeroPick {
  const defaultScenario =
    scenarios.find((s) => s.scenario.scenario_id === defaultId) ?? scenarios[0];

  const declaredCandidates = candidates.filter((c) => c.status === 'declared');
  const rnDeclared = declaredCandidates.find((c) => c.bloc === 'far_right');
  const rnHeroScenario = rnDeclared
    ? [...scenarios]
        .filter(
          (s) =>
            s.scenario.featured &&
            s.scenario.active_candidate_ids.includes(rnDeclared.candidate_id),
        )
        .sort(byCurrentEvidence)[0]
    : undefined;
  const heroScenario = rnHeroScenario ?? defaultScenario;
  return { heroScenario, heroId: heroScenario.scenario.scenario_id, rnDeclared };
}

/* LE CLASSEMENT SE FAIT SUR LES PREUVES ENCORE D'ACTUALITÉ.
 *
 * `n_polls_used` compte TOUS les sondages retenus, emprunts aux configurations
 * voisines compris, et ne vieillit jamais. Trié là-dessus, le hero du desk
 * s'est retrouvé le 2026-09-14 sur une configuration dont le dernier sondage
 * datait de 644 jours — avant l'appel purgé de Le Pen, avant la montée de
 * Bardella — pendant qu'une configuration à cinq sondages de quatre jours
 * n'apparaissait nulle part. `n_polls_recent` (moteur : fenêtre de six mois)
 * passe donc devant ; le total reste en départage à fraîcheur égale. */
function byCurrentEvidence(a: FrScenario, b: FrScenario): number {
  const recent = (s: FrScenario) => s.scenario.n_polls_recent ?? 0;
  const used = (s: FrScenario) => s.diagnostics?.n_polls_used ?? 0;
  return recent(b) - recent(a) || used(b) - used(a);
}

/* Explorateur : vedettes robustes (≥ 3 sondages retenus), scénario du hero en
 * tête, castings Le Pen ensuite, puis par preuves encore d'actualité. */
export function buildExplorerCards(
  scenarios: FrScenario[],
  heroId: string,
  locale: Locale,
): ScenarioCard[] {
  const featured = scenarios.filter((s) => s.scenario.featured);
  return [...featured]
    .filter((s) => s.scenario.scenario_id === heroId || (s.diagnostics?.n_polls_used ?? 0) >= 3)
    .sort((a, b) => {
      if (a.scenario.scenario_id === heroId) return -1;
      if (b.scenario.scenario_id === heroId) return 1;
      const aLepen = a.scenario.category === 'le_pen' ? 1 : 0;
      const bLepen = b.scenario.category === 'le_pen' ? 1 : 0;
      if (aLepen !== bLepen) return bLepen - aLepen;
      return byCurrentEvidence(a, b);
    })
    .slice(0, 8)
    .map((s) => toScenarioCard(s, locale));
}
