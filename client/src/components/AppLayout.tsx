import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { ThemeToggle } from './ThemeToggle.js';
import { AuthModal } from './AuthModal.js';
import axios from 'axios';

interface NotificationType {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const AppLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch notifications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch {
      // Mock notifications
      setNotifications([
        {
          _id: '1',
          title: 'Alert: High Queue at Passport Office',
          message: 'Estimated wait is now 4h 05m with high congestion.',
          type: 'queue_alert',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Verification Accepted',
          message: 'Your report for Central Station was verified. +20 XP!',
          type: 'followed_update',
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // Debounced search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`/locations/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
      } catch {
        // Mock filter search
        const mockLocs = [
          { _id: 'seed-kolkata-passport', name: 'Passport Office Kolkata', category: 'Passport Office' },
          { _id: 'seed-central-hospital', name: 'Central Gen Hospital ER', category: 'Hospital' },
          { _id: 'seed-first-bank', name: 'First National Bank', category: 'Bank' }
        ];
        setSearchResults(mockLocs.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())));
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { label: 'Dashboard', path: '/app/dashboard', icon: 'dashboard' },
    { label: 'Live Map', path: '/app/map', icon: 'map' },
    { label: 'Leaderboard', path: '/app/leaderboard', icon: 'emoji_events' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background relative">
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex flex-col p-md z-40 fixed left-0 top-0 h-full w-64 border-r border-outline-variant bg-surface-container-low text-primary font-label-md text-label-md select-none glass-panel">
        <div className="mb-xl flex items-center gap-md px-md pt-sm">
          <Link to="/" className="w-10 h-10 rounded flex items-center justify-center active:scale-95 transition-transform">
            <img src="/logo.png" alt="QueueMirror Logo" className="w-full h-full object-contain rounded" />
          </Link>
          <div>
            <Link to="/" className="font-headline-sm text-headline-sm font-black text-on-surface hover:text-primary">
              QueueMirror
            </Link>
            <div className="font-label-sm text-label-sm text-on-surface-variant">Enterprise Intelligence</div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/app/report')}
          className="mb-lg w-full bg-primary text-on-primary rounded-lg py-sm px-md flex justify-center items-center gap-sm font-label-md text-label-md elevation-1 hover:bg-primary/95 hover:shadow-md transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span className="material-symbols-outlined filled-icon">add</span>
          Report Queue
        </button>

        {/* Navigation links */}
        <nav className="flex flex-col gap-xs flex-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 border-l-4 ${
                isActive(link.path)
                  ? 'bg-secondary-container text-on-secondary-container border-primary font-bold shadow-sm'
                  : 'text-on-surface-variant border-transparent hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive(link.path) ? 'filled-icon' : ''}`}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          ))}
          
          {user?.role === 'admin' && (
            <Link
              to="/app/admin"
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 border-l-4 ${
                isActive('/app/admin')
                  ? 'bg-secondary-container text-on-secondary-container border-primary font-bold'
                  : 'text-on-surface-variant border-transparent hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User Card at Bottom of Sidebar */}
        <div className="pt-md border-t border-outline-variant flex items-center justify-between">
          {isAuthenticated ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-sm">
                <img
                  src={user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-outline-variant object-cover"
                />
                <div>
                  <div className="font-label-sm text-label-sm font-semibold text-on-surface truncate max-w-[120px]">{user?.name}</div>
                  <div className="font-label-sm text-[10px] text-primary uppercase font-bold">{user?.level}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-on-surface-variant hover:text-error p-xs rounded hover:bg-surface-container-high cursor-pointer"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high py-sm rounded-lg flex items-center justify-center gap-xs font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="relative flex flex-col p-md w-64 bg-surface border-r border-outline-variant h-full z-10 glass-panel animate-slide-right">
            <div className="mb-xl flex items-center gap-md px-md pt-sm justify-between">
              <div className="flex items-center gap-md">
                <img src="/logo.png" alt="QueueMirror" className="w-8 h-8 object-contain rounded" />
                <div className="font-headline-sm text-headline-sm font-black text-on-surface">QueueMirror</div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/app/report');
              }}
              className="mb-lg w-full bg-primary text-on-primary rounded-lg py-sm px-md flex justify-center items-center gap-sm font-label-md text-label-md font-bold active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
              Report Queue
            </button>

            <nav className="flex flex-col gap-xs flex-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-md px-md py-sm rounded-lg border-l-4 ${
                    isActive(link.path)
                      ? 'bg-secondary-container text-on-secondary-container border-primary font-bold'
                      : 'text-on-surface-variant border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/app/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-md px-md py-sm rounded-lg border-l-4 ${
                    isActive('/app/admin')
                      ? 'bg-secondary-container text-on-secondary-container border-primary font-bold'
                      : 'text-on-surface-variant border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            <div className="pt-md border-t border-outline-variant">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <img src={user?.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-label-sm text-label-sm font-semibold text-on-surface">{user?.name}</div>
                      <div className="font-label-sm text-[10px] text-primary uppercase font-bold">{user?.level}</div>
                    </div>
                  </div>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-on-surface-variant">
                    <span className="material-symbols-outlined">logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }}
                  className="w-full bg-primary text-on-primary py-sm rounded-lg flex items-center justify-center gap-xs font-semibold"
                >
                  <span className="material-symbols-outlined">login</span>
                  Sign In
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT CANVAS */}
      <div className="flex-1 flex flex-col md:ml-64 h-full overflow-hidden relative">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto bg-surface border-b border-outline-variant shadow-sm z-30 h-16 shrink-0 relative glass-panel">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-on-surface-variant p-xs hover:bg-surface-container-low rounded-full mr-md cursor-pointer active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Search bar on left */}
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for a location or service..."
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-full py-[6px] pl-xl pr-md font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-outline"
            />
            {/* Search autocomplete dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-xs bg-surface border border-outline-variant rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto p-xs glass-panel">
                {searchResults.map(result => (
                  <button
                    key={result._id}
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      navigate(`/app/location/${result._id}`);
                    }}
                    className="w-full text-left p-sm hover:bg-surface-container-low rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-label-sm text-label-sm text-on-surface font-bold group-hover:text-primary">
                        {result.name}
                      </div>
                      <div className="font-label-sm text-[10px] text-on-surface-variant">
                        {result.category}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trailing actions */}
          <div className="flex items-center gap-md ml-md">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-colors cursor-pointer active:scale-95 transition-transform relative"
              >
                <span className="material-symbols-outlined">notifications</span>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface animate-pulse"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-md w-80 bg-surface border border-outline-variant rounded-xl shadow-xl z-50 p-sm glass-panel max-h-[400px] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-outline-variant pb-xs mb-xs px-xs">
                    <span className="font-label-md text-label-md text-on-surface font-bold">Notifications</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
                    >
                      Read All
                    </button>
                  </div>
                  <div className="flex flex-col gap-xs">
                    {notifications.length === 0 ? (
                      <div className="text-center py-lg font-body-sm text-body-sm text-on-surface-variant">
                        No notifications.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          className={`p-sm rounded-lg flex flex-col gap-xs border-l-4 transition-colors ${
                            n.read
                              ? 'bg-transparent border-transparent'
                              : 'bg-primary-container/10 border-primary'
                          }`}
                        >
                          <div className="font-label-sm text-label-sm text-on-surface font-bold leading-tight">{n.title}</div>
                          <div className="font-body-sm text-[11px] text-on-surface-variant leading-snug">{n.message}</div>
                          <span className="font-label-sm text-[9px] text-outline self-end">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            {isAuthenticated ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('/app/dashboard')}>
                <img
                  src={user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-primary text-on-primary font-label-md text-label-md px-md py-xs rounded-lg hover:bg-primary-container transition-all flex items-center gap-xs active:scale-95 cursor-pointer font-semibold shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
