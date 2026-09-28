import { CURRENT_TERM, daysFromToday } from './calendar.js';

/** Period weights for the final rating. */
export const GRADE_WEIGHTS = { prelim: 0.3, midterm: 0.3, final: 0.4 };

/** Percentage → grade point, the common Philippine college scale (1.00 is highest). */
export const GRADING_SCALE = [
  { min: 97, max: 100, point: 1.0, description: 'Excellent' },
  { min: 94, max: 96, point: 1.25, description: 'Excellent' },
  { min: 91, max: 93, point: 1.5, description: 'Very Good' },
  { min: 88, max: 90, point: 1.75, description: 'Very Good' },
  { min: 85, max: 87, point: 2.0, description: 'Good' },
  { min: 82, max: 84, point: 2.25, description: 'Good' },
  { min: 79, max: 81, point: 2.5, description: 'Satisfactory' },
  { min: 76, max: 78, point: 2.75, description: 'Satisfactory' },
  { min: 75, max: 75, point: 3.0, description: 'Passing' },
  { min: 0, max: 74, point: 5.0, description: 'Failed' },
];

const row = (code, name, units, prelim, midterm, final) => ({ code, name, units, prelim, midterm, final });

export const terms = [
  {
    id: '2024-2025-1',
    academicYear: '2024–2025',
    semester: '1st Semester',
    subjects: [
      row('GE101', 'Understanding the Self', 3, 88, 89, 90),
      row('GE102', 'Readings in Philippine History', 3, 85, 86, 88),
      row('GE103', 'Mathematics in the Modern World', 3, 82, 84, 86),
      row('CC101', 'Introduction to Computing', 3, 90, 91, 93),
      row('CC102', 'Computer Programming 1', 3, 86, 88, 90),
      row('PATHFit1', 'Movement Competency Training', 2, 91, 92, 93),
      row('NSTP1', 'National Service Training Program 1', 3, 88, 90, 91),
    ],
  },
  {
    id: '2024-2025-2',
    academicYear: '2024–2025',
    semester: '2nd Semester',
    subjects: [
      row('GE104', 'Purposive Communication', 3, 84, 86, 87),
      row('GE105', 'The Contemporary World', 3, 86, 87, 89),
      row('CC103', 'Computer Programming 2', 3, 85, 87, 89),
      row('IT101', 'Discrete Mathematics', 3, 80, 82, 84),
      row('IT102', 'Introduction to Human Computer Interaction', 3, 89, 90, 92),
      row('PATHFit2', 'Exercise-based Fitness Activities', 2, 90, 91, 92),
      row('NSTP2', 'National Service Training Program 2', 3, 89, 90, 91),
    ],
  },
  {
    id: '2025-2026-1',
    academicYear: '2025–2026',
    semester: '1st Semester',
    subjects: [
      row('CC104', 'Data Structures and Algorithms', 3, 83, 84, 86),
      row('CC105', 'Information Management', 3, 87, 88, 90),
      row('IT201', 'Networking 1', 3, 84, 85, 87),
      row('IT202', 'Object-Oriented Programming', 3, 86, 88, 89),
      row('GE106', 'Art Appreciation', 3, 88, 89, 90),
      row('PATHFit3', 'Dance', 2, 92, 93, 94),
    ],
  },
  {
    id: '2025-2026-2',
    academicYear: '2025–2026',
    semester: '2nd Semester',
    subjects: [
      row('IT203', 'Networking 2', 3, 87, 88, 90),
      row('IT204', 'Web Systems and Technologies 1', 3, 91, 92, 94),
      row('IT205', 'Applications Development and Emerging Technologies', 3, 89, 91, 92),
      row('IT206', 'Fundamentals of Database Systems', 3, 90, 91, 93),
      row('GE107', 'Science, Technology and Society', 3, 88, 89, 90),
      row('PATHFit4', 'Sports', 2, 93, 94, 95),
    ],
  },
  {
    // In progress: only prelim grades have been posted.
    ...CURRENT_TERM,
    subjects: [
      row('IT301', 'Advanced Database Systems', 3, 88, null, null),
      row('IT302', 'Web Systems and Technologies 2', 3, 92, null, null),
      row('IT303', 'Integrative Programming and Technologies', 3, 90, null, null),
      row('IT304', 'Information Assurance and Security 1', 3, 86, null, null),
      row('IT305', 'Systems Integration and Architecture 1', 3, 89, null, null),
      row('IT306', 'Quantitative Methods', 3, 84, null, null),
      row('IT307', 'Mobile Application Development', 3, 91, null, null),
      row('GE108', 'Ethics', 3, 93, null, null),
    ],
  },
];

/** When each current-term prelim grade was posted (days ago). */
export const prelimPostedDaysAgo = {
  IT301: 0,
  IT303: 3,
  IT302: 4,
  IT305: 4,
  IT304: 5,
  IT307: 5,
  IT306: 6,
  GE108: 6,
};

export const prelimPostedAt = (code) => daysFromToday(-(prelimPostedDaysAgo[code] ?? 7));
