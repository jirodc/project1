import { Router } from 'express';
import { create, deactivate, get, gradebook, list, setStudents, update } from '../controllers/classroom.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { classroomSchema, classroomStudentsSchema, listClassroomsQuerySchema } from '../validators/classroom.validators.js';
import { idParamSchema } from '../validators/common.js';

const router = Router();
const staff = requireRole('admin', 'teacher');
const byId = validate({ params: idParamSchema });

router.use(authenticateUser);

// Teachers get only their own classes from these; the service enforces it.
router.get('/', staff, validate({ query: listClassroomsQuerySchema }), list);
router.get('/:id', staff, byId, get);
router.get('/:id/gradebook', staff, byId, gradebook);
router.put('/:id/students', staff, validate({ params: idParamSchema, body: classroomStudentsSchema }), setStudents);

router.post('/', requireRole('admin'), validate({ body: classroomSchema }), create);
router.put('/:id', requireRole('admin'), validate({ params: idParamSchema, body: classroomSchema }), update);
router.delete('/:id', requireRole('admin'), byId, deactivate);

export default router;
