import { CalendarCheck, CircleCheck, CircleX, Clock, FilterX, Percent, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Card, { CardBody, CardHeader } from '../../components/common/Card.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import SelectField from '../../components/common/SelectField.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import TextField from '../../components/common/TextField.jsx';
import AttendanceBySubjectChart from '../../components/student/AttendanceBySubjectChart.jsx';
import StatusBadge from '../../components/student/StatusBadges.jsx';
import SubjectTag from '../../components/student/SubjectTag.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useStudentData } from '../../hooks/useStudentData.js';
import {
  ATTENDANCE_STATUSES,
  getAttendance,
  SEMESTER_START,
  summarizeAttendance,
  TODAY,
} from '../../services/student.service.js';
import { toDateKey } from '../../utils/dates.js';
import { formatDate, formatTimeRange } from '../../utils/format.js';

const PAGE_SIZE = 10;

export default function StudentAttendance() {
  const query = useStudentData(getAttendance);

  return (
    <>
      <PageHeader title="Attendance" description="Your class attendance for the 1st Semester, A.Y. 2026–2027." />
      <QueryState query={query} loadingLabel="Loading attendance records…">
        {(data) => <AttendanceContent data={data} />}
      </QueryState>
    </>
  );
}

function AttendanceContent({ data }) {
  // The subject filter lives in the URL so links like ?subject=IT306 open pre-filtered.
  const [searchParams, setSearchParams] = useSearchParams();
  const subject = searchParams.get('subject') ?? 'all';
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = useMemo(
    () =>
      data.records.filter(
        (record) =>
          (subject === 'all' || record.subjectCode === subject) &&
          (status === 'all' || record.status === status) &&
          (!from || record.date >= from) &&
          (!to || record.date <= to),
      ),
    [data.records, subject, status, from, to],
  );
  const summary = useMemo(() => summarizeAttendance(filtered), [filtered]);
  const { pageItems, pagination, setPage } = usePagination(filtered, PAGE_SIZE);

  const hasFilters = subject !== 'all' || status !== 'all' || from || to;

  const updateFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const setSubject = (value) => {
    setSearchParams(value === 'all' ? {} : { subject: value }, { replace: true });
    setPage(1);
  };
  const resetFilters = () => {
    setSubject('all');
    setStatus('all');
    setFrom('');
    setTo('');
  };

  const subjectOptions = [
    { value: 'all', label: 'All subjects' },
    ...data.bySubject.map(({ subject: s }) => ({ value: s.code, label: `${s.code} — ${s.name}` })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total classes" value={summary.total} icon={CalendarCheck} tone="neutral" />
          <StatCard label="Present" value={summary.Present} icon={CircleCheck} tone="green" />
          <StatCard label="Late" value={summary.Late} icon={Clock} tone="amber" />
          <StatCard label="Absent" value={summary.Absent} hint={`${summary.Excused} excused`} icon={CircleX} tone="red" />
          <StatCard label="Attendance rate" value={`${summary.rate}%`} hint="Present + late" icon={Percent} tone="indigo" />
        </div>
        {hasFilters && <p className="mt-2 text-xs text-slate-600">Totals reflect the filters below.</p>}
      </div>

      <Card>
        <CardHeader title="Attendance Records" description={`${filtered.length} of ${data.records.length} classes`} />
        <div className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
          <SelectField id="filter-subject" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} options={subjectOptions} />
          <SelectField
            id="filter-status"
            label="Status"
            value={status}
            onChange={(e) => updateFilter(setStatus)(e.target.value)}
            options={[{ value: 'all', label: 'All statuses' }, ...ATTENDANCE_STATUSES.map((s) => ({ value: s, label: s }))]}
          />
          <TextField
            id="filter-from"
            label="From"
            type="date"
            value={from}
            min={toDateKey(SEMESTER_START)}
            max={to || toDateKey(TODAY)}
            onChange={(e) => updateFilter(setFrom)(e.target.value)}
          />
          <TextField
            id="filter-to"
            label="To"
            type="date"
            value={to}
            min={from || toDateKey(SEMESTER_START)}
            max={toDateKey(TODAY)}
            onChange={(e) => updateFilter(setTo)(e.target.value)}
          />
          <Button variant="secondary" onClick={resetFilters} disabled={!hasFilters}>
            <FilterX className="size-4" aria-hidden="true" />
            Reset
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={SearchX}
              title="No records match your filters"
              description="Try a different subject, status, or date range."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <Table caption="Attendance records" minWidth="min-w-[820px]">
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Subject</Th>
                  <Th>Instructor</Th>
                  <Th>Time</Th>
                  <Th>Status</Th>
                  <Th>Remarks</Th>
                </tr>
              </thead>
              <TBody>
                {pageItems.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <Td className="whitespace-nowrap font-medium text-slate-900">{formatDate(record.date)}</Td>
                    <Td className="max-w-64">
                      <SubjectTag subject={record.subject} link className="max-w-full" />
                    </Td>
                    <Td className="whitespace-nowrap">{record.subject.instructor}</Td>
                    <Td className="whitespace-nowrap tabular-nums">{formatTimeRange(record.start, record.end)}</Td>
                    <Td>
                      <StatusBadge kind="attendance" status={record.status} />
                    </Td>
                    <Td className="text-slate-600">{record.remarks || '—'}</Td>
                  </tr>
                ))}
              </TBody>
            </Table>
            <Pagination
              className="border-t border-slate-200 px-5 py-3"
              pagination={pagination}
              itemCount={pageItems.length}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <Card>
        <CardHeader title="Attendance by Subject" description="Semester to date, all records" />
        <CardBody>
          <AttendanceBySubjectChart bySubject={data.bySubject} />
        </CardBody>
      </Card>
    </div>
  );
}
