import { CalendarDays, List } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardHeader } from '../../components/common/Card.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import { QueryState } from '../../components/common/States.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import { SubjectDot } from '../../components/student/SubjectTag.jsx';
import WeeklyTimetable from '../../components/student/WeeklyTimetable.jsx';
import { useStudentData } from '../../hooks/useStudentData.js';
import { getSchedule } from '../../services/student.service.js';
import { formatTimeRange } from '../../utils/format.js';

const VIEW_KEY = 'ctms.student.scheduleView';

function readSavedView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'weekly';
  } catch {
    return 'weekly';
  }
}

export default function StudentSchedule() {
  const query = useStudentData(getSchedule);
  const [view, setView] = useState(readSavedView);

  const changeView = (next) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Remembering the view is a convenience only.
    }
  };

  return (
    <>
      <PageHeader
        title="Class Schedule"
        description="Section BSIT-3A · 1st Semester, A.Y. 2026–2027"
        actions={
          <Tabs
            label="Schedule view"
            value={view}
            onChange={changeView}
            tabs={[
              { value: 'weekly', label: 'Weekly', icon: CalendarDays },
              { value: 'list', label: 'List', icon: List },
            ]}
          />
        }
      />
      <QueryState query={query} loadingLabel="Loading your schedule…">
        {(slots) =>
          view === 'weekly' ? (
            <Card>
              <CardBody>
                <WeeklyTimetable slots={slots} />
              </CardBody>
            </Card>
          ) : (
            <ScheduleList slots={slots} />
          )
        }
      </QueryState>
    </>
  );
}

function ScheduleList({ slots }) {
  const days = [...new Set(slots.map((slot) => slot.dayName))];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <Card>
      <CardHeader title="Weekly Classes" description={`${slots.length} class meetings per week`} />
      <Table caption="Class schedule" minWidth="min-w-[720px]">
        <thead>
          <tr>
            <Th>Day</Th>
            <Th>Time</Th>
            <Th>Subject</Th>
            <Th>Instructor</Th>
            <Th>Room</Th>
          </tr>
        </thead>
        {days.map((day) => {
          const daySlots = slots.filter((slot) => slot.dayName === day);
          return (
            <TBody key={day}>
              {daySlots.map((slot, index) => (
                <tr key={slot.id} className={day === todayName ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}>
                  {index === 0 && (
                    <th
                      scope="rowgroup"
                      rowSpan={daySlots.length}
                      className="whitespace-nowrap border-r border-slate-100 px-4 py-3 text-left align-top font-semibold text-slate-900"
                    >
                      {day}
                      {day === todayName && <span className="block text-xs font-medium text-indigo-700">Today</span>}
                    </th>
                  )}
                  <Td className="whitespace-nowrap tabular-nums">{formatTimeRange(slot.start, slot.end)}</Td>
                  <Td>
                    <Link to={`/student/subjects/${slot.subject.code}`} className="group inline-flex items-center gap-2">
                      <SubjectDot color={slot.subject.color} />
                      <span className="font-medium text-slate-900 group-hover:underline">{slot.subject.code}</span>
                      <span className="text-slate-600">{slot.subject.name}</span>
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap">{slot.subject.instructor}</Td>
                  <Td className="whitespace-nowrap">{slot.room}</Td>
                </tr>
              ))}
            </TBody>
          );
        })}
      </Table>
    </Card>
  );
}
