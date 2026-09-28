import { CalendarX } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { timeToMinutes, WEEKDAYS } from '../../utils/dates.js';
import { formatTime, formatTimeRange } from '../../utils/format.js';
import { EmptyState } from '../common/States.jsx';
import Tabs from '../common/Tabs.jsx';

const HOUR_HEIGHT = 64; // px per hour
const SCHOOL_DAYS = [1, 2, 3, 4, 5, 6]; // Monday to Saturday

function ClassBlock({ slot, style, compact = false, className = '' }) {
  return (
    <Link
      to={`/student/subjects/${slot.subject.code}`}
      style={{ ...style, backgroundColor: `${slot.subject.color}1a`, borderLeftColor: slot.subject.color }}
      className={`group block overflow-hidden rounded-md border-l-4 px-2 py-1.5 text-xs transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-indigo-600 ${className}`}
    >
      <p className="font-semibold text-slate-900">{slot.subject.code}</p>
      {!compact && <p className="truncate text-slate-700">{slot.subject.name}</p>}
      <p className="mt-0.5 text-slate-700">{formatTimeRange(slot.start, slot.end)}</p>
      <p className="truncate text-slate-600">{slot.room}</p>
    </Link>
  );
}

/** Desktop: a timetable grid. Phones: one day at a time. */
export default function WeeklyTimetable({ slots, today = new Date() }) {
  const days = SCHOOL_DAYS.filter((day) => day <= 5 || slots.some((slot) => slot.day === day));
  const todayDay = today.getDay();
  const [mobileDay, setMobileDay] = useState(days.includes(todayDay) ? todayDay : days[0]);

  const startHour = Math.floor(Math.min(...slots.map((slot) => timeToMinutes(slot.start))) / 60);
  const endHour = Math.ceil(Math.max(...slots.map((slot) => timeToMinutes(slot.end))) / 60);
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);

  const mobileSlots = slots.filter((slot) => slot.day === mobileDay);

  return (
    <>
      {/* Phones and small tablets */}
      <div className="md:hidden">
        <Tabs
          label="Day of the week"
          value={mobileDay}
          onChange={setMobileDay}
          tabs={days.map((day) => ({ value: day, label: WEEKDAYS[day].slice(0, 3) }))}
          className="w-full"
        />
        <div className="mt-4 space-y-3">
          {mobileSlots.length === 0 ? (
            <EmptyState icon={CalendarX} title={`No classes on ${WEEKDAYS[mobileDay]}`} />
          ) : (
            mobileSlots.map((slot) => (
              <div key={slot.id} className="flex gap-3">
                <p className="w-16 shrink-0 pt-1.5 text-xs font-medium text-slate-600">{formatTime(slot.start)}</p>
                <ClassBlock slot={slot} className="flex-1 text-sm" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tablets and up */}
      <div className="hidden overflow-x-auto md:block">
        <div
          className="grid min-w-180"
          style={{ gridTemplateColumns: `4rem repeat(${days.length}, minmax(0, 1fr))` }}
        >
          <div />
          {days.map((day) => (
            <div
              key={day}
              className={`border-b border-slate-200 px-2 pb-2 text-center text-sm font-semibold ${
                day === todayDay ? 'text-indigo-700' : 'text-slate-700'
              }`}
            >
              {WEEKDAYS[day].slice(0, 3)}
              {day === todayDay && <span className="ml-1 text-xs font-medium">(Today)</span>}
            </div>
          ))}

          {/* Time gutter */}
          <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
            {hours.map((hour, index) => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-xs text-slate-600"
                style={{ top: index * HOUR_HEIGHT }}
              >
                {formatTime(`${hour}:00`)}
              </span>
            ))}
          </div>

          {days.map((day) => (
            <div
              key={day}
              className={`relative border-l border-slate-200 ${day === todayDay ? 'bg-indigo-50/40' : ''}`}
              style={{ height: hours.length * HOUR_HEIGHT }}
            >
              {hours.map((hour, index) => (
                <div
                  key={hour}
                  className="absolute inset-x-0 border-t border-slate-100"
                  style={{ top: index * HOUR_HEIGHT }}
                  aria-hidden="true"
                />
              ))}
              {slots
                .filter((slot) => slot.day === day)
                .map((slot) => {
                  const top = ((timeToMinutes(slot.start) - startHour * 60) / 60) * HOUR_HEIGHT;
                  const height = ((timeToMinutes(slot.end) - timeToMinutes(slot.start)) / 60) * HOUR_HEIGHT;
                  return (
                    <ClassBlock
                      key={slot.id}
                      slot={slot}
                      compact={height < 90}
                      style={{ position: 'absolute', top: top + 2, height: height - 4, left: 4, right: 4 }}
                    />
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
