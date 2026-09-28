import { User } from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';

/** Roles that have a portal to sign in to. Students are records only for now. */
const PORTAL_ROLES = ['admin', 'teacher'];

const INVALID_CREDENTIALS = 'Invalid email or password';

// Comparing against a real hash when the email is unknown keeps response times
// similar, so attackers cannot use timing to discover which emails exist.
let dummyHashPromise;
const getDummyHash = () => (dummyHashPromise ??= hashPassword('timing-equalizer-password'));

export function toAuthUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

export async function login({ email, password }, { ipAddress } = {}) {
  const user = await User.findOne({ email }).select('+password');
  const passwordMatches = await comparePassword(password, user?.password ?? (await getDummyHash()));

  if (!user || !passwordMatches) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }
  if (user.status !== 'active') {
    throw new AppError(403, 'Your account is not active. Please contact an administrator.');
  }
  if (!PORTAL_ROLES.includes(user.role)) {
    throw new AppError(403, 'Student accounts do not have portal access yet.');
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  await logActivity({
    actorId: user._id,
    action: 'auth.login',
    entityType: 'User',
    entityId: user._id,
    description: `${user.fullName} signed in`,
    ipAddress,
  });

  return { user: toAuthUser(user), token: signToken(user) };
}

export async function register(data, { actor, ipAddress } = {}) {
  if (await User.exists({ email: data.email })) {
    throw new AppError(409, 'Unable to create user', { error: 'Email already exists' });
  }

  const user = await User.create(data);
  await logActivity({
    actorId: actor?._id,
    action: 'user.created',
    entityType: 'User',
    entityId: user._id,
    description: `Created ${user.role} account for ${user.fullName}`,
    ipAddress,
  });

  return toAuthUser(user);
}

export async function logout(user, { ipAddress } = {}) {
  await logActivity({
    actorId: user._id,
    action: 'auth.logout',
    entityType: 'User',
    entityId: user._id,
    description: `${user.fullName} signed out`,
    ipAddress,
  });
}
