import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import Tabs from '../common/Tabs.jsx';
import { Table, TBody, Td, Th } from '../common/Table.jsx';

export const LOW_ATTENDANCE_THRESHOLD = 90;
const TICKS = [0, 25, 50, 75, 100];

/** Attendance rate per subject as horizontal bars, one color (a single measure). */
export default function AttendanceBySubjectChart({ bySubject }) {
  const [view, setView] = useState('chart');
  const [activeCode, setActiveCode] = useState(null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Present and late count as attended</p>
        <Tabs
          label="Attendance by subject view"
          value={view}
          onChange={setView}
          tabs={[
            { value: 'chart', label: 'Chart' },
            { value: 'table', label: 'Table' },
          ]}
        />
      </div>

      {view === 'table' ? (
        <Table caption="Attendance by subject" minWidth="min-w-[520px]">
          <thead>
            <tr>
              <Th>Subject</Th>
              <Th align="right">Classes</Th>
              <Th align="right">Present</Th>
              <Th align="right">Late</Th>
              <Th align="right">Absent</Th>
              <Th align="right">Excused</Th>
              <Th align="right">Rate</Th>
            </tr>
          </thead>
          <TBody>
            {bySubject.map((row) => (
              <tr key={row.subject.code}>
                <Td className="font-medium text-slate-900">{row.subject.code}</Td>
                <Td align="right">{row.total}</Td>
                <Td align="right">{row.Present}</Td>
                <Td align="right">{row.Late}</Td>
                <Td align="right">{row.Absent}</Td>
                <Td align="right">{row.Excused}</Td>
                <Td align="right">{row.rate}%</Td>
              </tr>
            ))}
          </TBody>
        </Table>
      ) : (
        <div>
          <ul className="space-y-2.5">
            {bySubject.map((row) => {
              const low = row.rate < LOW_ATTENDANCE_THRESHOLD;
              const active = activeCode === row.subject.code;
              return (
                <li
                  key={row.subject.code}
                  tabIndex={0}
                  aria-label={`${row.subject.code}: ${row.rate}% attendance, ${row.Absent} absent, ${row.Late} late, ${row.Excused} excused`}
                  onMouseEnter={() => setActiveCode(row.subject.code)}
                  onMouseLeave={() => setActiveCode(null)}
                  onFocus={() => setActiveCode(row.subject.code)}
                  onBlur={() => setActiveCode(null)}
                  className="relative grid grid-cols-[4.5rem_1fr] items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className="text-sm font-medium text-slate-900">{row.subject.code}</span>
                  <div className="flex items-center gap-2">
                    <div className="relative h-3.5 flex-1">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-r ${active ? 'bg-indigo-700' : 'bg-indigo-600'}`}
                        style={{ width: `${row.rate}%` }}
                      />
                    </div>
                    <span className="w-24 shrink-0 text-sm tabular-nums text-slate-700">
                      {row.rate}%
                      {low && (
                        <span className="ml-1 inline-flex items-center gap-0.5 text-xs font-medium text-amber-800">
                          <TriangleAlert className="size-3.5" aria-hidden="true" />
                          Low
                        </span>
                      )}
                    </span>
                  </div>

                  {active && (
                    <div className="pointer-events-none absolute left-20 top-full z-10 mt-1 w-max rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold text-slate-900">
                        {row.subject.code} · {row.subject.name}
                      </p>
                      <p className="mt-0.5 text-slate-700">
                        {row.Present} present · {row.Late} late · {row.Absent} absent · {row.Excused} excused
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Axis */}
          <div className="mt-2 grid grid-cols-[4.5rem_1fr] gap-3" aria-hidden="true">
            <span />
            <div className="flex items-center gap-2">
              <div className="relative h-4 flex-1 border-t border-slate-300">
                {TICKS.map((tick) => (
                  <span
                    key={tick}
                    className="absolute top-1 -translate-x-1/2 text-[11px] tabular-nums text-slate-600"
                    style={{ left: `${tick}%` }}
                  >
                    {tick}%
                  </span>
                ))}
              </div>
              <span className="w-24 shrink-0" />
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1 text-xs text-slate-600">
            <TriangleAlert className="size-3.5 text-amber-700" aria-hidden="true" />
            “Low” marks subjects below {LOW_ATTENDANCE_THRESHOLD}% attendance.
          </p>
        </div>
      )}
    </div>
  );
}
