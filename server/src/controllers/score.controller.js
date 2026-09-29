import * as scoreService from '../services/score.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const context = (req) => ({ actor: req.user, ipAddress: req.ip });

export async function list(req, res) {
  sendSuccess(res, { data: { items: await scoreService.listScores(req.validatedQuery, req.user) } });
}

export async function create(req, res) {
  const score = await scoreService.createScore(req.body, context(req));
  sendSuccess(res, { status: 201, message: 'Score recorded', data: { score } });
}

export async function update(req, res) {
  const score = await scoreService.updateScore(req.params.id, req.body, context(req));
  sendSuccess(res, { message: 'Score updated', data: { score } });
}

export async function remove(req, res) {
  await scoreService.deleteScore(req.params.id, context(req));
  sendSuccess(res, { message: 'Score deleted' });
}
