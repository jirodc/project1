import { CircleAlert, RotateCw } from 'lucide-react';
import Button from './Button.jsx';
import Spinner from './Spinner.jsx';

export function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-16 text-sm text-slate-600 ${className}`}
    >
      <Spinner className="size-6 text-indigo-600" />
      {label}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center ${className}`}
    >
      {Icon && (
        <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong while loading this page.', onRetry, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center ${className}`}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-700">
        <CircleAlert className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-semibold text-red-900">Unable to load</h3>
      <p className="mt-1 max-w-sm text-sm text-red-800">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}

/**
 * Renders the right state for a data query: a spinner on first load, an error
 * with retry, or `children(data)`. Refetches keep showing the previous data.
 */
export function QueryState({ query, loadingLabel, children }) {
  if (query.status === 'error') {
    return <ErrorState message={query.error?.message} onRetry={query.reload} />;
  }
  if (query.data === undefined) {
    return <LoadingState label={loadingLabel} />;
  }
  return children(query.data);
}
