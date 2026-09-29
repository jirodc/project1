import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const context = (req) => ({ actor: req.user, ipAddress: req.ip });

export async function list(req, res) {
  sendSuccess(res, { data: await userService.listUsers(req.validatedQuery) });
}

export async function get(req, res) {
  sendSuccess(res, { data: { user: await userService.getUser(req.params.id) } });
}

export async function create(req, res) {
  const user = await userService.createUser(req.body, context(req));
  sendSuccess(res, { status: 201, message: 'User created successfully', data: { user } });
}

export async function update(req, res) {
  const user = await userService.updateUser(req.params.id, req.body, context(req));
  sendSuccess(res, { message: 'User updated successfully', data: { user } });
}

export async function deactivate(req, res) {
  const user = await userService.deactivateUser(req.params.id, context(req));
  sendSuccess(res, { message: 'User deactivated', data: { user } });
}

export async function resetPassword(req, res) {
  await userService.resetPassword(req.params.id, req.body.newPassword, context(req));
  sendSuccess(res, { message: 'Password reset successfully' });
}
