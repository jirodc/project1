import { addDays, startOfDay, startOfWeek } from '../../utils/dates.js';

// All mock dates are relative to today, so the portal always looks like the
// middle of an active semester no matter when it is opened.
export const TODAY = startOfDay(new Date());

/** Monday seven weeks ago: classes have been running for about two months. */
export const SEMESTER_START = addDays(startOfWeek(TODAY), -7 * 7);

export const daysFromToday = (days) => addDays(TODAY, days);

export const hoursAgo = (hours) => new Date(Date.now() - hours * 3_600_000);

export const CURRENT_TERM = {
  id: '2026-2027-1',
  academicYear: '2026–2027',
  semester: '1st Semester',
};
