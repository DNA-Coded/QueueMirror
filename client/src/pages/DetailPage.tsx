import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';

interface LocationType {
  _id: string;
  name: string;
  address: string;
  category: string;
  currentlyServing: number;
  currentQueueNo: number;
  averageQueueSpeed: number;
  estimatedWaitTime: number;
  crowdDensity: number;
  bestTimeStart: string;
  bestTimeEnd: string;
}

interface ReportType {
  _id: string;
  user: {
    name: string;
    avatarUrl: string;
    level: string;
  };
  servingNumber: number;
  ownTokenNumber: number;
  queueLength: number;
  notes: string;
  photoEvidenceUrl: string;
  verifiedBy: string[];
  isVerified: boolean;
  createdAt: string;
}

export const DetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, saveLocationToggle, followLocationToggle, isAuthenticated } = useAuth();

  const [location, setLocation] = useState<LocationType | null>(null);
  const [reports, setReports] = useState<ReportType[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isSaved = user?.savedLocations?.includes(id || '') || false;
  const isFollowed = user?.followedLocations?.includes(id || '') || false;

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const locRes = await axios.get(`/locations/${id}`);
      setLocation(locRes.data);

      const repRes = await axios.get(`/queues/recent/${id}`);
      setReports(repRes.data);

      const anyRes = await axios.get(`/analytics/location/${id}`);
      setAnalytics(anyRes.data);
    } catch {
      // Mock Fallbacks for offline demo
      const mockLocation: LocationType = {
        _id: id,
        name: 'Passport Office Kolkata',
        address: 'Regional Head Office, Kolkata, WB',
        category: 'Passport Office',
        currentlyServing: 127,
        currentQueueNo: 185,
        averageQueueSpeed: 4.3,
        estimatedWaitTime: 245,
        crowdDensity: 85,
        bestTimeStart: '15:00',
        bestTimeEnd: '16:00'
      };
      setLocation(mockLocation);

      setReports([
        {
          _id: '1',
          user: {
            name: 'Alex Mercer',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
            level: 'Queue Expert'
          },
          servingNumber: 125,
          ownTokenNumber: 180,
          queueLength: 55,
          notes: 'Counter 3 is processing slowly. Long queues outside the gate.',
          photoEvidenceUrl: '',
          verifiedBy: ['user-1', 'user-2'],
          isVerified: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          user: {
            name: 'Priya Sharma',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya',
            level: 'Trusted Reporter'
          },
          servingNumber: 110,
          ownTokenNumber: 165,
          queueLength: 55,
          notes: 'Security check takes about 5 minutes per person.',
          photoEvidenceUrl: '',
          verifiedBy: ['user-3', 'user-4', 'user-5'],
          isVerified: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]);

      setAnalytics({
        historicalTrends: [
          { hour: '9A', density: 30 },
          { hour: '10A', density: 50 },
          { hour: '11A', density: 85 },
          { hour: '12P', density: 95 },
          { hour: '1P', density: 60 },
          { hour: '2P', density: 40 },
          { hour: '3P', density: 20 },
          { hour: '4P', density: 10 }
        ],
        weeklyTrends: [
          { day: 'Mon', waitTime: 220 },
          { day: 'Tue', waitTime: 245 },
          { day: 'Wed', waitTime: 180 },
          { day: 'Thu', waitTime: 260 },
          { day: 'Fri', waitTime: 280 },
          { day: 'Sat', waitTime: 110 },
          { day: 'Sun', waitTime: 50 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (reportId: string) => {
    try {
      await axios.post(`/queues/verify/${reportId}`);
      // Refresh
      fetchData();
    } catch {
      // Offline fallback: Increment verifications locally
      setReports(prev =>
        prev.map(rep => {
          if (rep._id === reportId) {
            const alreadyVerified = rep.verifiedBy.includes(user?.id || 'mock-user-alex');
            const updatedVerified = alreadyVerified
              ? rep.verifiedBy
              : [...rep.verifiedBy, user?.id || 'mock-user-alex'];
            const nextVerifiedStatus = updatedVerified.length >= 3;
            return {
              ...rep,
              verifiedBy: updatedVerified,
              isVerified: nextVerifiedStatus
            };
          }
          return rep;
        })
      );
    }
  };

  const formatWaitTime = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs}h`;
  };

  if (loading || !location) {
    return (
      <div className="flex justify-center items-center h-full py-xl text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[48px]">sync</span>
      </div>
    );
  }

  return (
    <div className="p-lg max-w-container-max mx-auto flex flex-col gap-lg pb-xl">
      {/* 1. HEADER / ACTIONS */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <button
            onClick={() => navigate('/app/map')}
            className="flex items-center gap-xs font-label-sm text-label-sm text-primary hover:underline cursor-pointer mb-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Map
          </button>
          <div className="flex items-center gap-sm flex-wrap">
            <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold">{location.name}</h1>
            <span className="inline-flex px-md py-xs rounded-full bg-surface-container border border-outline-variant font-label-sm text-label-sm font-semibold">
              {location.category}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{location.address}</p>
        </div>

        <div className="flex items-center gap-sm">
          {/* Bookmark Save */}
          <button
            onClick={() => saveLocationToggle(location._id)}
            className={`p-sm border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isSaved
                ? 'bg-primary-container text-on-primary-container border-primary'
                : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
            title="Save Location"
          >
            <span className={`material-symbols-outlined ${isSaved ? 'filled-icon' : ''}`}>bookmark</span>
          </button>

          {/* Follow Notification Alert */}
          <button
            onClick={() => followLocationToggle(location._id)}
            className={`p-sm border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isFollowed
                ? 'bg-primary-container text-on-primary-container border-primary'
                : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
            title="Follow Location Updates"
          >
            <span className={`material-symbols-outlined ${isFollowed ? 'filled-icon' : ''}`}>notifications_active</span>
          </button>

          <button
            onClick={() => navigate(`/app/report?loc=${location._id}`)}
            className="bg-primary text-on-primary font-label-md text-label-md py-sm px-xl rounded-xl hover:bg-primary-container transition-all cursor-pointer font-bold active:scale-95 shadow-sm"
          >
            Submit Report
          </button>
        </div>
      </div>

      {/* 2. METRICS OVERVIEW PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        {/* Estimated Wait */}
        <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm flex flex-col justify-between">
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Estimated Wait</div>
            <div className="font-display-lg text-headline-md md:text-display-lg text-on-surface font-black mt-xs">
              {formatWaitTime(location.estimatedWaitTime)}
            </div>
          </div>
          <div className="font-label-sm text-[10px] text-outline mt-sm">
            Based on {reports.length} user updates today
          </div>
        </div>

        {/* Currently Serving */}
        <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm flex flex-col justify-between">
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Currently Serving</div>
            <div className="font-display-lg text-headline-md md:text-display-lg text-on-surface font-black mt-xs">
              #{location.currentlyServing}
            </div>
          </div>
          <div className="font-label-sm text-[10px] text-outline mt-sm">
            Latest token called at counter
          </div>
        </div>

        {/* Current Queue No */}
        <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm flex flex-col justify-between">
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Latest Ticket</div>
            <div className="font-display-lg text-headline-md md:text-display-lg text-on-surface font-black mt-xs">
              #{location.currentQueueNo}
            </div>
          </div>
          <div className="font-label-sm text-[10px] text-outline mt-sm">
            People waiting: {Math.max(0, location.currentQueueNo - location.currentlyServing)}
          </div>
        </div>

        {/* Crowd Density */}
        <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm flex flex-col justify-between">
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Crowd Density</div>
            <div className="font-display-lg text-headline-md md:text-display-lg text-on-surface font-black mt-xs">
              {location.crowdDensity}%
            </div>
          </div>
          <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden mt-sm">
            <div
              className={`h-full rounded-full ${
                location.crowdDensity <= 30
                  ? 'bg-low-queue'
                  : location.crowdDensity <= 70
                  ? 'bg-medium-queue'
                  : 'bg-high-queue'
              }`}
              style={{ width: `${location.crowdDensity}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. BEST TIME WARNING BOX */}
      <div className="p-md bg-primary-container/10 border border-primary/20 rounded-2xl flex items-center gap-md">
        <span className="material-symbols-outlined text-primary text-[32px] filled-icon shrink-0">info</span>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface font-bold">Best Arrival Window</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Arrive between <strong className="text-on-surface">{location.bestTimeStart}</strong> and <strong className="text-on-surface">{location.bestTimeEnd}</strong> to bypass peak hours and save up to 1.5 hours of wait time.
          </p>
        </div>
      </div>

      {/* 4. ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Hourly Trend Bar Chart */}
        <div className="p-lg bg-surface border border-outline-variant rounded-3xl glass-panel shadow-sm flex flex-col gap-md">
          <div>
            <h3 className="font-label-md text-label-md text-on-surface font-bold">Hourly Congestion Index</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Estimated crowd capacity percentage per hour.</p>
          </div>
          <div className="h-64">
            {analytics?.historicalTrends && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.historicalTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="hour" stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--outline-variant)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--on-surface)' }}
                  />
                  <Bar dataKey="density" fill="var(--primary)" radius={[4, 4, 0, 0]} className="data-bar-enter" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weekly Wait times Line Chart */}
        <div className="p-lg bg-surface border border-outline-variant rounded-3xl glass-panel shadow-sm flex flex-col gap-md">
          <div>
            <h3 className="font-label-md text-label-md text-on-surface font-bold">Weekly Wait Patterns</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Average queue wait minutes across days of the week.</p>
          </div>
          <div className="h-64">
            {analytics?.weeklyTrends && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--outline-variant)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--on-surface)' }}
                  />
                  <Line type="monotone" dataKey="waitTime" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 5. COMMUNITY VERIFICATIONS FEED */}
      <div className="flex flex-col gap-md">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold px-xs">Community Updates</h3>
        
        <div className="flex flex-col gap-sm">
          {reports.map(rep => (
            <div
              key={rep._id}
              className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm flex justify-between gap-md flex-wrap items-start relative"
            >
              <div className="flex gap-md">
                <img
                  src={rep.user.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-outline-variant"
                />
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center gap-xs flex-wrap">
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">{rep.user.name}</span>
                    <span className="font-label-sm text-[10px] text-primary uppercase font-bold">
                      ({rep.user.level})
                    </span>
                    {rep.isVerified && (
                      <span className="inline-flex px-sm py-[2px] rounded bg-green-500/10 text-green-500 font-label-sm text-[10px] font-bold border border-green-500/20 items-center gap-xs">
                        <span className="material-symbols-outlined text-[12px] filled-icon">verified</span>
                        Verified Report
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-md font-label-sm text-label-sm text-on-surface-variant flex-wrap">
                    <span>Serving: <strong>#{rep.servingNumber}</strong></span>
                    <span>Latest Ticket: <strong>#{rep.ownTokenNumber}</strong></span>
                    <span>People in line: <strong>{rep.queueLength}</strong></span>
                  </div>

                  {rep.notes && (
                    <p className="font-body-sm text-body-sm text-on-surface mt-xs italic bg-surface-container-low p-sm rounded-lg border border-outline-variant/30">
                      "{rep.notes}"
                    </p>
                  )}
                  
                  {rep.photoEvidenceUrl && (
                    <div className="mt-sm max-w-xs rounded-xl overflow-hidden border border-outline-variant shadow-sm">
                      <img src={rep.photoEvidenceUrl} alt="Queue evidence" className="w-full object-cover" />
                    </div>
                  )}

                  {/* Verification list */}
                  <div className="flex items-center gap-xs font-label-sm text-[10px] text-on-surface-variant mt-sm">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    <span>Verified by {rep.verifiedBy.length} users</span>
                  </div>
                </div>
              </div>

              {/* Action Upvote Verification */}
              <div className="self-end md:self-center shrink-0">
                <button
                  onClick={() => handleVerify(rep._id)}
                  disabled={rep.verifiedBy.includes(user?.id || 'mock-user-alex')}
                  className={`py-xs px-md rounded-lg font-label-sm text-label-sm font-bold flex items-center gap-xs active:scale-95 transition-all cursor-pointer ${
                    rep.verifiedBy.includes(user?.id || 'mock-user-alex')
                      ? 'bg-surface-container-high border border-outline-variant text-outline cursor-not-allowed'
                      : 'bg-primary text-on-primary hover:bg-primary-container shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                  {rep.verifiedBy.includes(user?.id || 'mock-user-alex') ? 'Verified' : 'Correct (+5 XP)'}
                </button>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="p-lg bg-surface border border-outline-dashed border-outline-variant rounded-2xl text-center py-xl">
              <span className="material-symbols-outlined text-outline text-[48px] mb-xs">rate_review</span>
              <p className="font-body-md text-body-md text-on-surface">No updates for this location yet.</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs mb-sm">Be the first to submit a queue status report!</p>
              <button
                onClick={() => navigate(`/app/report?loc=${location._id}`)}
                className="font-label-md text-label-md bg-primary text-on-primary py-xs px-md rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
              >
                Submit First Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
