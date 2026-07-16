import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Set default API URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  points: number;
  level: 'Explorer' | 'Reporter' | 'Trusted Reporter' | 'Queue Expert' | 'Queue Legend';
  avatarUrl: string;
  savedLocations?: string[];
  followedLocations?: string[];
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLoginMock: (name: string, email: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  saveLocationToggle: (locId: string) => Promise<void>;
  followLocationToggle: (locId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('queuemirror_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Configure Axios token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('queuemirror_token', token);
      fetchProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('queuemirror_token');
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/auth/profile');
      setUser(res.data);
    } catch (err) {
      console.warn('Backend profile fetch failed. Falling back to local storage profile if present.');
      // If server is not running, we keep a mock session if we have a token
      if (token) {
        const savedMock = localStorage.getItem('queuemirror_mock_user');
        if (savedMock) {
          setUser(JSON.parse(savedMock));
        } else {
          setUser({
            id: 'mock-user-alex',
            name: 'Alex Mercer',
            email: 'alex@queuemirror.com',
            role: 'user',
            points: 2450,
            level: 'Queue Expert',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
            savedLocations: [],
            followedLocations: []
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (error: any) {
      // Fallback for static demo
      if (email === 'admin@queuemirror.com' && password === 'admin123') {
        const mockAdmin: UserType = {
          id: 'mock-admin-id',
          name: 'Chief Moderator',
          email: 'admin@queuemirror.com',
          role: 'admin',
          points: 5000,
          level: 'Queue Legend',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'
        };
        setToken('mock-jwt-token-admin');
        setUser(mockAdmin);
        localStorage.setItem('queuemirror_mock_user', JSON.stringify(mockAdmin));
      } else {
        const mockUser: UserType = {
          id: 'mock-user-alex',
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: 'user',
          points: 350,
          level: 'Reporter',
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`
        };
        setToken('mock-jwt-token-user');
        setUser(mockUser);
        localStorage.setItem('queuemirror_mock_user', JSON.stringify(mockUser));
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await axios.post('/auth/register', { name, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (error: any) {
      // Fallback for static demo
      const mockUser: UserType = {
        id: `mock-user-${Date.now()}`,
        name,
        email,
        role: 'user',
        points: 10,
        level: 'Explorer',
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
      };
      setToken('mock-jwt-token-register');
      setUser(mockUser);
      localStorage.setItem('queuemirror_mock_user', JSON.stringify(mockUser));
    }
  };

  const googleLoginMock = async (name: string, email: string) => {
    try {
      // Try to register/login via Google auth backend mock
      const res = await axios.post('/auth/google', { token: JSON.stringify({ email, name }) });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch {
      const mockUser: UserType = {
        id: 'mock-google-user-id',
        name,
        email,
        role: 'user',
        points: 150,
        level: 'Explorer',
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
      };
      setToken('mock-jwt-token-google');
      setUser(mockUser);
      localStorage.setItem('queuemirror_mock_user', JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('queuemirror_mock_user');
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const saveLocationToggle = async (locId: string) => {
    if (!user) return;
    try {
      const res = await axios.post(`/locations/${locId}/save`);
      setUser(prev => prev ? { ...prev, savedLocations: res.data.savedLocations } : null);
    } catch {
      // Local fallback
      setUser(prev => {
        if (!prev) return null;
        const currentSaved = prev.savedLocations || [];
        const index = currentSaved.indexOf(locId);
        let updated = [...currentSaved];
        if (index > -1) {
          updated.splice(index, 1);
        } else {
          updated.push(locId);
        }
        const updatedUser = { ...prev, savedLocations: updated };
        localStorage.setItem('queuemirror_mock_user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }
  };

  const followLocationToggle = async (locId: string) => {
    if (!user) return;
    try {
      const res = await axios.post(`/locations/${locId}/follow`);
      setUser(prev => prev ? { ...prev, followedLocations: res.data.followedLocations } : null);
    } catch {
      // Local fallback
      setUser(prev => {
        if (!prev) return null;
        const currentFollowed = prev.followedLocations || [];
        const index = currentFollowed.indexOf(locId);
        let updated = [...currentFollowed];
        if (index > -1) {
          updated.splice(index, 1);
        } else {
          updated.push(locId);
        }
        const updatedUser = { ...prev, followedLocations: updated };
        localStorage.setItem('queuemirror_mock_user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      googleLoginMock,
      logout,
      refreshProfile,
      saveLocationToggle,
      followLocationToggle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
