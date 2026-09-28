import { ArrowRight, CalendarClock, ListTodo, MapPin, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader } from '../../components/common/Card.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import StatusBadge from '../../components/student/StatusBadges.jsx';
import { SubjectDot } from '../../components/student/SubjectTag.jsx';
import { useStudentData } from '../../hooks/useStudentData.js';
import { getSubjectsOverview, TODAY } from '../../services/student.service.js';
import { formatDate, formatDaysUntil } from '../../utils/format.js';

export default function StudentSubjects() {
  const query = useStudentData(getSubjectsOverview);

  return (
    <>
      <PageHeader title="Subjects" description="Your enrolled subjects for the 1st Semester, A.Y. 2026–2027." />
      <QueryState query={query} loadingLabel="Loading subjects…">
        {(data) => <SubjectsContent data={data} />}
      </QueryState>
    </>
  );
}

function SubjectsContent({ data }) {
  const navigate = useNavigate();
  const { subjects, pendingTasks } = data;
  const units = subjects.reduce((total, subject) => total + subject.units, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Enrolled Subjects" description={`${subjects.length} subjects · ${units} units · Section BSIT-3A`} />

        {/* Phones: cards */}
        <ul className="divide-y divide-slate-100 md:hidden">
          {subjects.map((subject) => (
            <li key={subject.code}>
              <Link to={subject.code} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50">
                <SubjectDot color={subject.color} className="mt-1.5 size-3" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-600">
                    {subject.code} · {subject.units} units
                  </span>
                  <span className="block font-medium text-slate-900">{subject.name}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                    <User className="size-3.5 shrink-0" aria-hidden="true" />
                    {subject.instructor}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                    <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
                    {subject.scheduleText}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                    {subject.room}
                  </span>
                </span>
                <ArrowRight className="mt-1 size-4 shrink-0 text-slate-500" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Tablets and up: table */}
        <div className="hidden md:block">
          <Table caption="Enrolled subjects" minWidth="min-w-[900px]">
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Subject</Th>
                <Th align="center">Units</Th>
                <Th>Instructor</Th>
                <Th>Section</Th>
                <Th>Schedule</Th>
                <Th>Room</Th>
              </tr>
            </thead>
            <TBody>
              {subjects.map((subject) => (
                <tr
                  key={subject.code}
                  onClick={() => navigate(subject.code)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <Td className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-900">
                      <SubjectDot color={subject.color} />
                      {subject.code}
                    </span>
                  </Td>
                  <Td>
                    <Link to={subject.code} className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline">
                      {subject.name}
                    </Link>
                  </Td>
                  <Td align="center">{subject.units}</Td>
                  <Td className="whitespace-nowrap">{subject.instructor}</Td>
                  <Td>{subject.section}</Td>
                  <Td className="text-slate-600">
                    {subject.scheduleText.split(' · ').map((part) => (
                      <span key={part} className="block whitespace-nowrap">
                        {part}
                      </span>
                    ))}
                  </Td>
                  <Td className="whitespace-nowrap">{subject.room}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Pending Tasks" description="Assignments and projects you haven't submitted yet" />
        {pendingTasks.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={ListTodo} title="You're all caught up" description="No pending assignments or projects." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pendingTasks.map((task) => (
              <li key={task.id}>
                <Link to={task.subjectCode} className="flex flex-col gap-2 px-5 py-4 hover:bg-slate-50 sm:flex-row sm:items-center">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <SubjectDot color={task.subject.color} />
                      {task.subject.code} · {task.type}
                    </span>
                    <span className="mt-0.5 block font-medium text-slate-900">{task.title}</span>
                  </span>
                  <span className="flex items-center gap-3 text-sm text-slate-600">
                    <span>
                      Due {formatDate(task.dueAt)} ({formatDaysUntil(task.dueAt, TODAY).toLowerCase()})
                    </span>
                    <StatusBadge kind="task" status={task.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
