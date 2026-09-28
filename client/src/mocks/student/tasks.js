import { daysFromToday } from './calendar.js';

const task = (id, subjectCode, title, type, dueInDays, dueTime, status) => ({
  id,
  subjectCode,
  title,
  type,
  dueAt: (() => {
    const due = daysFromToday(dueInDays);
    const [h, m] = dueTime.split(':').map(Number);
    due.setHours(h, m, 0, 0);
    return due.toISOString();
  })(),
  status,
});

export const tasks = [
  task('task-1', 'IT302', 'Lab 5: Build a REST API with authentication', 'Lab Activity', 2, '23:59', 'pending'),
  task('task-2', 'IT301', 'Normalization exercise: 3NF and BCNF', 'Assignment', 4, '23:59', 'pending'),
  task('task-3', 'IT304', 'Risk assessment case study (group)', 'Project', 9, '17:00', 'pending'),
  task('task-4', 'IT307', 'UI prototype of the capstone app in Figma', 'Project', 11, '23:59', 'submitted'),
  task('task-5', 'IT303', 'JSON and XML data exchange exercise', 'Assignment', -3, '23:59', 'submitted'),
  task('task-6', 'IT306', 'Problem set 4: Linear programming', 'Assignment', -5, '23:59', 'submitted'),
  task('task-7', 'GE108', 'Reflection paper: Utilitarianism in daily life', 'Assignment', -8, '23:59', 'submitted'),
];
