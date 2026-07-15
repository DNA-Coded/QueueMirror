import { Schema, model } from 'mongoose';

const ActivityLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  pointsEarned: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

export const ActivityLog = model('ActivityLog', ActivityLogSchema);
