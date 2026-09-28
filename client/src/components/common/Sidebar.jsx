import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Settings, LogOut,
  Star, Ticket, History, PlusCircle, BarChart2,
  Shield, Tag, ClipboardList, Activity, User,
  ScanLine, DollarSign, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const attendeeLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/events', icon: Calendar, label: 'Browse Events' },
  { to: '/my-registrations', icon: Ticket, label: 'My Tickets' },
  { to: '/event-history', icon: History, label: 'Event History' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const organizerLinks = [
  { to: '/organizer', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/organizer/events', icon: Calendar, label: 'My Events' },
  { to: '/organizer/create-event', icon: PlusCircle, label: 'Create Event' },
  { to: '/organizer/scan', icon: ScanLine, label: 'Scan QR / Check-in' },
  { to: '/organizer/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/organizer/reviews', icon: Star, label: 'Reviews' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/registrations', icon: ClipboardList, label: 'Registrations' },
  { to: '/admin/analytics', icon: Activity, label: 'Analytics' },
  { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = { admin: adminLinks, organizer: organizerLinks, attendee: attendeeLinks }[user?.role] || [];
  const roleColors = { admin: 'var(--error)', organizer: 'var(--accent)', attendee: 'var(--primary-light)' };

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    navigate('/');
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          <div className="logo" style={{ fontSize: '1.25rem' }}>EventFlow</div>
          {onClose && (
            <button
              onClick={onClose}
              className="sidebar-close-btn"
              aria-label="Close navigation menu"
            >
              &times;
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="avatar avatar-md" style={{ background: 'var(--gradient-primary)', flexShrink: 0 }}>
            {user?.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <span className="badge" style={{ background: `${roleColors[user?.role]}20`, color: roleColors[user?.role], fontSize: '11px', padding: '2px 8px', marginTop: '2px' }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }}>
        <p className="sidebar-section-label">Navigation</p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={handleLinkClick}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0 12px 20px' }}>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '10px 16px', cursor: 'pointer', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
