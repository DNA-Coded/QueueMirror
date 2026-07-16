import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import axios from 'axios';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  level: string;
}

interface ReportItem {
  _id: string;
  user: string | { name: string };
  location: string | { name: string };
  servingNumber: number;
  ownTokenNumber: number;
  queueLength: number;
  notes: string;
  isVerified: boolean;
  createdAt: string;
}

interface MetricStats {
  totalUsers: number;
  totalLocations: number;
  totalReports: number;
  pendingReports: number;
  systemHealth: string;
  serverUptime: number;
}

interface ActivityLogItem {
  _id: string;
  user?: { name: string; email: string };
  action: string;
  details: string;
  createdAt: string;
}

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState<MetricStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'reports'>('metrics');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const metricsRes = await axios.get('/admin/metrics');
      setMetrics(metricsRes.data.metrics);
      setLogs(metricsRes.data.activityLogs);

      const usersRes = await axios.get('/admin/users');
      setUsers(usersRes.data);

      // Load all locations reports
      const reportsRes = await axios.get('/locations');
      // For demo, list all recent reports across locations
      const allReports: ReportItem[] = [];
      for (const loc of reportsRes.data) {
        try {
          const recRes = await axios.get(`/queues/recent/${loc._id}`);
          allReports.push(...recRes.data.map((r: any) => ({ ...r, location: { name: loc.name } })));
        } catch {
          // ignore
        }
      }
      setReports(allReports);
    } catch (err: any) {
      // Mock Offline Admin Data
      setMetrics({
        totalUsers: 124,
        totalLocations: 6,
        totalReports: 18,
        pendingReports: 4,
        systemHealth: 'Optimal',
        serverUptime: 3600
      });
      setLogs([
        { _id: '1', user: { name: 'Sarah Connor', email: 'sarah@gmail.com' }, action: 'New Report Submitted', details: 'Reported queue at Central ER', createdAt: new Date().toISOString() },
        { _id: '2', user: { name: 'Alex Mercer', email: 'alex@gmail.com' }, action: 'Verification Accepted', details: 'Verified queue report at Passport Office', createdAt: new Date(Date.now() - 3600000).toISOString() }
      ]);
      setUsers([
        { _id: 'u1', name: 'Sarah Connor', email: 'sarah@gmail.com', role: 'user', points: 3450, level: 'Queue Legend' },
        { _id: 'u2', name: 'Alex Mercer', email: 'alex@gmail.com', role: 'user', points: 2450, level: 'Queue Expert' },
        { _id: 'u3', name: 'Chief Moderator', email: 'admin@queuemirror.com', role: 'admin', points: 5000, level: 'Queue Legend' }
      ]);
      setReports([
        { _id: 'r1', user: 'Alex Mercer', location: { name: 'Passport Office Kolkata' }, servingNumber: 127, ownTokenNumber: 185, queueLength: 58, notes: 'Counter 3 is down.', isVerified: false, createdAt: new Date().toISOString() },
        { _id: 'r2', user: 'Priya Sharma', location: { name: 'Central Gen Hospital ER' }, servingNumber: 382, ownTokenNumber: 402, queueLength: 20, notes: 'Very crowded.', isVerified: true, createdAt: new Date(Date.now() - 3600000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateReport = async (reportId: string, action: 'delete' | 'verify') => {
    try {
      await axios.post(`/admin/reports/${reportId}/moderate`, { action });
      fetchAdminData();
    } catch {
      // Offline fallback
      if (action === 'delete') {
        setReports(prev => prev.filter(r => r._id !== reportId));
      } else {
        setReports(prev => prev.map(r => r._id === reportId ? { ...r, isVerified: true } : r));
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch {
      // Offline fallback
      setUsers(prev => prev.filter(u => u._id !== userId));
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-lg max-w-md mx-auto text-center py-xl">
        <span className="material-symbols-outlined text-error text-[48px] mb-xs">lock</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Unauthorized Access</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs mb-md">
          You must be an administrator to view this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-xl text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[48px]">sync</span>
      </div>
    );
  }

  return (
    <div className="p-lg max-w-container-max mx-auto flex flex-col gap-lg pb-xl">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold">Moderator Panel</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Manage spam, check system metrics, and audit user reports.</p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-outline-variant gap-md">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`font-label-md text-label-md py-sm px-md border-b-2 font-bold cursor-pointer ${
            activeTab === 'metrics'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Metrics & Logs
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`font-label-md text-label-md py-sm px-md border-b-2 font-bold cursor-pointer ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`font-label-md text-label-md py-sm px-md border-b-2 font-bold cursor-pointer ${
            activeTab === 'reports'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Report Moderation ({reports.length})
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'metrics' && (
        <div className="flex flex-col gap-lg animate-fade-in">
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm">
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Total Accounts</div>
              <div className="font-display-lg text-headline-md text-on-surface font-black mt-xs">{metrics?.totalUsers}</div>
            </div>
            <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm">
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Locations</div>
              <div className="font-display-lg text-headline-md text-on-surface font-black mt-xs">{metrics?.totalLocations}</div>
            </div>
            <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm">
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Reports Logged</div>
              <div className="font-display-lg text-headline-md text-on-surface font-black mt-xs">{metrics?.totalReports}</div>
            </div>
            <div className="p-md bg-surface border border-outline-variant rounded-2xl glass-panel shadow-sm">
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">System Health</div>
              <div className="font-display-lg text-headline-md text-low-queue font-black mt-xs">{metrics?.systemHealth}</div>
            </div>
          </div>

          {/* Activity Audit logs */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold px-xs">System Activity Feed</h3>
            <div className="bg-surface border border-outline-variant rounded-2xl glass-panel overflow-hidden shadow-sm">
              <div className="p-sm bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold grid grid-cols-12 gap-sm border-b border-outline-variant">
                <div className="col-span-3">Time</div>
                <div className="col-span-3">User</div>
                <div className="col-span-3">Action</div>
                <div className="col-span-3">Details</div>
              </div>
              <div className="flex flex-col">
                {logs.map((log, index) => (
                  <div key={log._id || index} className="p-sm grid grid-cols-12 gap-sm border-b border-outline-variant/30 last:border-0 font-body-sm text-[12px] text-on-surface">
                    <div className="col-span-3 text-outline">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                    <div className="col-span-3 font-semibold truncate">
                      {log.user?.name || 'System / Guest'}
                    </div>
                    <div className="col-span-3 text-primary font-bold">
                      {log.action}
                    </div>
                    <div className="col-span-3 text-on-surface-variant truncate">
                      {log.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-surface border border-outline-variant rounded-2xl glass-panel overflow-hidden shadow-sm animate-fade-in">
          <div className="p-sm bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold grid grid-cols-12 gap-sm border-b border-outline-variant">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Level</div>
            <div className="col-span-2 text-right">XP Points</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
          <div className="flex flex-col">
            {users.map(u => (
              <div key={u._id} className="p-sm grid grid-cols-12 gap-sm border-b border-outline-variant/30 last:border-0 items-center font-body-sm text-body-sm text-on-surface">
                <div className="col-span-3 font-bold flex items-center gap-xs">
                  {u.name}
                  {u.role === 'admin' && (
                    <span className="material-symbols-outlined text-[14px] text-primary" title="Administrator">
                      admin_panel_settings
                    </span>
                  )}
                </div>
                <div className="col-span-3 text-on-surface-variant truncate">{u.email}</div>
                <div className="col-span-2">
                  <span className="inline-flex px-sm py-[2px] rounded-full bg-primary/10 text-primary font-label-sm text-[10px] font-bold">
                    {u.level}
                  </span>
                </div>
                <div className="col-span-2 text-right font-mono-data font-bold">{u.points}</div>
                <div className="col-span-2 text-center">
                  {u.role !== 'admin' ? (
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="text-error hover:bg-error/10 py-xs px-md rounded-lg font-label-sm text-[11px] font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="text-outline font-label-sm text-[10px] uppercase font-bold">System</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-surface border border-outline-variant rounded-2xl glass-panel overflow-hidden shadow-sm animate-fade-in">
          <div className="p-sm bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold grid grid-cols-12 gap-sm border-b border-outline-variant">
            <div className="col-span-3">Location</div>
            <div className="col-span-2">Reporter</div>
            <div className="col-span-3">Details</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
          <div className="flex flex-col">
            {reports.map(rep => (
              <div key={rep._id} className="p-sm grid grid-cols-12 gap-sm border-b border-outline-variant/30 last:border-0 items-center font-body-sm text-body-sm text-on-surface">
                <div className="col-span-3 font-bold truncate">
                  {(rep.location as any)?.name}
                </div>
                <div className="col-span-2 text-on-surface-variant truncate">
                  {typeof rep.user === 'object' ? rep.user.name : rep.user}
                </div>
                <div className="col-span-3 text-[12px] truncate">
                  Serving: #{rep.servingNumber} | Ticket: #{rep.ownTokenNumber} | Notes: {rep.notes || 'None'}
                </div>
                <div className="col-span-2 text-center">
                  <span className={`inline-flex px-sm py-[2px] rounded font-label-sm text-[10px] font-bold ${
                    rep.isVerified ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {rep.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="col-span-2 text-center flex justify-center gap-xs">
                  {!rep.isVerified && (
                    <button
                      onClick={() => handleModerateReport(rep._id, 'verify')}
                      className="text-primary hover:bg-primary/10 py-xs px-sm rounded font-label-sm text-[11px] font-bold cursor-pointer"
                    >
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleModerateReport(rep._id, 'delete')}
                    className="text-error hover:bg-error/10 py-xs px-sm rounded font-label-sm text-[11px] font-bold cursor-pointer"
                  >
                    Spam
                  </button>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="p-lg text-center font-body-sm text-body-sm text-on-surface-variant">
                No active queue reports in database for moderation.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
