import { ArrowLeft, BookX, CalendarClock, ListTodo, Mail, MapPin, Megaphone, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardLink } from '../../components/common/Card.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States.jsx';
import { LOW_ATTENDANCE_THRESHOLD } from '../../components/student/AttendanceBySubjectChart.jsx';
import StatusBadge, { ImportantBadge } from '../../components/student/StatusBadges.jsx';
import { SubjectDot } from '../../components/student/SubjectTag.jsx';
import { useStudentData } from '../../hooks/useStudentData.js';
import { getSubject, NotFoundError, TODAY } from '../../services/student.service.js';
import { formatGrade } from '../../utils/academic.js';
import { formatDate, formatDaysUntil, formatRelativeTime, formatShortDate, formatTimeRange } from '../../utils/format.js';

function BackLink() {
  return (
    <Link to="/student/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
      <ArrowLeft className="size-4" aria-hidden="true" />
      All subjects
    </Link>
  );
}

export default function SubjectDetail() {
  const { code } = useParams();
  const query = useStudentData(() => getSubject(code), [code]);

  let content;
  if (query.error instanceof NotFoundError) {
    content = (
      <EmptyState
        icon={BookX}
        title="Subject not found"
        description={query.error.message}
        action={<CardLink to="/student/subjects">Go to your subjects</CardLink>}
      />
    );
  } else if (query.status === 'error') {
    content = <ErrorState message={query.error?.message} onRetry={query.reload} />;
  } else if (!query.data) {
    content = <LoadingState label="Loading subject…" />;
  } else {
    content = <SubjectContent data={query.data} />;
  }

  return (
    <>
      <BackLink />
      {content}
    </>
  );
}

function SubjectContent({ data }) {
  const { subject, slots, attendance, grade, tasks, announcements } = data;
  const lowAttendance = attendance.summary.rate < LOW_ATTENDANCE_THRESHOLD;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs" style={{ borderTop: `4px solid ${subject.color}` }}>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <SubjectDot color={subject.color} />
          {subject.code} · {subject.units} units · {subject.section}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{subject.name}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{subject.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Class Information" />
          <CardBody>
            <dl className="space-y-4 text-sm">
              <div className="flex gap-3">
                <User className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
                <div>
                  <dt className="text-slate-600">Instructor</dt>
                  <dd className="font-medium text-slate-900">{subject.instructor}</dd>
                  <dd>
                    <a href={`mailto:${subject.instructorEmail}`} className="inline-flex items-center gap-1 text-indigo-700 hover:underline">
                      <Mail className="size-3.5" aria-hidden="true" />
                      {subject.instructorEmail}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
                <div>
                  <dt className="text-slate-600">Schedule</dt>
                  {slots.map((slot) => (
                    <dd key={slot.id} className="font-medium text-slate-900">
                      {slot.dayName}, {formatTimeRange(slot.start, slot.end)}
                    </dd>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
                <div>
                  <dt className="text-slate-600">Room</dt>
                  <dd className="font-medium text-slate-900">{subject.room}</dd>
                </div>
              </div>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Attendance"
            action={<CardLink to={`/student/attendance?subject=${subject.code}`}>All records</CardLink>}
          />
          <CardBody>
            <p className="text-3xl font-semibold tracking-tight text-slate-900">{attendance.summary.rate}%</p>
            <ProgressBar
              value={attendance.summary.rate}
              tone={lowAttendance ? 'amber' : 'indigo'}
              label={`${subject.code} attendance rate`}
              className="mt-3"
            />
            <dl className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              {['Present', 'Late', 'Absent', 'Excused'].map((status) => (
                <div key={status} className="flex flex-col-reverse rounded-lg bg-slate-50 py-2">
                  <dt className="text-slate-600">{status}</dt>
                  <dd className="text-base font-semibold text-slate-900">{attendance.summary[status]}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-4 space-y-2">
              {attendance.recent.map((record) => (
                <li key={record.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-700">{formatShortDate(record.date)}</span>
                  <StatusBadge kind="attendance" status={record.status} />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Current Grade" action={<CardLink to="/student/grades">All grades</CardLink>} />
          <CardBody>
            {!grade ? (
              <p className="text-sm text-slate-600">No grades have been recorded for this subject yet.</p>
            ) : (
              <dl className="divide-y divide-slate-100 text-sm">
                {[
                  ['Prelim', grade.prelim],
                  ['Midterm', grade.midterm],
                  ['Final', grade.final],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <dt className="text-slate-600">{label}</dt>
                    <dd className={value == null ? 'text-slate-600' : 'text-lg font-semibold tabular-nums text-slate-900'}>
                      {value == null ? 'Not yet posted' : formatGrade(value)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2.5">
                  <dt className="font-medium text-slate-900">Final rating</dt>
                  <dd>
                    {grade.rating == null ? (
                      <StatusBadge kind="grade" status="In Progress" />
                    ) : (
                      <span className="text-lg font-semibold">
                        {grade.rating} ({grade.point.toFixed(2)})
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Assignments" description="Upcoming and recently submitted work" />
          {tasks.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={ListTodo} title="No assignments yet" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <li key={task.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <p className="text-sm text-slate-600">
                      {task.type} · Due {formatDate(task.dueAt)}
                      {task.status === 'pending' && ` (${formatDaysUntil(task.dueAt, TODAY).toLowerCase()})`}
                    </p>
                  </div>
                  <StatusBadge kind="task" status={task.status} className="self-start sm:self-center" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Class Announcements" description={`From ${subject.instructor}`} />
          {announcements.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Megaphone} title="No class announcements" description="Your instructor hasn't posted anything yet." />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <li key={announcement.id}>
                  <Link to={`/student/announcements/${announcement.id}`} className="block px-5 py-3 hover:bg-slate-50">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">{announcement.title}</span>
                      {announcement.priority === 'high' && <ImportantBadge />}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-sm text-slate-600">{announcement.summary}</span>
                    <span className="mt-1 block text-xs text-slate-600">{formatRelativeTime(announcement.postedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
