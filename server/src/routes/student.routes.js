import { Router } from 'express';
import { create, deactivate, get, list, lookup, me, myGrades, update } from '../controllers/student.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { idParamSchema } from '../validators/common.js';
import {
  createStudentSchema,
  listStudentsQuerySchema,
  lookupStudentsQuerySchema,
  updateStudentSchema,
} from '../validators/student.validators.js';

const router = Router();
const staff = requireRole('admin', 'teacher');

router.use(authenticateUser);

// The signed-in student's own record (declared before /:id).
router.get('/me', requireRole('student'), me);
router.get('/me/grades', requireRole('student'), myGrades);

router.get('/lookup', staff, validate({ query: lookupStudentsQuerySchema }), lookup);
router.get('/', staff, validate({ query: listStudentsQuerySchema }), list);
router.get('/:id', staff, validate({ params: idParamSchema }), get);
router.post('/', requireRole('admin'), validate({ body: createStudentSchema }), create);
router.put('/:id', requireRole('admin'), validate({ params: idParamSchema, body: updateStudentSchema }), update);
router.delete('/:id', requireRole('admin'), validate({ params: idParamSchema }), deactivate);

export default router;
