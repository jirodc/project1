import { Classroom } from '../models/Classroom.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { AppError } from '../utils/AppError.js';
import { containsPattern, paginate, searchFilter } from '../utils/listQuery.js';
import { loadClassroomFor, visibleStudentIds } from './access.service.js';
import { formatClassroom, formatStudent, USER_SUMMARY_FIELDS } from './format.js';

const WITH_USER = { path: 'userId', select: USER_SUMMARY_FIELDS };

/** Matches student ID, section, or the linked account's name/email. */
async function studentSearchFilter(search) {
  if (!search) return {};
  const userIds = await User.find({
    role: 'student',
    ...searchFilter(search, ['firstName', 'lastName', 'email']),
  }).distinct('_id');
  const pattern = containsPattern(search);
  return { $or: [{ studentId: pattern }, { section: pattern }, { userId: { $in: userIds } }] };
}

export async function listStudents({ page, limit, search, yearLevel, section, status, classroomId, sort }, actor) {
  const filter = {
    ...(await studentSearchFilter(search)),
    ...(yearLevel && { yearLevel }),
    ...(section && { section }),
    ...(status && { status }),
  };

  // Teachers only ever see students in their own classes.
  const allowed = classroomId ? (await loadClassroomFor(classroomId, actor)).studentIds : await visibleStudentIds(actor);
  if (allowed) filter._id = { $in: allowed };

  const result = await paginate(Student, filter, { page, limit, sort, populate: WITH_USER });
  return { items: result.items.map(formatStudent), pagination: result.pagination };
}

/** Small search used when adding students to a class. */
export async function lookupStudents(search) {
  const students = await Student.find({ status: 'active', ...(await studentSearchFilter(search)) })
    .sort('studentId')
    .limit(10)
    .populate(WITH_USER);
  return students.map(formatStudent);
}

async function findStudent(id) {
  const student = await Student.findById(id).populate(WITH_USER);
  if (!student) throw new AppError(404, 'Student not found');
  return student;
}

export async function getStudent(id, actor) {
  const allowed = await visibleStudentIds(actor);
  if (allowed && !allowed.some((studentId) => studentId.equals(id))) throw new AppError(404, 'Student not found');

  const student = await findStudent(id);
  const classrooms = await Classroom.find({ studentIds: student._id })
    .sort('-academicYear -semester')
    .populate('subjectId', 'code name units')
    .populate('teacherId', USER_SUMMARY_FIELDS);
  return { ...formatStudent(student), classrooms: classrooms.map(formatClassroom) };
}

export async function getOwnStudentRecord(userId) {
  const student = await Student.findOne({ userId }).populate(WITH_USER);
  if (!student) throw new AppError(404, 'No student record is linked to your account. Please contact the Registrar.');
  return student;
}

async function assertUnique({ email, studentId }, { userId, id } = {}) {
  if (await User.exists({ email, ...(userId && { _id: { $ne: userId } }) })) {
    throw new AppError(409, 'Unable to save student', { error: 'Email already exists' });
  }
  if (await Student.exists({ studentId, ...(id && { _id: { $ne: id } }) })) {
    throw new AppError(409, 'Unable to save student', { error: `Student ID ${studentId} already exists` });
  }
}

const log = (action, student, { actor, ipAddress }, description) =>
  logActivity({ actorId: actor._id, action, entityType: 'Student', entityId: student._id, description, ipAddress });

export async function createStudent(data, context) {
  const { firstName, lastName, email, password, status, ...record } = data;
  await assertUnique({ email, studentId: record.studentId });

  const user = await User.create({ firstName, lastName, email, password, role: 'student', status });
  let student;
  try {
    student = await Student.create({ ...record, status, userId: user._id });
  } catch (err) {
    await User.deleteOne({ _id: user._id }); // don't leave an account without a record
    throw err;
  }

  await log('student.created', student, context, `Created student ${record.studentId} (${firstName} ${lastName})`);
  return formatStudent(await student.populate(WITH_USER));
}

export async function updateStudent(id, data, context) {
  const student = await Student.findById(id);
  if (!student) throw new AppError(404, 'Student not found');

  const { firstName, lastName, email, status, ...record } = data;
  await assertUnique({ email, studentId: record.studentId }, { userId: student.userId, id: student._id });

  await User.updateOne({ _id: student.userId }, { firstName, lastName, email, status });
  student.set({ ...record, status });
  await student.save();

  await log('student.updated', student, context, `Updated student ${record.studentId} (${firstName} ${lastName})`);
  return formatStudent(await student.populate(WITH_USER));
}

/** Soft delete: the record and account are deactivated; grades and history remain. */
export async function deactivateStudent(id, context) {
  const student = await findStudent(id);
  student.status = 'inactive';
  await student.save();
  await User.updateOne({ _id: student.userId._id }, { status: 'inactive' });
  await log('student.deactivated', student, context, `Deactivated student ${student.studentId}`);
  return formatStudent(student);
}
