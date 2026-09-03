import { useMemo } from 'preact/hooks';
import { useUrlParam } from './lib/urlState';

/* Sélecteur de scénarios — Clacton 2.0.
 *
 * Quatre interrupteurs, 24 combinaisons précalculées par
 * run_clacton_recall_projection.py. Rien n'est simulé dans le navigateur : on
 * lit une cellule de la grille. C'est ce qui permet de laisser l'utilisateur
 * explorer SANS que la page puisse produire un chiffre que le moteur n'a pas
 * écrit — y compris les combinaisons qui nous contredisent.
 */

type Locale = 'en' | 'fr' | 'es';
type Field = 'all_parties' | 'partial' | 'boycott_repeat';
type Trigger = 'forced' | 'resignation';

interface Cell {
  p_reform_hold: number;
  candidates: Record<string, {
    labels: Record<string, string>;
    share: Record<string, number>;
    p_win: number;
  }>;
}

interface Props {
  grid: Record<string, Cell>;
  locale: Locale;
  /** Ordre d'affichage des blocs. */
  buckets: string[];
  colors: Record<string, string>;
}

const COPY = {
  fr: {
    intro: 'Quatre interrupteurs, 24 courses précalculées. Rien n’est simulé dans votre navigateur : chaque combinaison a été tirée 25 000 fois par le moteur.',
    farage: 'Farage se représente',
    farageYes: 'Oui', farageNo: 'Non',
    field: 'Qui présente des candidats',
    fieldAll: 'Tous les partis', fieldPartial: 'Con + Lab seulement', fieldBoycott: 'Boycott, comme en août',
    binface: 'Count Binface',
    binfaceYes: 'Se présente', binfaceNo: 'Absent',
    trigger: 'Ce qui a déclenché la partielle',
    triggerForced: 'Subie (suspension ou condamnation)', triggerResign: 'Démission choisie',
    triggerHelp: 'Une partielle subie arrive avec un verdict institutionnel déjà tombé : le malus de scandale sur Reform est plus lourd que pour une démission que Farage aurait choisi le moment de déclencher.',
    hold: 'Reform conserve le siège',
    rangeLabel: 'Parts projetées — 10e-90e percentile, médiane marquée',
    winner: 'en tête',
    caveat: 'Ces courses sont CONDITIONNELLES : elles supposent qu’une seconde partielle a lieu. La probabilité qu’elle ait lieu est une autre question, traitée plus haut.',
  },
  en: {
    intro: 'Four switches, 24 pre-computed races. Nothing is simulated in your browser: every combination was drawn 25,000 times by the engine.',
    farage: 'Farage stands again',
    farageYes: 'Yes', farageNo: 'No',
    field: 'Who fields candidates',
    fieldAll: 'All parties', fieldPartial: 'Con + Lab only', fieldBoycott: 'Boycott, as in August',
    binface: 'Count Binface',
    binfaceYes: 'Stands', binfaceNo: 'Absent',
    trigger: 'What triggered the by-election',
    triggerForced: 'Forced (suspension or conviction)', triggerResign: 'Chosen resignation',
    triggerHelp: 'A by-election he did not choose arrives with an institutional verdict already against him: the scandal penalty on Reform is heavier than for a resignation timed by Farage himself.',
    hold: 'Reform holds the seat',
    rangeLabel: 'Projected shares — 10th–90th percentile, median marked',
    winner: 'leads',
    caveat: 'These races are CONDITIONAL: they assume a second by-election happens. Whether it happens is a separate question, handled above.',
  },
  es: {
    intro: 'Cuatro interruptores, 24 contiendas precalculadas. Nada se simula en su navegador: cada combinación fue sorteada 25 000 veces por el motor.',
    farage: 'Farage se presenta de nuevo',
    farageYes: 'Sí', farageNo: 'No',
    field: 'Quién presenta candidatos',
    fieldAll: 'Todos los partidos', fieldPartial: 'Solo Con + Lab', fieldBoycott: 'Boicot, como en agosto',
    binface: 'Count Binface',
    binfaceYes: 'Se presenta', binfaceNo: 'Ausente',
    trigger: 'Qué provocó la parcial',
    triggerForced: 'Forzada (suspensión o condena)', triggerResign: 'Renuncia elegida',
    triggerHelp: 'Una parcial no elegida llega con un veredicto institucional ya en contra: la penalización por escándalo sobre Reform es mayor que en una renuncia cuyo momento elige Farage.',
    hold: 'Reform conserva el escaño',
    rangeLabel: 'Cuotas proyectadas — percentil 10–90, mediana marcada',
    winner: 'encabeza',
    caveat: 'Estas contiendas son CONDICIONALES: suponen que hay una segunda parcial. Si ocurre o no es otra pregunta, tratada arriba.',
  },
};

function cellId(farage: boolean, field: Field, binface: boolean, trigger: Trigger) {
  return `${farage ? 'F' : 'noF'}|${field}|${binface ? 'bin' : 'nobin'}|${trigger}`;
}

export default function ClactonScenarioPicker({ grid, locale, buckets, colors }: Props) {
  const t = COPY[locale] ?? COPY.en;

  const [farage, setFarage] = useUrlParam('farage', 'yes');
  const [field, setField] = useUrlParam('field', 'all_parties');
  const [binface, setBinface] = useUrlParam('binface', 'yes');
  const [trigger, setTrigger] = useUrlParam('trigger', 'forced');

  const cell = useMemo(() => {
    const id = cellId(farage === 'yes', field as Field, binface === 'yes', trigger as Trigger);
    return grid[id] ?? grid[cellId(true, 'all_parties', true, 'forced')];
  }, [grid, farage, field, binface, trigger]);

  const rows = useMemo(() => {
    const list = buckets
      .map((k) => ({ key: k, ...cell.candidates[k] }))
      .filter((r) => r.share)
      .sort((a, b) => b.share.q50 - a.share.q50);
    const max = Math.max(...list.map((r) => r.share.q90)) * 1.05;
    return { list, max };
  }, [cell, buckets]);

  const nf = (v: number, d = 1) =>
    locale === 'en' ? v.toFixed(d) : v.toFixed(d).replace('.', ',');
  // Une page de prévision n'affiche jamais 100 % ni 0 % — convention Clacton.
  const prob = (v: number) => (v > 0.995 ? '> 99' : v < 0.005 ? '< 1' : nf(v * 100, 1));

  const label = (r: any) => r.labels?.[locale] ?? r.labels?.en ?? r.key;

  return (
    <div class="csp">
      <p class="csp-intro">{t.intro}</p>

      <div class="csp-controls">
        <fieldset class="csp-group">
          <legend>{t.farage}</legend>
          <div class="csp-seg" role="radiogroup" aria-label={t.farage}>
            {[['yes', t.farageYes], ['no', t.farageNo]].map(([v, l]) => (
              <button type="button" role="radio" aria-checked={farage === v}
                class={`csp-opt${farage === v ? ' is-on' : ''}`} onClick={() => setFarage(v)}>{l}</button>
            ))}
          </div>
        </fieldset>

        <fieldset class="csp-group">
          <legend>{t.field}</legend>
          <div class="csp-seg" role="radiogroup" aria-label={t.field}>
            {[['all_parties', t.fieldAll], ['partial', t.fieldPartial], ['boycott_repeat', t.fieldBoycott]].map(([v, l]) => (
              <button type="button" role="radio" aria-checked={field === v}
                class={`csp-opt${field === v ? ' is-on' : ''}`} onClick={() => setField(v)}>{l}</button>
            ))}
          </div>
        </fieldset>

        <fieldset class="csp-group">
          <legend>{t.binface}</legend>
          <div class="csp-seg" role="radiogroup" aria-label={t.binface}>
            {[['yes', t.binfaceYes], ['no', t.binfaceNo]].map(([v, l]) => (
              <button type="button" role="radio" aria-checked={binface === v}
                class={`csp-opt${binface === v ? ' is-on' : ''}`} onClick={() => setBinface(v)}>{l}</button>
            ))}
          </div>
        </fieldset>

        <fieldset class="csp-group">
          <legend>{t.trigger}</legend>
          <div class="csp-seg" role="radiogroup" aria-label={t.trigger}>
            {[['forced', t.triggerForced], ['resignation', t.triggerResign]].map(([v, l]) => (
              <button type="button" role="radio" aria-checked={trigger === v}
                class={`csp-opt${trigger === v ? ' is-on' : ''}`} onClick={() => setTrigger(v)}>{l}</button>
            ))}
          </div>
          <p class="csp-help">{t.triggerHelp}</p>
        </fieldset>
      </div>

      <div class="csp-headline">
        <strong>{prob(cell.p_reform_hold)}%</strong>
        <span>{t.hold}</span>
      </div>

      <p class="csp-range-label">{t.rangeLabel}</p>
      <div class="csp-rows">
        {rows.list.map((r, i) => {
          const color = colors[r.key] ?? '#9a938a';
          const pc = (v: number) => `${(v / rows.max) * 100}%`;
          return (
            <div class="csp-row">
              <div class="csp-name">
                <i style={`background:${color}`}></i>
                <span>{label(r)}{i === 0 ? <small> · {t.winner}</small> : null}</span>
              </div>
              <div class="csp-track">
                <div class="csp-band" style={`left:${pc(r.share.q10)};width:calc(${pc(r.share.q90)} - ${pc(r.share.q10)});background:${color}22;border-color:${color}`}></div>
                <div class="csp-median" style={`left:${pc(r.share.q50)};background:${color}`}></div>
              </div>
              <div class="csp-nums">
                <strong>{nf(r.share.q50)}%</strong>
                <small>[{nf(r.share.q10, 0)}–{nf(r.share.q90, 0)}]</small>
              </div>
            </div>
          );
        })}
      </div>

      <p class="csp-caveat">{t.caveat}</p>
    </div>
  );
}
