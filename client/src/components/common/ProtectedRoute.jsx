import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Shows full-screen spinner while auth loads
const LoadingScreen = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading EventFlow...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const redirectMap = { admin: '/admin', organizer: '/organizer', attendee: '/dashboard' };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    const redirectMap = { admin: '/admin', organizer: '/organizer', attendee: '/dashboard' };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return children;
};
