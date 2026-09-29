import { z } from 'zod';
import { DEFAULT_GRADING, GRADING_PERIODS, SCORE_CATEGORIES } from '../models/Subject.js';
import { ACTIVE_STATUSES, pagination } from './common.js';

const weights = (keys, label) =>
  z
    .object(Object.fromEntries(keys.map((key) => [key, z.coerce.number().min(0).max(100)])))
    .refine((value) => Math.abs(Object.values(value).reduce((a, b) => a + b, 0) - 100) < 0.001, {
      message: `${label} weights must add up to 100%`,
    });

export const subjectSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Use letters, numbers, and dashes only'),
  name: z.string().trim().min(2, 'Name is required').max(120),
  units: z.coerce.number().int().min(0).max(10),
  description: z.string().trim().max(500).default(''),
  grading: z
    .object({
      categories: weights(SCORE_CATEGORIES, 'Category'),
      periods: weights(GRADING_PERIODS, 'Grading period'),
    })
    .default(DEFAULT_GRADING),
  status: z.enum(ACTIVE_STATUSES).default('active'),
});

export const listSubjectsQuerySchema = z.object({
  ...pagination,
  status: z.enum(ACTIVE_STATUSES).optional(),
  sort: z.enum(['code', '-code', 'name', '-createdAt']).default('code'),
});
