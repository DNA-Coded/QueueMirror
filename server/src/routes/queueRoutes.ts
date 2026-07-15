import { Router } from 'express';
import { reportQueue, verifyReport, getRecentReports, getWaitPrediction } from '../controllers/QueueController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/report', authenticateToken as any, upload.single('photoEvidence'), reportQueue as any);
router.post('/verify/:reportId', authenticateToken as any, verifyReport as any);
router.get('/recent/:locationId', getRecentReports as any);
router.get('/predict/:locationId', getWaitPrediction as any);

export default router;
