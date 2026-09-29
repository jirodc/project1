import { Router } from 'express';
import { create, deactivate, get, list, update } from '../controllers/subject.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { idParamSchema } from '../validators/common.js';
import { listSubjectsQuerySchema, subjectSchema } from '../validators/subject.validators.js';

const router = Router();

router.use(authenticateUser);

router.get('/', requireRole('admin', 'teacher'), validate({ query: listSubjectsQuerySchema }), list);
router.get('/:id', requireRole('admin', 'teacher'), validate({ params: idParamSchema }), get);
router.post('/', requireRole('admin'), validate({ body: subjectSchema }), create);
router.put('/:id', requireRole('admin'), validate({ params: idParamSchema, body: subjectSchema }), update);
router.delete('/:id', requireRole('admin'), validate({ params: idParamSchema }), deactivate);

export default router;
