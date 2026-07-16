import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import axios from 'axios';

interface SavedLocationType {
  _id: string;
  name: string;
  category: string;
  estimatedWaitTime: number;
  crowdDensity: number;
}

interface ActivityType {
  _id: string;
  action: string;
  details: string;
  pointsEarned: number;
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  const { user, logout, saveLocationToggle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [savedLocations, setSavedLocations] = useState<SavedLocationType[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  // If not authenticated, redirect to map or show guest placeholder
  useEffect(() => {
    if (!isAuthenticated) {
      // For demo, we don't force redirect, but we can load mock data if guest
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch followed/saved locations
      if (user?.id) {
        const res = await axios.get('/locations');
        // Filter based on saved list
        const userSavedIds = user.savedLocations || [];
        
        // If user saved list is empty, let's show 2 mock saved items for demo aesthetic!
        if (userSavedIds.length === 0) {
          setSavedLocations(res.data.slice(0, 2));
        } else {
          setSavedLocations(res.data.filter((l: any) => userSavedIds.includes(l._id)));
        }

        // Fetch activity logs
        try {
          const actRes = await axios.get('/admin/metrics'); // Admin gets logs, or user timeline
          setActivities(actRes.data.activityLogs.filter((l: any) => l.user === user.id));
        } catch {
          // Mock activities timeline
          setActivities([
            {
              _id: '1',
              action: 'New Report Submitted',
              details: 'Reported queue at Passport Office Kolkata.',
              pointsEarned: 10,
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              action: 'Verification Bonus',
              details: 'Your report for Passport Office was verified by 3 users.',
              pointsEarned: 20,
              createdAt: new Date(Date.now() - 7200000).toISOString()
            },
            {
              _id: '3',
              action: 'Verified Report',
              details: 'Verified another user\'s report at Central Gen Hospital ER.',
              pointsEarned: 5,
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              _id: '4',
              action: 'New Zone Bonus',
              details: 'Discovered a new queue zone: First National Bank.',
              pointsEarned: 50,
              createdAt: new Date(Date.now() - 259200000).toISOString()
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getXPProgress = () => {
    const points = user?.points || 0;
    if (points >= 3000) return 100;
    if (points >= 2000) return ((points - 2000) / 1000) * 100;
    if (points >= 1000) return ((points - 1000) / 1000) * 100;
    if (points >= 300) return ((points - 300) / 700) * 100;
    return (points / 300) * 100;
  };

  const getNextLevelXP = () => {
    const points = user?.points || 0;
    if (points >= 3000) return 'Max Level';
    if (points >= 2000) return '3000 XP (Queue Legend)';
    if (points >= 1000) return '2000 XP (Queue Expert)';
    if (points >= 300) return '1000 XP (Trusted Reporter)';
    return '300 XP (Reporter)';
  };

  const formatWaitTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs}h`;
  };

  const getSemanticColor = (waitMinutes: number) => {
    if (waitMinutes <= 15) return 'text-low-queue bg-green-500/10 border-green-500/20';
    if (waitMinutes <= 45) return 'text-medium-queue bg-amber-500/10 border-amber-500/20';
    if (waitMinutes <= 120) return 'text-high-queue bg-red-500/10 border-red-500/20';
    return 'text-critical-queue bg-red-700/10 border-red-700/20';
  };

  const getAvatarUrl = () => {
    return user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex';
  };

  return (
    <div className="p-lg max-w-container-max mx-auto flex flex-col gap-lg pb-xl">
      {/* 1. WELCOME HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold">Overview</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Track your lines, reputation logs, and level standings.</p>
        </div>
      </div>

      {/* 2. PROFILE CARD */}
      <div className="p-lg bg-surface border border-outline-variant rounded-2xl glass-panel flex flex-col md:flex-row gap-lg items-center shadow-sm">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shrink-0">
          <img src={getAvatarUrl()} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 w-full flex flex-col gap-xs">
          <div className="flex items-center gap-sm flex-wrap">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {user?.name || 'Alex Mercer'}
            </h2>
            <span className="inline-flex px-md py-xs rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold uppercase">
              {user?.level || 'Queue Expert'}
            </span>
            <span className="font-label-sm text-label-sm text-primary font-bold">
              Rank #3 in City
            </span>
          </div>
          
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {user?.email || 'alex.mercer@queuemirror.com'}
          </p>

          {/* XP Progress Bar */}
          <div className="mt-sm">
            <div className="flex justify-between font-label-sm text-label-sm mb-xs">
              <span className="text-on-surface font-bold">{user?.points || 2450} XP</span>
              <span className="text-on-surface-variant">Next Milestone: {getNextLevelXP()}</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${getXPProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex gap-sm w-full md:w-auto">
          <button
            onClick={() => navigate('/app/report')}
            className="flex-grow md:flex-grow-0 bg-primary text-on-primary font-label-md text-label-md py-sm px-xl rounded-xl hover:bg-primary-container transition-all cursor-pointer font-bold active:scale-95 text-center"
          >
            New Report
          </button>
        </div>
      </div>

      {/* 3. BENTO STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm">
          <span className="material-symbols-outlined text-primary text-[28px] filled-icon mb-xs">checklist</span>
          <div className="font-display-lg text-headline-md text-on-surface font-black mt-xs">45</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant font-medium">Reports Submitted</div>
          <div className="font-label-sm text-[10px] text-primary mt-xs font-bold">+450 XP Earned</div>
        </div>

        <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm">
          <span className="material-symbols-outlined text-primary text-[28px] mb-xs">task_alt</span>
          <div className="font-display-lg text-headline-md text-on-surface font-black mt-xs">120</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant font-medium">Verifications Submitted</div>
          <div className="font-label-sm text-[10px] text-primary mt-xs font-bold">+600 XP Earned</div>
        </div>

        <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm">
          <span className="material-symbols-outlined text-primary text-[28px] filled-icon mb-xs">hourglass_empty</span>
          <div className="font-display-lg text-headline-md text-on-surface font-black mt-xs">142h</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant font-medium">Hours Saved For Others</div>
          <div className="font-label-sm text-[10px] text-primary mt-xs font-bold">142,000 community impact</div>
        </div>

        <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm">
          <span className="material-symbols-outlined text-primary text-[28px] filled-icon mb-xs">verified</span>
          <div className="font-display-lg text-headline-md text-on-surface font-black mt-xs">98%</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant font-medium">Reputation Accuracy</div>
          <div className="font-label-sm text-[10px] text-primary mt-xs font-bold">Highly Trusted Contributor</div>
        </div>
      </div>

      {/* 4. MAIN LAYOUT: FOLLOWED LOCATIONS & ACTIVITY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Column: Followed/Saved Locations */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          <div className="flex justify-between items-center px-xs">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Saved Queue Intelligence</h3>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{savedLocations.length} locations saved</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {savedLocations.map(loc => (
              <div
                key={loc._id}
                onClick={() => navigate(`/app/location/${loc._id}`)}
                className="p-md bg-surface border border-outline-variant rounded-2xl hover:border-primary transition-all cursor-pointer group flex flex-col justify-between h-40 shadow-sm hover:shadow-md glass-panel relative overflow-hidden"
              >
                {loc.estimatedWaitTime >= 60 && (
                  <div className="absolute top-0 right-0 bg-error text-on-error font-label-sm text-[10px] py-[2px] px-sm font-bold uppercase tracking-wider rounded-bl-lg flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[12px] filled-icon">warning</span>
                    High Delay Alert
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-label-sm text-label-sm text-primary font-semibold">{loc.category}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveLocationToggle(loc._id);
                      }}
                      className="text-on-surface-variant hover:text-error transition-colors p-xs rounded cursor-pointer"
                      title="Unsave location"
                    >
                      <span className="material-symbols-outlined text-[20px] filled-icon">bookmark</span>
                    </button>
                  </div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors mt-xs truncate">
                    {loc.name}
                  </h4>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Live Wait Time</div>
                    <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-xs">
                      {formatWaitTime(loc.estimatedWaitTime)}
                    </div>
                  </div>
                  <span className={`px-md py-xs rounded-full border font-label-sm text-label-sm font-semibold ${getSemanticColor(loc.estimatedWaitTime)}`}>
                    {loc.estimatedWaitTime <= 15 ? 'Low Line' : loc.estimatedWaitTime <= 45 ? 'Medium Line' : 'High Line'}
                  </span>
                </div>
              </div>
            ))}

            {savedLocations.length === 0 && (
              <div className="col-span-2 p-lg bg-surface border border-outline-dashed border-outline-variant rounded-2xl text-center py-xl">
                <span className="material-symbols-outlined text-outline text-[48px] mb-xs">bookmark_border</span>
                <p className="font-body-md text-body-md text-on-surface">No saved locations yet.</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs mb-sm">Follow locations on the map to monitor wait times here.</p>
                <button
                  onClick={() => navigate('/app/map')}
                  className="font-label-md text-label-md bg-primary text-on-primary py-xs px-md rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Browse Live Map
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="flex flex-col gap-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold px-xs">Recent Contributions</h3>
          
          <div className="p-lg bg-surface border border-outline-variant rounded-2xl glass-panel flex flex-col gap-md shadow-sm relative timeline-line h-fit">
            {activities.map((act, index) => (
              <div key={act._id || index} className="flex gap-md relative z-10 timeline-item">
                <div className="w-10 h-10 rounded-full bg-primary-container border border-outline-variant flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined text-[20px] filled-icon">
                    {act.action.includes('Report') ? 'rate_review' : act.action.includes('Verify') ? 'task_alt' : 'award_star'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-xs flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-xs">
                    <span className="font-label-sm text-label-sm text-on-surface font-bold leading-tight">{act.action}</span>
                    <span className="font-label-sm text-[10px] text-primary bg-primary/10 px-sm py-[2px] rounded-full font-bold">
                      +{act.pointsEarned} XP
                    </span>
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant leading-snug">{act.details}</p>
                  <span className="font-label-sm text-[9px] text-outline self-end">
                    {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-center py-lg font-body-sm text-body-sm text-on-surface-variant">
                No recent activity. Submitting queue wait times will log contributions here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
