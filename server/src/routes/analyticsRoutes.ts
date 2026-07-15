import { Router } from 'express';
import { getLocationComparison, getDashboardStats, getLocationAnalytics } from '../controllers/AnalyticsController.js';

const router = Router();

router.get('/dashboard-stats', getDashboardStats as any);
router.get('/comparison', getLocationComparison as any);
router.get('/location/:locationId', getLocationAnalytics as any);

export default router;
