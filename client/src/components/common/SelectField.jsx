import { ChevronDown } from 'lucide-react';

/** Labelled native <select>. `options`: [{ value, label }]. */
export default function SelectField({ id, label, options, error, className = '', ...selectProps }) {
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`block w-full appearance-none rounded-lg border bg-white py-2.5 pl-3 pr-9 text-sm text-slate-900 shadow-xs outline-none transition focus:ring-2 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
          }`}
          {...selectProps}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
