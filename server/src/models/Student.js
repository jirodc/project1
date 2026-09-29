import mongoose from 'mongoose';
import { jsonOptions } from '../utils/toJSON.js';

export const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

/**
 * Academic record for a student. Every student signs in, so each record is
 * linked to exactly one `User` with the `student` role (name and email live there).
 */
const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    program: { type: String, required: true, trim: true, maxlength: 120 },
    yearLevel: { type: String, enum: YEAR_LEVELS, required: true },
    section: { type: String, required: true, trim: true, maxlength: 30 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true, toJSON: jsonOptions },
);

studentSchema.index({ section: 1, yearLevel: 1 });

export const Student = mongoose.model('Student', studentSchema);
