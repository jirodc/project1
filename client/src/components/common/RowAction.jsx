/** Compact labelled action button for table rows. */
export default function RowAction({ icon: Icon, label, onClick, tone = 'default', disabled = false }) {
  const tones = {
    default: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    danger: 'text-red-700 hover:bg-red-50 hover:text-red-800',
    success: 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50 ${tones[tone]}`}
    >
      {Icon && <Icon className="size-4" aria-hidden="true" />}
      {label}
    </button>
  );
}
