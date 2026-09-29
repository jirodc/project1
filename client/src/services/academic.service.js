import { api, unwrap } from './api.js';

/** Admin and teacher API calls for the academic modules. */

export const userService = {
  list: (params) => api.get('/users', { params }).then(unwrap),
  create: (body) => api.post('/users', body).then((res) => unwrap(res).user),
  update: (id, body) => api.put(`/users/${id}`, body).then((res) => unwrap(res).user),
  deactivate: (id) => api.delete(`/users/${id}`).then((res) => unwrap(res).user),
  resetPassword: (id, newPassword) => api.post(`/users/${id}/reset-password`, { newPassword }),
};

export const subjectService = {
  list: (params) => api.get('/subjects', { params }).then(unwrap),
  create: (body) => api.post('/subjects', body).then((res) => unwrap(res).subject),
  update: (id, body) => api.put(`/subjects/${id}`, body).then((res) => unwrap(res).subject),
  deactivate: (id) => api.delete(`/subjects/${id}`).then((res) => unwrap(res).subject),
};

export const studentService = {
  list: (params) => api.get('/students', { params }).then(unwrap),
  lookup: (search) => api.get('/students/lookup', { params: { search } }).then((res) => unwrap(res).items),
  create: (body) => api.post('/students', body).then((res) => unwrap(res).student),
  update: (id, body) => api.put(`/students/${id}`, body).then((res) => unwrap(res).student),
  deactivate: (id) => api.delete(`/students/${id}`).then((res) => unwrap(res).student),
};

export const classroomService = {
  list: (params) => api.get('/classrooms', { params }).then(unwrap),
  get: (id) => api.get(`/classrooms/${id}`).then((res) => unwrap(res).classroom),
  gradebook: (id) => api.get(`/classrooms/${id}/gradebook`).then(unwrap),
  create: (body) => api.post('/classrooms', body).then((res) => unwrap(res).classroom),
  update: (id, body) => api.put(`/classrooms/${id}`, body).then((res) => unwrap(res).classroom),
  setStudents: (id, studentIds) => api.put(`/classrooms/${id}/students`, { studentIds }).then((res) => unwrap(res).classroom),
  deactivate: (id) => api.delete(`/classrooms/${id}`).then((res) => unwrap(res).classroom),
};

export const scoreService = {
  list: (params) => api.get('/scores', { params }).then((res) => unwrap(res).items),
  create: (body) => api.post('/scores', body).then((res) => unwrap(res).score),
  update: (id, body) => api.put(`/scores/${id}`, body).then((res) => unwrap(res).score),
  remove: (id) => api.delete(`/scores/${id}`),
};

export const adminService = {
  dashboard: () => api.get('/dashboard/admin').then(unwrap),
  activityLogs: (params) => api.get('/activity-logs', { params }).then(unwrap),
};
