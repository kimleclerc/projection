/**
 * Accueil US, le lendemain du 3 novembre 2026 : sièges appelés par chambre et
 * bascules (course gagnée par un autre parti que le sortant). Rendu au build
 * depuis la copie de repli du live.json, puis tenu à jour dans le navigateur.
 */
import type { Chamber, UsLivePayload } from './usLive';
import { etStamp, homeView, num, seatsOf, useLiveView, type HomeContext, type HomeView, type Lang } from '../lib/us-results';
import '../styles/us-results.css';

type Race = { name: string; href?: string };
interface Props {
  lang: Lang; initial: HomeView; ctx: HomeContext; urls: string[];
  races: Record<string, Race>; colors: Record<string, string>;
  pages: Record<Chamber, string>; seats: Record<Chamber, number>; majority: Record<Chamber, number | null>;
}

const T = {
  fr: {
    title: 'Les résultats', asOf: (s: string) => `Appels Vote-Scope au ${s}, heure de l’Est.`,
    chamber: { house: 'Chambre des représentants', senate: 'Sénat', governor: 'Gouverneurs' } as Record<Chamber, string>,
    short: { house: 'Chambre', senate: 'Sénat', governor: 'Gouverneur' } as Record<Chamber, string>,
    party: { us_dem: 'démocrate', us_rep: 'républicain', us_oth: 'autre' } as Record<string, string>,
    others: 'Autres',
    houseNote: (n: number, seats: number, maj: number) => `Sièges appelés : ${n} sur ${seats}. Majorité : ${maj}.`,
    senateNote: (n: number, races: number, maj: number) => `Avec les sièges non renouvelés cette année. Courses appelées : ${n} sur ${races}. Majorité : ${maj}.`,
    govNote: (n: number, races: number) => `Courses appelées : ${n} sur ${races}.`,
    flipsTitle: (n: number) => n === 0 ? 'Aucune bascule pour l’instant' : `${n} siège${n > 1 ? 's' : ''} chang${n > 1 ? 'ent' : 'e'} de parti`,
    flipsLede: 'Courses gagnées par un autre parti que celui du sortant (siège vacant : le parti qui l’a gagné en 2024).',
    flip: (from: string, to: string) => `de ${from} à ${to}`,
  },
  en: {
    title: 'The results', asOf: (s: string) => `Vote-Scope calls as of ${s} Eastern.`,
    chamber: { house: 'House of Representatives', senate: 'Senate', governor: 'Governors' } as Record<Chamber, string>,
    short: { house: 'House', senate: 'Senate', governor: 'Governor' } as Record<Chamber, string>,
    party: { us_dem: 'Democratic', us_rep: 'Republican', us_oth: 'other' } as Record<string, string>,
    others: 'Others',
    houseNote: (n: number, seats: number, maj: number) => `Seats called: ${n} of ${seats}. Majority: ${maj}.`,
    senateNote: (n: number, races: number, maj: number) => `Including seats not up this year. Races called: ${n} of ${races}. Majority: ${maj}.`,
    govNote: (n: number, races: number) => `Races called: ${n} of ${races}.`,
    flipsTitle: (n: number) => n === 0 ? 'No seat has changed hands yet' : `${n} seat${n === 1 ? '' : 's'} changing hands`,
    flipsLede: 'Races won by a party other than the incumbent’s (for a vacant seat, the party that won it in 2024).',
    flip: (from: string, to: string) => `${from} to ${to}`,
  },
  es: {
    title: 'Los resultados', asOf: (s: string) => `Llamadas de Vote-Scope al ${s}, hora del Este.`,
    chamber: { house: 'Cámara de Representantes', senate: 'Senado', governor: 'Gobernadores' } as Record<Chamber, string>,
    short: { house: 'Cámara', senate: 'Senado', governor: 'Gobernador' } as Record<Chamber, string>,
    party: { us_dem: 'demócrata', us_rep: 'republicano', us_oth: 'otro' } as Record<string, string>,
    others: 'Otros',
    houseNote: (n: number, seats: number, maj: number) => `Escaños llamados: ${n} de ${seats}. Mayoría: ${maj}.`,
    senateNote: (n: number, races: number, maj: number) => `Incluidos los escaños que no se renuevan este año. Contiendas llamadas: ${n} de ${races}. Mayoría: ${maj}.`,
    govNote: (n: number, races: number) => `Contiendas llamadas: ${n} de ${races}.`,
    flipsTitle: (n: number) => n === 0 ? 'Ningún escaño ha cambiado de partido por ahora' : `${n} escaño${n === 1 ? '' : 's'} cambia${n === 1 ? '' : 'n'} de partido`,
    flipsLede: 'Contiendas ganadas por un partido distinto del saliente (en un escaño vacante, el partido que lo ganó en 2024).',
    flip: (from: string, to: string) => `de ${from} a ${to}`,
  },
};

const CH: Chamber[] = ['house', 'senate', 'governor'];

export default function UsResultsHome({ lang, initial, ctx, urls, races, colors, pages, seats, majority }: Props) {
  const v = useLiveView<HomeView>(urls, initial, (p: UsLivePayload) => homeView(p, ctx));
  const t = T[lang];
  const stamp = etStamp(v.generatedAt, lang);
  return (
    <section class="container ush" aria-labelledby="ush-h">
      <h2 id="ush-h" class="usr-h">{t.title}</h2>
      {stamp && <p class="usr-meta">{t.asOf(stamp)}</p>}
      <div class="ush-grid">
        {CH.map((ch) => {
          const c = v.counts[ch];
          const hold = ch === 'senate';
          const d = seatsOf(c, 'us_dem', hold), r = seatsOf(c, 'us_rep', hold), o = seatsOf(c, 'us_oth', hold);
          const note = ch === 'house' ? t.houseNote(c.calledRaces, seats.house, majority.house ?? 218)
            : ch === 'senate' ? t.senateNote(c.calledRaces, c.races, majority.senate ?? 51) : t.govNote(c.calledRaces, c.races);
          return (
            <div class="ush-cell" key={ch}>
              <h3><a href={pages[ch]}>{t.chamber[ch]}</a></h3>
              <p class="ush-nums">
                <span class="ush-num" style={`color:${colors.us_dem}`}>{num(d, lang)}<small>D</small></span>
                <span class="ush-num" style={`color:${colors.us_rep}`}>{num(r, lang)}<small>R</small></span>
                {o > 0 && <span class="ush-num">{num(o, lang)}<small>{t.others}</small></span>}
              </p>
              <p class="ush-note">{note}</p>
            </div>
          );
        })}
      </div>
      <h3 class="ush-sub">{t.flipsTitle(v.flips.length)}</h3>
      <p class="ush-note">{t.flipsLede}</p>
      {v.flips.length > 0 && (
        <ul class="ush-flips">
          {v.flips.map((f) => {
            const ch = CH.find((c) => f.id.startsWith(c === 'house' ? 'H-' : c === 'senate' ? 'S-' : 'G-'))!;
            const race = races[f.id];
            const label = ch === 'house' ? (race?.name ?? f.id) : `${t.short[ch]} · ${race?.name ?? f.id}`;
            return (
              <li key={f.id}>
                <span class="ush-swatch" style={`background:${colors[f.to] ?? '#777'}`} aria-hidden="true"></span>
                <span>{race?.href ? <a class="vs-link" href={race.href}>{label}</a> : label}{lang === 'fr' ? ' : ' : ': '}{t.flip(t.party[f.from] ?? f.from, t.party[f.to] ?? f.to)}{f.candidate ? ` (${f.candidate})` : ''}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
