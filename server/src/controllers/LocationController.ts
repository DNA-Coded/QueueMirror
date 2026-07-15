import { Response } from 'express';
import { Location } from '../models/Location.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

// Get all locations with optional filtering
export const listLocations = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search } = req.query;
    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const locations = await Location.find(query);
    res.status(200).json(locations);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching locations.' });
  }
};

// Global search engine with autocomplete
export const searchLocations = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(200).json([]);
      return;
    }

    const locations = await Location.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    res.status(200).json(locations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get location detail
export const getLocationDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) {
      res.status(404).json({ message: 'Location not found.' });
      return;
    }
    res.status(200).json(location);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Save Location
export const saveLocation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params; // Location ID
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const index = user.savedLocations.indexOf(id as any);
    let saved = false;
    if (index > -1) {
      user.savedLocations.splice(index, 1);
    } else {
      user.savedLocations.push(id as any);
      saved = true;
    }

    await user.save();
    res.status(200).json({ saved, savedLocations: user.savedLocations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Follow Location
export const followLocation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params; // Location ID
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const index = user.followedLocations.indexOf(id as any);
    let followed = false;
    if (index > -1) {
      user.followedLocations.splice(index, 1);
    } else {
      user.followedLocations.push(id as any);
      followed = true;
    }

    await user.save();
    res.status(200).json({ followed, followedLocations: user.followedLocations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create new location (Admin or registered user)
export const createLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, category, lat, lng } = req.body;
    if (!name || !address || !category || lat === undefined || lng === undefined) {
      res.status(400).json({ message: 'Name, address, category, lat, and lng are required.' });
      return;
    }

    // Prepopulate trend graphs with realistic mock shapes
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

    const location = new Location({
      name,
      address,
      category,
      coordinates: { lat, lng },
      peakHours: mockPeakHours,
      historicalTrends: mockTrends,
      forecastData: mockForecast
    });

    await location.save();
    res.status(201).json(location);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
