import { z } from 'zod';
import { YEAR_LEVELS } from '../models/Student.js';
import { ACTIVE_STATUSES, email, objectId, pagination, passwordSchema, personName } from './common.js';

const studentFields = {
  firstName: personName('First name'),
  lastName: personName('Last name'),
  email,
  studentId: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{6}$/, 'Use the format 2026-001234'),
  program: z.string().trim().min(2, 'Program is required').max(120),
  yearLevel: z.enum(YEAR_LEVELS),
  section: z.string().trim().min(1, 'Section is required').max(30),
  status: z.enum(ACTIVE_STATUSES).default('active'),
};

// Every student signs in, so creating a student also creates their account.
export const createStudentSchema = z.object({ ...studentFields, password: passwordSchema });
export const updateStudentSchema = z.object(studentFields);

export const listStudentsQuerySchema = z.object({
  ...pagination,
  yearLevel: z.enum(YEAR_LEVELS).optional(),
  section: z.string().trim().max(30).optional(),
  status: z.enum(ACTIVE_STATUSES).optional(),
  classroomId: objectId('classroom').optional(),
  sort: z.enum(['studentId', '-studentId', 'section', '-createdAt']).default('studentId'),
});

export const lookupStudentsQuerySchema = z.object({
  search: z.string().trim().min(2, 'Type at least 2 characters').max(100),
});
