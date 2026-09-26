import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User, Settings, LayoutDashboard, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout, notifications, unreadCount, fetchNotifications } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('eventflow_theme') || 'light');
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eventflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath = { admin: '/admin', organizer: '/organizer', attendee: '/dashboard' }[user?.role] || '/';

  return (
    <nav className="navbar" style={{ justifyContent: 'space-between' }}>
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="btn btn-ghost btn-sm"
            style={{ display: 'none', padding: '8px' }}
            id="sidebar-toggle"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <Link to="/" className="logo">EventFlow</Link>
      </div>

      {/* Center nav links (public) */}
      {!user && (
        <div className="flex items-center gap-2" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Link to="/events" className="btn btn-ghost btn-sm">Browse Events</Link>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ padding: '8px', color: 'var(--text-primary)' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Warm Rose Light Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <>
            {/* Notifications */}
            <div className="dropdown" ref={notifRef}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative', padding: '8px' }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '2px', right: '2px',
                    background: 'var(--error)', color: '#fff', borderRadius: '50%',
                    width: '16px', height: '16px', fontSize: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="dropdown-menu" style={{ width: '320px', right: 0, left: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '14px' }}>
                    Notifications {unreadCount > 0 && <span className="badge badge-error" style={{ marginLeft: 8 }}>{unreadCount}</span>}
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        No notifications yet
                      </div>
                    ) : (
                      [...notifications].reverse().slice(0, 10).map((n) => (
                        <div key={n._id} className="dropdown-item" style={{
                          background: n.isRead ? 'transparent' : 'rgba(124,58,237,0.05)',
                          borderLeft: n.isRead ? 'none' : '3px solid var(--primary)',
                          paddingLeft: n.isRead ? '16px' : '13px',
                        }}>
                          <span style={{ fontSize: '13px', color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                            {n.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="dropdown" ref={userRef}>
              <button
                className="flex items-center gap-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', transition: 'all var(--transition-fast)' }}
              >
                <div className="avatar avatar-sm" style={{ fontSize: '12px', background: 'var(--gradient-primary)' }}>
                  {user.avatar ? (
                    <img src={`http://localhost:5000${user.avatar}`} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    user.name?.[0]?.toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name?.split(' ')[0]}
                </span>
                <span className={`badge badge-${user.role === 'admin' ? 'error' : user.role === 'organizer' ? 'warning' : 'primary'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {user.role}
                </span>
                <ChevronDown size={14} />
              </button>

              {showUserMenu && (
                <div className="dropdown-menu">
                  <Link to={dashboardPath} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <User size={15} /> Profile
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <Settings size={15} /> Settings
                  </Link>
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                  <div className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={15} /> Logout
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
