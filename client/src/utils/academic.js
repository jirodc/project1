/** Labels and helpers shared by the admin, teacher, and student grade screens. */

export const SCORE_CATEGORIES = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'project', label: 'Project' },
  { value: 'examination', label: 'Examination' },
  { value: 'participation', label: 'Participation' },
  { value: 'other', label: 'Other' },
];

export const GRADING_PERIODS = [
  { value: 'prelim', label: 'Prelim' },
  { value: 'midterm', label: 'Midterm' },
  { value: 'final', label: 'Final' },
];

export const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];
export const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

export const DEFAULT_GRADING = {
  categories: { quiz: 20, assignment: 20, project: 30, examination: 30, participation: 0, other: 0 },
  periods: { prelim: 30, midterm: 30, final: 40 },
};

export const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? value;

/** "2026-2027" → "2026–2027" */
export const formatAcademicYear = (year) => year.replace('-', '–');

export const formatTerm = ({ semester, academicYear }) => `${semester}, A.Y. ${formatAcademicYear(academicYear)}`;

/** Academic years around today, newest first, e.g. for filters and forms. */
export function academicYearOptions(before = 3, after = 1) {
  const now = new Date();
  // The school year starts in August.
  const current = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const years = [];
  for (let start = current + after; start >= current - before; start -= 1) years.push(`${start}-${start + 1}`);
  return years;
}

/** Period grades may have decimals; ratings are whole numbers. */
export const formatGrade = (value) =>
  value == null ? '—' : Number.isInteger(value) ? String(value) : value.toFixed(2);

export const fullName = (person) => (person ? `${person.firstName} ${person.lastName}` : '—');
