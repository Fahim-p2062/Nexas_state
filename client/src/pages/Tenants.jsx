import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', nid: '', phone: '', emergency_contact: '' });

  const load = () => API.get('/tenants').then(r => { setTenants(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await API.post('/tenants', form); toast.success('Tenant added!'); setModal(false); setForm({ name: '', email: '', password: '', nid: '', phone: '', emergency_contact: '' }); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));
  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>Tenants</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{tenants.length} registered tenants</p>
          </div>
          <button onClick={() => setModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ Add Tenant</button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input className="nexas-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '400px' }} />
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table className="nexas-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>NID</th><th>Active Leases</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.tenant_id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.email}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{t.phone || '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{t.nid || '—'}</td>
                  <td><span className={`badge ${t.active_leases > 0 ? 'badge-green' : 'badge-yellow'}`}>{t.active_leases || 0}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No tenants found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Tenant">
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Name *</label><input className="nexas-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Email *</label><input className="nexas-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Password *</label><input className="nexas-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Phone</label><input className="nexas-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>NID</label><input className="nexas-input" value={form.nid} onChange={e => setForm({ ...form, nid: e.target.value })} /></div>
            <div style={{ marginBottom: '24px' }}><label style={labelStyle}>Emergency Contact</label><input className="nexas-input" value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} /></div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Create Tenant</button>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Tenants;
