import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Eye, EyeOff, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'attendee' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = form;
      const user = await register(registerData);
      const redirectMap = { organizer: '/organizer', attendee: '/dashboard' };
      navigate(redirectMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-hero)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(198,106,134,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(233,160,181,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }} className="animate-slideUp">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" className="logo" style={{ fontSize: '1.75rem', display: 'block', marginBottom: '8px' }}>EventFlow</Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Create your account and get started</p>
        </div>

        <div className="glass" style={{ padding: '40px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>Create Account ✨</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>Join thousands of event creators and attendees</p>

          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">I want to...</label>
              <div className="tabs">
                <button type="button" className={`tab-btn${form.role === 'attendee' ? ' active' : ''}`} onClick={() => setForm({ ...form, role: 'attendee' })}>
                  🎟 Attend Events
                </button>
                <button type="button" className={`tab-btn${form.role === 'organizer' ? ' active' : ''}`} onClick={() => setForm({ ...form, role: 'organizer' })}>
                  🎪 Organize Events
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-name" type="text" className="form-input" style={{ paddingLeft: '40px' }} placeholder="John Doe" value={form.name} onChange={update('name')} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-email" type="email" className="form-input" style={{ paddingLeft: '40px' }} placeholder="you@example.com" value={form.email} onChange={update('email')} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '40px', paddingRight: '40px' }} placeholder="Min. 6 characters" value={form.password} onChange={update('password')} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-confirm" type="password" className="form-input" style={{ paddingLeft: '40px' }} placeholder="Repeat your password" value={form.confirmPassword} onChange={update('confirmPassword')} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? (
                <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Creating account...</>
              ) : (
                <><UserCheck size={16} /> Create Account</>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
