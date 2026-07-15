import { Response } from 'express';
import { Location } from '../models/Location.js';
import { QueueReport } from '../models/QueueReport.js';
import { AuthRequest } from '../middleware/auth.js';

// Get location comparison stats
export const getLocationComparison = async (req: AuthRequest, res: Response) => {
  try {
    const locations = await Location.find().select('name category estimatedWaitTime crowdDensity');
    
    // Sort and compare wait times
    const sortedByWait = [...locations].sort((a, b) => a.estimatedWaitTime - b.estimatedWaitTime);
    
    res.status(200).json({
      all: locations,
      bestLocations: sortedByWait.slice(0, 5),
      worstLocations: sortedByWait.slice(-5).reverse()
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get general dashboard overview analytics (counts and figures)
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const activeLocations = await Location.countDocuments();
    const reportsCount = await QueueReport.countDocuments();
    
    // Mock general metrics for system-wide stats
    const activeUsersCount = 1240; 
    const hoursSavedCount = Math.round(reportsCount * 0.45 * 1.5 + 8200); // 1.5 hours per report verification

    res.status(200).json({
      activeLocations,
      reportsSubmitted: reportsCount,
      hoursSaved: hoursSavedCount,
      activeUsers: activeUsersCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get advanced chart statistics for a location
export const getLocationAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: 'Location not found.' });
      return;
    }

    // Generate weekly data (7 days wait times)
    const weeklyTrends = [
      { day: 'Mon', waitTime: Math.round(location.estimatedWaitTime * 0.9) },
      { day: 'Tue', waitTime: Math.round(location.estimatedWaitTime * 1.1) },
      { day: 'Wed', waitTime: Math.round(location.estimatedWaitTime * 0.8) },
      { day: 'Thu', waitTime: Math.round(location.estimatedWaitTime * 1.2) },
      { day: 'Fri', waitTime: Math.round(location.estimatedWaitTime * 1.3) },
      { day: 'Sat', waitTime: Math.round(location.estimatedWaitTime * 0.5) },
      { day: 'Sun', waitTime: Math.round(location.estimatedWaitTime * 0.3) }
    ];

    // Generate monthly data (4 weeks crowd capacities)
    const monthlyTrends = [
      { week: 'W1', avgDensity: 45 },
      { week: 'W2', avgDensity: 55 },
      { week: 'W3', avgDensity: 65 },
      { week: 'W4', avgDensity: location.crowdDensity }
    ];

    res.status(200).json({
      locationName: location.name,
      category: location.category,
      currentWaitTime: location.estimatedWaitTime,
      currentCrowdDensity: location.crowdDensity,
      historicalTrends: location.historicalTrends,
      weeklyTrends,
      monthlyTrends,
      peakHours: location.peakHours
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
