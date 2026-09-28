import { BellOff, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import SelectField from '../../components/common/SelectField.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import NotificationIcon from '../../components/student/NotificationIcon.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useStudentData } from '../../hooks/useStudentData.js';
import { NOTIFICATION_TYPES } from '../../mocks/student/notifications.js';
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  restoreNotification,
} from '../../services/student.service.js';
import { formatDateTime, formatRelativeTime } from '../../utils/format.js';

const PAGE_SIZE = 8;

export default function StudentNotifications() {
  const query = useStudentData(getNotifications);

  return (
    <QueryState query={query} loadingLabel="Loading notifications…">
      {(data) => <NotificationsContent data={data} />}
    </QueryState>
  );
}

function NotificationsContent({ data }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [type, setType] = useState('all');

  const filtered = useMemo(
    () =>
      data.notifications.filter(
        (n) => (tab === 'all' || !n.read) && (type === 'all' || n.type === type),
      ),
    [data.notifications, tab, type],
  );
  const { pageItems, pagination, setPage } = usePagination(filtered, PAGE_SIZE);

  const markAll = () => {
    markAllNotificationsRead();
    toast.success('All notifications marked as read.');
  };

  const remove = (notification) => {
    const removed = deleteNotification(notification.id);
    toast(
      (t) => (
        <span className="flex items-center gap-3 text-sm text-slate-900">
          Notification deleted.
          <button
            type="button"
            className="rounded-md px-2 py-1 font-semibold text-indigo-700 hover:bg-indigo-50"
            onClick={() => {
              restoreNotification(removed);
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 5000 },
    );
  };

  const open = (notification) => {
    markNotificationRead(notification.id);
    navigate(notification.link);
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description={data.unreadCount ? `You have ${data.unreadCount} unread ${data.unreadCount === 1 ? 'notification' : 'notifications'}.` : "You're all caught up."}
        actions={
          <Button variant="secondary" onClick={markAll} disabled={data.unreadCount === 0}>
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all as read
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Tabs
          label="Show notifications"
          value={tab}
          onChange={(value) => {
            setTab(value);
            setPage(1);
          }}
          tabs={[
            { value: 'all', label: 'All', count: data.notifications.length },
            { value: 'unread', label: 'Unread', count: data.unreadCount },
          ]}
          className="w-fit"
        />
        <SelectField
          id="notification-type"
          label="Type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          options={[{ value: 'all', label: 'All types' }, ...Object.entries(NOTIFICATION_TYPES).map(([value, label]) => ({ value, label }))]}
          className="sm:w-56"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={tab === 'unread' ? 'No unread notifications' : 'No notifications'}
          description={tab === 'unread' ? "You've read everything. Nice!" : 'Notifications about grades, payments, and classes will appear here.'}
        />
      ) : (
        <>
          <Card as="div">
            <ul className="divide-y divide-slate-100">
              {pageItems.map((notification) => (
                <li
                  key={notification.id}
                  className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5 ${notification.read ? '' : 'bg-indigo-50/40'}`}
                >
                  <button type="button" onClick={() => open(notification)} className="flex min-w-0 flex-1 gap-3 text-left">
                    <NotificationIcon type={notification.type} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {!notification.read && <span className="size-2 rounded-full bg-indigo-600" aria-hidden="true" />}
                        <span className={notification.read ? 'font-medium text-slate-800' : 'font-semibold text-slate-900'}>
                          {notification.title}
                        </span>
                        <span className="sr-only">{notification.read ? '(read)' : '(unread)'}</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-600">{notification.description}</span>
                      <span className="mt-1 block text-xs text-slate-600">
                        {NOTIFICATION_TYPES[notification.type]} ·{' '}
                        <time dateTime={notification.createdAt} title={formatDateTime(notification.createdAt)}>
                          {formatRelativeTime(notification.createdAt)}
                        </time>
                      </span>
                    </span>
                  </button>
                  <div className="flex shrink-0 gap-1 self-end sm:self-start">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        className="px-2.5 py-1.5"
                        onClick={() => markNotificationRead(notification.id)}
                        aria-label={`Mark "${notification.title}" as read`}
                      >
                        <Check className="size-4" aria-hidden="true" />
                        <span className="sm:sr-only">Mark as read</span>
                      </Button>
                    )}
                    <Button
                      variant="dangerGhost"
                      className="px-2.5 py-1.5"
                      onClick={() => remove(notification)}
                      aria-label={`Delete "${notification.title}"`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      <span className="sm:sr-only">Delete</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Pagination className="mt-5" pagination={pagination} itemCount={pageItems.length} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
