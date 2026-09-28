import { daysFromToday } from './calendar.js';

const event = (id, title, type, inDays, details) => ({
  id,
  title,
  type,
  date: daysFromToday(inDays).toISOString(),
  ...details,
});

/** School events, exams, and deadlines. Assignment due dates come from tasks.js. */
export const events = [
  event('ev-1', 'IT306 Long Quiz 3', 'Exam', 3, {
    time: '13:00',
    location: 'Room 305',
    link: '/student/subjects/IT306',
  }),
  event('ev-2', 'Last day to drop subjects', 'Deadline', 6, {
    location: "Registrar's Office",
    link: '/student/subjects',
  }),
  event('ev-3', 'CCS Tech Summit 2026', 'Event', 8, {
    time: '09:00',
    location: 'University Auditorium',
    link: '/student/announcements/ann-tech-summit',
  }),
  event('ev-4', 'Midterm Examinations', 'Exam', 13, {
    endDate: daysFromToday(18).toISOString(),
    location: 'Assigned rooms',
    link: '/student/announcements/ann-midterm-schedule',
  }),
  event('ev-5', 'University Foundation Day (no classes)', 'Event', 24, {
    location: 'Main Campus',
    link: '/student/announcements/ann-foundation-day',
  }),
  event('ev-6', 'Final tuition installment due', 'Deadline', 38, {
    location: 'Accounting Office',
    link: '/student/finance',
  }),
];
