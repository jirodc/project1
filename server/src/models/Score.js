import mongoose from 'mongoose';
import { jsonOptions } from '../utils/toJSON.js';
import { GRADING_PERIODS, SCORE_CATEGORIES } from './Subject.js';

const scoreSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, enum: GRADING_PERIODS, required: true },
    category: { type: String, enum: SCORE_CATEGORIES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    score: { type: Number, required: true, min: 0 },
    maximumScore: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    remarks: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true, toJSON: jsonOptions },
);

scoreSchema.index({ classroomId: 1, studentId: 1 });
scoreSchema.index({ studentId: 1 });

export const Score = mongoose.model('Score', scoreSchema);
