import { BookOpen, GraduationCap, History, Megaphone, School, UserCheck, Users, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardLink } from '../../components/common/Card.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import ModuleGrid from '../../components/dashboard/ModuleGrid.jsx';
import { adminNavigation, navigationItems } from '../../config/navigation.js';
import { useApiQuery } from '../../hooks/useApiQuery.js';
import { useAuth } from '../../hooks/useAuth.js';
import { adminService } from '../../services/academic.service.js';
import { formatDateTime, formatRelativeTime } from '../../utils/format.js';
import { actionLabel } from '../../utils/activity.js';

const modules = navigationItems(adminNavigation).filter((item) => item.to !== '/admin');

export default function AdminDashboard() {
  const { user } = useAuth();
  const query = useApiQuery(adminService.dashboard);

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome back, ${user.firstName}.`}
        actions={
          <Link
            to="/admin/announcements"
            state={{ openCreate: true }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Megaphone className="size-4" aria-hidden="true" />
            Create Announcement
          </Link>
        }
      />

      <QueryState query={query} loadingLabel="Loading system overview…">
        {({ counts, recentActivity }) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Users" value={counts.users} icon={Users} tone="indigo" to="/admin/users" />
              <StatCard label="Teachers" value={counts.teachers} icon={GraduationCap} tone="violet" to="/admin/teachers" />
              <StatCard label="Students" value={counts.students} icon={Users} tone="blue" to="/admin/students" />
              <StatCard label="Active classes" value={counts.classrooms} hint={`${counts.subjects} subjects`} icon={School} tone="green" to="/admin/classrooms" />
              <StatCard label="Active users" value={counts.activeUsers} icon={UserCheck} tone="green" />
              <StatCard label="Inactive users" value={counts.inactiveUsers} icon={UserX} tone="neutral" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader title="Recent System Activity" action={<CardLink to="/admin/activity-logs">All activity</CardLink>} />
                {recentActivity.length === 0 ? (
                  <div className="p-5">
                    <EmptyState icon={History} title="No activity yet" />
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {recentActivity.map((log) => (
                      <li key={log.id} className="flex gap-3 px-5 py-3">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-900">{log.description}</p>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {actionLabel(log.action)} · {log.actor?.name ?? 'System'} ·{' '}
                            <time dateTime={log.createdAt} title={formatDateTime(log.createdAt)}>
                              {formatRelativeTime(log.createdAt)}
                            </time>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card>
                <CardHeader title="Quick links" />
                <div className="grid gap-2 p-4">
                  {[
                    { to: '/admin/students', label: 'Add or edit students', icon: Users },
                    { to: '/admin/classrooms', label: 'Set up classes', icon: School },
                    { to: '/admin/subjects', label: 'Subjects and grading weights', icon: BookOpen },
                    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                      <Icon className="size-4 text-indigo-600" aria-hidden="true" />
                      {label}
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600">All modules</h2>
              <ModuleGrid items={modules} />
            </div>
          </div>
        )}
      </QueryState>
    </>
  );
}
