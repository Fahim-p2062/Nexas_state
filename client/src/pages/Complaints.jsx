import { useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const statusBadge = (s) => {
  const map = { Open: 'badge-red', 'Under Review': 'badge-yellow', Resolved: 'badge-green', Dismissed: 'badge-blue' };
  return map[s] || 'badge-purple';
};

const Complaints = () => {
  const { role } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    lease_id: '',
    against_role: 'Landlord',
    against_id: '',
    subject: '',
    description: '',
  });
  const [myLeases, setMyLeases] = useState([]);

  useEffect(() => {
    if (role === 'Tenant') {
      API.get('/tenant-portal/dashboard').then(r => {
        if (r.data?.data?.allLeases) {
          setMyLeases(r.data.data.allLeases.filter(l => l.status === 'Active'));
        }
      }).catch(()=>{});
    }
  }, [role]);

  const load = () => {
    setLoading(true);
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    API.get(`/objections${qs}`)
      .then(r => setRows(r.data.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const title = useMemo(() => {
    if (role === 'Admin') return 'Objections Monitor';
    if (role === 'Landlord') return 'Tenant Objections';
    return 'My Objections';
  }, [role]);

  const canCreate = role === 'Tenant';
  const canAdminUpdate = role === 'Admin';

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/objections', {
        lease_id: form.lease_id,
        against_role: form.against_role,
        against_id: form.against_role === 'Staff' ? (form.against_id || null) : null,
        subject: form.subject,
        description: form.description,
      });
      toast.success('Objection submitted!');
      setModal(false);
      setForm({ lease_id: '', against_role: 'Landlord', against_id: '', subject: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const adminUpdate = async (objection_id, nextStatus) => {
    try {
      await API.put(`/objections/${objection_id}`, { status: nextStatus });
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>{title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{rows.length} items</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="nexas-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All</option>
              <option>Open</option>
              <option>Under Review</option>
              <option>Resolved</option>
              <option>Dismissed</option>
            </select>
            {canCreate && (
              <button onClick={() => setModal(true)} style={{ padding: '12px 22px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                + New Objection
              </button>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table className="nexas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                {role !== 'Tenant' && <th>Tenant</th>}
                {role === 'Admin' && <th>Against</th>}
                <th>Subject</th>
                <th>Created</th>
                {canAdminUpdate && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.objection_id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>#{c.objection_id}</td>
                  <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                  {role !== 'Tenant' && <td style={{ fontWeight: 500 }}>{c.tenant_name}</td>}
                  {role === 'Admin' && (
                    <td style={{ color: 'var(--text-muted)' }}>
                      {c.against_role === 'Landlord' ? c.landlord_name : c.staff_name ? `${c.staff_name} (Staff)` : 'Staff'}
                    </td>
                  )}
                  <td style={{ fontWeight: 600 }}>{c.subject}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{String(c.created_at).slice(0, 10)}</td>
                  {canAdminUpdate && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {c.status !== 'Under Review' && <button className="nexas-btn" onClick={() => adminUpdate(c.objection_id, 'Under Review')}>Review</button>}
                        {c.status !== 'Resolved' && <button className="nexas-btn" onClick={() => adminUpdate(c.objection_id, 'Resolved')}>Resolve</button>}
                        {c.status !== 'Dismissed' && <button className="nexas-btn" onClick={() => adminUpdate(c.objection_id, 'Dismissed')}>Dismiss</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={canAdminUpdate ? 8 : (role === 'Admin' ? 7 : (role === 'Tenant' ? 6 : 6))} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    No objections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={modal} onClose={() => setModal(false)} title="New Objection">
          <form onSubmit={submit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Select Active Lease *</label>
              <select className="nexas-select" value={form.lease_id} onChange={e => setForm({ ...form, lease_id: e.target.value })} required>
                <option value="">-- Choose your lease --</option>
                {myLeases.map(l => (
                  <option key={l.lease_id} value={l.lease_id}>{l.property_name} (Unit {l.unit_number})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Against</label>
              <select className="nexas-select" value={form.against_role} onChange={e => setForm({ ...form, against_role: e.target.value, against_id: '' })}>
                <option value="Landlord">Landlord</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Staff ID {form.against_role === 'Staff' ? '*' : '(optional)'}</label>
              <input
                className="nexas-input"
                value={form.against_id}
                onChange={e => setForm({ ...form, against_id: e.target.value })}
                placeholder="Required if against staff"
                disabled={form.against_role !== 'Staff'}
                required={form.against_role === 'Staff'}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Subject *</label>
              <input className="nexas-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Description *</label>
              <textarea className="nexas-input" rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Submit
            </button>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Complaints;

