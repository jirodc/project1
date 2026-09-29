import mongoose from 'mongoose';
import { jsonOptions } from '../utils/toJSON.js';

export const SCORE_CATEGORIES = ['quiz', 'assignment', 'project', 'examination', 'participation', 'other'];
export const GRADING_PERIODS = ['prelim', 'midterm', 'final'];

/** Used when a subject is created without its own weights. Each group adds up to 100. */
export const DEFAULT_GRADING = {
  categories: { quiz: 20, assignment: 20, project: 30, examination: 30, participation: 0, other: 0 },
  periods: { prelim: 30, midterm: 30, final: 40 },
};

const weights = (keys, defaults) =>
  new mongoose.Schema(
    Object.fromEntries(keys.map((key) => [key, { type: Number, min: 0, max: 100, default: defaults[key] }])),
    { _id: false },
  );

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 20 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    units: { type: Number, required: true, min: 0, max: 10 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    // How category scores and grading periods combine into a final rating.
    grading: {
      categories: { type: weights(SCORE_CATEGORIES, DEFAULT_GRADING.categories), default: () => ({}) },
      periods: { type: weights(GRADING_PERIODS, DEFAULT_GRADING.periods), default: () => ({}) },
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true, toJSON: jsonOptions },
);

subjectSchema.index({ status: 1, code: 1 });

export const Subject = mongoose.model('Subject', subjectSchema);
