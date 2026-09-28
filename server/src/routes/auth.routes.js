import { Router } from 'express';
import { login, logout, me, register } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { loginLimiter } from '../middleware/rateLimit.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validators.js';

const router = Router();

router.post('/login', loginLimiter, validate({ body: loginSchema }), login);

// Accounts are provisioned by administrators — there is no public sign-up.
router.post(
  '/register',
  authenticateUser,
  requireRole('admin'),
  validate({ body: registerSchema }),
  register,
);

router.get('/me', authenticateUser, me);
router.post('/logout', authenticateUser, logout);

export default router;
