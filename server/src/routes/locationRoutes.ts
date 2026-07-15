import { Router } from 'express';
import { listLocations, searchLocations, getLocationDetail, saveLocation, followLocation, createLocation } from '../controllers/LocationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', listLocations as any);
router.get('/search', searchLocations as any);
router.get('/:id', getLocationDetail as any);
router.post('/', authenticateToken as any, createLocation as any);
router.post('/:id/save', authenticateToken as any, saveLocation as any);
router.post('/:id/follow', authenticateToken as any, followLocation as any);

export default router;
