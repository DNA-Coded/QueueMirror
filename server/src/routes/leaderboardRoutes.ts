import { Router } from 'express';
import { getLeaderboard } from '../controllers/LeaderboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// authenticateToken is optional for leaderboard, so we check if token is valid without blocking
router.get('/', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    authenticateToken(req as any, res, next);
  } else {
    next();
  }
}, getLeaderboard as any);

export default router;
