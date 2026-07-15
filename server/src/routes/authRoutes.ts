import { Router } from 'express';
import { register, login, googleLogin, forgotPassword, resetPassword, getProfile } from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateToken as any, getProfile as any);

export default router;
