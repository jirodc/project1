import { z } from 'zod';
import { GRADING_PERIODS, SCORE_CATEGORIES } from '../models/Subject.js';
import { objectId } from './common.js';

const scoreFields = {
  period: z.enum(GRADING_PERIODS),
  category: z.enum(SCORE_CATEGORIES),
  title: z.string().trim().min(1, 'Title is required').max(80),
  score: z.coerce.number().min(0, 'Score cannot be negative'),
  maximumScore: z.coerce.number().positive('Maximum score must be more than 0').max(1000),
  date: z.coerce.date({ error: 'Enter a valid date' }),
  remarks: z.string().trim().max(300).default(''),
};

const withinMaximum = [
  (data) => data.score <= data.maximumScore,
  { message: 'Score cannot be higher than the maximum score', path: ['score'] },
];

export const createScoreSchema = z
  .object({ classroomId: objectId('classroom'), studentId: objectId('student'), ...scoreFields })
  .refine(...withinMaximum);

// The student and class of a score never change; delete and re-add instead.
export const updateScoreSchema = z.object(scoreFields).refine(...withinMaximum);

export const listScoresQuerySchema = z.object({
  classroomId: objectId('classroom'),
  studentId: objectId('student').optional(),
  period: z.enum(GRADING_PERIODS).optional(),
});
