import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('eventflow_user');
    const token = localStorage.getItem('eventflow_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // Validate token with backend
      authService
        .getMe()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('eventflow_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('eventflow_token');
          localStorage.removeItem('eventflow_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('eventflow_token', token);
    localStorage.setItem('eventflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem('eventflow_token', token);
    localStorage.setItem('eventflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem('eventflow_token');
    localStorage.removeItem('eventflow_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('eventflow_user', JSON.stringify(updatedUser));
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authService.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch {}
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    notifications,
    unreadCount,
    fetchNotifications,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer',
    isAttendee: user?.role === 'attendee',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
