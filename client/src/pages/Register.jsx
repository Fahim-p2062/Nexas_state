import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Register = () => {
  const [type, setType] = useState('landlord');
  const [form, setForm] = useState({ name: '', email: '', password: '', contact: '', phone: '', nid: '' });
  const [loading, setLoading] = useState(false);
  const { registerLandlord, registerTenant } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'landlord') {
        await registerLandlord({ name: form.name, email: form.email, password: form.password, contact: form.contact });
        toast.success('Landlord registered!');
        navigate('/dashboard');
      } else {
        await registerTenant({ name: form.name, email: form.email, password: form.password, phone: form.phone, nid: form.nid });
        toast.success('Tenant registered!');
        navigate('/tenant-portal');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };
  const fieldStyle = { marginBottom: '16px' };

  return (
    <>
      <LoadingSpinner duration={600} />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
        <div className="grid-bg" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}></div>
        <div style={{ width: '100%', maxWidth: '420px', padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', position: 'relative', zIndex: 1, animation: 'modalIn 0.6s cubic-bezier(0.23,1,0.32,1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>NexasEstate</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Create your account</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['landlord', 'tenant'].map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                background: type === t ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' : 'var(--bg-primary)',
                color: type === t ? 'white' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', fontFamily: 'var(--font-body)', textTransform: 'capitalize',
              }}>{t}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}><label style={labelStyle}>Full Name</label><input className="nexas-input" value={form.name} onChange={set('name')} required /></div>
            <div style={fieldStyle}><label style={labelStyle}>Email</label><input className="nexas-input" type="email" value={form.email} onChange={set('email')} required /></div>
            <div style={fieldStyle}><label style={labelStyle}>Password</label><input className="nexas-input" type="password" value={form.password} onChange={set('password')} required /></div>
            {type === 'landlord' && (
              <div style={fieldStyle}><label style={labelStyle}>Contact Number</label><input className="nexas-input" value={form.contact} onChange={set('contact')} /></div>
            )}
            {type === 'tenant' && (<>
              <div style={fieldStyle}><label style={labelStyle}>Phone</label><input className="nexas-input" value={form.phone} onChange={set('phone')} /></div>
              <div style={fieldStyle}><label style={labelStyle}>NID</label><input className="nexas-input" value={form.nid} onChange={set('nid')} /></div>
            </>)}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: loading ? 0.6 : 1, transition: 'all 0.3s' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
