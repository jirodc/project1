import { Router } from 'express';
import { create, list, remove, update } from '../controllers/score.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { idParamSchema } from '../validators/common.js';
import { createScoreSchema, listScoresQuerySchema, updateScoreSchema } from '../validators/score.validators.js';

const router = Router();

// Class ownership is checked per request in the score service.
router.use(authenticateUser, requireRole('admin', 'teacher'));

router.get('/', validate({ query: listScoresQuerySchema }), list);
router.post('/', validate({ body: createScoreSchema }), create);
router.put('/:id', validate({ params: idParamSchema, body: updateScoreSchema }), update);
router.delete('/:id', validate({ params: idParamSchema }), remove);

export default router;
