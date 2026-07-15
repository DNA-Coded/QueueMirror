import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'user', 'admin'], default: 'user' },
  avatarUrl: { type: String, default: '' },
  points: { type: Number, default: 0 },
  level: { type: String, enum: ['Explorer', 'Reporter', 'Trusted Reporter', 'Queue Expert', 'Queue Legend'], default: 'Explorer' },
  savedLocations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
  followedLocations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
  createdAt: { type: Date, default: Date.now }
});

export const User = model('User', UserSchema);
