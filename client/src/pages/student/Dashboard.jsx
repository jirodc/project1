import {
  BookOpen,
  CalendarCheck,
  CalendarOff,
  ClipboardCheck,
  GraduationCap,
  ListTodo,
  Megaphone,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardLink } from '../../components/common/Card.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import StatusBadge, { ImportantBadge } from '../../components/student/StatusBadges.jsx';
import SubjectTag, { SubjectDot } from '../../components/student/SubjectTag.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useStudentData } from '../../hooks/useStudentData.js';
import { TODAY } from '../../mocks/student/calendar.js';
import { getDashboard } from '../../services/student.service.js';
import {
  formatCurrency,
  formatDate,
  formatDaysUntil,
  formatLongDate,
  formatRelativeTime,
  formatShortDate,
  formatTime,
  formatTimeRange,
} from '../../utils/format.js';

const greeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const query = useStudentData(() => getDashboard(user), [user.id]);

  return (
    <QueryState query={query} loadingLabel="Loading your dashboard…">
      {(data) => <DashboardContent data={data} />}
    </QueryState>
  );
}

function DashboardContent({ data }) {
  const { profile, stats } = data;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${profile.firstName}!`}
        description={`${formatLongDate(new Date())} · ${profile.semester}, A.Y. ${profile.academicYear} · ${profile.section}`}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Current GPA"
          value={stats.gpa.toFixed(2)}
          hint="Cumulative GWA"
          icon={GraduationCap}
          tone="indigo"
          to="/student/grades"
        />
        <StatCard
          label="Attendance"
          value={`${stats.attendanceRate}%`}
          hint="This semester"
          icon={ClipboardCheck}
          tone="green"
          to="/student/attendance"
        />
        <StatCard
          label="Enrolled subjects"
          value={stats.subjectCount}
          hint={`${stats.units} units`}
          icon={BookOpen}
          tone="blue"
          to="/student/subjects"
        />
        <StatCard
          label="Pending tasks"
          value={stats.pendingTasks}
          hint="Assignments & projects"
          icon={ListTodo}
          tone="amber"
          to="/student/subjects"
        />
        <StatCard
          label="Outstanding balance"
          value={formatCurrency(stats.balance)}
          hint={stats.nextDue ? `Next due ${formatDate(stats.nextDue.dueDate)}` : 'Fully paid'}
          icon={Wallet}
          tone="violet"
          to="/student/finance"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <TodaySchedule classes={data.today} />
        <UpcomingEvents items={data.upcoming} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentGrades grades={data.recentGrades} />
        <RecentAttendance records={data.recentAttendance} />
      </div>

      <div className="mt-6">
        <LatestAnnouncements announcements={data.announcements} />
      </div>
    </>
  );
}

function TodaySchedule({ classes }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Today's Schedule"
        description={formatLongDate(new Date())}
        action={<CardLink to="/student/schedule">Full schedule</CardLink>}
      />
      {classes.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={CalendarOff} title="No classes today" description="Enjoy your day. Check the full schedule for the rest of the week." />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {classes.map((slot) => (
            <li key={slot.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <p className="w-40 shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                {formatTimeRange(slot.start, slot.end)}
              </p>
              <div className="min-w-0 flex-1">
                <Link to={`/student/subjects/${slot.subject.code}`} className="group inline-flex items-center gap-2">
                  <SubjectDot color={slot.subject.color} />
                  <span className="font-medium text-slate-900 group-hover:underline">{slot.subject.name}</span>
                </Link>
                <p className="mt-0.5 text-sm text-slate-600">
                  {slot.subject.code} · {slot.room} · {slot.subject.instructor}
                </p>
              </div>
              <StatusBadge kind="class" status={slot.status} className="self-start sm:self-center" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function UpcomingEvents({ items }) {
  return (
    <Card>
      <CardHeader title="Upcoming" description="Exams, deadlines, and events" />
      {items.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={CalendarCheck} title="Nothing coming up" description="You have no upcoming exams or deadlines." />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const date = new Date(item.date);
            return (
              <li key={item.id}>
                <Link to={item.link} className="flex gap-3 px-5 py-3 hover:bg-slate-50">
                  <span className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-slate-200 py-1">
                    <span className="text-[11px] font-semibold uppercase text-slate-600">
                      {date.toLocaleString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-semibold leading-tight text-slate-900">{date.getDate()}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900">{item.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                      <StatusBadge kind="event" status={item.type} />
                      <span>{formatDaysUntil(item.date, TODAY)}</span>
                      {item.time && <span>· {formatTime(item.time)}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function RecentGrades({ grades }) {
  return (
    <Card>
      <CardHeader title="Recent Grades" description="Prelim grades posted this semester" action={<CardLink to="/student/grades">All grades</CardLink>} />
      <ul className="divide-y divide-slate-100">
        {grades.map((grade) => (
          <li key={grade.code} className="flex items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <SubjectTag subject={grade.subject} link className="max-w-full text-sm" />
              <p className="mt-0.5 text-xs text-slate-600">Prelim · posted {formatRelativeTime(grade.postedAt)}</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-slate-900">{grade.prelim}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RecentAttendance({ records }) {
  return (
    <Card>
      <CardHeader title="Recent Attendance" description="Your latest class check-ins" action={<CardLink to="/student/attendance">All records</CardLink>} />
      <ul className="divide-y divide-slate-100">
        {records.map((record) => (
          <li key={record.id} className="flex items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <SubjectTag subject={record.subject} showName={false} className="text-sm" />
              <p className="mt-0.5 text-xs text-slate-600">
                {formatShortDate(record.date)} · {formatTimeRange(record.start, record.end)}
              </p>
            </div>
            <StatusBadge kind="attendance" status={record.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function LatestAnnouncements({ announcements }) {
  return (
    <Card>
      <CardHeader title="Announcements" description="Latest from the university" action={<CardLink to="/student/announcements">All announcements</CardLink>} />
      {announcements.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={Megaphone} title="No announcements yet" />
        </div>
      ) : (
        <ul className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <Link to={`/student/announcements/${announcement.id}`} className="block h-full p-5 hover:bg-slate-50">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge kind="category" status={announcement.category} />
                  {announcement.priority === 'high' && <ImportantBadge />}
                </div>
                <p className="mt-2 font-medium text-slate-900">{announcement.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{announcement.summary}</p>
                <p className="mt-2 text-xs text-slate-600">
                  {announcement.postedBy} · {formatRelativeTime(announcement.postedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
