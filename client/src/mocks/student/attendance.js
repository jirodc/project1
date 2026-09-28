import { addDays, atTime, toDateKey } from '../../utils/dates.js';
import { SEMESTER_START, TODAY } from './calendar.js';
import { subjects } from './subjects.js';

/**
 * Specific meetings (0-based, per subject, counted from the start of the
 * semester) that were not a plain "Present". Everything else is Present.
 * Explicit rather than random so notifications can reference real records.
 */
const EXCEPTIONS = {
  IT301: { 4: ['Late', 'Arrived 5 minutes late'] },
  IT302: { 7: ['Late', 'Arrived 10 minutes late'] },
  IT303: { 1: ['Late', 'Arrived 8 minutes late'], 6: ['Late', 'Arrived 12 minutes late'] },
  IT304: { 5: ['Excused', 'Medical certificate submitted'], 10: ['Late', 'Arrived 6 minutes late'] },
  IT305: {
    2: ['Late', 'Arrived 15 minutes late'],
    8: ['Excused', 'Official university activity (CCS Quiz Bee)'],
    13: ['Late', 'Arrived 7 minutes late'],
  },
  IT306: { 3: ['Absent', 'No excuse letter submitted'], 9: ['Absent', 'No excuse letter submitted'] },
  IT307: { 2: ['Absent', 'No excuse letter submitted'] },
  GE108: { 3: ['Late', 'Arrived 7 minutes late'], 5: ['Excused', 'Family emergency (excuse letter approved)'] },
};

/** Every class meeting from the first day of the semester until now, newest first. */
export function buildAttendanceRecords(now = new Date()) {
  const records = [];
  const meetingCounts = {};

  for (let date = SEMESTER_START; date <= TODAY; date = addDays(date, 1)) {
    for (const subject of subjects) {
      for (const slot of subject.schedule) {
        if (slot.day !== date.getDay()) continue;
        if (atTime(date, slot.end) > now) continue; // class has not finished yet

        const meeting = meetingCounts[subject.code] ?? 0;
        meetingCounts[subject.code] = meeting + 1;

        const [status, remarks] = EXCEPTIONS[subject.code]?.[meeting] ?? ['Present', ''];
        records.push({
          id: `${subject.code}-${toDateKey(date)}-${slot.start}`,
          date: toDateKey(date),
          subjectCode: subject.code,
          start: slot.start,
          end: slot.end,
          status,
          remarks,
        });
      }
    }
  }

  return records.sort((a, b) => `${b.date} ${b.start}`.localeCompare(`${a.date} ${a.start}`));
}

export const ATTENDANCE_STATUSES = ['Present', 'Late', 'Absent', 'Excused'];

/** Late still counts as attended; the rate is attended meetings over all meetings. */
export function summarizeAttendance(records) {
  const counts = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
  for (const record of records) counts[record.status] += 1;

  const total = records.length;
  const attended = counts.Present + counts.Late;
  return {
    total,
    ...counts,
    rate: total === 0 ? 0 : Math.round((attended / total) * 1000) / 10,
  };
}
