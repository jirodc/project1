import { clearDatabase, createUser, startDatabase, stopDatabase, TEST_PASSWORD } from './helpers.js';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';

const app = createApp();

async function signIn(user) {
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password: TEST_PASSWORD });
  assert.equal(res.status, 200, `test setup: ${user.email} should sign in`);
  return res.body.data.token;
}

const as = (token) => ({
  get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
  post: (url, body) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
  put: (url, body) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body),
  delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
});

let admin;
let adminApi;

before(startDatabase);
after(stopDatabase);
beforeEach(async () => {
  await clearDatabase();
  admin = await createUser({ role: 'admin' });
  adminApi = as(await signIn(admin));
});

let studentCounter = 0;
async function createStudent(overrides = {}) {
  studentCounter += 1;
  const res = await adminApi.post('/api/students', {
    firstName: 'Juan',
    lastName: `Cruz${studentCounter}`,
    email: `student${studentCounter}@student.edu.ph`,
    password: TEST_PASSWORD,
    studentId: `2026-${String(studentCounter).padStart(6, '0')}`,
    program: 'BS Information Technology',
    yearLevel: '3rd Year',
    section: 'BSIT-3A',
    ...overrides,
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.data.student;
}

async function createSubject(code = 'IT301') {
  const res = await adminApi.post('/api/subjects', { code, name: 'Advanced Database Systems', units: 3 });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.data.subject;
}

async function createClassroom({ subject, teacher, students = [], section = 'BSIT-3A' }) {
  const res = await adminApi.post('/api/classrooms', {
    subjectId: subject.id,
    teacherId: teacher.id,
    section,
    academicYear: '2026-2027',
    semester: '1st Semester',
    room: 'CL-204',
    studentIds: students.map((s) => s.id),
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.data.classroom;
}

describe('users (admin)', () => {
  it('creates, lists, and filters staff accounts', async () => {
    const created = await adminApi.post('/api/users', {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria@univ.edu.ph',
      password: 'Secure1234',
      role: 'teacher',
    });
    assert.equal(created.status, 201);

    const teachers = await adminApi.get('/api/users?role=teacher&search=maria san');
    assert.equal(teachers.body.data.pagination.total, 1);
    assert.equal(teachers.body.data.items[0].email, 'maria@univ.edu.ph');
  });

  it('is forbidden to teachers', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const res = await as(await signIn(teacher)).get('/api/users');
    assert.equal(res.status, 403);
  });

  it("won't let an admin deactivate themselves or remove the last admin", async () => {
    const self = await adminApi.delete(`/api/users/${admin.id}`);
    assert.equal(self.status, 400);

    const other = await createUser({ role: 'admin' });
    const otherApi = as(await signIn(other));
    assert.equal((await otherApi.delete(`/api/users/${admin.id}`)).status, 200);
    // `other` is now the only active admin and can't demote themselves either.
    const demote = await otherApi.put(`/api/users/${other.id}`, {
      firstName: other.firstName,
      lastName: other.lastName,
      email: other.email,
      role: 'teacher',
      status: 'active',
    });
    assert.equal(demote.status, 400);
  });

  it('resets passwords and soft-deletes accounts', async () => {
    const teacher = await createUser({ role: 'teacher' });
    assert.equal((await adminApi.post(`/api/users/${teacher.id}/reset-password`, { newPassword: 'Changed123' })).status, 200);
    const login = await request(app).post('/api/auth/login').send({ email: teacher.email, password: 'Changed123' });
    assert.equal(login.status, 200);

    assert.equal((await adminApi.delete(`/api/users/${teacher.id}`)).status, 200);
    assert.equal((await User.findById(teacher._id)).status, 'inactive');
  });
});

describe('subjects', () => {
  it('requires grading weights that add up to 100%', async () => {
    const res = await adminApi.post('/api/subjects', {
      code: 'IT302',
      name: 'Web Systems',
      units: 3,
      grading: {
        categories: { quiz: 50, assignment: 20, project: 0, examination: 0, participation: 0, other: 0 },
        periods: { prelim: 30, midterm: 30, final: 40 },
      },
    });
    assert.equal(res.status, 400);
  });

  it('rejects duplicate codes', async () => {
    await createSubject('IT301');
    const res = await adminApi.post('/api/subjects', { code: 'it301', name: 'Duplicate', units: 3 });
    assert.equal(res.status, 409);
  });
});

describe('students', () => {
  it('creates a student together with a login', async () => {
    const student = await createStudent({ email: 'juan@student.edu.ph' });
    assert.equal(student.email, 'juan@student.edu.ph');

    const login = await request(app).post('/api/auth/login').send({ email: 'juan@student.edu.ph', password: TEST_PASSWORD });
    assert.equal(login.status, 200);
    assert.equal(login.body.data.user.role, 'student');
  });

  it('rejects a duplicate student ID without leaving an orphan account', async () => {
    await createStudent({ studentId: '2026-999999' });
    const res = await adminApi.post('/api/students', {
      firstName: 'Ana',
      lastName: 'Reyes',
      email: 'ana@student.edu.ph',
      password: TEST_PASSWORD,
      studentId: '2026-999999',
      program: 'BSIT',
      yearLevel: '1st Year',
      section: 'BSIT-1A',
    });
    assert.equal(res.status, 409);
    assert.equal(await User.exists({ email: 'ana@student.edu.ph' }), null);
  });

  it('deactivating a student blocks their sign-in', async () => {
    const student = await createStudent({ email: 'leaving@student.edu.ph' });
    assert.equal((await adminApi.delete(`/api/students/${student.id}`)).status, 200);
    const login = await request(app).post('/api/auth/login').send({ email: 'leaving@student.edu.ph', password: TEST_PASSWORD });
    assert.equal(login.status, 403);
  });
});

describe('classrooms, scores, and teacher data isolation', () => {
  let teacherA;
  let teacherB;
  let apiA;
  let apiB;
  let subject;
  let juan;
  let other;
  let classroom;

  beforeEach(async () => {
    teacherA = await createUser({ role: 'teacher' });
    teacherB = await createUser({ role: 'teacher' });
    apiA = as(await signIn(teacherA));
    apiB = as(await signIn(teacherB));
    subject = await createSubject();
    juan = await createStudent({ email: 'juan@student.edu.ph' });
    other = await createStudent();
    classroom = await createClassroom({ subject, teacher: teacherA, students: [juan] });
  });

  it('rejects a duplicate class for the same subject, section, and term', async () => {
    const res = await adminApi.post('/api/classrooms', {
      subjectId: subject.id,
      teacherId: teacherB.id,
      section: 'BSIT-3A',
      academicYear: '2026-2027',
      semester: '1st Semester',
    });
    assert.equal(res.status, 409);
  });

  it("limits teachers to their own classes and students", async () => {
    const mine = await apiA.get('/api/classrooms');
    const theirs = await apiB.get('/api/classrooms');
    assert.equal(mine.body.data.items.length, 1);
    assert.equal(theirs.body.data.items.length, 0);

    assert.equal((await apiB.get(`/api/classrooms/${classroom.id}`)).status, 404);
    assert.equal((await apiB.get(`/api/classrooms/${classroom.id}/gradebook`)).status, 404);
    assert.equal((await apiB.get(`/api/scores?classroomId=${classroom.id}`)).status, 404);
    assert.equal((await apiB.get(`/api/students/${juan.id}`)).status, 404);

    const studentsA = await apiA.get('/api/students');
    assert.deepEqual(
      studentsA.body.data.items.map((s) => s.id),
      [juan.id],
    );
  });

  it('lets the class teacher manage the class list, but not other teachers', async () => {
    const updated = await apiA.put(`/api/classrooms/${classroom.id}/students`, { studentIds: [juan.id, other.id] });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.classroom.students.length, 2);

    assert.equal((await apiB.put(`/api/classrooms/${classroom.id}/students`, { studentIds: [] })).status, 404);
  });

  it('records scores for enrolled students only and validates them', async () => {
    const base = { classroomId: classroom.id, period: 'prelim', category: 'quiz', title: 'Quiz 1', date: '2026-09-01' };

    assert.equal((await apiA.post('/api/scores', { ...base, studentId: juan.id, score: 9, maximumScore: 10 })).status, 201);
    assert.equal((await apiA.post('/api/scores', { ...base, studentId: other.id, score: 9, maximumScore: 10 })).status, 400);
    assert.equal((await apiA.post('/api/scores', { ...base, studentId: juan.id, score: 11, maximumScore: 10 })).status, 400);
    assert.equal((await apiB.post('/api/scores', { ...base, studentId: juan.id, score: 9, maximumScore: 10 })).status, 404);
  });

  it("computes the gradebook and the student's own grade report", async () => {
    const record = (period, category, score) =>
      apiA.post('/api/scores', {
        classroomId: classroom.id,
        studentId: juan.id,
        period,
        category,
        title: `${period} ${category}`,
        score,
        maximumScore: 100,
        date: '2026-09-01',
      });
    await record('prelim', 'quiz', 80);
    await record('prelim', 'examination', 90);

    const gradebook = await apiA.get(`/api/classrooms/${classroom.id}/gradebook`);
    assert.equal(gradebook.status, 200);
    assert.equal(gradebook.body.data.rows[0].prelim, 86);
    assert.equal(gradebook.body.data.rows[0].remarks, 'In Progress');

    const studentApi = as((await request(app).post('/api/auth/login').send({ email: 'juan@student.edu.ph', password: TEST_PASSWORD })).body.data.token);
    const report = await studentApi.get('/api/students/me/grades');
    assert.equal(report.status, 200);
    assert.equal(report.body.data.currentTermId, '2026-2027-1');
    assert.equal(report.body.data.terms[0].rows[0].code, 'IT301');
    assert.equal(report.body.data.terms[0].rows[0].prelim, 86);

    // Students can't use staff endpoints.
    assert.equal((await studentApi.get('/api/students')).status, 403);
    assert.equal((await studentApi.get(`/api/classrooms/${classroom.id}/gradebook`)).status, 403);
  });
});

describe('admin dashboard', () => {
  it('returns counts and recent activity', async () => {
    await createStudent();
    const res = await adminApi.get('/api/dashboard/admin');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.counts.students, 1);
    assert.ok(res.body.data.recentActivity.length > 0);
  });
});
