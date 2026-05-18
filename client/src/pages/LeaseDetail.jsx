import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const LeaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/leases/${id}`).then(r => { setLease(r.data.data); setLoading(false); }).catch(() => { setLoading(false); navigate('/leases'); });
  }, [id]);

  const updateStatus = async (status) => {
    try { await API.put(`/leases/${id}/status`, { status }); toast.success(`Lease ${status.toLowerCase()}`); const r = await API.get(`/leases/${id}`); setLease(r.data.data); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading || !lease) return <LoadingSpinner />;

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <button onClick={() => navigate('/leases')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', fontFamily: 'var(--font-body)' }}>← Back to Leases</button>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 600 }}>Lease #{id}</h1>
            <span className={`badge ${lease.status === 'Active' ? 'badge-green' : lease.status === 'Expired' ? 'badge-yellow' : 'badge-red'}`}>{lease.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tenant</span><p style={{ fontWeight: 600, marginTop: '4px' }}>{lease.tenant_name}</p></div>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Property</span><p style={{ marginTop: '4px' }}>{lease.property_name}</p></div>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Unit</span><p style={{ fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{lease.unit_number}</p></div>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Rent</span><p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 600, marginTop: '4px' }}>${parseFloat(lease.monthly_rent).toLocaleString()}</p></div>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Period</span><p style={{ fontSize: '13px', marginTop: '4px' }}>{lease.start_date} → {lease.end_date}</p></div>
            {lease.security_deposit && <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Deposit</span><p style={{ fontFamily: 'var(--font-mono)', marginTop: '4px' }}>${parseFloat(lease.security_deposit).toLocaleString()}</p></div>}
          </div>
          {lease.status === 'Active' && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
              <button onClick={() => updateStatus('Terminated')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.3)', background: 'rgba(255,80,80,0.08)', color: '#ff7b7b', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Terminate</button>
              <button onClick={() => updateStatus('Expired')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(247,228,121,0.3)', background: 'rgba(247,228,121,0.08)', color: '#f7e479', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Mark Expired</button>
            </div>
          )}
        </div>

        {lease.payments?.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '16px' }}>Payment History</h2>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <table className="nexas-table">
                <thead><tr><th>Amount</th><th>Date</th><th>Method</th><th>Status</th><th>Ref</th></tr></thead>
                <tbody>
                  {lease.payments.map(p => (
                    <tr key={p.payment_id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>${parseFloat(p.amount).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.payment_date}</td>
                      <td><span className="badge badge-purple">{p.method}</span></td>
                      <td><span className={`badge ${p.status === 'Paid' ? 'badge-green' : 'badge-yellow'}`}>{p.status}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{p.reference_no || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default LeaseDetail;
