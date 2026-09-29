import { Router } from 'express';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { getAdminDashboard, listActivityLogs } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { pagination } from '../validators/common.js';

const router = Router();
const adminOnly = [authenticateUser, requireRole('admin')];

// Guards are per route: this router is mounted at the API root.
router.get('/dashboard/admin', ...adminOnly, async (_req, res) => {
  sendSuccess(res, { data: await getAdminDashboard() });
});

router.get('/activity-logs', ...adminOnly, validate({ query: z.object(pagination) }), async (req, res) => {
  sendSuccess(res, { data: await listActivityLogs(req.validatedQuery) });
});

export default router;
