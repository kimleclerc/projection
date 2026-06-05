/* Shared bird SVGs for the Canada/U.S. instruments.
 *
 * GooseSvg — flying Canada goose (Bernache), used on the Canada Goose meter and
 * the CUSMA showdown. DuckSvg — compact rubber lame-duck, used on the showdown.
 * Both are server-friendly inline SVG, profile facing right by default; flip with
 * a parent `transform: scaleX(-1)` to face left.
 */

export function GooseSvg({ size, idPrefix, flapping = false }: { size: number; idPrefix: string; flapping?: boolean }) {
  const w = size;
  const h = Math.round(size * 0.75);
  const bodyId = `${idPrefix}-gooseBody`;
  const wingId = `${idPrefix}-gooseWing`;
  const farId = `${idPrefix}-gooseFar`;
  return (
    <svg
      class={flapping ? 'goose-fly' : undefined}
      width={w}
      height={h}
      viewBox="0 0 240 180"
      style="overflow:visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stop-color="oklch(0.62 0.022 72)" />
          <stop offset="55%" stop-color="oklch(0.48 0.03 66)" />
          <stop offset="100%" stop-color="oklch(0.37 0.03 60)" />
        </linearGradient>
        <linearGradient id={wingId} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stop-color="oklch(0.46 0.03 64)" />
          <stop offset="100%" stop-color="oklch(0.27 0.025 58)" />
        </linearGradient>
        <linearGradient id={farId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="oklch(0.40 0.025 62)" />
          <stop offset="100%" stop-color="oklch(0.30 0.022 58)" />
        </linearGradient>
      </defs>

      {/* Far wing — downstroke behind the body, gives depth */}
      <path
        d="M 104 102
           C 88 120, 66 138, 46 150
           C 39 154, 37 151, 42 142
           C 58 124, 82 108, 100 99 Z"
        fill={`url(#${farId})`}
        opacity="0.85"
      />

      {/* Tail — short pointed spike at the rear (left) */}
      <path d="M 36 99 L 16 93 L 32 109 Z" fill="oklch(0.30 0.022 60)" />

      {/* Body — streamlined teardrop, breast to the right */}
      <path
        d="M 34 99
           C 64 82, 110 78, 150 93
           C 159 96, 159 104, 150 109
           C 112 126, 62 123, 40 110
           C 32 106, 30 102, 34 99 Z"
        fill={`url(#${bodyId})`}
      />
      {/* Pale belly highlight */}
      <path d="M 58 114 C 84 122, 116 122, 144 109 C 120 121, 84 122, 58 114 Z" fill="oklch(0.86 0.02 82)" opacity="0.8" />

      {/* Long black neck + head — one graceful sweep up to the right */}
      <path
        d="M 146 96
           C 165 84, 183 69, 193 55
           C 197 49, 201 44, 207 42
           C 215 40, 219 47, 216 56
           C 213 64, 206 65, 199 62
           C 193 73, 184 84, 174 92
           C 165 99, 155 102, 149 103 Z"
        fill="oklch(0.16 0.012 60)"
      />
      {/* White cheek chinstrap — the Canada goose signature */}
      <ellipse cx="201" cy="55" rx="5" ry="8" transform="rotate(24 201 55)" fill="oklch(0.97 0.004 100)" />
      {/* Bill, pointing up-right */}
      <path d="M 214 47 L 231 41 L 217 55 Z" fill="oklch(0.13 0.01 60)" />
      {/* Eye glint */}
      <circle cx="208" cy="50" r="1.4" fill="oklch(0.85 0.02 90)" opacity="0.7" />

      {/* Near wing — strong upstroke over the body, the flight read */}
      <path
        d="M 110 95
           C 92 70, 68 47, 42 33
           C 34 29, 28 30, 31 40
           C 42 54, 64 77, 86 94
           C 96 101, 104 100, 114 97 Z"
        fill={`url(#${wingId})`}
      />
      {/* Primary-feather separations on the near wing */}
      <path d="M 96 90 C 76 74, 56 56, 38 42" stroke="oklch(0.20 0.02 58)" stroke-width="1.3" fill="none" opacity="0.45" stroke-linecap="round" />
      <path d="M 104 92 C 86 78, 66 60, 46 46" stroke="oklch(0.22 0.02 58)" stroke-width="1.1" fill="none" opacity="0.35" stroke-linecap="round" />
    </svg>
  );
}

/* Compact rubber lame-duck — yellow body, brow-swoop nod to the toupet.
 * Profile facing right. */
export function DuckSvg({ size, idPrefix }: { size: number; idPrefix: string }) {
  const w = size;
  const h = Math.round(size * 0.9);
  const bodyId = `${idPrefix}-duckBody`;
  const headId = `${idPrefix}-duckHead`;
  return (
    <svg width={w} height={h} viewBox="0 0 200 188" style="overflow:visible" aria-hidden="true">
      <defs>
        <radialGradient id={bodyId} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stop-color="oklch(0.93 0.16 92)" />
          <stop offset="60%" stop-color="oklch(0.84 0.18 86)" />
          <stop offset="100%" stop-color="oklch(0.72 0.18 78)" />
        </radialGradient>
        <radialGradient id={headId} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0%" stop-color="oklch(0.95 0.14 92)" />
          <stop offset="100%" stop-color="oklch(0.80 0.18 80)" />
        </radialGradient>
      </defs>
      {/* Body */}
      <ellipse cx="96" cy="128" rx="70" ry="46" fill={`url(#${bodyId})`} />
      <ellipse cx="34" cy="108" rx="17" ry="11" fill={`url(#${bodyId})`} transform="rotate(-18 34 108)" />
      {/* Head */}
      <circle cx="134" cy="74" r="40" fill={`url(#${headId})`} />
      {/* Brow swoop — toupet nod */}
      <path d="M 100 56 Q 120 22 158 24 Q 184 28 190 48 Q 172 38 148 40 Q 122 42 110 58 Z"
        fill="oklch(0.86 0.16 80)" stroke="oklch(0.62 0.22 62)" stroke-width="0.8" opacity="0.95" />
      {/* Beak */}
      <ellipse cx="170" cy="80" rx="18" ry="9" fill="oklch(0.70 0.18 44)" />
      {/* Eye */}
      <circle cx="146" cy="64" r="5" fill="#1a1814" />
      <circle cx="147.4" cy="62.2" r="1.6" fill="#fff" />
    </svg>
  );
}
