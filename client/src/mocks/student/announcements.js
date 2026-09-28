import { formatDate, formatLongDate } from '../../utils/format.js';
import { daysFromToday, hoursAgo } from './calendar.js';

export const ANNOUNCEMENT_CATEGORIES = ['Academic', 'Finance', 'Events', 'General'];

const midtermStart = daysFromToday(13);
const midtermEnd = daysFromToday(18);
const foundationDay = daysFromToday(24);
const finalInstallmentDue = daysFromToday(38);
const makeupClass = daysFromToday(4);
const techSummit = daysFromToday(8);

/**
 * `priority: 'high'` marks an announcement as Important. `attachment.lines`
 * is the text used to generate the downloadable PDF.
 */
export const announcements = [
  {
    id: 'ann-midterm-schedule',
    title: 'Midterm Examination Schedule',
    category: 'Academic',
    priority: 'high',
    postedBy: 'Office of the University Registrar',
    postedAt: hoursAgo(5).toISOString(),
    summary: `Midterm examinations run from ${formatDate(midtermStart)} to ${formatDate(midtermEnd)}. Room assignments are in the attached schedule.`,
    body: [
      `The midterm examinations for the 1st Semester, A.Y. 2026–2027 will be held from ${formatLongDate(midtermStart)} to ${formatLongDate(midtermEnd)}.`,
      'Examinations follow your regular class schedule unless your instructor announces otherwise. Room assignments for combined sections are listed in the attached file.',
      'Students must present their validated student ID and examination permit at the door. Permits are issued once the midterm installment is settled with the Accounting Office.',
      'Students with conflicts or approved special examinations should coordinate with their program chair no later than three days before the examination week.',
    ],
    attachment: {
      fileName: 'Midterm-Examination-Schedule-AY-2026-2027.pdf',
      size: '184 KB',
      lines: [
        'MIDTERM EXAMINATION SCHEDULE',
        '1st Semester, A.Y. 2026-2027',
        `${formatLongDate(midtermStart)} to ${formatLongDate(midtermEnd)}`,
        '',
        'College of Computer Studies - BSIT 3rd Year',
        'Examinations follow the regular class schedule.',
        'Combined-section exams: University Auditorium and Rooms 301-305.',
        '',
        'Bring your validated student ID and examination permit.',
      ],
    },
  },
  {
    id: 'ann-it302-lab5',
    title: 'IT302: Lab 5 guidelines and rubric posted',
    category: 'Academic',
    priority: 'normal',
    subjectCode: 'IT302',
    postedBy: 'Prof. Antonio Reyes',
    postedAt: hoursAgo(20).toISOString(),
    summary: 'Lab 5 (REST API with authentication) is due in two days. The rubric is attached.',
    body: [
      'Good day, class. The guidelines for Lab 5 are now available. You will build a small REST API with token-based authentication and at least two protected routes.',
      'Submit your GitHub repository link through the class portal. Late submissions receive a 10% deduction per day.',
      'We will use our Wednesday session for consultations, so bring your laptops.',
    ],
    attachment: {
      fileName: 'IT302-Lab5-Rubric.pdf',
      size: '96 KB',
      lines: [
        'IT302 - WEB SYSTEMS AND TECHNOLOGIES 2',
        'Lab 5: REST API with Authentication',
        '',
        'Functionality ............ 40 pts',
        'Security practices ....... 25 pts',
        'Code quality ............. 20 pts',
        'Documentation ............ 15 pts',
      ],
    },
  },
  {
    id: 'ann-tuition-deadline',
    title: 'Tuition Payment Deadline for Examination Permits',
    category: 'Finance',
    priority: 'high',
    postedBy: 'Accounting Office',
    postedAt: daysFromToday(-2).toISOString(),
    summary: 'Settle your midterm installment before the examination week to receive your permit.',
    body: [
      'Students are reminded to settle their midterm installment before the start of the midterm examinations. Examination permits are released only to students with no outstanding midterm balance.',
      'Payments may be made at the Cashier’s Office (Monday to Saturday, 8:00 AM – 5:00 PM), through GCash or Maya using your Student ID as reference, or through BPI and BDO online banking.',
      `The final installment is due on ${formatLongDate(finalInstallmentDue)}.`,
    ],
  },
  {
    id: 'ann-it304-makeup',
    title: 'IT304: Make-up class this week',
    category: 'Academic',
    priority: 'normal',
    subjectCode: 'IT304',
    postedBy: 'Dr. Liza Villanueva',
    postedAt: daysFromToday(-2).toISOString(),
    summary: `A make-up session will be held on ${formatDate(makeupClass)}, 3:00 PM – 4:30 PM in Room 301.`,
    body: [
      `To make up for the class suspended during the recent typhoon, we will hold a make-up session on ${formatLongDate(makeupClass)}, from 3:00 PM to 4:30 PM in Room 301.`,
      'We will cover access control models and start the group risk assessment case study. Attendance will be checked.',
    ],
  },
  {
    id: 'ann-enrollment-reminder',
    title: 'Enrollment Reminder: Pre-registration for 2nd Semester',
    category: 'Academic',
    priority: 'normal',
    postedBy: 'Office of the University Registrar',
    postedAt: daysFromToday(-3).toISOString(),
    summary: 'Pre-registration for the 2nd Semester opens after the midterm examinations. Review your curriculum checklist.',
    body: [
      'Pre-registration for the 2nd Semester, A.Y. 2026–2027 will open one week after the midterm examinations.',
      'Please review your curriculum checklist with your adviser and make sure you have no outstanding balance or library obligations, as these will block your pre-registration.',
    ],
  },
  {
    id: 'ann-tech-summit',
    title: 'CCS Tech Summit 2026: Registration now open',
    category: 'Events',
    priority: 'normal',
    postedBy: 'CCS Student Council',
    postedAt: daysFromToday(-4).toISOString(),
    summary: `Join talks on AI, cybersecurity, and cloud careers on ${formatDate(techSummit)} at the University Auditorium.`,
    body: [
      `The College of Computer Studies Student Council invites all students to the CCS Tech Summit 2026 on ${formatLongDate(techSummit)}, 9:00 AM at the University Auditorium.`,
      'Speakers from local tech companies will talk about AI, cybersecurity, and careers in cloud computing. Attendance counts as one co-curricular activity.',
      'Register using the attached form and submit it to your class president.',
    ],
    attachment: {
      fileName: 'CCS-Tech-Summit-2026-Registration.pdf',
      size: '72 KB',
      lines: [
        'CCS TECH SUMMIT 2026 - REGISTRATION FORM',
        `Date: ${formatLongDate(techSummit)}`,
        'Venue: University Auditorium',
        '',
        'Name: ______________________________',
        'Program / Section: __________________',
        'Contact number: ____________________',
      ],
    },
  },
  {
    id: 'ann-library-hours',
    title: 'Extended library hours during midterms',
    category: 'General',
    priority: 'normal',
    postedBy: 'University Library',
    postedAt: daysFromToday(-5).toISOString(),
    summary: 'The main library will stay open until 9:00 PM on weekdays during the examination period.',
    body: [
      'To support students during the midterm examinations, the main library will be open from 7:00 AM to 9:00 PM on weekdays and 8:00 AM to 5:00 PM on Saturdays.',
      'Discussion rooms can be reserved at the circulation desk for up to two hours per group.',
    ],
  },
  {
    id: 'ann-scholarship',
    title: 'Scholarship renewal: submit your grades',
    category: 'Finance',
    priority: 'normal',
    postedBy: 'Office of Student Affairs and Scholarships',
    postedAt: daysFromToday(-6).toISOString(),
    summary: 'Scholars must submit a certified copy of their grades to keep their scholarship for the next semester.',
    body: [
      'All academic and grant-in-aid scholars must submit a certified true copy of their grades from the previous semester to the Office of Student Affairs and Scholarships.',
      'You can request a Certificate of Grades from the Documents page of the student portal.',
    ],
  },
  {
    id: 'ann-foundation-day',
    title: 'University Holiday: No classes on Foundation Day',
    category: 'Events',
    priority: 'high',
    postedBy: 'Office of the President',
    postedAt: daysFromToday(-7).toISOString(),
    summary: `Classes are suspended on ${formatDate(foundationDay)} for the University Foundation Day celebration.`,
    body: [
      `In celebration of the University Foundation Day, classes at all levels are suspended on ${formatLongDate(foundationDay)}.`,
      'Students are encouraged to join the morning mass, the parade, and the afternoon program at the Main Campus grounds. Offices will remain open until 12:00 NN.',
    ],
  },
  {
    id: 'ann-it301-laptops',
    title: 'IT301: Bring laptops for the hands-on SQL lab',
    category: 'Academic',
    priority: 'normal',
    subjectCode: 'IT301',
    postedBy: 'Prof. Maria Santos',
    postedAt: daysFromToday(-6).toISOString(),
    summary: 'Install PostgreSQL 16 before our next meeting in CL-204.',
    body: [
      'For our next meeting we will do a hands-on lab on indexing and query plans. Please install PostgreSQL 16 and pgAdmin on your laptops before class.',
      'If you do not have a laptop, the CL-204 workstations are available — just let me know so I can reserve one for you.',
    ],
  },
];
