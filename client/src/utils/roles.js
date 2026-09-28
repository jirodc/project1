export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
};

export const ROLE_LABELS = {
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
};

export const homePathFor = (role) => (role === ROLES.ADMIN ? '/admin' : '/teacher');
