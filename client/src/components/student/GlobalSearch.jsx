import { CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { search } from '../../services/student.service.js';
import Modal from '../common/Modal.jsx';

const SUGGESTIONS = ['IT301', 'Midterm', 'Transcript', 'Payment', 'Attendance'];
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

const isTypingTarget = (element) =>
  element instanceof HTMLElement && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName));

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Recomputed when the dialog opens so notifications and requests are current.
  const groups = useMemo(() => (open ? search(query) : []), [open, query]);
  const results = groups.flatMap((group) => group.items);

  useEffect(() => {
    const openOnShortcut = (event) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      const isSlash = event.key === '/' && !isTypingTarget(event.target);
      if (isShortcut || isSlash) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', openOnShortcut);
    return () => window.removeEventListener('keydown', openOnShortcut);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  const goTo = (item) => {
    close();
    navigate(item.to);
  };

  const handleKeyDown = (event) => {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      goTo(results[Math.min(activeIndex, results.length - 1)]);
    }
  };

  let optionIndex = -1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-600 transition hover:border-slate-300 hover:bg-white"
      >
        <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
        <span className="truncate">
          <span className="sm:hidden">Search</span>
          <span className="hidden sm:inline">Search subjects, grades, announcements…</span>
        </span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-slate-300 bg-white px-1.5 font-sans text-xs text-slate-600 md:inline">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </button>

      <Modal open={open} onClose={close} title="Search the portal" size="max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Try a subject code, “midterm”, or “transcript”"
            role="combobox"
            aria-label="Search the portal"
            aria-expanded={results.length > 0}
            aria-controls="global-search-results"
            aria-activedescendant={results.length ? `search-option-${activeIndex}` : undefined}
            className="block w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Try searching for</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">
              No results for “<span className="font-medium text-slate-900">{query}</span>”.
            </p>
          ) : (
            <div id="global-search-results" role="listbox" aria-label="Search results" className="space-y-4">
              {groups.map((group) => (
                <div key={group.group} role="group" aria-label={group.group}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-600">{group.group}</p>
                  <ul>
                    {group.items.map((item) => {
                      optionIndex += 1;
                      const index = optionIndex;
                      const active = index === activeIndex;
                      return (
                        <li
                          key={item.id}
                          id={`search-option-${index}`}
                          role="option"
                          aria-selected={active}
                          onClick={() => goTo(item)}
                          onMouseMove={() => setActiveIndex(index)}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${active ? 'bg-indigo-50' : ''}`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-slate-900">{item.title}</span>
                            <span className="block truncate text-xs text-slate-600">{item.subtitle}</span>
                          </span>
                          {active && <CornerDownLeft className="size-4 shrink-0 text-indigo-600" aria-hidden="true" />}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
