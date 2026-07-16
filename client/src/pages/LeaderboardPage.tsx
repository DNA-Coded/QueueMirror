import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import axios from 'axios';

interface LeaderType {
  _id: string;
  name: string;
  avatarUrl: string;
  points: number;
  level: string;
  role: string;
}

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderType[]>([]);
  const [userRank, setUserRank] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/leaderboard');
      setLeaders(res.data.leaderboard);
      setUserRank(res.data.userRank);
    } catch {
      // Mock Leaders
      const mockLeaders: LeaderType[] = [
        {
          _id: 'l1',
          name: 'Sarah Connor',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
          points: 3450,
          level: 'Queue Legend',
          role: 'user'
        },
        {
          _id: 'l2',
          name: 'Chief Moderator',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin',
          points: 2900,
          level: 'Queue Expert',
          role: 'admin'
        },
        {
          _id: 'mock-user-alex',
          name: user?.name || 'Alex Mercer',
          avatarUrl: user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
          points: user?.points || 2450,
          level: user?.level || 'Queue Expert',
          role: 'user'
        },
        {
          _id: 'l4',
          name: 'Vikram Singh',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram',
          points: 1850,
          level: 'Trusted Reporter',
          role: 'user'
        },
        {
          _id: 'l5',
          name: 'Priya Sharma',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya',
          points: 1200,
          level: 'Trusted Reporter',
          role: 'user'
        }
      ];
      setLeaders(mockLeaders);
      setUserRank(3);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-xl text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[48px]">sync</span>
      </div>
    );
  }

  return (
    <div className="p-lg max-w-2xl mx-auto flex flex-col gap-lg pb-xl">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold">Contribution Standings</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Compare points with regional line reporters. Level up to earn badges.</p>
      </div>

      {/* User's position standing overview card */}
      {user && (
        <div className="p-md bg-primary-container/10 border border-primary/20 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-sm">
            <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-primary/40" />
            <div>
              <div className="font-label-md text-label-md text-on-surface font-bold">Your Standing</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">{user.level}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-headline-sm text-headline-sm text-primary font-black">Rank #{userRank > 0 ? userRank : 'N/A'}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">{user.points} XP total</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table/List */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden glass-panel shadow-sm">
        <div className="p-md border-b border-outline-variant bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold grid grid-cols-12 gap-sm">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Contributor</div>
          <div className="col-span-4 text-right">XP Points</div>
        </div>

        <div className="flex flex-col">
          {leaders.map((leader, index) => {
            const rank = index + 1;
            const isSelf = leader._id === user?.id || (leader.name === user?.name && user?.name);

            return (
              <div
                key={leader._id}
                className={`p-md grid grid-cols-12 gap-sm items-center border-b border-outline-variant/30 last:border-0 transition-colors ${
                  isSelf ? 'bg-primary-container/5 font-bold' : ''
                }`}
              >
                {/* Rank Podium styling */}
                <div className="col-span-2 text-center flex justify-center">
                  {rank === 1 ? (
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">1</span>
                  ) : rank === 2 ? (
                    <span className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">2</span>
                  ) : rank === 3 ? (
                    <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">3</span>
                  ) : (
                    <span className="font-mono-data text-body-sm text-on-surface-variant">{rank}</span>
                  )}
                </div>

                {/* Contributor Profile */}
                <div className="col-span-6 flex items-center gap-sm">
                  <img
                    src={leader.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-outline-variant object-cover"
                  />
                  <div className="truncate">
                    <div className="font-label-md text-label-md text-on-surface truncate flex items-center gap-xs">
                      {leader.name}
                      {leader.role === 'admin' && (
                        <span className="material-symbols-outlined text-[14px] text-primary" title="Administrator/Moderator">
                          admin_panel_settings
                        </span>
                      )}
                    </div>
                    <div className="font-label-sm text-[10px] text-on-surface-variant font-medium">
                      {leader.level}
                    </div>
                  </div>
                </div>

                {/* Total Points */}
                <div className="col-span-4 text-right">
                  <span className="font-mono-data text-body-sm text-on-surface font-bold">
                    {leader.points.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
