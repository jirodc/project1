import { daysFromToday } from './calendar.js';

/** Documents the Registrar can issue. `fee` is per copy. */
export const documentCatalog = [
  {
    type: 'Certificate of Enrollment',
    description: 'Certifies that you are officially enrolled this semester.',
    fee: 50,
    processingDays: 2,
  },
  {
    type: 'Certificate of Grades',
    description: 'Official copy of your grades for a specific semester.',
    fee: 50,
    processingDays: 2,
  },
  {
    type: 'Transcript of Records',
    description: 'Complete academic record. Usually required for transfers and employment.',
    fee: 150,
    processingDays: 7,
  },
  {
    type: 'Good Moral Certificate',
    description: 'Certifies good conduct while enrolled at the university.',
    fee: 100,
    processingDays: 3,
  },
  {
    type: 'Student ID Replacement',
    description: 'Replacement for a lost or damaged student ID. Requires an affidavit of loss.',
    fee: 250,
    processingDays: 5,
  },
  {
    type: 'Honorable Dismissal',
    description: 'Required when transferring to another school.',
    fee: 200,
    processingDays: 7,
  },
];

export const documentPurposes = [
  'Scholarship application',
  'Employment',
  'Internship / OJT requirement',
  'Transfer to another school',
  'Personal copy',
  'Other',
];

export const DOCUMENT_STATUSES = ['Pending', 'Processing', 'Ready', 'Rejected'];

export const initialDocumentRequests = [
  {
    id: 'req-1005',
    type: 'Good Moral Certificate',
    purpose: 'Scholarship application',
    copies: 1,
    requestedAt: daysFromToday(-1).toISOString(),
    processingDate: daysFromToday(2).toISOString(),
    status: 'Pending',
    remarks: 'Waiting for payment verification.',
  },
  {
    id: 'req-1004',
    type: 'Transcript of Records',
    purpose: 'Internship / OJT requirement',
    copies: 2,
    requestedAt: daysFromToday(-3).toISOString(),
    processingDate: daysFromToday(4).toISOString(),
    status: 'Processing',
    remarks: 'Being reviewed by the Registrar.',
  },
  {
    id: 'req-1003',
    type: 'Certificate of Enrollment',
    purpose: 'Scholarship application',
    copies: 1,
    requestedAt: daysFromToday(-20).toISOString(),
    processingDate: daysFromToday(-18).toISOString(),
    status: 'Ready',
    remarks: 'Digitally signed copy available for download.',
  },
  {
    id: 'req-1002',
    type: 'Certificate of Grades',
    purpose: 'Scholarship application',
    copies: 1,
    requestedAt: daysFromToday(-34).toISOString(),
    processingDate: daysFromToday(-32).toISOString(),
    status: 'Ready',
    remarks: 'Digitally signed copy available for download.',
  },
  {
    id: 'req-1001',
    type: 'Student ID Replacement',
    purpose: 'Personal copy',
    copies: 1,
    requestedAt: daysFromToday(-60).toISOString(),
    processingDate: daysFromToday(-58).toISOString(),
    status: 'Rejected',
    remarks: 'Affidavit of loss was not attached. Please submit a new request with the affidavit.',
  },
];
