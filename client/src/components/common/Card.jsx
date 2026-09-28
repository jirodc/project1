import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    // min-w-0 lets cards in grid/flex layouts shrink instead of growing to fit long text.
    <Tag className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-xs ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, id }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div className="min-w-0">
        <h2 id={id} className="text-base font-semibold text-slate-900">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

/** "View all →" style link for a card header. */
export function CardLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 rounded text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:underline">
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
