import { Classroom } from '../models/Classroom.js';
import { Student } from '../models/Student.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { AppError } from '../utils/AppError.js';
import { containsPattern, paginate, searchFilter } from '../utils/listQuery.js';
import { loadClassroomFor } from './access.service.js';
import { formatClassroom, formatStudent, USER_SUMMARY_FIELDS } from './format.js';

const POPULATE = [
  { path: 'subjectId', select: 'code name units' },
  { path: 'teacherId', select: USER_SUMMARY_FIELDS },
];

const label = (classroom, subject) => `${subject?.code ?? 'class'} · ${classroom.section} (${classroom.semester}, ${classroom.academicYear})`;

export async function listClassrooms({ page, limit, search, academicYear, semester, status, teacherId, subjectId, sort }, actor) {
  const filter = {
    ...(academicYear && { academicYear }),
    ...(semester && { semester }),
    ...(status && { status }),
    ...(subjectId && { subjectId }),
    // Teachers are always limited to their own classes.
    ...(actor.role === 'teacher' ? { teacherId: actor._id } : teacherId && { teacherId }),
  };

  if (search) {
    const subjectIds = await Subject.find(searchFilter(search, ['code', 'name'])).distinct('_id');
    const pattern = containsPattern(search);
    filter.$or = [{ section: pattern }, { room: pattern }, { subjectId: { $in: subjectIds } }];
  }

  const result = await paginate(Classroom, filter, {
    page,
    limit,
    sort: `${sort} ${sort.includes('academicYear') ? '-semester section' : ''}`.trim(),
    populate: POPULATE,
  });
  return { items: result.items.map(formatClassroom), pagination: result.pagination };
}

export async function getClassroom(id, actor) {
  const classroom = await loadClassroomFor(id, actor);
  await classroom.populate([
    ...POPULATE,
    { path: 'studentIds', populate: { path: 'userId', select: USER_SUMMARY_FIELDS } },
  ]);

  const students = classroom.studentIds
    .map(formatStudent)
    .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));
  return { ...formatClassroom(classroom), students };
}

async function assertStudentsExist(studentIds) {
  const unique = [...new Set(studentIds)];
  const found = await Student.countDocuments({ _id: { $in: unique }, status: 'active' });
  if (found !== unique.length) throw new AppError(400, 'One or more students were not found or are inactive');
  return unique;
}

async function assertReferences({ subjectId, teacherId, studentIds }) {
  const [subject, teacher] = await Promise.all([
    Subject.findOne({ _id: subjectId, status: 'active' }),
    User.findOne({ _id: teacherId, role: 'teacher', status: 'active' }),
  ]);
  if (!subject) throw new AppError(400, 'Choose an active subject');
  if (!teacher) throw new AppError(400, 'Choose an active teacher');
  return { subject, studentIds: await assertStudentsExist(studentIds) };
}

async function assertNotDuplicate({ subjectId, section, academicYear, semester }, subject, exceptId) {
  const duplicate = await Classroom.exists({
    subjectId,
    section,
    academicYear,
    semester,
    ...(exceptId && { _id: { $ne: exceptId } }),
  });
  if (duplicate) {
    throw new AppError(409, 'Unable to save class', {
      error: `${subject.code} already has a class for section ${section} in the ${semester}, ${academicYear}`,
    });
  }
}

const log = (action, classroom, { actor, ipAddress }, description) =>
  logActivity({ actorId: actor._id, action, entityType: 'Classroom', entityId: classroom._id, description, ipAddress });

export async function createClassroom(data, context) {
  const { subject, studentIds } = await assertReferences(data);
  await assertNotDuplicate(data, subject);

  const classroom = await Classroom.create({ ...data, studentIds });
  await log('classroom.created', classroom, context, `Created class ${label(classroom, subject)}`);
  return formatClassroom(await classroom.populate(POPULATE));
}

export async function updateClassroom(id, data, context) {
  const classroom = await Classroom.findById(id);
  if (!classroom) throw new AppError(404, 'Classroom not found');

  const { subject, studentIds } = await assertReferences(data);
  await assertNotDuplicate(data, subject, classroom._id);

  classroom.set({ ...data, studentIds });
  await classroom.save();
  await log('classroom.updated', classroom, context, `Updated class ${label(classroom, subject)}`);
  return formatClassroom(await classroom.populate(POPULATE));
}

/** Admins and the class's own teacher can change who is enrolled. */
export async function setClassroomStudents(id, studentIds, context) {
  const classroom = await loadClassroomFor(id, context.actor);
  classroom.studentIds = await assertStudentsExist(studentIds);
  await classroom.save();

  await classroom.populate(POPULATE);
  await log(
    'classroom.students_updated',
    classroom,
    context,
    `Updated the student list of ${label(classroom, classroom.subjectId)} (${classroom.studentIds.length} students)`,
  );
  return getClassroom(id, context.actor);
}

export async function deactivateClassroom(id, context) {
  const classroom = await Classroom.findById(id).populate(POPULATE);
  if (!classroom) throw new AppError(404, 'Classroom not found');
  classroom.status = 'inactive';
  await classroom.save();
  await log('classroom.deactivated', classroom, context, `Deactivated class ${label(classroom, classroom.subjectId)}`);
  return formatClassroom(classroom);
}
