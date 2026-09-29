import mongoose from 'mongoose';
import { z } from 'zod';

export const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'));

export const personName = (label) =>
  z.string().trim().min(1, `${label} is required`).max(50, `${label} must be at most 50 characters`);

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected.
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const objectId = (label = 'ID') =>
  z.string().refine((value) => mongoose.isValidObjectId(value), `Invalid ${label}`);

export const idParamSchema = z.object({ id: objectId() });

/** Common list-endpoint query fields: `?page&limit&search`. */
export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).default(''),
};

export const ACTIVE_STATUSES = ['active', 'inactive'];
