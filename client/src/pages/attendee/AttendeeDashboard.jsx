import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Clock, Star, ArrowRight, MapPin } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { registrationService, eventService } from '../../services';

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      registrationService.getMyRegistrations({ limit: 5 }),
      eventService.getEvents({ limit: 6, sort: 'startDate' }),
    ]).then(([regRes, evRes]) => {
      setRegistrations(regRes.data.registrations || []);
      setUpcomingEvents(evRes.data.events || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const confirmed = registrations.filter(r => r.status === 'confirmed').length;
  const attended = registrations.filter(r => r.status === 'attended').length;
  const upcoming = registrations.filter(r => r.status === 'confirmed' && new Date(r.event?.startDate) > new Date()).length;

  const stats = [
    { label: 'Total Registrations', value: registrations.length, color: 'var(--primary)', icon: Ticket },
    { label: 'Confirmed', value: confirmed, color: 'var(--success)', icon: Calendar },
    { label: 'Upcoming', value: upcoming, color: 'var(--secondary)', icon: Clock },
    { label: 'Attended', value: attended, color: 'var(--accent)', icon: Star },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your events</p>
        </div>
        <Link to="/events" className="btn btn-primary">
          <Calendar size={16} /> Browse Events
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '32px' }}>
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20`, color }}>
              <Icon size={22} />
            </div>
            <div>
              <div className="stat-value">{loading ? '—' : value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Recent Registrations */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>My Upcoming Tickets</h2>
            <Link to="/my-registrations" className="btn btn-ghost btn-sm" style={{ fontSize: '13px', color: 'var(--primary-light)' }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Ticket size={28} /></div>
              <p style={{ fontWeight: 600 }}>No registrations yet</p>
              <p style={{ fontSize: '13px' }}>Browse events and register for something exciting!</p>
              <Link to="/events" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>Browse Events</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.slice(0, 4).map((reg) => (
                <div key={reg._id} className="flex items-center gap-3" style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={18} style={{ color: 'var(--primary-light)' }} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg.event?.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {reg.event?.startDate ? new Date(reg.event.startDate).toLocaleDateString() : 'Date TBD'}
                    </div>
                  </div>
                  <span className={`badge badge-${reg.status === 'confirmed' ? 'success' : reg.status === 'cancelled' ? 'error' : 'secondary'}`} style={{ fontSize: '11px' }}>
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discover Events */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Discover Events</h2>
            <Link to="/events" className="btn btn-ghost btn-sm" style={{ fontSize: '13px', color: 'var(--primary-light)' }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingEvents.slice(0, 4).map((event) => (
              <Link key={event._id} to={`/events/${event._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', transition: 'all var(--transition-fast)', textDecoration: 'none' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                  {event.coverImage ? (
                    <img src={`http://localhost:5000${event.coverImage}`} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={18} style={{ color: 'var(--primary-light)' }} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{event.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={10} /> {event.venue?.city || 'Online'}
                  </div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: event.isFree ? 'var(--success)' : 'var(--primary-light)' }}>
                  {event.isFree ? 'Free' : event.ticketTypes?.[0]?.price ? `$${event.ticketTypes[0].price}` : 'View'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendeeDashboard;
