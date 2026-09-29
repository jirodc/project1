import * as gradebookService from '../services/gradebook.service.js';
import { formatStudent } from '../services/format.js';
import * as studentService from '../services/student.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const context = (req) => ({ actor: req.user, ipAddress: req.ip });

export async function list(req, res) {
  sendSuccess(res, { data: await studentService.listStudents(req.validatedQuery, req.user) });
}

export async function lookup(req, res) {
  sendSuccess(res, { data: { items: await studentService.lookupStudents(req.validatedQuery.search) } });
}

export async function get(req, res) {
  sendSuccess(res, { data: { student: await studentService.getStudent(req.params.id, req.user) } });
}

export async function create(req, res) {
  const student = await studentService.createStudent(req.body, context(req));
  sendSuccess(res, { status: 201, message: 'Student created successfully', data: { student } });
}

export async function update(req, res) {
  const student = await studentService.updateStudent(req.params.id, req.body, context(req));
  sendSuccess(res, { message: 'Student updated successfully', data: { student } });
}

export async function deactivate(req, res) {
  const student = await studentService.deactivateStudent(req.params.id, context(req));
  sendSuccess(res, { message: 'Student deactivated', data: { student } });
}

export async function me(req, res) {
  const student = await studentService.getOwnStudentRecord(req.user._id);
  sendSuccess(res, { data: { student: formatStudent(student) } });
}

export async function myGrades(req, res) {
  sendSuccess(res, { data: await gradebookService.getStudentGradeReport(req.user._id) });
}
