const TONES = {
  indigo: { track: 'bg-indigo-100', fill: 'bg-indigo-600' },
  green: { track: 'bg-emerald-100', fill: 'bg-emerald-600' },
  amber: { track: 'bg-amber-100', fill: 'bg-amber-500' },
  red: { track: 'bg-red-100', fill: 'bg-red-600' },
};

/** Meter whose unfilled track is a lighter step of the same hue. */
export default function ProgressBar({ value, max = 100, tone = 'indigo', label, className = '' }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const { track, fill } = TONES[tone];

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`h-2 w-full overflow-hidden rounded-full ${track} ${className}`}
    >
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
