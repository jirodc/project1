import { GraduationCap, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout.js';
import Spinner from '../common/Spinner.jsx';

const linkClass = ({ isActive }) =>
  `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-slate-800 text-white before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:rounded-full before:bg-indigo-400'
      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
  }`;

/**
 * `badges` maps a nav item's `to` to a count shown beside it (e.g. unread notifications).
 */
export default function Sidebar({ navigation, portalName, open, onClose, badges = {} }) {
  const { signOut, isSigningOut } = useLogout();

  return (
    <>
      {/* Backdrop for the mobile drawer */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/50 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Classroom Manager</p>
              <p className="text-xs text-slate-300">{portalName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navigation.map((section, index) => (
            <div key={section.heading ?? index}>
              {section.heading && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {section.heading}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map(({ label, to, icon: Icon, end, phase }) => (
                  <li key={to}>
                    <NavLink to={to} end={end} className={linkClass} onClick={onClose}>
                      <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{label}</span>
                      {badges[to] > 0 && (
                        <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white tabular-nums">
                          {badges[to]}
                          <span className="sr-only"> unread</span>
                        </span>
                      )}
                      {phase && (
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300 group-hover:bg-slate-700">
                          Soon
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={signOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/70 hover:text-white disabled:opacity-60"
          >
            {isSigningOut ? <Spinner className="size-4.5" /> : <LogOut className="size-4.5" aria-hidden="true" />}
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
