import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/tenants/${id}`).then(r => { setTenant(r.data.data); setLoading(false); }).catch(() => { setLoading(false); navigate('/tenants'); });
  }, [id]);

  if (loading || !tenant) return <LoadingSpinner />;

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <button onClick={() => navigate('/tenants')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', fontFamily: 'var(--font-body)' }}>← Back to Tenants</button>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: 'white' }}>{tenant.name.charAt(0)}</div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 600 }}>{tenant.name}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{tenant.email}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</span><p style={{ fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{tenant.phone || '—'}</p></div>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>NID</span><p style={{ fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{tenant.nid || '—'}</p></div>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Emergency</span><p style={{ fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{tenant.emergency_contact || '—'}</p></div>
            <div><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Joined</span><p style={{ fontSize: '13px', marginTop: '4px' }}>{tenant.created_at}</p></div>
          </div>
        </div>
        {tenant.leases?.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '16px' }}>Lease History</h2>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <table className="nexas-table">
                <thead><tr><th>Property</th><th>Unit</th><th>Rent</th><th>Period</th><th>Status</th></tr></thead>
                <tbody>
                  {tenant.leases.map(l => (
                    <tr key={l.lease_id}>
                      <td>{l.property_name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{l.unit_number}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>${parseFloat(l.monthly_rent).toLocaleString()}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.start_date} → {l.end_date}</td>
                      <td><span className={`badge ${l.status === 'Active' ? 'badge-green' : l.status === 'Expired' ? 'badge-yellow' : 'badge-red'}`}>{l.status}</span></td>
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
export default TenantDetail;
