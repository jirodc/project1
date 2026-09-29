import * as classroomService from '../services/classroom.service.js';
import * as gradebookService from '../services/gradebook.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const context = (req) => ({ actor: req.user, ipAddress: req.ip });

export async function list(req, res) {
  sendSuccess(res, { data: await classroomService.listClassrooms(req.validatedQuery, req.user) });
}

export async function get(req, res) {
  sendSuccess(res, { data: { classroom: await classroomService.getClassroom(req.params.id, req.user) } });
}

export async function gradebook(req, res) {
  sendSuccess(res, { data: await gradebookService.getClassroomGradebook(req.params.id, req.user) });
}

export async function create(req, res) {
  const classroom = await classroomService.createClassroom(req.body, context(req));
  sendSuccess(res, { status: 201, message: 'Class created successfully', data: { classroom } });
}

export async function update(req, res) {
  const classroom = await classroomService.updateClassroom(req.params.id, req.body, context(req));
  sendSuccess(res, { message: 'Class updated successfully', data: { classroom } });
}

export async function setStudents(req, res) {
  const classroom = await classroomService.setClassroomStudents(req.params.id, req.body.studentIds, context(req));
  sendSuccess(res, { message: 'Class list updated', data: { classroom } });
}

export async function deactivate(req, res) {
  const classroom = await classroomService.deactivateClassroom(req.params.id, context(req));
  sendSuccess(res, { message: 'Class deactivated', data: { classroom } });
}
