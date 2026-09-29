import { Classroom } from '../models/Classroom.js';
import { AppError } from '../utils/AppError.js';

/**
 * Loads a classroom the actor may work with: admins can reach any classroom,
 * teachers only their own. Anything else is reported as "not found" so a
 * teacher can't discover other teachers' classes.
 */
export async function loadClassroomFor(id, actor) {
  const classroom = await Classroom.findById(id);
  const allowed =
    classroom && (actor.role === 'admin' || (actor.role === 'teacher' && classroom.teacherId.equals(actor._id)));
  if (!allowed) throw new AppError(404, 'Classroom not found');
  return classroom;
}

/** IDs of students the actor may see: null means "all" (admins). */
export async function visibleStudentIds(actor) {
  if (actor.role === 'admin') return null;
  if (actor.role === 'teacher') return Classroom.distinct('studentIds', { teacherId: actor._id });
  return [];
}
