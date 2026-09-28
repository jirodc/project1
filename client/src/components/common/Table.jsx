/**
 * Horizontally scrollable table so wide data stays usable on phones.
 * `relative` keeps absolutely positioned descendants (e.g. sr-only labels)
 * inside the scroller instead of widening the whole page.
 */
export function Table({ children, minWidth = 'min-w-[640px]', caption }) {
  return (
    <div className="relative overflow-x-auto">
      <table className={`w-full ${minWidth} divide-y divide-slate-200 text-sm`}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function Th({ children, align = 'left', className = '' }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = 'left', className = '' }) {
  return (
    <td
      className={`px-4 py-3 text-slate-700 ${
        align === 'right' ? 'text-right tabular-nums' : align === 'center' ? 'text-center tabular-nums' : 'text-left'
      } ${className}`}
    >
      {children}
    </td>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
}
