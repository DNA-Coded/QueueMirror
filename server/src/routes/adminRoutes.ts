import { Router } from 'express';
import { getAdminMetrics, getUsers, deleteUser, moderateReport } from '../controllers/AdminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Secure all admin routes
router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get('/metrics', getAdminMetrics as any);
router.get('/users', getUsers as any);
router.delete('/users/:userId', deleteUser as any);
router.post('/reports/:reportId/moderate', moderateReport as any);

export default router;
