import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', phone: '' });
  const load = () => API.get('/staff').then(r => { setStaff(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await API.post('/staff', form); toast.success('Staff added!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div><h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>Staff</h1><p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{staff.length} team members</p></div>
          <button onClick={() => setModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ Add Staff</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {staff.map(s => (
            <div key={s.staff_id} className="stat-card" style={{ cursor: 'default' }}>
              <div className="shimmer"></div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.name.charAt(0)}</div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{s.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {s.role && <span className="badge badge-purple">{s.role}</span>}
                    {s.phone && <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{s.phone}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {staff.length === 0 && !loading && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><p>No staff members yet</p></div>}
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Staff">
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Name *</label><input className="nexas-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Email *</label><input className="nexas-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Password</label><input className="nexas-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Role</label><input className="nexas-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Electrician, Plumber" /></div>
            <div style={{ marginBottom: '24px' }}><label style={labelStyle}>Phone</label><input className="nexas-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Add Staff</button>
          </form>
        </Modal>
      </div>
    </>
  );
};
export default Staff;
