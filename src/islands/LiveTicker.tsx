import type { LameDuckTickerItem } from '../data/lameDuck';

interface Props {
  items: LameDuckTickerItem[];
  ariaLabel?: string;
}

function toneClass(tone: LameDuckTickerItem['tone']) {
  if (tone === 'red') return 'is-red';
  if (tone === 'blue') return 'is-blue';
  if (tone === 'duck') return 'is-duck';
  return 'is-neutral';
}

export default function LiveTicker({ items, ariaLabel = 'Live signals' }: Props) {
  const safeItems = items.length > 0 ? items : [];
  const loopItems = [...safeItems, ...safeItems];

  return (
    <aside class="lame-duck-ticker" aria-label={ariaLabel}>
      <div class="lame-duck-ticker-track">
        {loopItems.map((item, index) => {
          const body = (
            <>
              <span class={`lame-duck-ticker-tag ${toneClass(item.tone)}`}>{item.tag}</span>
              <span>{item.text}</span>
              {item.time && <time>{item.time}</time>}
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
