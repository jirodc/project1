import { Classroom, SEMESTERS } from '../models/Classroom.js';
import { Score } from '../models/Score.js';
import { DEFAULT_GRADING } from '../models/Subject.js';
import { loadClassroomFor } from './access.service.js';
import { formatClassroom, formatStudent, USER_SUMMARY_FIELDS } from './format.js';
import { computeGrade, GRADING_SCALE, weightedAverage } from './grading.service.js';
import { getOwnStudentRecord } from './student.service.js';

const scoresOf = (scores, studentId) => scores.filter((score) => score.studentId.equals(studentId));
/** Date of the most recent assessment, e.g. to show "latest grades" first. */
const lastScoredAt = (scores) =>
  scores.reduce((latest, score) => (!latest || score.date > latest ? score.date : latest), null);

/** Every enrolled student's computed grades for one class. */
export async function getClassroomGradebook(classroomId, actor) {
  const classroom = await loadClassroomFor(classroomId, actor);
  await classroom.populate([
    { path: 'subjectId' },
    { path: 'teacherId', select: USER_SUMMARY_FIELDS },
    { path: 'studentIds', populate: { path: 'userId', select: USER_SUMMARY_FIELDS } },
  ]);

  const grading = classroom.subjectId.toJSON().grading;
  const scores = await Score.find({ classroomId });

  const rows = classroom.studentIds
    .map((student) => {
      const own = scoresOf(scores, student._id);
      return { student: formatStudent(student), ...computeGrade(own, grading), scoreCount: own.length };
    })
    .sort((a, b) => `${a.student.lastName} ${a.student.firstName}`.localeCompare(`${b.student.lastName} ${b.student.firstName}`));

  return { classroom: formatClassroom(classroom), grading, rows, scale: GRADING_SCALE };
}

const termOrder = (term) => Number(term.academicYear.slice(0, 4)) * 10 + SEMESTERS.indexOf(term.semester);

/**
 * The signed-in student's grades grouped by semester, oldest first, plus
 * cumulative GWA over completed semesters.
 */
export async function getStudentGradeReport(userId) {
  const student = await getOwnStudentRecord(userId);
  const classrooms = await Classroom.find({ studentIds: student._id, status: 'active' })
    .populate('subjectId')
    .populate('teacherId', 'firstName lastName');
  const scores = await Score.find({ studentId: student._id, classroomId: { $in: classrooms.map((c) => c._id) } });

  const byTerm = new Map();
  for (const classroom of classrooms) {
    const subject = classroom.subjectId;
    const own = scores.filter((score) => score.classroomId.equals(classroom._id));
    const key = `${classroom.academicYear}|${classroom.semester}`;
    if (!byTerm.has(key)) byTerm.set(key, { academicYear: classroom.academicYear, semester: classroom.semester, rows: [] });

    byTerm.get(key).rows.push({
      classroomId: classroom.id,
      code: subject.code,
      name: subject.name,
      units: subject.units,
      instructor: classroom.teacherId ? `${classroom.teacherId.firstName} ${classroom.teacherId.lastName}` : null,
      ...computeGrade(own, subject.toJSON().grading),
      lastScoredAt: lastScoredAt(own),
    });
  }

  const terms = [...byTerm.values()]
    .sort((a, b) => termOrder(a) - termOrder(b))
    .map((term) => {
      const complete = term.rows.every((row) => row.rating != null);
      return {
        id: `${term.academicYear}-${SEMESTERS.indexOf(term.semester) + 1}`,
        academicYear: term.academicYear,
        semester: term.semester,
        rows: term.rows.sort((a, b) => a.code.localeCompare(b.code)),
        complete,
        units: term.rows.reduce((total, row) => total + row.units, 0),
        gwa: complete ? weightedAverage(term.rows) : null,
      };
    });

  const completed = terms.filter((term) => term.complete);
  const completedRows = completed.flatMap((term) => term.rows);
  const passedRows = completedRows.filter((row) => row.remarks === 'Passed');

  return {
    student: formatStudent(student),
    terms,
    currentTermId: terms.at(-1)?.id ?? null,
    scale: GRADING_SCALE,
    defaultPeriodWeights: DEFAULT_GRADING.periods,
    summary: {
      currentGpa: weightedAverage(completedRows),
      previousGpa: completed.at(-1)?.gwa ?? null,
      previousTerm: completed.at(-1) ? { academicYear: completed.at(-1).academicYear, semester: completed.at(-1).semester } : null,
      totalUnits: passedRows.reduce((total, row) => total + row.units, 0),
      passed: passedRows.length,
      failed: completedRows.length - passedRows.length,
    },
  };
}
