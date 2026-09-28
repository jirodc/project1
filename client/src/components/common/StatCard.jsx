import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICON_TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
  neutral: 'bg-slate-100 text-slate-600',
};

/** Headline number with a label. With `to`, the whole card links to the detail page. */
export default function StatCard({ label, value, hint, icon: Icon, tone = 'indigo', to }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {Icon && (
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${ICON_TONES[tone]}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint && (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
          {hint}
          {to && <ArrowRight className="size-3 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />}
        </p>
      )}
    </>
  );

  const className = 'block h-full rounded-xl border border-slate-200 bg-white p-4 shadow-xs';

  if (to) {
    return (
      <Link to={to} className={`group ${className} transition hover:border-indigo-300 hover:shadow-sm`}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}
