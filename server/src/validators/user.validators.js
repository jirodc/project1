import { z } from 'zod';
import { USER_ROLES, USER_STATUSES } from '../models/User.js';
import { email, pagination, passwordSchema, personName } from './common.js';

// Student accounts are created from the Students page, together with their student record.
const STAFF_ROLES = ['admin', 'teacher'];

const userFields = {
  firstName: personName('First name'),
  lastName: personName('Last name'),
  email,
  status: z.enum(USER_STATUSES).default('active'),
};

export const createUserSchema = z.object({
  ...userFields,
  role: z.enum(STAFF_ROLES),
  password: passwordSchema,
});

export const updateUserSchema = z.object({
  ...userFields,
  role: z.enum(USER_ROLES),
});

export const listUsersQuerySchema = z.object({
  ...pagination,
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  sort: z.enum(['lastName', '-lastName', 'email', '-createdAt', 'createdAt', '-lastLoginAt']).default('lastName'),
});

export const resetPasswordSchema = z.object({ newPassword: passwordSchema });
