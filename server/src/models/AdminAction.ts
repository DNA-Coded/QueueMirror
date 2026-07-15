import { Schema, model } from 'mongoose';

const AdminActionSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, enum: ['approve_location', 'delete_report', 'suspend_user', 'system_setting'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const AdminAction = model('AdminAction', AdminActionSchema);
