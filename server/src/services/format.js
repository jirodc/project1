/** API shapes for records whose references are populated. */

export const USER_SUMMARY_FIELDS = 'firstName lastName email status';

const personSummary = (user) =>
  user?._id ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null;

/** Student record flattened with its account's name and email. */
export function formatStudent(student) {
  const user = student.userId;
  return {
    id: student.id,
    userId: user?._id ? user.id : String(user),
    studentId: student.studentId,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    program: student.program,
    yearLevel: student.yearLevel,
    section: student.section,
    status: student.status,
    createdAt: student.createdAt,
  };
}

export function formatClassroom(classroom) {
  const subject = classroom.subjectId;
  return {
    id: classroom.id,
    subject: subject?._id ? { id: subject.id, code: subject.code, name: subject.name, units: subject.units } : null,
    teacher: personSummary(classroom.teacherId),
    section: classroom.section,
    academicYear: classroom.academicYear,
    semester: classroom.semester,
    room: classroom.room,
    status: classroom.status,
    studentIds: classroom.studentIds.map((student) => String(student._id ?? student)),
    studentCount: classroom.studentIds.length,
    createdAt: classroom.createdAt,
  };
}
