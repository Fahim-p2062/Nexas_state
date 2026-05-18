import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [form, setForm] = useState({ unit_id: '', title: '', description: '', priority: 'Medium' });
  const { role } = useAuth();
  useScrollReveal();

  const load = () => {
    let url = '/maintenance';
    const params = [];
    if (statusFilter) params.push(`status=${statusFilter}`);
    if (priorityFilter) params.push(`priority=${priorityFilter}`);
    if (params.length) url += '?' + params.join('&');
    API.get(url).then(r => { setRequests(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [statusFilter, priorityFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await API.post('/maintenance', form); toast.success('Request submitted!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const priorityColor = (p) => {
    const map = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Emergency: '#dc2626' };
    return map[p] || '#888';
  };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>Maintenance</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{requests.length} requests</p>
          </div>
          {role === 'Tenant' && (
            <button onClick={() => setModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ New Request</button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select className="nexas-select" style={{ maxWidth: '180px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option><option>Pending</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
          </select>
          <select className="nexas-select" style={{ maxWidth: '180px' }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option><option>Low</option><option>Medium</option><option>High</option><option>Emergency</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {requests.map(m => (
            <div key={m.request_id} className={`scroll-reveal priority-${m.priority?.toLowerCase()}`} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: '14px', padding: '22px',
              transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${priorityColor(m.priority)}22`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, flex: 1, marginRight: '12px' }}>{m.title}</h3>
                <span className={`badge ${m.priority === 'Emergency' || m.priority === 'High' ? 'badge-red' : m.priority === 'Medium' ? 'badge-yellow' : 'badge-blue'}`}>{m.priority}</span>
              </div>
              {m.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>{m.description}</p>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span className={`badge ${m.status === 'Pending' ? 'badge-yellow' : m.status === 'In Progress' ? 'badge-purple' : m.status === 'Resolved' ? 'badge-green' : 'badge-blue'}`}>{m.status}</span>
                {m.unit_number && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Unit {m.unit_number}</span>}
              </div>
              <div style={{ fontSize: '11px', color: '#555' }}>
                {role !== 'Tenant' && m.tenant_name && <span>{m.tenant_name}</span>}
                {m.property_name && <span>{role !== 'Tenant' && m.tenant_name ? ' · ' : ''}{m.property_name}</span>}
                {role !== 'Tenant' && m.assigned_staff && <span> · Assigned: {m.assigned_staff}</span>}
              </div>
            </div>
          ))}
        </div>

        {requests.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>⚙</p>
            <p>No maintenance requests</p>
          </div>
        )}

        <Modal isOpen={modal} onClose={() => setModal(false)} title="New Maintenance Request">
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Unit ID *</label><input className="nexas-input" value={form.unit_id} onChange={e => setForm({ ...form, unit_id: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Title *</label><input className="nexas-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Description</label><textarea className="nexas-input" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
            <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Priority</label><select className="nexas-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Emergency</option></select></div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Submit Request</button>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Maintenance;
