import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Star, Zap, MapPin, Clock, ArrowRight, Shield, Cpu, Music, Briefcase, Heart, Dumbbell } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { eventService } from '../services';

const categoryIcons = { Technology: Cpu, Music, Business: Briefcase, 'Health & Wellness': Heart, 'Sports & Fitness': Dumbbell };

const LandingPage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [stats] = useState({ events: '2,400+', attendees: '120K+', cities: '50+', rating: '4.9' });

  useEffect(() => {
    eventService.getEvents({ limit: 6, sort: '-analytics.views' })
      .then(res => setFeaturedEvents(res.data.events || []))
      .catch(() => {});
  }, []);

  const features = [
    { icon: Calendar, title: 'Smart Event Discovery', desc: 'Find events tailored to your interests with powerful search and filters.', color: 'var(--primary)' },
    { icon: Shield, title: 'Secure Registration', desc: 'One-click registration with digital tickets and QR code check-in.', color: 'var(--secondary)' },
    { icon: Users, title: 'Community Building', desc: 'Connect with like-minded attendees and build lasting networks.', color: 'var(--success)' },
    { icon: Star, title: 'Verified Reviews', desc: 'Real reviews from verified attendees to help you choose the best events.', color: 'var(--accent)' },
  ];

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* HERO */}
      <section className="hero" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="badge badge-primary" style={{ display: 'inline-flex', marginBottom: '20px', padding: '6px 16px', fontSize: '13px' }}>
            <Zap size={12} /> The Future of Event Management
          </div>

          <h1 className="heading-xl" style={{ marginBottom: '24px', lineHeight: 1.1 }}>
            Discover, Create &{' '}
            <span className="text-gradient">Manage Events</span>{' '}
            Like Never Before
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            EventFlow connects passionate organizers with eager attendees. From intimate workshops to massive conferences — your perfect event awaits.
          </p>

          <div className="flex items-center justify-center gap-3" style={{ flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary btn-lg">
              <Calendar size={18} /> Explore Events <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              <Users size={18} /> Start Organizing
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6" style={{ marginTop: '60px', flexWrap: 'wrap' }}>
            {[
              { value: stats.events, label: 'Events Created' },
              { value: stats.attendees, label: 'Happy Attendees' },
              { value: stats.cities, label: 'Cities Covered' },
              { value: stats.rating, label: 'Average Rating' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      {featuredEvents.length > 0 && (
        <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="heading-md">Featured Events</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Curated picks for the discerning attendee</p>
              </div>
              <Link to="/events" className="btn btn-secondary">View All Events <ArrowRight size={14} /></Link>
            </div>

            <div className="grid grid-auto">
              {featuredEvents.map((event) => (
                <Link to={`/events/${event._id}`} key={event._id} className="event-card" style={{ textDecoration: 'none' }}>
                  {event.coverImage ? (
                    <img src={`http://localhost:5000${event.coverImage}`} alt={event.title} className="event-card-image" />
                  ) : (
                    <div className="event-card-image-placeholder">
                      <Calendar size={48} style={{ opacity: 0.4 }} />
                    </div>
                  )}
                  {event.isFeatured && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                      <span className="badge badge-warning"><Star size={10} /> Featured</span>
                    </div>
                  )}
                  <div className="event-card-body">
                    {event.category && (
                      <span className="badge badge-primary" style={{ marginBottom: '8px', fontSize: '11px' }}>
                        {event.category.name}
                      </span>
                    )}
                    <h3 className="event-card-title">{event.title}</h3>
                    <div className="event-card-meta">
                      <div className="event-card-meta-item">
                        <Clock size={13} />
                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {event.venue?.city && (
                        <div className="event-card-meta-item">
                          <MapPin size={13} />
                          {event.venue.city}
                          {event.venue.country ? `, ${event.venue.country}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="event-card-footer">
                      <div>
                        {event.isFree ? (
                          <span className="badge badge-success">Free</span>
                        ) : event.ticketTypes?.[0]?.price ? (
                          <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>${event.ticketTypes[0].price}</span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        <Users size={12} /> {event.registeredCount || 0} registered
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 className="heading-md" style={{ marginBottom: '12px' }}>Why Choose <span className="text-gradient">EventFlow</span>?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
              Built for everyone — from first-time attendees to seasoned event professionals.
            </p>
          </div>

          <div className="grid grid-4">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card" style={{ padding: '28px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color }}>
                  <Icon size={26} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div className="glass" style={{ padding: '60px 40px', background: 'var(--gradient-card)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 className="heading-md" style={{ marginBottom: '16px' }}>Ready to Get Started?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
              Create your free account today and start discovering amazing events in your city.
            </p>
            <div className="flex items-center justify-center gap-3" style={{ flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/events" className="btn btn-secondary btn-lg">Browse Events</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        <span className="logo" style={{ fontSize: '1rem', display: 'block', marginBottom: '8px' }}>EventFlow</span>
        © {new Date().getFullYear()} EventFlow. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
