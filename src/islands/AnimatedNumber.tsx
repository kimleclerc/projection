interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: 'thousands' | 'percent' | 'plain';
}

function formatValue(n: number, decimals: number, format: string, prefix: string, suffix: string): string {
  let str: string;
  if (format === 'thousands') {
    if (n >= 1_000_000) str = `${(n / 1_000_000).toFixed(decimals)}M`;
    else if (n >= 1_000) str = `${(n / 1_000).toFixed(decimals)}K`;
    else str = n.toFixed(decimals);
  } else if (format === 'percent') {
    str = n.toFixed(decimals);
  } else {
    str = n.toFixed(decimals);
  }
  return `${prefix}${str}${suffix}`;
}

/**
 * Affiche le chiffre tel quel. Le décompte animé (de 0 à la valeur) a été retiré :
 * c'est un des signes typiques des sites générés par IA, et le lecteur veut le chiffre
 * tout de suite. On garde le nom et les props pour ne pas toucher aux 67 usages.
 */
export default function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  format = 'plain',
}: Props) {
  return <span>{formatValue(value, decimals, format, prefix, suffix)}</span>;
}
