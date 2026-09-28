/**
 * Accessible on/off toggle. With `hideLabel`, only the switch is rendered and
 * the label is announced to screen readers (for compact grids of toggles).
 */
export default function Switch({ id, checked, onChange, label, description, disabled = false, hideLabel = false }) {
  const descriptionId = description ? `${id}-description` : undefined;

  const toggle = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      aria-describedby={descriptionId}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-5 rounded-full bg-white shadow-sm transition ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`}
      />
    </button>
  );

  if (hideLabel) return toggle;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-slate-900">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="mt-0.5 text-sm text-slate-600">
            {description}
          </p>
        )}
      </div>
      {toggle}
    </div>
  );
}
