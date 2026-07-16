import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { ThemeToggle } from '../components/ThemeToggle.js';
import { AuthModal } from '../components/AuthModal.js';
import axios from 'axios';

interface LocationType {
  _id: string;
  name: string;
  category: string;
  estimatedWaitTime: number;
  crowdDensity: number;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [searchVal, setSearchVal] = useState('');
  const [systemStats, setSystemStats] = useState({
    activeLocations: 6,
    reportsSubmitted: 185,
    hoursSaved: 8400,
    activeUsers: 1200
  });

  // Fetch initial locations and global stats
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const locRes = await axios.get('/locations');
      setLocations(locRes.data.slice(0, 3)); // show top 3 on landing page
    } catch {
      // Mock Fallbacks
      setLocations([
        {
          _id: 'seed-kolkata-passport',
          name: 'Passport Office Kolkata',
          category: 'Passport Office',
          estimatedWaitTime: 245,
          crowdDensity: 85
        },
        {
          _id: 'seed-central-hospital',
          name: 'Central Gen Hospital ER',
          category: 'Hospital',
          estimatedWaitTime: 105,
          crowdDensity: 80
        },
        {
          _id: 'seed-first-bank',
          name: 'First National Bank',
          category: 'Bank',
          estimatedWaitTime: 25,
          crowdDensity: 50
        }
      ]);
    }

    try {
      const statsRes = await axios.get('/analytics/dashboard-stats');
      setSystemStats(statsRes.data);
    } catch {
      // Keep initial mocks
    }
  };

  const getSemanticColor = (waitMinutes: number) => {
    if (waitMinutes <= 15) return 'text-low-queue bg-green-500/10 border-green-500/20';
    if (waitMinutes <= 45) return 'text-medium-queue bg-amber-500/10 border-amber-500/20';
    if (waitMinutes <= 120) return 'text-high-queue bg-red-500/10 border-red-500/20';
    return 'text-critical-queue bg-red-700/10 border-red-700/20';
  };

  const formatWaitTime = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs}h`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/app/map?search=${encodeURIComponent(searchVal)}`);
    } else {
      navigate('/app/map');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container">
      {/* 1. STICKY TOPBAR */}
      <header className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur border-b border-outline-variant h-16 flex items-center justify-between px-lg max-w-container-max mx-auto glass-panel">
        <div className="flex items-center gap-md select-none">
          <Link to="/" className="w-10 h-10 rounded flex items-center justify-center active:scale-95 transition-transform">
            <img src="/logo.png" alt="QueueMirror Logo" className="w-full h-full object-contain rounded" />
          </Link>
          <span className="font-headline-sm text-headline-sm font-black text-on-surface">QueueMirror</span>
        </div>

        <div className="flex items-center gap-md">
          {isAuthenticated && (
            <Link
              to="/app/dashboard"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/app/map"
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            Live Map
          </Link>
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-sm">
              <div
                className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer"
                onClick={() => navigate('/app/dashboard')}
              >
                <img src={user?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={logout}
                className="font-label-md text-label-md bg-surface border border-outline-variant text-on-surface px-md py-xs rounded-lg hover:bg-surface-container-high transition-colors font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="font-label-md text-label-md bg-primary text-on-primary px-lg py-[8px] rounded-lg hover:bg-primary-container transition-all font-bold shadow-sm active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 px-lg max-w-container-max mx-auto text-center flex flex-col items-center">
        {/* Background Gradients for glacier theme styling */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[100px] pointer-events-none opacity-50 dark:opacity-100"></div>

        <div className="inline-flex items-center gap-xs px-md py-xs bg-surface-container-low border border-outline-variant rounded-full text-primary font-label-sm text-label-sm font-semibold mb-lg shadow-sm">
          <span className="material-symbols-outlined text-[16px] animate-pulse">radar</span>
          Crowd-Powered Intelligence System v1.0
        </div>

        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface font-extrabold max-w-3xl leading-tight mb-md">
          Know The Wait <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Before You Go</span>
        </h1>
        
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-xl">
          QueueMirror collects real-time crowd metrics, calculates predictive wait speeds, and lets you bypass long lines at physical service centers.
        </p>

        {/* Hero Search Box */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg flex items-center relative mb-lg">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Search passport offices, banks, ER centers..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant text-on-surface rounded-full py-md pl-[52px] pr-32 font-body-md text-body-md shadow-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-outline"
          />
          <button
            type="submit"
            className="absolute right-[6px] top-1/2 -translate-y-1/2 bg-primary text-on-primary font-label-md text-label-md px-lg py-[10px] rounded-full hover:bg-primary-container transition-all active:scale-95 cursor-pointer font-bold shadow-sm"
          >
            Find Lines
          </button>
        </form>

        <div className="flex gap-md mt-sm">
          <button
            onClick={() => navigate('/app/map')}
            className="font-label-md text-label-md bg-surface border border-outline-variant hover:bg-surface-container-high text-on-surface px-xl py-sm rounded-xl transition-all cursor-pointer font-bold flex items-center gap-sm active:scale-95"
          >
            <span className="material-symbols-outlined">map</span>
            Explore Live Map
          </button>
        </div>
      </section>

      {/* 3. SYSTEM STATS ROW */}
      <section className="py-md border-y border-outline-variant bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-lg grid grid-cols-2 md:grid-cols-4 gap-md text-center">
          <div className="p-sm">
            <div className="font-display-lg text-headline-md md:text-display-lg text-primary font-black">
              {systemStats.activeLocations}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs font-semibold">Tracked Zones</div>
          </div>
          <div className="p-sm">
            <div className="font-display-lg text-headline-md md:text-display-lg text-primary font-black">
              {systemStats.reportsSubmitted}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs font-semibold">Reports Submitted</div>
          </div>
          <div className="p-sm">
            <div className="font-display-lg text-headline-md md:text-display-lg text-primary font-black">
              {systemStats.hoursSaved}+
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs font-semibold">Hours Saved</div>
          </div>
          <div className="p-sm">
            <div className="font-display-lg text-headline-md md:text-display-lg text-primary font-black">
              {systemStats.activeUsers}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs font-semibold">Active Reporters</div>
          </div>
        </div>
      </section>

      {/* 4. BENTO GRID FEATURES */}
      <section className="py-xl px-lg max-w-container-max mx-auto w-full">
        <div className="text-center mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">Advanced Queue Intelligence</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Powered by crowdsourced data telemetry and real-time processing simulation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* Card 1: Wait Time Predictions */}
          <div className="p-lg bg-surface border border-outline-variant rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-md glass-panel group">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px] filled-icon">query_stats</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Predictive Wait Times</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">
              Simulation engine computes wait minutes by evaluating token numbers, ticket speeds, historical patterns, and time-of-day peak congestion profiles.
            </p>
          </div>

          {/* Card 2: Interactive Live Maps */}
          <div className="p-lg bg-surface border border-outline-variant rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-md glass-panel group">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]">explore</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Live Traffic Density</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">
              Navigate your region using our Leaflet-backed interactive map. Filter by categories (Hospitals, Passport Offices, Banks) and check real-time color markers.
            </p>
          </div>

          {/* Card 3: Gamified Contributions */}
          <div className="p-lg bg-surface border border-outline-variant rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-md glass-panel group">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px] filled-icon">military_tech</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Community Reputations</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">
              Earn XP points (+10 per report, +5 per verification) to level up from Explorer to Queue Legend. Get highlighted on your regional leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* 5. LIVE LOCATIONS TABLE PREVIEW */}
      <section className="py-xl px-lg max-w-container-max mx-auto w-full bg-surface-container-low border border-outline-variant rounded-3xl glass-panel mb-xl">
        <div className="flex justify-between items-center flex-wrap gap-md mb-lg px-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Active Line Intelligence</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Real-time status updates reported by active queue participants.</p>
          </div>
          <button
            onClick={() => navigate('/app/map')}
            className="font-label-md text-label-md text-primary hover:underline flex items-center gap-xs font-semibold cursor-pointer"
          >
            See All Locations
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="flex flex-col gap-sm">
          {locations.map(loc => (
            <div
              key={loc._id}
              onClick={() => navigate(`/app/location/${loc._id}`)}
              className="p-md bg-surface border border-outline-variant rounded-2xl hover:border-primary transition-all flex items-center justify-between flex-wrap gap-md cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">
                    {loc.category === 'Hospital'
                      ? 'emergency'
                      : loc.category === 'Bank'
                      ? 'account_balance'
                      : loc.category === 'Passport Office'
                      ? 'passkey'
                      : 'domain'}
                  </span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors">
                    {loc.name}
                  </h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{loc.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-xl flex-wrap">
                <div className="text-right">
                  <div className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Estimated Wait</div>
                  <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-xs">
                    {formatWaitTime(loc.estimatedWaitTime)}
                  </div>
                </div>

                <div>
                  <span className={`inline-flex px-md py-xs rounded-full border font-label-sm text-label-sm font-semibold ${getSemanticColor(loc.estimatedWaitTime)}`}>
                    {loc.estimatedWaitTime <= 15
                      ? 'Low Wait'
                      : loc.estimatedWaitTime <= 45
                      ? 'Medium Wait'
                      : loc.estimatedWaitTime <= 120
                      ? 'High Wait'
                      : 'Critical Wait'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto py-lg border-t border-outline-variant bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-lg flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-sm">
            <img src="/logo.png" alt="QueueMirror Logo" className="w-6 h-6 object-contain rounded" />
            <span className="font-headline-sm text-headline-sm text-on-surface font-black">QueueMirror</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant ml-sm">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex gap-lg font-label-sm text-label-sm text-on-surface-variant">
            <Link to="/app/map" className="hover:text-primary transition-colors">Live Map</Link>
            <Link to="/app/leaderboard" className="hover:text-primary transition-colors">Leaderboards</Link>
            <span className="text-outline">Know The Wait Before You Go</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
