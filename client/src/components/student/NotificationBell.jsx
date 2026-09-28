import { Bell, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudentData } from '../../hooks/useStudentData.js';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/student.service.js';
import { formatRelativeTime } from '../../utils/format.js';
import NotificationIcon from './NotificationIcon.jsx';

const PREVIEW_COUNT = 5;

export default function NotificationBell() {
  const { data } = useStudentData(getNotifications);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const unread = data?.unreadCount ?? 0;
  const latest = data?.notifications.slice(0, PREVIEW_COUNT) ?? [];

  const openNotification = (notification) => {
    markNotificationRead(notification.id);
    setOpen(false);
    navigate(notification.link);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-16 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="font-semibold text-slate-900">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
              >
                <CheckCheck className="size-4" aria-hidden="true" />
                Mark all as read
              </button>
            )}
          </div>

          {latest.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-600">You're all caught up.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {latest.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 ${notification.read ? '' : 'bg-indigo-50/40'}`}
                  >
                    <NotificationIcon type={notification.type} size="size-8" />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm ${notification.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                        {notification.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-600">{formatRelativeTime(notification.createdAt)}</span>
                    </span>
                    {!notification.read && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-600">
                        <span className="sr-only">Unread</span>
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/student/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-medium text-indigo-700 hover:bg-slate-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
