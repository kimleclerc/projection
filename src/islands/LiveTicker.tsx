import type { LameDuckTickerItem } from '../data/lameDuck';

interface Props {
  items: LameDuckTickerItem[];
  ariaLabel?: string;
  lang?: 'en' | 'fr' | 'es';
}

/** Date ISO → « 10 oct. » / « Oct 10 » / « 10 oct » ; tout autre texte passe tel quel. */
function when(t: string, lang: 'en' | 'fr' | 'es'): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(t)) return t;
  const d = new Date(`${t.slice(0, 10)}T12:00:00Z`);
  return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function toneClass(tone: LameDuckTickerItem['tone']) {
  if (tone === 'red') return 'is-red';
  if (tone === 'blue') return 'is-blue';
  if (tone === 'duck') return 'is-duck';
  return 'is-neutral';
}

export default function LiveTicker({ items, lang = 'en', ariaLabel }: Props) {
  const label = ariaLabel ?? (lang === 'fr' ? 'Signaux en direct' : lang === 'es' ? 'Señales en vivo' : 'Live signals');
  const safeItems = items.length > 0 ? items : [];
  const loopItems = [...safeItems, ...safeItems];

  return (
    <aside class="lame-duck-ticker" aria-label={label}>
      <div class="lame-duck-ticker-track">
        {loopItems.map((item, index) => {
          const body = (
            <>
              <span class={`lame-duck-ticker-tag ${toneClass(item.tone)}`}>{item.tag}</span>
              <span>{item.text}</span>
              {item.time && <time dateTime={/^\d{4}-/.test(item.time) ? item.time.slice(0, 10) : undefined}>{when(item.time, lang)}</time>}
              <span aria-hidden="true">·</span>
            </>
          );

          return item.href ? (
            <a class="lame-duck-ticker-item" href={item.href} key={`${item.tag}-${index}`}>
              {body}
            </a>
          ) : (
            <span class="lame-duck-ticker-item" key={`${item.tag}-${index}`}>
              {body}
            </span>
          );
        })}
      </div>
    </aside>
  );
}
