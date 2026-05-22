type Signal = {
  label: string;
  value: string;
  href: string;
};

type Props = {
  signals: Signal[];
};

export default function SignalTicker({ signals }: Props) {
  return (
    <div class="signal-ticker" data-signal-ticker aria-label="Vote-Scope live signals">
      <div class="signal-track">
        {[...signals, ...signals].map((signal, index) => (
          <a href={signal.href} class="signal-item" key={`${signal.label}-${index}`}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
          </a>
        ))}
      </div>
    </div>
  );
}
