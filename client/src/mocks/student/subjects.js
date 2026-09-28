/**
 * Categorical colors for subject identity, in a fixed order validated for
 * color-vision deficiency. Subjects are always labelled with text too, since
 * some of these hues are below 3:1 contrast on white.
 */
const SUBJECT_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];

// day: 1 = Monday … 6 = Saturday
const rawSubjects = [
  {
    code: 'IT301',
    name: 'Advanced Database Systems',
    units: 3,
    instructor: 'Prof. Maria Santos',
    instructorEmail: 'maria.santos@faculty.edu.ph',
    room: 'CL-204',
    description:
      'Query optimization, transactions and concurrency control, stored procedures, and an introduction to NoSQL data stores.',
    schedule: [
      { day: 1, start: '08:00', end: '09:30' },
      { day: 3, start: '08:00', end: '09:30' },
    ],
  },
  {
    code: 'IT302',
    name: 'Web Systems and Technologies 2',
    units: 3,
    instructor: 'Prof. Antonio Reyes',
    instructorEmail: 'antonio.reyes@faculty.edu.ph',
    room: 'CL-205',
    description: 'Server-side web development, REST APIs, authentication, and deploying full-stack web applications.',
    schedule: [
      { day: 1, start: '10:00', end: '11:30' },
      { day: 3, start: '10:00', end: '11:30' },
    ],
  },
  {
    code: 'IT303',
    name: 'Integrative Programming and Technologies',
    units: 3,
    instructor: 'Engr. Carlo Mendoza',
    instructorEmail: 'carlo.mendoza@faculty.edu.ph',
    room: 'CL-204',
    description: 'Data exchange formats, middleware, web services, and integrating heterogeneous systems.',
    schedule: [
      { day: 2, start: '08:00', end: '09:30' },
      { day: 4, start: '08:00', end: '09:30' },
    ],
  },
  {
    code: 'IT304',
    name: 'Information Assurance and Security 1',
    units: 3,
    instructor: 'Dr. Liza Villanueva',
    instructorEmail: 'liza.villanueva@faculty.edu.ph',
    room: 'Room 301',
    description: 'Security principles, risk management, cryptography fundamentals, and the Data Privacy Act of 2012.',
    schedule: [
      { day: 2, start: '10:00', end: '11:30' },
      { day: 4, start: '10:00', end: '11:30' },
    ],
  },
  {
    code: 'IT305',
    name: 'Systems Integration and Architecture 1',
    units: 3,
    instructor: 'Prof. Ramon Garcia',
    instructorEmail: 'ramon.garcia@faculty.edu.ph',
    room: 'Room 302',
    description: 'Enterprise architecture, integration patterns, and business process modeling.',
    schedule: [
      { day: 1, start: '13:00', end: '14:30' },
      { day: 3, start: '13:00', end: '14:30' },
    ],
  },
  {
    code: 'IT306',
    name: 'Quantitative Methods',
    units: 3,
    instructor: 'Prof. Grace Bautista',
    instructorEmail: 'grace.bautista@faculty.edu.ph',
    room: 'Room 305',
    description: 'Probability, statistics, linear programming, and modeling and simulation for IT decision-making.',
    schedule: [
      { day: 2, start: '13:00', end: '14:30' },
      { day: 4, start: '13:00', end: '14:30' },
    ],
  },
  {
    code: 'IT307',
    name: 'Mobile Application Development',
    units: 3,
    instructor: 'Engr. Paolo Ramos',
    instructorEmail: 'paolo.ramos@faculty.edu.ph',
    room: 'CL-301',
    description: 'Designing and building cross-platform mobile apps, from UI prototyping to publishing.',
    schedule: [{ day: 5, start: '13:00', end: '16:00' }],
  },
  {
    code: 'GE108',
    name: 'Ethics',
    units: 3,
    instructor: 'Dr. Eduardo Navarro',
    instructorEmail: 'eduardo.navarro@faculty.edu.ph',
    room: 'Room 210',
    description: 'Moral frameworks and their application to personal, professional, and societal issues.',
    schedule: [{ day: 5, start: '08:00', end: '11:00' }],
  },
];

export const subjects = rawSubjects.map((subject, index) => ({
  ...subject,
  section: 'BSIT-3A',
  color: SUBJECT_COLORS[index],
}));

export const subjectsByCode = Object.fromEntries(subjects.map((subject) => [subject.code, subject]));
