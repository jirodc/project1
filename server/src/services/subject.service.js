import { Subject } from '../models/Subject.js';
import { logActivity } from '../utils/activityLogger.js';
import { AppError } from '../utils/AppError.js';
import { paginate, searchFilter } from '../utils/listQuery.js';

export async function listSubjects({ page, limit, search, status, sort }) {
  const filter = { ...searchFilter(search, ['code', 'name']), ...(status && { status }) };
  return paginate(Subject, filter, { page, limit, sort });
}

export async function getSubject(id) {
  const subject = await Subject.findById(id);
  if (!subject) throw new AppError(404, 'Subject not found');
  return subject;
}

async function assertCodeAvailable(code, exceptId) {
  if (await Subject.exists({ code, ...(exceptId && { _id: { $ne: exceptId } }) })) {
    throw new AppError(409, 'Unable to save subject', { error: `Subject code ${code} already exists` });
  }
}

const log = (action, subject, { actor, ipAddress }, verb) =>
  logActivity({
    actorId: actor._id,
    action,
    entityType: 'Subject',
    entityId: subject._id,
    description: `${verb} subject ${subject.code} — ${subject.name}`,
    ipAddress,
  });

export async function createSubject(data, context) {
  await assertCodeAvailable(data.code);
  const subject = await Subject.create(data);
  await log('subject.created', subject, context, 'Created');
  return subject;
}

/** Weight changes apply to every class of this subject, so grades recompute on the next read. */
export async function updateSubject(id, data, context) {
  const subject = await getSubject(id);
  if (data.code !== subject.code) await assertCodeAvailable(data.code, subject._id);
  subject.set(data);
  await subject.save();
  await log('subject.updated', subject, context, 'Updated');
  return subject;
}

export async function deactivateSubject(id, context) {
  const subject = await getSubject(id);
  subject.status = 'inactive';
  await subject.save();
  await log('subject.deactivated', subject, context, 'Deactivated');
  return subject;
}
