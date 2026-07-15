import { Response } from 'express';
import { User } from '../models/User.js';
import { Location } from '../models/Location.js';
import { QueueReport } from '../models/QueueReport.js';
import { AdminAction } from '../models/AdminAction.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AuthRequest } from '../middleware/auth.js';

// Get Admin Overview Metrics
export const getAdminMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLocations = await Location.countDocuments();
    const totalReports = await QueueReport.countDocuments();
    const pendingReports = await QueueReport.countDocuments({ isVerified: false });
    
    // Recent logs
    const activityLogs = await ActivityLog.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10);
    const adminActions = await AdminAction.find().populate('admin', 'name').sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      metrics: {
        totalUsers,
        totalLocations,
        totalReports,
        pendingReports,
        systemHealth: 'Optimal',
        serverUptime: process.uptime()
      },
      activityLogs,
      adminActions
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching admin metrics.' });
  }
};

// List Users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend / Delete User
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { userId } = req.params;
    
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (userToDelete.role === 'admin') {
      res.status(400).json({ message: 'Cannot delete an administrator.' });
      return;
    }

    await User.findByIdAndDelete(userId);

    // Log admin action
    const action = new AdminAction({
      admin: req.user.id,
      actionType: 'suspend_user',
      targetId: userId as any,
      details: `Deleted user ${userToDelete.name} (${userToDelete.email})`
    });
    await action.save();

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Moderate Report (Delete / Spam removal)
export const moderateReport = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { reportId } = req.params;
    const { action } = req.body; // 'delete' or 'verify'

    const report = await QueueReport.findById(reportId);
    if (!report) {
      res.status(404).json({ message: 'Report not found.' });
      return;
    }

    if (action === 'delete') {
      await QueueReport.findByIdAndDelete(reportId);

      // Log admin action
      const adminAction = new AdminAction({
        admin: req.user.id,
        actionType: 'delete_report',
        targetId: reportId as any,
        details: `Deleted report submitted by User ID ${report.user}`
      });
      await adminAction.save();

      res.status(200).json({ message: 'Report deleted successfully (moderated).' });
    } else if (action === 'verify') {
      report.isVerified = true;
      await report.save();

      const adminAction = new AdminAction({
        admin: req.user.id,
        actionType: 'approve_location', // using as generic approval
        targetId: reportId as any,
        details: `Force verified report ID ${reportId}`
      });
      await adminAction.save();

      res.status(200).json({ message: 'Report force verified successfully.', report });
    } else {
      res.status(400).json({ message: "Invalid action. Must be 'delete' or 'verify'." });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
