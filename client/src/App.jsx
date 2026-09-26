import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';
import BotanicalBackground from './components/common/BotanicalBackground';
import GridDistortionBackground from './components/common/GridDistortionBackground';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Attendee
const AttendeeDashboard = lazy(() => import('./pages/attendee/AttendeeDashboard'));
const EventsPage = lazy(() => import('./pages/attendee/EventsPage'));

// Organizer
const OrganizerDashboard = lazy(() => import('./pages/organizer/OrganizerDashboard'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Fallback loader
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading...</p>
    </div>
  </div>
);

// Placeholder page for routes not yet fully built
const ComingSoon = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
    <div style={{ fontSize: '3rem' }}>🚧</div>
    <h2 style={{ color: 'var(--text-primary)' }}>{title}</h2>
    <p style={{ fontSize: '14px' }}>This page is under construction</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <GridDistortionBackground />
        <BotanicalBackground />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventsPage />} />

            {/* Auth routes (redirect if logged in) */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Attendee routes */}
            <Route path="/dashboard" element={<ProtectedRoute roles={['attendee']}><AttendeeDashboard /></ProtectedRoute>} />
            <Route path="/my-registrations" element={<ProtectedRoute roles={['attendee']}><ComingSoon title="My Tickets" /></ProtectedRoute>} />
            <Route path="/event-history" element={<ProtectedRoute roles={['attendee']}><ComingSoon title="Event History" /></ProtectedRoute>} />

            {/* Organizer routes */}
            <Route path="/organizer" element={<ProtectedRoute roles={['organizer']}><OrganizerDashboard /></ProtectedRoute>} />
            <Route path="/organizer/events" element={<ProtectedRoute roles={['organizer']}><ComingSoon title="My Events" /></ProtectedRoute>} />
            <Route path="/organizer/create-event" element={<ProtectedRoute roles={['organizer']}><ComingSoon title="Create Event" /></ProtectedRoute>} />
            <Route path="/organizer/events/:id/edit" element={<ProtectedRoute roles={['organizer']}><ComingSoon title="Edit Event" /></ProtectedRoute>} />
            <Route path="/organizer/scan" element={<ProtectedRoute roles={['organizer']}><ComingSoon title="QR Scanner" /></ProtectedRoute>} />
            <Route path="/organizer/analytics" element={<ProtectedRoute roles={['organizer']}><ComingSoon title="Analytics" /></ProtectedRoute>} />
            <Route path="/organizer/reviews" element={<ProtectedRoute roles={['organizer']}><ComingSoon title="Reviews" /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><ComingSoon title="User Management" /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute roles={['admin']}><ComingSoon title="Event Management" /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><ComingSoon title="Categories" /></ProtectedRoute>} />
            <Route path="/admin/registrations" element={<ProtectedRoute roles={['admin']}><ComingSoon title="Registrations" /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><ComingSoon title="Platform Analytics" /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['admin']}><ComingSoon title="Audit Logs" /></ProtectedRoute>} />

            {/* Shared */}
            <Route path="/profile" element={<ProtectedRoute><ComingSoon title="Profile" /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ComingSoon title="Settings" /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
