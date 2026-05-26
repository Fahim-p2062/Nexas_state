import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import useScrollReveal from '../hooks/useScrollReveal';
import toast from 'react-hot-toast';

const StaffMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  useScrollReveal();

  const load = () => {
    API.get('/maintenance').then(r => {
      const sorted = r.data.data.sort((a, b) => {
        const order = { 'Emergency': 1, 'High': 2, 'Medium': 3, 'Low': 4 };
        if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
        if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
        if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
        return new Date(a.submitted_at) - new Date(b.submitted_at);
      });
      setRequests(sorted);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/maintenance/${id}`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const priorityColor = (p) => {
    const map = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Emergency: '#dc2626' };
    return map[p] || '#888';
  };

  if (loading) return <LoadingSpinner duration={500} />;

  return (
    <div style={{ animation: 'modalIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '24px' }}>Maintenance Queue</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {requests.map((m, index) => (
          <div key={m.request_id} className="scroll-reveal" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '16px', padding: '24px', position: 'relative',
            opacity: m.status === 'Resolved' || m.status === 'Closed' ? 0.6 : 1,
            borderLeft: `6px solid ${priorityColor(m.priority)}`,
            transition: 'all 0.3s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    #{index + 1}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 600 }}>{m.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span className={`badge ${m.priority === 'Emergency' || m.priority === 'High' ? 'badge-red' : m.priority === 'Medium' ? 'badge-yellow' : 'badge-blue'}`}>{m.priority} Priority</span>
                  <span className={`badge ${m.status === 'Pending' ? 'badge-yellow' : m.status === 'In Progress' ? 'badge-purple' : m.status === 'Resolved' ? 'badge-green' : 'badge-blue'}`}>{m.status}</span>
                </div>
              </div>
              
              {m.status !== 'Resolved' && m.status !== 'Closed' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {m.status === 'Pending' && (
                    <button onClick={() => handleStatusUpdate(m.request_id, 'In Progress')} 
                      style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                      Start Work
                    </button>
                  )}
                  <button onClick={() => handleStatusUpdate(m.request_id, 'Resolved')} 
                    style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
            
            {m.description && <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>{m.description}</p>}
            
            <div style={{ fontSize: '14px', color: '#666', display: 'flex', flexWrap: 'wrap', gap: '24px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Property</span><strong style={{ color: 'var(--text-primary)' }}>{m.property_name}</strong></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Unit</span><strong style={{ color: 'var(--text-primary)' }}>{m.unit_number}</strong></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tenant</span><strong style={{ color: 'var(--text-primary)' }}>{m.tenant_name}</strong></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Submitted On</span><strong style={{ color: 'var(--text-primary)' }}>{new Date(m.submitted_at).toLocaleDateString()}</strong></div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🎉</p>
            <p>No assigned works in your queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffMaintenance;
