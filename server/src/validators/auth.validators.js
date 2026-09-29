import { z } from 'zod';
import { USER_ROLES, USER_STATUSES } from '../models/User.js';
import { email, passwordSchema, personName } from './common.js';

export { passwordSchema };

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  });

export const registerSchema = z.object({
  firstName: personName('First name'),
  lastName: personName('Last name'),
  email,
  password: passwordSchema,
  role: z.enum(USER_ROLES).default('teacher'),
  status: z.enum(USER_STATUSES).default('active'),
});
