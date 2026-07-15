import { Response } from 'express';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    // Get top 20 users by points
    const topContributors = await User.find()
      .select('name avatarUrl points level role')
      .sort({ points: -1 })
      .limit(20);

    // Calculate user rank if logged in
    let userRank = -1;
    let userPoints = 0;
    if (req.user) {
      const allUsersSorted = await User.find().select('_id points').sort({ points: -1 });
      userRank = allUsersSorted.findIndex(u => u._id.toString() === req.user?.id) + 1;
      const caller = await User.findById(req.user.id).select('points');
      userPoints = caller ? caller.points : 0;
    }

    res.status(200).json({
      leaderboard: topContributors,
      userRank,
      userPoints
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching leaderboard.' });
  }
};
