export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Monday of the week containing `date`. */
export function startOfWeek(date) {
  const day = startOfDay(date);
  const weekday = day.getDay();
  return addDays(day, weekday === 0 ? -6 : 1 - weekday);
}

/** Local-time YYYY-MM-DD, suitable for <input type="date"> values. */
export function toDateKey(date) {
  const d = new Date(date);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "08:30" → 510 */
export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** A Date on `date`'s day at the given "HH:MM" time. */
export function atTime(date, time) {
  const result = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export const isSameDay = (a, b) => toDateKey(a) === toDateKey(b);
