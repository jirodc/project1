import { z } from 'zod';
import { SEMESTERS } from '../models/Classroom.js';
import { ACTIVE_STATUSES, objectId, pagination } from './common.js';

const academicYear = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{4}$/, 'Use the format 2026-2027')
  .refine((value) => {
    const [start, end] = value.split('-').map(Number);
    return end === start + 1;
  }, 'The second year must follow the first');

const studentIds = z.array(objectId('student')).max(200, 'A class can have at most 200 students');

export const classroomSchema = z.object({
  subjectId: objectId('subject'),
  teacherId: objectId('teacher'),
  section: z.string().trim().min(1, 'Section is required').max(30),
  academicYear,
  semester: z.enum(SEMESTERS),
  room: z.string().trim().max(40).default(''),
  studentIds: studentIds.default([]),
  status: z.enum(ACTIVE_STATUSES).default('active'),
});

export const classroomStudentsSchema = z.object({ studentIds });

export const listClassroomsQuerySchema = z.object({
  ...pagination,
  academicYear: academicYear.optional(),
  semester: z.enum(SEMESTERS).optional(),
  status: z.enum(ACTIVE_STATUSES).optional(),
  teacherId: objectId('teacher').optional(),
  subjectId: objectId('subject').optional(),
  sort: z.enum(['-academicYear', 'academicYear', 'section', '-createdAt']).default('-academicYear'),
});
