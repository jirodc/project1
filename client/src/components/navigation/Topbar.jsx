import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_LABELS } from '../../utils/roles.js';

const initials = (user) => `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

function Avatar({ user, avatarUrl }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className="size-9 rounded-full object-cover ring-1 ring-slate-200" />;
  }
  return (
    <span
      className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
      aria-hidden="true"
    >
      {initials(user)}
    </span>
  );
}

/**
 * `leading` renders next to the menu button (e.g. search) and `trailing`
 * before the user (e.g. notifications). With `profilePath`, the user block
 * links to the profile page.
 */
export default function Topbar({ onMenuClick, leading, trailing, avatarUrl, profilePath }) {
  const { user } = useAuth();

  const userBlock = (
    <>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-600">{ROLE_LABELS[user.role]}</p>
      </div>
      <Avatar user={user} avatarUrl={avatarUrl} />
    </>
  );

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="-ml-1.5 rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {leading && <div className="min-w-0 flex-1">{leading}</div>}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {trailing}
        {profilePath ? (
          <Link
            to={profilePath}
            className="flex items-center gap-3 rounded-lg p-1 hover:bg-slate-100"
            aria-label="Your profile"
          >
            {userBlock}
          </Link>
        ) : (
          <div className="flex items-center gap-3">{userBlock}</div>
        )}
      </div>
    </header>
  );
}
