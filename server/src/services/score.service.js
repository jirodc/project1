import { Score } from '../models/Score.js';
import { logActivity } from '../utils/activityLogger.js';
import { AppError } from '../utils/AppError.js';
import { loadClassroomFor } from './access.service.js';

const isEnrolled = (classroom, studentId) => classroom.studentIds.some((id) => id.equals(studentId));

export async function listScores({ classroomId, studentId, period }, actor) {
  await loadClassroomFor(classroomId, actor);
  return Score.find({ classroomId, ...(studentId && { studentId }), ...(period && { period }) }).sort('-date -createdAt');
}

async function loadScoreFor(id, actor) {
  const score = await Score.findById(id);
  if (!score) throw new AppError(404, 'Score not found');
  const classroom = await loadClassroomFor(score.classroomId, actor);
  return { score, classroom };
}

const log = (action, score, { actor, ipAddress }, verb) =>
  logActivity({
    actorId: actor._id,
    action,
    entityType: 'Score',
    entityId: score._id,
    description: `${verb} ${score.period} ${score.category} score "${score.title}" (${score.score}/${score.maximumScore})`,
    ipAddress,
  });

export async function createScore(data, context) {
  const classroom = await loadClassroomFor(data.classroomId, context.actor);
  if (!isEnrolled(classroom, data.studentId)) throw new AppError(400, 'This student is not enrolled in the class');

  const score = await Score.create({ ...data, teacherId: classroom.teacherId });
  await log('score.created', score, context, 'Recorded');
  return score;
}

export async function updateScore(id, data, context) {
  const { score } = await loadScoreFor(id, context.actor);
  score.set(data);
  await score.save();
  await log('score.updated', score, context, 'Updated');
  return score;
}

export async function deleteScore(id, context) {
  const { score } = await loadScoreFor(id, context.actor);
  await score.deleteOne();
  await log('score.deleted', score, context, 'Deleted');
}
