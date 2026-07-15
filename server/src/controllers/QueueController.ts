import { Response } from 'express';
import { QueueReport } from '../models/QueueReport.js';
import { Location } from '../models/Location.js';
import { User } from '../models/User.js';
import { Contribution } from '../models/Contribution.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../middleware/upload.js';
import { Notification } from '../models/Notification.js';

// Calculate reputation level based on total XP
const calculateLevel = (points: number): 'Explorer' | 'Reporter' | 'Trusted Reporter' | 'Queue Expert' | 'Queue Legend' => {
  if (points >= 3000) return 'Queue Legend';
  if (points >= 2000) return 'Queue Expert';
  if (points >= 1000) return 'Trusted Reporter';
  if (points >= 300) return 'Reporter';
  return 'Explorer';
};

// Award points helper
const awardPoints = async (userId: string, points: number, type: 'submit_report' | 'verified_report' | 'popular_report', reportId?: string, actionDetail?: string) => {
  const user = await User.findById(userId);
  if (!user) return;

  user.points += points;
  user.level = calculateLevel(user.points);
  await user.save();

  // Create contribution log
  const contribution = new Contribution({
    user: userId,
    type,
    points,
    targetReport: reportId
  });
  await contribution.save();

  // Log activity
  const activity = new ActivityLog({
    user: userId,
    action: type === 'submit_report' ? 'New Report Submitted' : type === 'verified_report' ? 'Verification Accepted' : 'Popular Report Bonus',
    details: actionDetail || `Earned +${points} XP for contributions.`,
    pointsEarned: points,
    category: 'Contributions'
  });
  await activity.save();
};

// Submit Report
export const reportQueue = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { locationId, servingNumber, ownTokenNumber, queueLength, notes, category } = req.body;
    
    if (!locationId || servingNumber === undefined || ownTokenNumber === undefined || queueLength === undefined || !category) {
      res.status(400).json({ message: 'Missing required report fields.' });
      return;
    }

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: 'Location not found.' });
      return;
    }

    let photoUrl = '';
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    }

    // Create Report
    const report = new QueueReport({
      user: req.user.id,
      location: locationId,
      category,
      servingNumber: Number(servingNumber),
      ownTokenNumber: Number(ownTokenNumber),
      queueLength: Number(queueLength),
      notes: notes || '',
      photoEvidenceUrl: photoUrl
    });

    await report.save();

    // Automatically update Location's live metrics
    // Estimated wait time calculation:
    // People Ahead = ownToken - servingNumber
    // If ownToken < servingNumber (e.g. new daily cycle), treat as queue length
    const peopleAhead = Math.max(0, Number(ownTokenNumber) - Number(servingNumber));
    const estWait = Math.max(5, Math.round(peopleAhead * location.averageQueueSpeed));

    location.currentlyServing = Number(servingNumber);
    location.currentQueueNo = Number(ownTokenNumber);
    location.estimatedWaitTime = estWait;

    // Crowd Density Calculation (capacity percentage based on queue length)
    // Assume capacity is 50 max queue length for 100% capacity
    const calculatedDensity = Math.min(100, Math.round((Number(queueLength) / 50) * 100));
    location.crowdDensity = calculatedDensity;

    // Update hourly trend graph
    const currentHour = new Date().getHours();
    const hourLabel = currentHour === 0 ? '12A' : currentHour < 12 ? `${currentHour}A` : currentHour === 12 ? '12P' : `${currentHour - 12}P`;
    
    const hourIndex = location.historicalTrends.findIndex(t => t.hour === hourLabel);
    if (hourIndex > -1) {
      location.historicalTrends[hourIndex].density = calculatedDensity;
    } else {
      location.historicalTrends.push({ hour: hourLabel, density: calculatedDensity });
      if (location.historicalTrends.length > 12) location.historicalTrends.shift();
    }

    await location.save();

    // Award +10 XP for submitting report
    await awardPoints(req.user.id, 10, 'submit_report', report._id.toString(), `Reported queue at ${location.name}`);

    // If wait time is high (> 60m) or capacity is critical, notify users who saved/followed this location
    if (estWait >= 60 || calculatedDensity >= 85) {
      const followers = await User.find({ followedLocations: locationId });
      for (const follower of followers) {
        const notification = new Notification({
          user: follower._id,
          title: `Alert: High Queue at ${location.name}`,
          message: `The estimated wait time is now ${estWait} mins with ${calculatedDensity}% crowd density.`,
          type: estWait >= 60 ? 'queue_alert' : 'crowd_alert'
        });
        await notification.save();
      }
    }

    res.status(201).json({ report, location });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error submitting report.' });
  }
};

// Verify Report (Upvote / Validate)
export const verifyReport = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { reportId } = req.params;
    const report = await QueueReport.findById(reportId).populate('location');
    if (!report) {
      res.status(404).json({ message: 'Report not found.' });
      return;
    }

    if (report.user.toString() === req.user.id) {
      res.status(400).json({ message: 'You cannot verify your own report.' });
      return;
    }

    if (report.verifiedBy.includes(req.user.id as any)) {
      res.status(400).json({ message: 'You have already verified this report.' });
      return;
    }

    report.verifiedBy.push(req.user.id as any);

    // If report reaches 3 verifications, it becomes officially verified
    if (report.verifiedBy.length >= 3 && !report.isVerified) {
      report.isVerified = true;
      // Award original reporter +20 XP
      await awardPoints(report.user.toString(), 20, 'verified_report', report._id.toString(), `Your report for ${(report.location as any).name} was verified by multiple users.`);
      
      // Notify original reporter
      const notification = new Notification({
        user: report.user,
        title: 'Report Verified!',
        message: `Your queue report at ${(report.location as any).name} has been verified by the community. +20 XP awarded!`,
        type: 'followed_update'
      });
      await notification.save();
    }

    // If report gets 10 verifications, mark as popular report (+50 XP)
    if (report.verifiedBy.length === 10) {
      await awardPoints(report.user.toString(), 50, 'popular_report', report._id.toString(), `Your report for ${(report.location as any).name} became trending.`);
    }

    await report.save();

    // Award +5 XP to the verifier for contributing to community intelligence
    const verifier = await User.findById(req.user.id);
    if (verifier) {
      verifier.points += 5;
      verifier.level = calculateLevel(verifier.points);
      await verifier.save();
      
      const activity = new ActivityLog({
        user: req.user.id,
        action: 'Report Verified',
        details: `Verified queue report at ${(report.location as any).name}.`,
        pointsEarned: 5,
        category: 'Verification'
      });
      await activity.save();
    }

    res.status(200).json({ message: 'Report verified successfully.', report });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get Live Reports for Location
export const getRecentReports = async (req: AuthRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const reports = await QueueReport.find({ location: locationId })
      .populate('user', 'name avatarUrl level points')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Wait Time Prediction engine query
export const getWaitPrediction = async (req: AuthRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const { ownToken, servingToken } = req.query;

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: 'Location not found.' });
      return;
    }

    const serving = servingToken ? Number(servingToken) : location.currentlyServing;
    const token = ownToken ? Number(ownToken) : location.currentQueueNo;
    const peopleAhead = Math.max(0, token - serving);

    // Calculate historical weight based on time of day
    const hour = new Date().getHours();
    const historicalWeight = location.peakHours[hour] ? location.peakHours[hour] / 100 : 0.5;

    // Estimated Wait Calculation
    const estWait = Math.max(5, Math.round(peopleAhead * location.averageQueueSpeed * (1 + historicalWeight * 0.2)));

    // Calculate prediction confidence
    // Confidence decreases with high variance or lack of recent reports
    const recentReportsCount = await QueueReport.countDocuments({
      location: locationId,
      createdAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } // past 2 hours
    });

    let confidence = 50 + recentReportsCount * 10;
    if (confidence > 95) confidence = 95;
    if (peopleAhead === 0) confidence = 99;

    res.status(200).json({
      locationId,
      peopleAhead,
      averageProcessingSpeed: location.averageQueueSpeed,
      estimatedWaitMinutes: estWait,
      predictionConfidence: confidence,
      bestArrivalTime: location.bestTimeStart + " - " + location.bestTimeEnd,
      crowdDensityForecast: location.forecastData
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
