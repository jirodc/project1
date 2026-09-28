import { CURRENT_TERM } from './calendar.js';

export const studentProfile = {
  studentId: '2026-001234',
  firstName: 'Juan',
  middleName: 'Santos',
  lastName: 'Dela Cruz',
  email: 'juan.delacruz@student.edu.ph',
  dateOfBirth: '2005-03-14',
  gender: 'Male',
  civilStatus: 'Single',
  nationality: 'Filipino',
  contactNumber: '0917 555 0142',
  address: 'Blk 12 Lot 8, Sampaguita St., Brgy. San Isidro, Quezon City, Metro Manila 1101',
  recoveryEmail: 'juan.dc.personal@gmail.com',
  guardian: { name: 'Maria Dela Cruz', relationship: 'Mother', contactNumber: '0918 222 7314' },

  college: 'College of Computer Studies',
  program: 'Bachelor of Science in Information Technology',
  programCode: 'BSIT',
  yearLevel: '3rd Year',
  section: 'BSIT-3A',
  academicYear: CURRENT_TERM.academicYear,
  semester: CURRENT_TERM.semester,
  enrollmentStatus: 'Enrolled',
  studentType: 'Regular',
  adviser: 'Prof. Maria Santos',
};

/** Fields the student may change themselves; the rest are managed by the Registrar. */
export const EDITABLE_PROFILE_FIELDS = ['contactNumber', 'address', 'recoveryEmail'];

export const defaultNotificationPreferences = {
  email: {
    grade: true,
    attendance: true,
    announcement: true,
    payment: true,
    assignment: false,
    schedule: true,
  },
  sms: {
    grade: false,
    attendance: true,
    announcement: false,
    payment: true,
    assignment: false,
    schedule: true,
  },
};
