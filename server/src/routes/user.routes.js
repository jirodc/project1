import { Router } from 'express';
import { create, deactivate, get, list, resetPassword, update } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { idParamSchema } from '../validators/common.js';
import {
  createUserSchema,
  listUsersQuerySchema,
  resetPasswordSchema,
  updateUserSchema,
} from '../validators/user.validators.js';

const router = Router();

router.use(authenticateUser, requireRole('admin'));

router.get('/', validate({ query: listUsersQuerySchema }), list);
router.post('/', validate({ body: createUserSchema }), create);
router.get('/:id', validate({ params: idParamSchema }), get);
router.put('/:id', validate({ params: idParamSchema, body: updateUserSchema }), update);
router.delete('/:id', validate({ params: idParamSchema }), deactivate);
router.post('/:id/reset-password', validate({ params: idParamSchema, body: resetPasswordSchema }), resetPassword);

export default router;
