/** Emoji flags for the 48 WC2026 teams, keyed by the model's FIFA-style trigrams. */
export const WC_FLAGS: Record<string, string> = {
  esp: '🇪🇸', fra: '🇫🇷', eng: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', arg: '🇦🇷', bra: '🇧🇷', por: '🇵🇹',
  ger: '🇩🇪', ned: '🇳🇱', nor: '🇳🇴', usa: '🇺🇸', bel: '🇧🇪', jpn: '🇯🇵',
  mex: '🇲🇽', cro: '🇭🇷', uru: '🇺🇾', col: '🇨🇴', can: '🇨🇦', mar: '🇲🇦',
  sui: '🇨🇭', tur: '🇹🇷', kor: '🇰🇷', sco: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', aut: '🇦🇹', ecu: '🇪🇨',
  cze: '🇨🇿', aus: '🇦🇺', irn: '🇮🇷', sen: '🇸🇳', alg: '🇩🇿', bih: '🇧🇦',
  swe: '🇸🇪', civ: '🇨🇮', qat: '🇶🇦', gha: '🇬🇭', ksa: '🇸🇦', par: '🇵🇾',
  tun: '🇹🇳', egy: '🇪🇬', cod: '🇨🇩', cpv: '🇨🇻', rsa: '🇿🇦', cur: '🇨🇼',
  nzl: '🇳🇿', pan: '🇵🇦', hat: '🇭🇹', irq: '🇮🇶', uzb: '🇺🇿', jor: '🇯🇴',
};

/** Flag for a team code, or empty string when unknown (safe to prepend). */
export const flagFor = (team: string | undefined | null): string =>
  (team && WC_FLAGS[team.toLowerCase()]) || '';
