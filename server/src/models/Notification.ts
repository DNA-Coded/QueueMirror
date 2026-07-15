import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['queue_alert', 'crowd_alert', 'best_time_alert', 'followed_update', 'admin_announcement'], 
    required: true 
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = model('Notification', NotificationSchema);
