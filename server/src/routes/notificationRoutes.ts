import { Router } from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controllers/NotificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken as any, getUserNotifications as any);
router.post('/read-all', authenticateToken as any, markAllAsRead as any);
router.post('/:notificationId/read', authenticateToken as any, markAsRead as any);

export default router;
