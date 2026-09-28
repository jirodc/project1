export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const ROLE_LABELS = {
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
};

const HOME_PATHS = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
};

export const homePathFor = (role) => HOME_PATHS[role] ?? '/login';
