import { Schema, model } from 'mongoose';

const ContributionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['submit_report', 'verified_report', 'popular_report'], required: true },
  points: { type: Number, required: true },
  targetReport: { type: Schema.Types.ObjectId, ref: 'QueueReport' },
  createdAt: { type: Date, default: Date.now }
});

export const Contribution = model('Contribution', ContributionSchema);
