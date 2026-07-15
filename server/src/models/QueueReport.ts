import { Schema, model } from 'mongoose';

const QueueReportSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  category: { type: String, required: true },
  servingNumber: { type: Number, required: true },
  ownTokenNumber: { type: Number, required: true },
  queueLength: { type: Number, required: true },
  notes: { type: String, default: '' },
  photoEvidenceUrl: { type: String, default: '' },
  verifiedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const QueueReport = model('QueueReport', QueueReportSchema);
