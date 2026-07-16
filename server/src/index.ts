import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Import model for seeding
import { Location } from './models/Location.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/queuemirror';

// Middleware
app.use(cors());
app.use(express.json());

// Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('QueueMirror API Server is Running...');
});

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error.' });
});

// Seed Data Function
const seedLocations = async () => {
  try {
    const count = await Location.countDocuments();
    if (count === 0) {
      console.log('Seeding initial location intelligence database...');
      
      const mockPeakHours = [10, 15, 20, 45, 60, 85, 95, 75, 60, 40, 20, 10];
      const mockTrends = [
        { hour: '9A', density: 30 },
        { hour: '10A', density: 50 },
        { hour: '11A', density: 85 },
        { hour: '12P', density: 95 },
        { hour: '1P', density: 60 },
        { hour: '2P', density: 40 },
        { hour: '3P', density: 20 },
        { hour: '4P', density: 10 }
      ];
      const mockForecast = [20, 30, 45, 60, 40, 30, 15, 5];

      const initialLocations = [
        {
          name: 'Passport Office Kolkata',
          address: 'Regional Head Office, Kolkata, WB',
          category: 'Passport Office',
          coordinates: { lat: 22.5726, lng: 88.3639 },
          currentQueueNo: 185,
          currentlyServing: 127,
          averageQueueSpeed: 4.3,
          estimatedWaitTime: 245, // 4h 05m
          crowdDensity: 85,
          bestTimeStart: "15:00",
          bestTimeEnd: "16:00",
          peakHours: mockPeakHours,
          historicalTrends: mockTrends,
          forecastData: mockForecast
        },
        {
          name: 'Central Gen Hospital ER',
          address: 'Central District Municipal Sq, Kolkata, WB',
          category: 'Hospital',
          coordinates: { lat: 22.5696, lng: 88.3589 },
          currentQueueNo: 402,
          currentlyServing: 382,
          averageQueueSpeed: 5.25,
          estimatedWaitTime: 105, // 1h 45m
          crowdDensity: 80,
          bestTimeStart: "08:00",
          bestTimeEnd: "10:00",
          peakHours: mockPeakHours,
          historicalTrends: mockTrends,
          forecastData: mockForecast
        },
        {
          name: 'First National Bank',
          address: 'Financial Hub Sector V, Salt Lake, Kolkata',
          category: 'Bank',
          coordinates: { lat: 22.5786, lng: 88.3689 },
          currentQueueNo: 48,
          currentlyServing: 42,
          averageQueueSpeed: 4.16,
          estimatedWaitTime: 25,
          crowdDensity: 50,
          bestTimeStart: "10:00",
          bestTimeEnd: "12:00",
          peakHours: mockPeakHours,
          historicalTrends: mockTrends,
          forecastData: mockForecast
        },
        {
          name: 'City Tax Office',
          address: 'Municipal Square Building, Kolkata, WB',
          category: 'Government Office',
          coordinates: { lat: 22.5826, lng: 88.3529 },
          currentQueueNo: 15,
          currentlyServing: 14,
          averageQueueSpeed: 5.0,
          estimatedWaitTime: 5,
          crowdDensity: 20,
          bestTimeStart: "14:00",
          bestTimeEnd: "16:00",
          peakHours: mockPeakHours,
          historicalTrends: mockTrends,
          forecastData: mockForecast
        },
        {
          name: 'Kolkata Passport Seva Kendra',
          address: 'Ritchie Road Service Hub, Kolkata, WB',
          category: 'Passport Office',
          coordinates: { lat: 22.5716, lng: 88.3629 },
          currentQueueNo: 510,
          currentlyServing: 482,
          averageQueueSpeed: 1.8,
          estimatedWaitTime: 56, // ~60 mins
          crowdDensity: 85,
          bestTimeStart: "15:00",
          bestTimeEnd: "16:00",
          peakHours: mockPeakHours,
          historicalTrends: mockTrends,
          forecastData: mockForecast
        },
        {
          name: 'Westside Medical Center',
          address: 'West Side Bypass Road, Kolkata, WB',
          category: 'Hospital',
          coordinates: { lat: 22.5656, lng: 88.3429 },
          currentQueueNo: 120,
          currentlyServing: 110,
          averageQueueSpeed: 3.0,
          estimatedWaitTime: 30,
          crowdDensity: 60,
          bestTimeStart: "07:00",
          bestTimeEnd: "09:00",
          peakHours: mockPeakHours,
          historicalTrends: mockTrends,
          forecastData: mockForecast
        }
      ];

      await Location.insertMany(initialLocations);
      console.log('Seeding completed successfully!');
    }
  } catch (error) {
    console.error('Error seeding location database:', error);
  }
};

// Database Connection & Server Listen
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas/Local.');
    await seedLocations();
    app.listen(PORT, () => {
      console.log(`Server is running in production mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
