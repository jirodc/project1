import { formatDate } from '../../utils/format.js';
import { daysFromToday, hoursAgo } from './calendar.js';

export const NOTIFICATION_TYPES = {
  grade: 'Grade posted',
  attendance: 'Attendance',
  announcement: 'Announcement',
  payment: 'Payment',
  assignment: 'Assignment',
  schedule: 'Schedule change',
};

const notification = (id, type, title, description, hours, read, link) => ({
  id,
  type,
  title,
  description,
  createdAt: hoursAgo(hours).toISOString(),
  read,
  link,
});

export function buildInitialNotifications() {
  return [
    notification(
      'notif-1',
      'grade',
      'Prelim grade posted for IT301',
      'Prof. Maria Santos posted your prelim grade for Advanced Database Systems.',
      2,
      false,
      '/student/grades',
    ),
    notification(
      'notif-2',
      'announcement',
      'New announcement: Midterm Examination Schedule',
      'The Registrar posted the midterm examination schedule and room assignments.',
      5,
      false,
      '/student/announcements/ann-midterm-schedule',
    ),
    notification(
      'notif-3',
      'assignment',
      'Lab 5 is due in 2 days',
      'IT302 · Lab 5: Build a REST API with authentication is due soon.',
      9,
      false,
      '/student/subjects/IT302',
    ),
    notification(
      'notif-4',
      'attendance',
      'Attendance warning: IT306',
      'You have 2 unexcused absences in Quantitative Methods. A third absence may affect your standing in the subject.',
      26,
      false,
      '/student/attendance?subject=IT306',
    ),
    notification(
      'notif-5',
      'payment',
      'Final installment reminder',
      `Your final installment of ₱8,500.00 is due on ${formatDate(daysFromToday(38))}.`,
      30,
      false,
      '/student/finance',
    ),
    notification(
      'notif-6',
      'schedule',
      'Schedule change: IT304 make-up class',
      `Dr. Villanueva scheduled a make-up class on ${formatDate(daysFromToday(4))}, 3:00 PM – 4:30 PM in Room 301.`,
      50,
      true,
      '/student/announcements/ann-it304-makeup',
    ),
    notification(
      'notif-7',
      'grade',
      'Prelim grade posted for IT303',
      'Engr. Carlo Mendoza posted your prelim grade for Integrative Programming and Technologies.',
      74,
      true,
      '/student/grades',
    ),
    notification(
      'notif-8',
      'payment',
      'Payment received: ₱11,500.00',
      'Your BPI Online Banking payment for the midterm installment has been posted.',
      96,
      true,
      '/student/finance',
    ),
    notification(
      'notif-9',
      'assignment',
      'Normalization exercise due in 4 days',
      'IT301 · Normalization exercise: 3NF and BCNF.',
      100,
      true,
      '/student/subjects/IT301',
    ),
    notification(
      'notif-10',
      'announcement',
      'New announcement: CCS Tech Summit 2026',
      'Registration for the CCS Tech Summit is now open.',
      98,
      true,
      '/student/announcements/ann-tech-summit',
    ),
  ];
}
