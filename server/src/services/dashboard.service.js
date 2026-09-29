import { ActivityLog } from '../models/ActivityLog.js';
import { Classroom } from '../models/Classroom.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { paginate, searchFilter } from '../utils/listQuery.js';

const WITH_ACTOR = { path: 'actorId', select: 'firstName lastName role' };

const formatLog = (log) => ({
  id: log.id,
  action: log.action,
  entityType: log.entityType,
  description: log.description,
  createdAt: log.createdAt,
  actor: log.actorId?._id
    ? { id: log.actorId.id, name: `${log.actorId.firstName} ${log.actorId.lastName}`, role: log.actorId.role }
    : null,
});

export async function getAdminDashboard() {
  const [users, teachers, students, activeUsers, classrooms, subjects, recent] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ status: 'active' }),
    Classroom.countDocuments({ status: 'active' }),
    Subject.countDocuments({ status: 'active' }),
    ActivityLog.find().sort('-createdAt').limit(8).populate(WITH_ACTOR),
  ]);

  return {
    counts: { users, teachers, students, activeUsers, inactiveUsers: users - activeUsers, classrooms, subjects },
    recentActivity: recent.map(formatLog),
  };
}

export async function listActivityLogs({ page, limit, search }) {
  const result = await paginate(ActivityLog, searchFilter(search, ['action', 'description']), {
    page,
    limit,
    sort: '-createdAt',
    populate: WITH_ACTOR,
  });
  return { items: result.items.map(formatLog), pagination: result.pagination };
}
