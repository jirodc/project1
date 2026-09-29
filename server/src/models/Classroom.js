import mongoose from 'mongoose';
import { jsonOptions } from '../utils/toJSON.js';

export const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];

/**
 * One subject taught to one section in one term. Membership lives only in
 * `studentIds`; a student's classes are found by querying this field.
 */
const classroomSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    section: { type: String, required: true, trim: true, maxlength: 30 },
    academicYear: { type: String, required: true, match: /^\d{4}-\d{4}$/ }, // "2026-2027"
    semester: { type: String, enum: SEMESTERS, required: true },
    room: { type: String, trim: true, maxlength: 40, default: '' },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true, toJSON: jsonOptions },
);

// One class per subject, section and term.
classroomSchema.index({ subjectId: 1, section: 1, academicYear: 1, semester: 1 }, { unique: true });
classroomSchema.index({ teacherId: 1, status: 1 });
classroomSchema.index({ studentIds: 1 });

export const Classroom = mongoose.model('Classroom', classroomSchema);
