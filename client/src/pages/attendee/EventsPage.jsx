import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Clock, Users, Star, X } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { eventService } from '../../services';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '', category: '', eventType: '', isFree: '', city: '', page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    eventService.getEvents({ ...params, limit: 12 })
      .then(res => {
        setEvents(res.data.events || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => {
    eventService.getPublicCategories()
      .then(res => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  const update = (key) => (e) => setFilters(prev => ({ ...prev, [key]: e.target.value, page: 1 }));
  const clearFilters = () => setFilters({ search: '', category: '', eventType: '', isFree: '', city: '', page: 1 });

  const hasFilters = filters.search || filters.category || filters.eventType || filters.isFree || filters.city;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Browse Events</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {total > 0 ? `${total.toLocaleString()} events found` : 'Discover amazing events near you'}
          </p>

          {/* Search bar */}
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <div className="search-container" style={{ flex: 1, minWidth: '260px' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search events, categories, locations..."
                value={filters.search}
                onChange={update('search')}
                style={{ minWidth: 'unset' }}
              />
            </div>
            <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={15} /> Filters {hasFilters && <span className="badge badge-primary" style={{ padding: '1px 6px', fontSize: '10px' }}>ON</span>}
            </button>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="grid grid-4" style={{ marginTop: '16px', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={filters.category} onChange={update('category')}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select className="form-input" value={filters.eventType} onChange={update('eventType')}>
                  <option value="">All Types</option>
                  <option value="in-person">In Person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pricing</label>
                <select className="form-input" value={filters.isFree} onChange={update('isFree')}>
                  <option value="">All Prices</option>
                  <option value="true">Free</option>
                  <option value="false">Paid</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" className="form-input" placeholder="e.g. New York" value={filters.city} onChange={update('city')} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div className="grid grid-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div className="skeleton" style={{ height: '200px' }} />
                <div style={{ padding: '20px' }}>
                  <div className="skeleton" style={{ height: '16px', marginBottom: '8px', width: '70%' }} />
                  <div className="skeleton" style={{ height: '14px', marginBottom: '6px', width: '50%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state" style={{ minHeight: '300px' }}>
            <div className="empty-state-icon"><Calendar size={32} /></div>
            <p style={{ fontWeight: 700, fontSize: '16px' }}>No events found</p>
            <p style={{ fontSize: '14px' }}>Try adjusting your search or filters</p>
            {hasFilters && <button className="btn btn-primary btn-sm" style={{ marginTop: '8px' }} onClick={clearFilters}>Clear Filters</button>}
          </div>
        ) : (
          <>
            <div className="grid grid-auto">
              {events.map((event) => (
                <Link to={`/events/${event._id}`} key={event._id} className="event-card" style={{ textDecoration: 'none' }}>
                  {event.coverImage ? (
                    <img src={`http://localhost:5000${event.coverImage}`} alt={event.title} className="event-card-image" />
                  ) : (
                    <div className="event-card-image-placeholder">
                      <Calendar size={48} style={{ opacity: 0.3 }} />
                    </div>
                  )}
                  {event.isFeatured && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                      <span className="badge badge-warning" style={{ fontSize: '11px' }}><Star size={9} /> Featured</span>
                    </div>
                  )}
                  <div className="event-card-body">
                    {event.category && (
                      <span className="badge badge-primary" style={{ marginBottom: '8px', fontSize: '11px' }}>{event.category.name}</span>
                    )}
                    <h3 className="event-card-title">{event.title}</h3>
                    <div className="event-card-meta">
                      <div className="event-card-meta-item">
                        <Clock size={13} />
                        {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      {event.venue?.city && (
                        <div className="event-card-meta-item">
                          <MapPin size={13} />
                          {event.venue.city}{event.venue.country ? `, ${event.venue.country}` : ''}
                        </div>
                      )}
                      {event.eventType === 'online' && (
                        <div className="event-card-meta-item">
                          <span className="badge badge-info" style={{ fontSize: '10px' }}>Online</span>
                        </div>
                      )}
                    </div>
                    <div className="event-card-footer">
                      <div>
                        {event.isFree ? (
                          <span className="badge badge-success">Free</span>
                        ) : event.ticketTypes?.[0]?.price ? (
                          <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '15px' }}>${event.ticketTypes[0].price}</span>
                        ) : (
                          <span className="badge badge-secondary">Paid</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {event.averageRating > 0 && (
                          <span className="flex items-center gap-1"><Star size={11} style={{ color: 'var(--accent)' }} /> {event.averageRating}</span>
                        )}
                        <span className="flex items-center gap-1"><Users size={11} /> {event.registeredCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={filters.page <= 1} onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}>←</button>
                {[...Array(pages)].map((_, i) => (
                  <button key={i} className={`page-btn${filters.page === i + 1 ? ' active' : ''}`} onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}>
                    {i + 1}
                  </button>
                ))}
                <button className="page-btn" disabled={filters.page >= pages} onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}>→</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
