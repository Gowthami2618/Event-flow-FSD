import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, Users, Eye, TrendingUp, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services';

const statusConfig = {
  draft: { color: 'var(--text-muted)', bg: 'var(--bg-card)', icon: Clock, badge: 'secondary' },
  pending: { color: 'var(--accent)', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle, badge: 'warning' },
  approved: { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, badge: 'success' },
  rejected: { color: 'var(--error)', bg: 'rgba(239,68,68,0.1)', icon: XCircle, badge: 'error' },
  cancelled: { color: 'var(--error)', bg: 'rgba(239,68,68,0.1)', icon: XCircle, badge: 'error' },
  completed: { color: 'var(--text-secondary)', bg: 'var(--bg-card)', icon: CheckCircle, badge: 'secondary' },
};

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getMyEvents({ limit: 20 })
      .then(res => setEvents(res.data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
  const totalViews = events.reduce((sum, e) => sum + (e.analytics?.views || 0), 0);
  const approved = events.filter(e => e.status === 'approved').length;
  const pending = events.filter(e => e.status === 'pending').length;

  const stats = [
    { label: 'Total Events', value: events.length, color: 'var(--primary)', icon: Calendar },
    { label: 'Registrations', value: totalRegistrations, color: 'var(--success)', icon: Users },
    { label: 'Total Views', value: totalViews, color: 'var(--secondary)', icon: Eye },
    { label: 'Active Events', value: approved, color: 'var(--accent)', icon: TrendingUp },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizer Dashboard</h1>
          <p className="page-subtitle">Manage your events and track performance</p>
        </div>
        <Link to="/organizer/create-event" className="btn btn-primary">
          <PlusCircle size={16} /> Create Event
        </Link>
      </div>

      {pending > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
          <AlertCircle size={16} />
          You have <strong>{pending}</strong> event(s) pending approval. We'll notify you once reviewed.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '32px' }}>
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20`, color }}>
              <Icon size={22} />
            </div>
            <div>
              <div className="stat-value">{loading ? '—' : value.toLocaleString()}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Events Table */}
      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>My Events</h2>
          <Link to="/organizer/events" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-light)' }}>
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Calendar size={28} /></div>
            <p style={{ fontWeight: 600 }}>No events yet</p>
            <p style={{ fontSize: '13px' }}>Create your first event to get started</p>
            <Link to="/organizer/create-event" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
              <PlusCircle size={14} /> Create Event
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Registrations</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 8).map((event) => {
                  const cfg = statusConfig[event.status] || statusConfig.draft;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={event._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{event.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{event.eventType}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${cfg.badge}`}>
                          <StatusIcon size={10} /> {event.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {new Date(event.startDate).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 600 }}>{event.registeredCount || 0}</span>
                          {event.maxAttendees && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ {event.maxAttendees}</span>
                          )}
                        </div>
                        {event.maxAttendees && (
                          <div className="progress-bar" style={{ marginTop: '4px', width: '80px' }}>
                            <div className="progress-fill" style={{ width: `${Math.min((event.registeredCount / event.maxAttendees) * 100, 100)}%` }} />
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {(event.analytics?.views || 0).toLocaleString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link to={`/organizer/events/${event._id}/edit`} className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>Edit</Link>
                          <Link to={`/events/${event._id}`} className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}><Eye size={12} /></Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
