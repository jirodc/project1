import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { AppError } from '../utils/AppError.js';
import { paginate, searchFilter } from '../utils/listQuery.js';

export async function listUsers({ page, limit, search, role, status, sort }) {
  const filter = {
    ...searchFilter(search, ['firstName', 'lastName', 'email']),
    ...(role && { role }),
    ...(status && { status }),
  };
  return paginate(User, filter, { page, limit, sort });
}

export async function getUser(id) {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

async function assertEmailAvailable(email, exceptId) {
  if (await User.exists({ email, ...(exceptId && { _id: { $ne: exceptId } }) })) {
    throw new AppError(409, 'Unable to save user', { error: 'Email already exists' });
  }
}

export async function createUser(data, { actor, ipAddress }) {
  await assertEmailAvailable(data.email);
  const user = await User.create(data);
  await logActivity({
    actorId: actor._id,
    action: 'user.created',
    entityType: 'User',
    entityId: user._id,
    description: `Created ${user.role} account for ${user.fullName}`,
    ipAddress,
  });
  return user;
}

/** Guards that keep the system administrable: no self-lockout, always one active admin. */
async function assertAdminChangeAllowed(user, changes, actor) {
  const losesAdmin =
    user.role === 'admin' &&
    user.status === 'active' &&
    ((changes.role && changes.role !== 'admin') || (changes.status && changes.status !== 'active'));
  if (!losesAdmin) return;

  if (user._id.equals(actor._id)) {
    throw new AppError(400, "You can't deactivate or demote your own account");
  }
  if ((await User.countDocuments({ role: 'admin', status: 'active' })) <= 1) {
    throw new AppError(400, 'At least one active administrator is required');
  }
}

export async function updateUser(id, changes, { actor, ipAddress }) {
  const user = await getUser(id);

  if (changes.role && changes.role !== user.role && (user.role === 'student' || changes.role === 'student')) {
    throw new AppError(400, 'Student accounts are managed from the Students page');
  }
  if (changes.email && changes.email !== user.email) await assertEmailAvailable(changes.email, user._id);
  await assertAdminChangeAllowed(user, changes, actor);

  const wasActive = user.status === 'active';
  Object.assign(user, changes);
  await user.save();

  // Keep a student's academic record in step with their account.
  if (user.role === 'student' && changes.status) {
    await Student.updateOne({ userId: user._id }, { status: user.status === 'active' ? 'active' : 'inactive' });
  }

  const action = wasActive && user.status !== 'active' ? 'user.deactivated' : 'user.updated';
  await logActivity({
    actorId: actor._id,
    action,
    entityType: 'User',
    entityId: user._id,
    description: `${action === 'user.deactivated' ? 'Deactivated' : 'Updated'} ${user.role} account for ${user.fullName}`,
    ipAddress,
  });
  return user;
}

/** Soft delete: accounts are deactivated, never removed, so history stays intact. */
export const deactivateUser = (id, context) => updateUser(id, { status: 'inactive' }, context);

export async function resetPassword(id, newPassword, { actor, ipAddress }) {
  const user = await User.findById(id).select('+password');
  if (!user) throw new AppError(404, 'User not found');

  user.password = newPassword;
  await user.save();
  await logActivity({
    actorId: actor._id,
    action: 'user.password_reset',
    entityType: 'User',
    entityId: user._id,
    description: `Reset the password of ${user.fullName}`,
    ipAddress,
  });
}
