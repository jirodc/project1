/**
 * Student portal data access. Reads are synchronous selectors over the mock
 * data (see hooks/useStudentData.js for loading behavior); writes are async
 * like real API calls. Swap these implementations for API requests when the
 * backend endpoints exist — the pages only depend on this module.
 */
import { buildAttendanceRecords, summarizeAttendance } from '../mocks/student/attendance.js';
import { announcements } from '../mocks/student/announcements.js';
import { CURRENT_TERM, TODAY, daysFromToday } from '../mocks/student/calendar.js';
import { documentCatalog, documentPurposes } from '../mocks/student/documents.js';
import { events } from '../mocks/student/events.js';
import { assessment, installments, paymentChannels, payments } from '../mocks/student/finance.js';
import { GRADE_WEIGHTS, GRADING_SCALE, prelimPostedAt, terms } from '../mocks/student/grades.js';
import { studentProfile } from '../mocks/student/profile.js';
import { studentStore } from '../mocks/student/store.js';
import { subjects, subjectsByCode } from '../mocks/student/subjects.js';
import { tasks } from '../mocks/student/tasks.js';
import { atTime, WEEKDAYS } from '../utils/dates.js';
import { formatTimeRange } from '../utils/format.js';

export { summarizeAttendance, ATTENDANCE_STATUSES } from '../mocks/student/attendance.js';
export { SEMESTER_START, TODAY } from '../mocks/student/calendar.js';

const MUTATION_DELAY_MS = 450;
const wait = (ms = MUTATION_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

const sum = (items, pick) => items.reduce((total, item) => total + pick(item), 0);
const round2 = (value) => Math.round(value * 100) / 100;
const byDateDesc = (key) => (a, b) => new Date(b[key]) - new Date(a[key]);

// ─── Grades ────────────────────────────────────────────────────────────────

export function computeRating({ prelim, midterm, final }) {
  if (prelim == null || midterm == null || final == null) return null;
  return Math.round(
    prelim * GRADE_WEIGHTS.prelim + midterm * GRADE_WEIGHTS.midterm + final * GRADE_WEIGHTS.final,
  );
}

export const gradePoint = (rating) => GRADING_SCALE.find((step) => rating >= step.min).point;

const weightedAverage = (rows) => round2(sum(rows, (r) => r.point * r.units) / sum(rows, (r) => r.units));

function buildTerm(term) {
  const rows = term.subjects.map((subject) => {
    const rating = computeRating(subject);
    const point = rating == null ? null : gradePoint(rating);
    const remarks = rating == null ? 'In Progress' : point <= 3 ? 'Passed' : 'Failed';
    return { ...subject, rating, point, remarks };
  });
  const complete = rows.every((row) => row.rating != null);

  return {
    ...term,
    label: `${term.semester}, A.Y. ${term.academicYear}`,
    rows,
    complete,
    units: sum(rows, (row) => row.units),
    gwa: complete ? weightedAverage(rows) : null,
  };
}

export function getGrades() {
  const builtTerms = terms.map(buildTerm);
  const completed = builtTerms.filter((term) => term.complete);
  const completedRows = completed.flatMap((term) => term.rows);
  const passedRows = completedRows.filter((row) => row.remarks === 'Passed');

  return {
    terms: builtTerms,
    currentTermId: CURRENT_TERM.id,
    scale: GRADING_SCALE,
    weights: GRADE_WEIGHTS,
    summary: {
      currentGpa: weightedAverage(completedRows),
      previousGpa: completed.at(-1)?.gwa ?? null,
      previousTermLabel: completed.at(-1)?.label ?? null,
      totalUnits: sum(passedRows, (row) => row.units),
      passed: passedRows.length,
      failed: completedRows.length - passedRows.length,
    },
  };
}

function currentTermRows() {
  return buildTerm(terms.find((term) => term.id === CURRENT_TERM.id)).rows;
}

// ─── Schedule & attendance ────────────────────────────────────────────────

const scheduleText = (subject) =>
  subject.schedule.map((slot) => `${WEEKDAYS[slot.day].slice(0, 3)} ${formatTimeRange(slot.start, slot.end)}`).join(' · ');

export function getSchedule() {
  return subjects
    .flatMap((subject) =>
      subject.schedule.map((slot) => ({
        id: `${subject.code}-${slot.day}-${slot.start}`,
        ...slot,
        dayName: WEEKDAYS[slot.day],
        room: subject.room,
        subject,
      })),
    )
    .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
}

export function getTodaySchedule(now = new Date()) {
  return getSchedule()
    .filter((slot) => slot.day === now.getDay())
    .map((slot) => {
      const start = atTime(now, slot.start);
      const end = atTime(now, slot.end);
      const status = now < start ? 'Upcoming' : now < end ? 'Ongoing' : 'Completed';
      return { ...slot, status };
    });
}

export function getAttendance() {
  const records = buildAttendanceRecords().map((record) => ({
    ...record,
    subject: subjectsByCode[record.subjectCode],
  }));

  return {
    records,
    summary: summarizeAttendance(records),
    bySubject: subjects.map((subject) => ({
      subject,
      ...summarizeAttendance(records.filter((record) => record.subjectCode === subject.code)),
    })),
  };
}

// ─── Subjects ─────────────────────────────────────────────────────────────

export function getSubjects() {
  const { bySubject } = getAttendance();
  const grades = currentTermRows();

  return subjects.map((subject) => ({
    ...subject,
    scheduleText: scheduleText(subject),
    attendanceRate: bySubject.find((entry) => entry.subject.code === subject.code).rate,
    prelim: grades.find((row) => row.code === subject.code)?.prelim ?? null,
  }));
}

export function getSubjectsOverview() {
  return {
    subjects: getSubjects(),
    pendingTasks: tasks
      .filter((task) => task.status === 'pending')
      .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
      .map((task) => ({ ...task, subject: subjectsByCode[task.subjectCode] })),
  };
}

export function getSubject(code) {
  const subject = subjectsByCode[code];
  if (!subject) throw new NotFoundError(`We couldn't find a subject with the code "${code}".`);

  const records = getAttendance().records.filter((record) => record.subjectCode === code);

  return {
    subject: { ...subject, scheduleText: scheduleText(subject) },
    slots: getSchedule().filter((slot) => slot.subject.code === code),
    attendance: { summary: summarizeAttendance(records), recent: records.slice(0, 5) },
    grade: currentTermRows().find((row) => row.code === code),
    tasks: tasks
      .filter((task) => task.subjectCode === code)
      .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)),
    announcements: getAnnouncements().filter((announcement) => announcement.subjectCode === code),
  };
}

// ─── Announcements & events ───────────────────────────────────────────────

export function getAnnouncements() {
  return [...announcements].sort(byDateDesc('postedAt'));
}

export function getAnnouncement(id) {
  const announcement = announcements.find((item) => item.id === id);
  if (!announcement) throw new NotFoundError('This announcement may have been removed or the link is incorrect.');
  return announcement;
}

/** Exams, events, deadlines and pending assignments from today onward. */
export function getUpcoming(limit = Infinity) {
  const fromEvents = events.map((event) => ({ ...event, subject: subjectsByCode[event.subjectCode] }));
  const fromTasks = tasks
    .filter((task) => task.status === 'pending')
    .map((task) => ({
      id: task.id,
      title: task.title,
      type: 'Assignment',
      date: task.dueAt,
      subject: subjectsByCode[task.subjectCode],
      link: `/student/subjects/${task.subjectCode}`,
    }));

  return [...fromEvents, ...fromTasks]
    .filter((item) => new Date(item.endDate ?? item.date) >= TODAY)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, limit);
}

// ─── Finance ──────────────────────────────────────────────────────────────

export function getFinance() {
  const total = sum(assessment, (item) => item.amount);
  const paid = sum(
    payments.filter((payment) => payment.status === 'Paid'),
    (payment) => payment.amount,
  );

  // Apply payments to installments in order.
  let pool = paid;
  const schedule = installments.map((installment) => {
    const applied = Math.min(pool, installment.amount);
    pool -= applied;
    const remaining = installment.amount - applied;
    const overdue = remaining > 0 && new Date(installment.dueDate) < TODAY;
    const status = remaining === 0 ? 'Paid' : overdue ? 'Overdue' : applied > 0 ? 'Partially paid' : 'Unpaid';
    return { ...installment, paid: applied, remaining, status };
  });

  const next = schedule.find((installment) => installment.remaining > 0);

  return {
    assessment,
    total,
    paid,
    balance: total - paid,
    installments: schedule,
    nextDue: next ? { label: next.label, amount: next.remaining, dueDate: next.dueDate } : null,
    payments: [...payments].sort(byDateDesc('date')),
    channels: paymentChannels,
  };
}

// ─── Documents ────────────────────────────────────────────────────────────

export function getDocuments() {
  return {
    catalog: documentCatalog,
    purposes: documentPurposes,
    requests: [...studentStore.getState().documentRequests].sort(byDateDesc('requestedAt')),
  };
}

export async function requestDocument({ type, purpose, copies, notes }) {
  await wait();
  const item = documentCatalog.find((doc) => doc.type === type);
  if (!item) throw new Error('Please choose a document type.');

  const request = {
    id: `req-${Date.now()}`,
    type,
    purpose,
    copies,
    notes,
    requestedAt: new Date().toISOString(),
    processingDate: daysFromToday(item.processingDays).toISOString(),
    status: 'Pending',
    remarks: 'Waiting for payment verification.',
  };

  studentStore.update((state) => ({ ...state, documentRequests: [request, ...state.documentRequests] }));
  return request;
}

export async function cancelDocumentRequest(id) {
  await wait();
  const request = studentStore.getState().documentRequests.find((item) => item.id === id);
  if (!request || request.status !== 'Pending') {
    throw new Error('Only pending requests can be cancelled.');
  }
  studentStore.update((state) => ({
    ...state,
    documentRequests: state.documentRequests.filter((item) => item.id !== id),
  }));
}

// ─── Notifications ────────────────────────────────────────────────────────

export function getNotifications() {
  const notifications = [...studentStore.getState().notifications].sort(byDateDesc('createdAt'));
  return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
}

const setNotifications = (updater) =>
  studentStore.update((state) => ({ ...state, notifications: updater(state.notifications) }));

// Read-state changes apply instantly, as they would with optimistic updates.
export function markNotificationRead(id) {
  setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function markAllNotificationsRead() {
  setNotifications((list) => list.map((n) => ({ ...n, read: true })));
}

export function deleteNotification(id) {
  const removed = studentStore.getState().notifications.find((n) => n.id === id);
  setNotifications((list) => list.filter((n) => n.id !== id));
  return removed;
}

export function restoreNotification(notification) {
  setNotifications((list) => [...list.filter((n) => n.id !== notification.id), notification]);
}

// ─── Profile ──────────────────────────────────────────────────────────────

/** Name and email come from the signed-in account; the rest from the student record. */
export function getProfile(user) {
  const { profile, photo, preferences } = studentStore.getState();
  return {
    ...studentProfile,
    ...profile,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    photo,
    preferences,
  };
}

export function getPhoto() {
  return studentStore.getState().photo;
}

export async function updateProfile(changes) {
  await wait();
  studentStore.update((state) => ({ ...state, profile: { ...state.profile, ...changes } }));
}

export async function updatePhoto(dataUrl) {
  await wait(250);
  studentStore.update((state) => ({ ...state, photo: dataUrl }));
}

export async function updatePreferences(preferences) {
  await wait();
  studentStore.update((state) => ({ ...state, preferences }));
}

// ─── Dashboard ────────────────────────────────────────────────────────────

export function getDashboard(user) {
  const grades = getGrades();
  const attendance = getAttendance();
  const finance = getFinance();

  return {
    profile: getProfile(user),
    stats: {
      gpa: grades.summary.currentGpa,
      attendanceRate: attendance.summary.rate,
      subjectCount: subjects.length,
      units: sum(subjects, (s) => s.units),
      pendingTasks: tasks.filter((task) => task.status === 'pending').length,
      balance: finance.balance,
      nextDue: finance.nextDue,
    },
    today: getTodaySchedule(),
    recentAttendance: attendance.records.slice(0, 5),
    recentGrades: currentTermRows()
      .map((row) => ({ ...row, postedAt: prelimPostedAt(row.code).toISOString(), subject: subjectsByCode[row.code] }))
      .sort(byDateDesc('postedAt'))
      .slice(0, 5),
    announcements: getAnnouncements().slice(0, 3),
    upcoming: getUpcoming(6),
  };
}

// ─── Global search ────────────────────────────────────────────────────────

function buildSearchIndex() {
  const { terms: gradeTerms } = getGrades();
  const { requests, catalog } = getDocuments();

  return [
    ...subjects.map((s) => ({
      id: `subject-${s.code}`,
      group: 'Subjects',
      title: `${s.code} — ${s.name}`,
      subtitle: `${s.instructor} · ${s.room}`,
      to: `/student/subjects/${s.code}`,
      text: `${s.code} ${s.name} ${s.instructor} ${s.room}`,
    })),
    ...gradeTerms.flatMap((term) =>
      term.rows.map((row) => ({
        id: `grade-${term.id}-${row.code}`,
        group: 'Grades',
        title: `${row.code} — ${row.name}`,
        subtitle: `${term.label} · ${row.rating != null ? `Final rating ${row.rating} (${row.point.toFixed(2)})` : `Prelim ${row.prelim}`}`,
        to: `/student/grades?term=${term.id}`,
        text: `${row.code} ${row.name} grade ${term.academicYear} ${term.semester}`,
      })),
    ),
    ...getAnnouncements().map((a) => ({
      id: `announcement-${a.id}`,
      group: 'Announcements',
      title: a.title,
      subtitle: `${a.category} · ${a.postedBy}`,
      to: `/student/announcements/${a.id}`,
      text: `${a.title} ${a.category} ${a.postedBy} ${a.summary}`,
    })),
    ...catalog.map((doc) => ({
      id: `doc-${doc.type}`,
      group: 'Documents',
      title: doc.type,
      subtitle: requests.find((r) => r.type === doc.type)?.status
        ? `Your latest request: ${requests.find((r) => r.type === doc.type).status}`
        : 'Request from the Registrar',
      to: '/student/documents',
      text: `${doc.type} ${doc.description} document request`,
    })),
    ...getNotifications().notifications.map((n) => ({
      id: `notification-${n.id}`,
      group: 'Notifications',
      title: n.title,
      subtitle: n.description,
      to: '/student/notifications',
      text: `${n.title} ${n.description}`,
    })),
  ];
}

export const SEARCH_GROUPS = ['Subjects', 'Grades', 'Announcements', 'Documents', 'Notifications'];

/** Every word of the query must appear somewhere in the result. */
export function search(query, perGroup = 5) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const matches = buildSearchIndex().filter((item) => {
    const text = item.text.toLowerCase();
    return words.every((word) => text.includes(word));
  });

  return SEARCH_GROUPS.map((group) => ({
    group,
    items: matches.filter((item) => item.group === group).slice(0, perGroup),
  })).filter((group) => group.items.length > 0);
}
