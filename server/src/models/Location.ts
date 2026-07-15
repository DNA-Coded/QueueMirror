import { Schema, model } from 'mongoose';

const HourlyTrendSchema = new Schema({
  hour: { type: String, required: true },
  density: { type: Number, required: true }
}, { _id: false });

const LocationSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Hospital', 'Bank', 'Passport Office', 'Government Office', 'University', 'Railway Center', 'Restaurant', 'Service Center'],
    required: true 
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  currentQueueNo: { type: Number, default: 0 },
  currentlyServing: { type: Number, default: 0 },
  averageQueueSpeed: { type: Number, default: 2.0 }, // minutes per token
  estimatedWaitTime: { type: Number, default: 0 }, // in minutes
  crowdDensity: { type: Number, default: 0 }, // capacity % (0 - 100)
  bestTimeStart: { type: String, default: "09:00" },
  bestTimeEnd: { type: String, default: "11:00" },
  peakHours: [{ type: Number }], // 24 numbers representing hour capacities
  historicalTrends: [HourlyTrendSchema],
  forecastData: [{ type: Number }], // estimated wait times for future hours
  createdAt: { type: Date, default: Date.now }
});

export const Location = model('Location', LocationSchema);
