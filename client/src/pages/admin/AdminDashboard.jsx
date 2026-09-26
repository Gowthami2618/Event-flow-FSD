import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, TrendingUp, AlertCircle, CheckCircle, Activity, ArrowRight, Shield } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container" style={{ minHeight: '400px' }}>
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {};
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers || 0, color: 'var(--primary)', icon: Users, link: '/admin/users' },
    { label: 'Total Events', value: stats.totalEvents || 0, color: 'var(--secondary)', icon: Calendar, link: '/admin/events' },
    { label: 'Registrations', value: stats.totalRegistrations || 0, color: 'var(--success)', icon: TrendingUp, link: '/admin/registrations' },
    { label: 'Pending Approval', value: stats.pendingEvents || 0, color: 'var(--accent)', icon: AlertCircle, link: '/admin/events?status=pending' },
  ];

  const userByRole = data?.usersByRole?.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}) || {};
  const eventByStatus = data?.eventsByStatus?.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}) || {};

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px' }}>
          <p style={{ marginBottom: '4px', fontWeight: 600 }}>{label}</p>
          {payload.map((p) => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/events?status=pending" className="btn btn-primary">
            <CheckCircle size={16} /> Review Events ({stats.pendingEvents || 0})
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: '32px' }}>
        {statCards.map(({ label, value, color, icon: Icon, link }) => (
          <Link key={label} to={link} className="stat-card" style={{ textDecoration: 'none' }}>
            <div className="stat-icon" style={{ background: `${color}20`, color }}>
              <Icon size={22} />
            </div>
            <div>
              <div className="stat-value">{value.toLocaleString()}</div>
              <div className="stat-label">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: '32px', alignItems: 'start' }}>
        {/* Registration Trend */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Registration Trend (7 days)</h2>
          {data?.regTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.regTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={customTooltip} />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 4 }} name="Registrations" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ minHeight: '160px' }}><Activity size={28} /><p style={{ fontSize: '13px' }}>No data yet</p></div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Platform Summary</h2>
          <div className="space-y-4">
            <div style={{ padding: '14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Users by Role</div>
              {[['admin', 'var(--error)'], ['organizer', 'var(--accent)'], ['attendee', 'var(--primary-light)']].map(([role, color]) => (
                <div key={role} className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{role}s</span>
                  <span style={{ fontWeight: 700, color }}>{userByRole[role] || 0}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Events by Status</div>
              {[['approved', 'var(--success)'], ['pending', 'var(--accent)'], ['draft', 'var(--text-muted)'], ['rejected', 'var(--error)']].map(([status, color]) => (
                <div key={status} className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{status}</span>
                  <span style={{ fontWeight: 700, color }}>{eventByStatus[status] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Activity</h2>
          <Link to="/admin/audit-logs" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-light)' }}>
            View All <ArrowRight size={13} />
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Resource</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentLogs || []).map((log) => (
                <tr key={log._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--primary-light)', background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{log.user?.name || 'System'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.user?.role}</div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{log.resource || '—'}</td>
                  <td><span className={`badge badge-${log.status === 'success' ? 'success' : 'error'}`}>{log.status}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.recentLogs?.length && (
            <div className="empty-state"><Shield size={28} /><p style={{ fontSize: '13px' }}>No activity logs yet</p></div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
