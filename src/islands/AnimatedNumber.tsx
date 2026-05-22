import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: 'thousands' | 'percent' | 'plain';
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
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

export default function AnimatedNumber({
  value,
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  format = 'plain',
}: Props) {
  const [display, setDisplay] = useState(value);
  const started = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = from + easeOutCubic(progress) * (value - from);
      setDisplay(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    }

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <span>{formatValue(display, decimals, format, prefix, suffix)}</span>
  );
}
