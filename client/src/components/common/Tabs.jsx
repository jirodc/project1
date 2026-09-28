import { useRef } from 'react';

/**
 * Segmented tab control. Supports arrow-key navigation between tabs.
 * `tabs`: [{ value, label, count?, icon? }]
 */
export default function Tabs({ tabs, value, onChange, label, className = '' }) {
  const listRef = useRef(null);

  const handleKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    const index = tabs.findIndex((tab) => tab.value === value);
    const nextIndex = {
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];

    onChange(tabs[nextIndex].value);
    listRef.current?.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={`relative flex max-w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 ${className}`}
    >
      {tabs.map(({ value: tabValue, label: tabLabel, count, icon: Icon }) => {
        const selected = tabValue === value;
        return (
          <button
            key={tabValue}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tabValue)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-600 ${
              selected ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
            }`}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {tabLabel}
            {count !== undefined && (
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  selected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
