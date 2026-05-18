import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Landlord');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password, role);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Tenant') navigate('/tenant-portal');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Your ID & password was incorrect.';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <>
      <LoadingSpinner duration={600} />
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden',
      }}>
        <div className="grid-bg" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}></div>

        <div style={{
          width: '100%', maxWidth: '420px', padding: '40px',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '20px', position: 'relative', zIndex: 1,
          animation: 'modalIn 0.6s cubic-bezier(0.23,1,0.32,1)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>NexasEstate</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(255, 80, 80, 0.1)',
              border: '1px solid rgba(255, 80, 80, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'modalIn 0.3s ease',
            }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span style={{ color: '#ff7b7b', fontSize: '13px', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {['Landlord', 'Tenant', 'Staff', 'Admin'].map(r => (
              <button key={r} onClick={() => { setRole(r); setError(''); }} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                background: role === r ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' : 'var(--bg-primary)',
                color: role === r ? 'white' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.3s', fontFamily: 'var(--font-body)',
                minWidth: '70px',
              }}>{r}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Email</label>
              <input className="nexas-input" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Password</label>
              <input className="nexas-input" type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
              color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.3s', fontFamily: 'var(--font-body)',
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
