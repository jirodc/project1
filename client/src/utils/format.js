import { parseDateKey, startOfDay } from './dates.js';

const dateTimeFormat =new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const longDateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const shortDateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const currencyFormat = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// `new Date('2026-09-28')` is UTC midnight, which is the previous day west of
// UTC. Plain YYYY-MM-DD values are calendar dates, so read them as local time.
const toDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDateKey(value) : new Date(value);

export const formatDateTime = (value) => dateTimeFormat.format(toDate(value));

/** "Sep 29, 2026" */
export const formatDate = (value) => dateFormat.format(toDate(value));

/** "Tuesday, September 29, 2026" */
export const formatLongDate = (value) => longDateFormat.format(toDate(value));

/** "Tue, Sep 29" */
export const formatShortDate = (value) => shortDateFormat.format(toDate(value));

/** "13:00" → "1:00 PM" */
export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export const formatTimeRange = (start, end) => `${formatTime(start)} – ${formatTime(end)}`;

/** "₱8,500.00" */
export const formatCurrency = (amount) => currencyFormat.format(amount);

/** "2 hours ago", "yesterday", or a date once it is more than a week old. */
export function formatRelativeTime(value, now = new Date()) {
  const seconds = Math.round((new Date(value) - now) / 1000);
  const abs = Math.abs(seconds);

  if (abs < 60) return 'Just now';
  if (abs < 3600) return relativeFormat.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return relativeFormat.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86400) return relativeFormat.format(Math.round(seconds / 86400), 'day');
  return formatDate(value);
}

/** "In 3 days", "Tomorrow", "Today" — counts calendar days, ignoring the time of day. */
export function formatDaysUntil(value, today) {
  const days = Math.round((startOfDay(toDate(value)) - startOfDay(today)) / 86400000);
  if (days === 0) return 'Today';
  return relativeFormat.format(days, 'day').replace(/^./, (c) => c.toUpperCase());
}
