import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';
import announcementRoutes from './announcement.routes.js';
import authRoutes from './auth.routes.js';
import classroomRoutes from './classroom.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import scoreRoutes from './score.routes.js';
import studentRoutes from './student.routes.js';
import subjectRoutes from './subject.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  sendSuccess(res, {
    message: 'Classroom Manager API. The web app runs separately (http://localhost:5173 in development).',
    data: { health: '/api/health' },
  });
});

router.get('/health', (_req, res) => {
  sendSuccess(res, {
    message: 'API is running',
    data: { database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' },
  });
});

router.use('/auth', authRoutes);
router.use('/announcements', announcementRoutes);
router.use('/users', userRoutes);
router.use('/subjects', subjectRoutes);
router.use('/students', studentRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/scores', scoreRoutes);
router.use(dashboardRoutes);

export default router;
