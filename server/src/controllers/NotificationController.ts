import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching notifications.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { notificationId } = req.params;
    const notification = await Notification.findOne({ _id: notificationId, user: req.user.id });
    if (!notification) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }

    notification.read = true;
    await notification.save();
    
    res.status(200).json({ message: 'Notification marked as read.', notification });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
