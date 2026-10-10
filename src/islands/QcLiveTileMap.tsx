import { useMemo, useState } from 'preact/hooks';
import { deriveRows, numFmt, useLive, type Locale, type PartyInfo, type RidingInfo } from './qcLiveBus';
import tiles from '../data/qc-tiles.json';

/**
 * Carte en tuiles des 127 circonscriptions : une case par siège, placée à peu
 * près selon la géographie (scripts/build-qc-tiles.py). Avant 20 h : la
 * projection d'avant-scrutin. Le soir : teinte pâle = en tête, pleine = élu,
 * coin = la circonscription change de parti (par rapport au sortant).
 */
const copy = {
  fr: { title: 'La carte des 127 circonscriptions', before: 'Projection d’avant-scrutin. La carte passe au dépouillement à 20 h.',
        live: 'Pâle : en tête. Plein : élu. Coin blanc : la circonscription change de parti.', leading: 'en tête', elected: 'élu', projected: 'projeté',
        noResult: 'aucun résultat', gain: 'gain', polls: 'bureaux', open: 'Voir la circonscription', tap: 'Touchez une case pour le détail.' },
  en: { title: 'Map of all 127 ridings', before: 'Pre-election projection. The map switches to the live count at 8 p.m.',
        live: 'Light: leading. Solid: elected. White corner: the seat changes hands.', leading: 'leading', elected: 'elected', projected: 'projected',
        noResult: 'no results yet', gain: 'gain', polls: 'polls', open: 'Open the riding', tap: 'Tap a square for details.' },
  es: { title: 'El mapa de los 127 distritos', before: 'Proyección previa. El mapa pasa al recuento a las 20:00.',
        live: 'Claro: en cabeza. Lleno: electo. Esquina blanca: el distrito cambia de partido.', leading: 'en cabeza', elected: 'electo', projected: 'proyectado',
        noResult: 'sin resultados', gain: 'ganancia', polls: 'mesas', open: 'Ver el distrito', tap: 'Toca una casilla para ver el detalle.' },
};

export default function QcLiveTileMap({ lang, parties, ridings }: { lang: Locale; parties: PartyInfo[]; ridings: RidingInfo[] }) {
  const t = copy[lang];
  const { data } = useLive();
  const [sel, setSel] = useState<string | null>(null);
  const pmap = useMemo(() => new Map(parties.map((p) => [p.code, p])), [parties]);
  const rows = useMemo(() => new Map(deriveRows(data).map((r) => [r.id, r])), [data]);
  const live = !!data && [...rows.values()].some((r) => r.party);
  const grid = tiles as { cols: number; rows: number; tiles: Record<string, [number, number]> };

  const info = (rid: string) => {
    const r = rows.get(rid); const rd = ridings.find((x) => x.id === rid);
    const party = live ? r?.party ?? null : rd?.projected ?? null;
    const state = !live ? 'projected' : r?.call ? 'elected' : r?.party ? 'leading' : 'none';
    const held = rd?.holder ?? rd?.winner2022;
    const gain = live && !!party && !!held && party !== held;
    return { r, rd, party, state, gain };
  };

  const selected = sel ? info(sel) : null;
  const present = [...new Set(ridings.map((rd) => info(rd.id).party).filter(Boolean))] as string[];

  return (
    <div class="qtm">
      <div class="qtm-head">
        <h2>{t.title}</h2>
        <p>{live ? t.live : t.before}</p>
      </div>
      <div class="qtm-grid" style={`grid-template-columns:repeat(${grid.cols},1fr)`} role="group" aria-label={t.title}>
        {ridings.map((rd) => {
          const pos = grid.tiles[rd.id]; if (!pos) return null;
          const { party, state, gain } = info(rd.id);
          const color = party ? pmap.get(party)?.color ?? '#90a4ae' : undefined;
          return (
            <button key={rd.id} type="button" class={`qtm-tile is-${state}${gain ? ' is-gain' : ''}${sel === rd.id ? ' is-sel' : ''}`}
              style={`grid-column:${pos[0] + 1};grid-row:${pos[1] + 1};${color ? `--c:${color}` : ''}`}
              aria-label={rd.name} title={rd.name} onClick={() => setSel(sel === rd.id ? null : rd.id)}></button>
          );
        })}
      </div>
      <div class="qtm-foot">
        <ul class="qtm-legend">
          {present.map((code) => { const p = pmap.get(code); return p ? <li key={code}><i style={`background:${p.color}`}></i>{p.label}</li> : null; })}
        </ul>
        {selected?.rd ? (
          <div class="qtm-info">
            <strong>{selected.rd.name}</strong>
            {selected.state === 'none' ? <span>{t.noResult}</span> : (
              <span>
                {selected.party ? pmap.get(selected.party)?.label ?? selected.party.toUpperCase() : ''}
                {' · '}{selected.state === 'elected' ? t.elected : selected.state === 'leading' ? t.leading : t.projected}
                {selected.r?.leader ? ` · ${selected.r.leader.candidate_name} ${numFmt(selected.r.leader.vote_pct ?? 0, lang)} %` : ''}
                {selected.r?.polls?.total ? ` · ${selected.r.polls.reported ?? 0}/${selected.r.polls.total} ${t.polls}` : ''}
                {selected.gain ? ` · ${t.gain}` : ''}
              </span>
            )}
            <a href={selected.rd.href}>{t.open}</a>
          </div>
        ) : <p class="qtm-hint">{t.tap}</p>}
      </div>
    </div>
  );
}
