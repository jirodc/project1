/**
 * Loads realistic demo data so the portals look populated: subjects with
 * grading weights, faculty, a BSIT-3A/3B class list, classes for five
 * semesters, and scores. Juan Dela Cruz (SEED_STUDENT_EMAIL) gets a full
 * academic history; the demo teacher (SEED_TEACHER_EMAIL) teaches IT302.
 *
 *   npm run seed        # first: creates the admin, demo teacher, and Juan
 *   npm run seed:demo   # then: this script (runs once; skips if already loaded)
 */
import { randomBytes } from 'node:crypto';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { assertRequiredEnv, env } from '../config/environment.js';
import { Classroom } from '../models/Classroom.js';
import { Score } from '../models/Score.js';
import { Student } from '../models/Student.js';
import { DEFAULT_GRADING, Subject } from '../models/Subject.js';
import { User } from '../models/User.js';

const PROGRAM = 'Bachelor of Science in Information Technology';

// [code, name, units, [prelim, midterm, final] for Juan]
const HISTORY = [
  {
    academicYear: '2024-2025', semester: '1st Semester', section: 'BSIT-1A',
    subjects: [
      ['GE101', 'Understanding the Self', 3, [88, 89, 90]],
      ['GE102', 'Readings in Philippine History', 3, [85, 86, 88]],
      ['GE103', 'Mathematics in the Modern World', 3, [82, 84, 86]],
      ['CC101', 'Introduction to Computing', 3, [90, 91, 93]],
      ['CC102', 'Computer Programming 1', 3, [86, 88, 90]],
      ['PATHFIT1', 'Movement Competency Training', 2, [91, 92, 93]],
      ['NSTP1', 'National Service Training Program 1', 3, [88, 90, 91]],
    ],
  },
  {
    academicYear: '2024-2025', semester: '2nd Semester', section: 'BSIT-1A',
    subjects: [
      ['GE104', 'Purposive Communication', 3, [84, 86, 87]],
      ['GE105', 'The Contemporary World', 3, [86, 87, 89]],
      ['CC103', 'Computer Programming 2', 3, [85, 87, 89]],
      ['IT101', 'Discrete Mathematics', 3, [80, 82, 84]],
      ['IT102', 'Introduction to Human Computer Interaction', 3, [89, 90, 92]],
      ['PATHFIT2', 'Exercise-based Fitness Activities', 2, [90, 91, 92]],
      ['NSTP2', 'National Service Training Program 2', 3, [89, 90, 91]],
    ],
  },
  {
    academicYear: '2025-2026', semester: '1st Semester', section: 'BSIT-2A',
    subjects: [
      ['CC104', 'Data Structures and Algorithms', 3, [83, 84, 86]],
      ['CC105', 'Information Management', 3, [87, 88, 90]],
      ['IT201', 'Networking 1', 3, [84, 85, 87]],
      ['IT202', 'Object-Oriented Programming', 3, [86, 88, 89]],
      ['GE106', 'Art Appreciation', 3, [88, 89, 90]],
      ['PATHFIT3', 'Dance', 2, [92, 93, 94]],
    ],
  },
  {
    academicYear: '2025-2026', semester: '2nd Semester', section: 'BSIT-2A',
    subjects: [
      ['IT203', 'Networking 2', 3, [87, 88, 90]],
      ['IT204', 'Web Systems and Technologies 1', 3, [91, 92, 94]],
      ['IT205', 'Applications Development and Emerging Technologies', 3, [89, 91, 92]],
      ['IT206', 'Fundamentals of Database Systems', 3, [90, 91, 93]],
      ['GE107', 'Science, Technology and Society', 3, [88, 89, 90]],
      ['PATHFIT4', 'Sports', 2, [93, 94, 95]],
    ],
  },
];

// Current semester: prelims only. [code, name, room, faculty index or 'demo', Juan's prelim, days ago]
const CURRENT = {
  academicYear: '2026-2027', semester: '1st Semester', section: 'BSIT-3A',
  subjects: [
    ['IT301', 'Advanced Database Systems', 'CL-204', 0, 88, 1],
    ['IT302', 'Web Systems and Technologies 2', 'CL-205', 'demo', 92, 4],
    ['IT303', 'Integrative Programming and Technologies', 'CL-204', 1, 90, 3],
    ['IT304', 'Information Assurance and Security 1', 'Room 301', 2, 86, 5],
    ['IT305', 'Systems Integration and Architecture 1', 'Room 302', 3, 89, 4],
    ['IT306', 'Quantitative Methods', 'Room 305', 4, 84, 6],
    ['IT307', 'Mobile Application Development', 'CL-301', 5, 91, 5],
    ['GE108', 'Ethics', 'Room 210', 6, 93, 6],
  ],
};

const FACULTY = [
  ['Maria', 'Santos'],
  ['Carlo', 'Mendoza'],
  ['Liza', 'Villanueva'],
  ['Ramon', 'Garcia'],
  ['Grace', 'Bautista'],
  ['Paolo', 'Ramos'],
  ['Eduardo', 'Navarro'],
];

const CLASSMATES = {
  'BSIT-3A': [
    ['Maria Clara', 'Reyes'], ['Jose', 'Santos'], ['Andrea', 'Villanueva'], ['Miguel', 'Fernandez'],
    ['Patricia', 'Aquino'], ['Rafael', 'Mercado'], ['Kristine', 'Lim'], ['Paolo', 'Castillo'], ['Bea', 'Domingo'],
  ],
  'BSIT-3B': [
    ['Carlos', 'Mendoza'], ['Janelle', 'Torres'], ['Mark Anthony', 'Ramos'], ['Sofia', 'Garcia'], ['Enzo', 'Navarro'],
    ['Angelica', 'Bautista'], ['Luis', 'Pascual'], ['Nicole', 'Tan'], ['Gabriel', 'Soriano'], ['Hannah', 'Del Rosario'],
  ],
};

const randomPassword = () => `${randomBytes(12).toString('base64url')}a1`;
const slug = (text) => text.toLowerCase().replace(/[^a-z]+/g, '');

// Small deterministic generator so every run produces the same classmates' scores.
let seed = 20260929;
const random = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, Math.round(value)));
const daysAgo = (days) => new Date(Date.now() - days * 86_400_000);

/** Assessment dates for past semesters: 1st sem Aug–Dec, 2nd sem Jan–May. */
function periodDates(academicYear, semester) {
  const [start, end] = academicYear.split('-').map(Number);
  return semester === '1st Semester'
    ? { prelim: new Date(start, 8, 15), midterm: new Date(start, 9, 20), final: new Date(start, 11, 10) }
    : { prelim: new Date(end, 1, 15), midterm: new Date(end, 2, 20), final: new Date(end, 4, 10) };
}

/**
 * Scores that produce exactly `target` for a period under the default weights:
 * every category scores `target`%, so the weighted grade is `target`.
 */
function periodScores(target, { period, date, prefix }) {
  const quiz1 = Math.round(target / 2);
  return [
    { period, category: 'quiz', title: `${prefix} Quiz 1`, score: quiz1, maximumScore: 50, date },
    { period, category: 'quiz', title: `${prefix} Quiz 2`, score: target - quiz1, maximumScore: 50, date },
    { period, category: 'assignment', title: `${prefix} Assignment`, score: target, maximumScore: 100, date },
    { period, category: 'examination', title: `${prefix} Examination`, score: target, maximumScore: 100, date },
  ];
}

async function requireUser(envName, role) {
  const email = process.env[envName]?.trim().toLowerCase();
  const user = email && (await User.findOne({ email, role }));
  if (!user) throw new Error(`${envName} account not found. Run "npm run seed" first.`);
  return user;
}

async function createStudentAccount([firstName, lastName], section, index) {
  const user = await User.create({
    firstName,
    lastName,
    email: `${slug(firstName)}.${slug(lastName)}@student.edu.ph`,
    password: randomPassword(),
    role: 'student',
  });
  return Student.create({
    userId: user._id,
    studentId: `2026-${String(1300 + index).padStart(6, '0')}`,
    program: PROGRAM,
    yearLevel: '3rd Year',
    section,
  });
}

async function seedDemo() {
  if (await Subject.exists({ code: 'IT301' })) {
    console.log('Demo data is already loaded (subject IT301 exists). Nothing to do.');
    return;
  }

  const demoTeacher = await requireUser('SEED_TEACHER_EMAIL', 'teacher');
  const juanUser = await requireUser('SEED_STUDENT_EMAIL', 'student');

  const juan =
    (await Student.findOne({ userId: juanUser._id })) ??
    (await Student.create({ userId: juanUser._id, studentId: '2026-001234', program: PROGRAM, yearLevel: '3rd Year', section: 'BSIT-3A' }));

  console.log('Creating faculty…');
  const faculty = [];
  for (const [firstName, lastName] of FACULTY) {
    const email = `${slug(firstName)}.${slug(lastName)}@faculty.edu.ph`;
    faculty.push(
      (await User.findOne({ email })) ??
        (await User.create({ firstName, lastName, email, password: randomPassword(), role: 'teacher' })),
    );
  }

  console.log('Creating classmates…');
  const classmates = {};
  let index = 0;
  for (const [section, names] of Object.entries(CLASSMATES)) {
    classmates[section] = [];
    for (const name of names) classmates[section].push(await createStudentAccount(name, section, (index += 1)));
  }

  console.log('Creating subjects…');
  const subjects = {};
  for (const [code, name, units] of [...HISTORY.flatMap((term) => term.subjects), ...CURRENT.subjects.map(([c, n]) => [c, n, 3])]) {
    subjects[code] = await Subject.create({ code, name, units, grading: DEFAULT_GRADING });
  }

  const scores = [];

  console.log('Creating past semesters…');
  for (const term of HISTORY) {
    const dates = periodDates(term.academicYear, term.semester);
    for (const [i, [code, , , grades]] of term.subjects.entries()) {
      const classroom = await Classroom.create({
        subjectId: subjects[code]._id,
        teacherId: faculty[i % faculty.length]._id,
        section: term.section,
        academicYear: term.academicYear,
        semester: term.semester,
        studentIds: [juan._id],
      });
      ['prelim', 'midterm', 'final'].forEach((period, p) =>
        periodScores(grades[p], { period, date: dates[period], prefix: period[0].toUpperCase() + period.slice(1) }).forEach(
          (score) => scores.push({ ...score, classroomId: classroom._id, studentId: juan._id, teacherId: classroom.teacherId }),
        ),
      );
    }
  }

  console.log('Creating the current semester…');
  const section3A = [juan, ...classmates['BSIT-3A']];
  for (const [code, , room, teacherIndex, juanPrelim, postedDaysAgo] of CURRENT.subjects) {
    const teacher = teacherIndex === 'demo' ? demoTeacher : faculty[teacherIndex];
    const sections = [['BSIT-3A', section3A]];
    if (code === 'IT302') sections.push(['BSIT-3B', classmates['BSIT-3B']]); // the demo teacher's second class

    for (const [section, students] of sections) {
      const classroom = await Classroom.create({
        subjectId: subjects[code]._id,
        teacherId: teacher._id,
        section,
        academicYear: CURRENT.academicYear,
        semester: CURRENT.semester,
        room,
        studentIds: students.map((s) => s._id),
      });

      for (const student of students) {
        const target = student._id.equals(juan._id) ? juanPrelim : clamp(76 + random() * 20, 70, 99);
        periodScores(target, { period: 'prelim', date: daysAgo(postedDaysAgo), prefix: 'Prelim' }).forEach((score) =>
          scores.push({ ...score, classroomId: classroom._id, studentId: student._id, teacherId: teacher._id }),
        );
      }
    }
  }

  await Score.insertMany(scores);
  console.log(`Done: ${Object.keys(subjects).length} subjects, ${faculty.length} faculty, ${index} classmates, ${scores.length} scores.`);
}

async function main() {
  assertRequiredEnv();
  await connectDatabase(env.mongodbUri);
  await Promise.all([User.init(), Student.init(), Subject.init(), Classroom.init()]);
  try {
    await seedDemo();
  } finally {
    await disconnectDatabase();
  }
}

main().catch((err) => {
  console.error(`Demo seeding failed: ${err.message}`);
  process.exit(1);
});
