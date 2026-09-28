import { Router } from 'express';
import { create, list } from '../controllers/announcement.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createAnnouncementSchema,
  listAnnouncementsQuerySchema,
} from '../validators/announcement.validators.js';

const router = Router();

router.use(authenticateUser);

router.get('/', requireRole('admin', 'teacher'), validate({ query: listAnnouncementsQuerySchema }), list);
router.post('/', requireRole('admin'), validate({ body: createAnnouncementSchema }), create);

export default router;
