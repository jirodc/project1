const TONES = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

/** Small status/category label. Pass `icon` so meaning never relies on color alone. */
export default function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}
