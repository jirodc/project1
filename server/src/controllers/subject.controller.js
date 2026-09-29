import * as subjectService from '../services/subject.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const context = (req) => ({ actor: req.user, ipAddress: req.ip });

export async function list(req, res) {
  sendSuccess(res, { data: await subjectService.listSubjects(req.validatedQuery) });
}

export async function get(req, res) {
  sendSuccess(res, { data: { subject: await subjectService.getSubject(req.params.id) } });
}

export async function create(req, res) {
  const subject = await subjectService.createSubject(req.body, context(req));
  sendSuccess(res, { status: 201, message: 'Subject created successfully', data: { subject } });
}

export async function update(req, res) {
  const subject = await subjectService.updateSubject(req.params.id, req.body, context(req));
  sendSuccess(res, { message: 'Subject updated successfully', data: { subject } });
}

export async function deactivate(req, res) {
  const subject = await subjectService.deactivateSubject(req.params.id, context(req));
  sendSuccess(res, { message: 'Subject deactivated', data: { subject } });
}
