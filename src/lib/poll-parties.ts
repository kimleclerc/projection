/**
 * Poll party chips — bridges the engine's `web_key` (us-house, federal, …) to
 * the riding palette (`partyMeta`, keyed by JurisdictionKey) and produces a
 * short, per-language label for the PollsHub legend + topline bars.
 *
 * Spanish short labels are derived from `mention_es` (e.g. "los Demócratas" →
 * "Demócratas"); parties.ts has no `label_es` field, so this is the single
 * place that resolves it for poll display.
 */
import { partyMeta } from './riding-adapters/parties';

/** engine web_key → palette key used by partyMeta(). */
const WEBKEY_TO_PALETTE: Record<string, string> = {
  'us-house': 'us-house',
  'us-senate': 'us-senate',
  federal: 'federal-ca',
  quebec: 'quebec',
  ontario: 'ontario',
  uk: 'uk',
};

const ES_ARTICLES = ['los ', 'las ', 'el ', 'la '];

/** Short Spanish label from mention_es, stripping its leading article. */
function shortEs(code: string, mentionEs: string | undefined, fallback: string): string {
  if (code.endsWith('_oth')) return 'Otros';
  if (!mentionEs) return fallback;
  for (const a of ES_ARTICLES) {
    if (mentionEs.startsWith(a)) return mentionEs.slice(a.length);
  }
  return mentionEs;
}

export interface PartyChip {
  code: string;
  label: string;
  color: string;
}

export function pollPartyChips(
  webKey: string,
  codes: string[],
  lang: 'en' | 'fr' | 'es',
): PartyChip[] {
  const palette = WEBKEY_TO_PALETTE[webKey] ?? webKey;
  return codes.map((code) => {
    const meta = partyMeta(palette, code);
    const label =
      lang === 'fr'
        ? meta.label_fr
        : lang === 'es'
          ? shortEs(code, meta.mention_es, meta.label_en)
          : meta.label_en;
    return { code, label, color: meta.color };
  });
}
