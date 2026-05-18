import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Leases = () => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ unit_id: '', tenant_id: '', start_date: '', end_date: '', monthly_rent: '', security_deposit: '' });
  const load = () => API.get('/leases').then(r => { setLeases(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await API.post('/leases', form); toast.success('Lease created!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div><h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>Leases</h1><p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{leases.length} total leases</p></div>
          <button onClick={() => setModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ New Lease</button>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table className="nexas-table">
            <thead><tr><th>Tenant</th><th>Property</th><th>Unit</th><th>Rent</th><th>Period</th><th>Status</th></tr></thead>
            <tbody>
              {leases.map(l => (
                <tr key={l.lease_id}>
                  <td style={{ fontWeight: 500 }}>{l.tenant_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{l.property_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{l.unit_number}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>${parseFloat(l.monthly_rent).toLocaleString()}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.start_date} → {l.end_date}</td>
                  <td><span className={`badge ${l.status === 'Active' ? 'badge-green' : l.status === 'Expired' ? 'badge-yellow' : 'badge-red'}`}>{l.status}</span></td>
                </tr>
              ))}
              {leases.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No leases</td></tr>}
            </tbody>
          </table>
        </div>
        <Modal isOpen={modal} onClose={() => setModal(false)} title="New Lease">
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Unit ID *</label><input className="nexas-input" value={form.unit_id} onChange={e => setForm({ ...form, unit_id: e.target.value })} required /></div>
              <div><label style={labelStyle}>Tenant ID *</label><input className="nexas-input" value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Start Date *</label><input className="nexas-input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required /></div>
              <div><label style={labelStyle}>End Date *</label><input className="nexas-input" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div><label style={labelStyle}>Monthly Rent *</label><input className="nexas-input" type="number" step="0.01" value={form.monthly_rent} onChange={e => setForm({ ...form, monthly_rent: e.target.value })} required /></div>
              <div><label style={labelStyle}>Security Deposit</label><input className="nexas-input" type="number" step="0.01" value={form.security_deposit} onChange={e => setForm({ ...form, security_deposit: e.target.value })} /></div>
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Create Lease</button>
          </form>
        </Modal>
      </div>
    </>
  );
};
export default Leases;
