import { useEffect, useMemo, useState } from 'preact/hooks';
import { flagFor } from '../lib/wc-flags';

type Lang = 'en' | 'fr' | 'es';

type BoardTeam = {
  team: string;
  labels: Record<string, string>;
  group: string;
  p_champion: number;
  p_final: number;
  p_semifinal: number;
};

type Props = {
  lang: Lang;
  board: BoardTeam[];
};

type Picks = {
  champion: string;
  finalist: string;
  surprise: string;
};

const STORAGE_KEY = 'wc2026-beat-the-model';

const T: Record<Lang, Record<string, string>> = {
  en: {
    intro: 'The model ran 50,000 tournaments. Now it’s your turn: call your champion, the other finalist, and one surprise semifinalist. We’ll tell you how bold your board is — and whether you’re just copying the machine.',
    champion: 'Your champion',
    finalist: 'The other finalist',
    surprise: 'Your surprise semifinalist',
    pick: 'Pick a team…',
    modelSays: 'model',
    toWin: 'to win it all',
    toFinal: 'to reach the final',
    toSemi: 'to reach the semis',
    boldness: 'Boldness meter',
    chalk: 'Chalk. You and the model are the same person.',
    balanced: 'Balanced. Confident, but you’d survive a debate with the model.',
    bold: 'Bold. The model raises an eyebrow.',
    heretic: 'Heretic. If this hits, screenshot it forever.',
    copycat: 'You picked the model’s favorite. Brave.',
    share: 'Share my board',
    copied: 'Copied! Paste it anywhere.',
    shareChampion: 'My champion',
    shareVs: 'The Vote-Scope model gives them',
    shareTry: 'Build your board:',
    reset: 'Start over',
  },
  fr: {
    intro: 'Le modèle a simulé 50 000 tournois. À ton tour : choisis ton champion, l’autre finaliste, et un demi-finaliste surprise. On te dira à quel point ton tableau est audacieux — et si tu ne fais que copier la machine.',
    champion: 'Ton champion',
    finalist: 'L’autre finaliste',
    surprise: 'Ton demi-finaliste surprise',
    pick: 'Choisis une équipe…',
    modelSays: 'modèle',
    toWin: 'de tout gagner',
    toFinal: 'd’atteindre la finale',
    toSemi: 'd’atteindre les demis',
    boldness: 'Indice d’audace',
    chalk: 'Conformiste. Le modèle et toi, même personne.',
    balanced: 'Équilibré. Confiant, mais tu survivrais à un débat avec le modèle.',
    bold: 'Audacieux. Le modèle hausse un sourcil.',
    heretic: 'Hérétique. Si ça passe, capture d’écran à vie.',
    copycat: 'Tu as choisi le favori du modèle. Courageux.',
    share: 'Partager mon tableau',
    copied: 'Copié! Colle-le où tu veux.',
    shareChampion: 'Mon champion',
    shareVs: 'Le modèle Vote-Scope lui donne',
    shareTry: 'Fais ton tableau :',
    reset: 'Recommencer',
  },
  es: {
    intro: 'El modelo simuló 50.000 torneos. Ahora te toca: elige tu campeón, el otro finalista y un semifinalista sorpresa. Te diremos qué tan audaz es tu cuadro — y si solo estás copiando a la máquina.',
    champion: 'Tu campeón',
    finalist: 'El otro finalista',
    surprise: 'Tu semifinalista sorpresa',
    pick: 'Elige un equipo…',
    modelSays: 'modelo',
    toWin: 'de ganarlo todo',
    toFinal: 'de llegar a la final',
    toSemi: 'de llegar a semis',
    boldness: 'Medidor de audacia',
    chalk: 'Conservador. Tú y el modelo son la misma persona.',
    balanced: 'Equilibrado. Confiado, pero sobrevivirías un debate con el modelo.',
    bold: 'Audaz. El modelo levanta una ceja.',
    heretic: 'Hereje. Si acierta, captura de pantalla para siempre.',
    copycat: 'Elegiste al favorito del modelo. Valiente.',
    share: 'Compartir mi cuadro',
    copied: '¡Copiado! Pégalo donde quieras.',
    shareChampion: 'Mi campeón',
    shareVs: 'El modelo Vote-Scope le da',
    shareTry: 'Arma tu cuadro:',
    reset: 'Empezar de nuevo',
  },
};

const pct = (lang: Lang, v: number) => (lang === 'en' ? `${v}%` : `${String(v).replace('.', ',')} %`);

export default function WcBeatTheModel({ lang, board }: Props) {
  const t = T[lang];
  const [picks, setPicks] = useState<Picks>({ champion: '', finalist: '', surprise: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPicks(JSON.parse(saved));
    } catch {
      /* private mode etc. — game still works, just not persisted */
    }
  }, []);

  const update = (key: keyof Picks, value: string) => {
    setCopied(false);
    setPicks((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const byCode = useMemo(() => Object.fromEntries(board.map((b) => [b.team, b])), [board]);
  const sorted = useMemo(
    () => [...board].sort((a, b) => (a.labels[lang] || '').localeCompare(b.labels[lang] || '')),
    [board, lang]
  );

  const champ = byCode[picks.champion];
  const fin = byCode[picks.finalist];
  const sur = byCode[picks.surprise];
  const complete = champ && fin && sur;

  // Boldness: average model probability of the three calls. Lower = bolder.
  const avgProb = complete ? (champ.p_champion + fin.p_final + sur.p_semifinal) / 3 : null;
  const verdict =
    avgProb == null ? '' : avgProb >= 18 ? t.chalk : avgProb >= 9 ? t.balanced : avgProb >= 3.5 ? t.bold : t.heretic;
  const boldnessScore = avgProb == null ? 0 : Math.max(0, Math.min(100, Math.round(100 - avgProb * 2.5)));
  const isCopycat = complete && board[0] && picks.champion === board[0].team;

  const reset = () => {
    setPicks({ champion: '', finalist: '', surprise: '' });
    setCopied(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    if (!complete) return;
    const text = `${t.shareChampion}: ${flagFor(champ.team)} ${champ.labels[lang]} 🏆 — ${t.shareVs} ${pct(lang, champ.p_champion)}. ${t.boldness}: ${boldnessScore}/100. ${t.shareTry} https://vote-scope.com/${lang}/sports/wc2026/`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      }
    } catch {
      /* user cancelled */
    }
  };

  const row = (key: keyof Picks, label: string, probOf: (b: BoardTeam) => number, suffix: string) => {
    const sel = byCode[picks[key]];
    return (
      <div class="btm-row">
        <label class="btm-label" for={`btm-${key}`}>
          {label}
        </label>
        <select id={`btm-${key}`} value={picks[key]} onChange={(e) => update(key, (e.target as HTMLSelectElement).value)}>
          <option value="">{t.pick}</option>
          {sorted.map((b) => (
            <option value={b.team}>{`${flagFor(b.team)} ${b.labels[lang]}`.trim()}</option>
          ))}
        </select>
        {sel && (
          <span class="btm-odds">
            {t.modelSays}: <strong>{pct(lang, probOf(sel))}</strong> {suffix}
          </span>
        )}
      </div>
    );
  };

  return (
    <div class="btm">
      <p class="btm-intro">{t.intro}</p>
      {row('champion', t.champion, (b) => b.p_champion, t.toWin)}
      {row('finalist', t.finalist, (b) => b.p_final, t.toFinal)}
      {row('surprise', t.surprise, (b) => b.p_semifinal, t.toSemi)}

      {complete && (
        <div class="btm-result">
          <p class="btm-meter-label">
            {t.boldness}: <strong>{boldnessScore}/100</strong>
          </p>
          <div class="btm-meter" role="img" aria-label={`${t.boldness}: ${boldnessScore}/100`}>
            <div class="btm-meter-fill" style={`width:${boldnessScore}%;`} />
          </div>
          <p class="btm-verdict">
            {verdict}
            {isCopycat ? ` ${t.copycat}` : ''}
          </p>
          <div class="btm-actions">
            <button class="btm-share" onClick={share}>
              {copied ? t.copied : t.share}
            </button>
            <button class="btm-reset" onClick={reset}>
              {t.reset}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .btm { max-width: 640px; }
        .btm-intro { line-height: 1.6; margin-bottom: 1.25rem; }
        .btm-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 0.85rem; }
        .btm-label { font-family: var(--mono, monospace); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3, #666); min-width: 180px; }
        .btm-row select { padding: 8px 10px; border: 1px solid var(--rule, #ccc); border-radius: 4px; background: var(--paper, #fff); color: var(--text, #111); font-size: 0.95rem; min-width: 220px; }
        .btm-odds { font-size: 0.85rem; color: var(--ink-3, #555); }
        .btm-result { margin-top: 1.5rem; padding: 1.25rem; border: 1px solid var(--rule, #ddd); border-left: 4px solid var(--red, #c33); border-radius: 4px; }
        .btm-meter-label { margin: 0 0 6px; font-size: 0.9rem; }
        .btm-meter { height: 10px; background: var(--surface-alt, #eee); border-radius: 5px; overflow: hidden; }
        .btm-meter-fill { height: 100%; background: var(--red, #c33); transition: width 0.5s ease; }
        .btm-verdict { margin: 0.85rem 0 0; font-weight: 600; line-height: 1.5; }
        .btm-actions { display: flex; gap: 10px; margin-top: 1rem; flex-wrap: wrap; }
        .btm-share { padding: 9px 18px; background: var(--red, #c33); color: var(--paper, #fff); border: 0; border-radius: 4px; font-weight: 700; font-size: 0.9rem; cursor: pointer; }
        .btm-share:hover { opacity: 0.9; }
        .btm-reset { padding: 9px 14px; background: transparent; color: var(--ink-3, #666); border: 1px solid var(--rule, #ccc); border-radius: 4px; font-size: 0.85rem; cursor: pointer; }
      `}</style>
    </div>
  );
}
