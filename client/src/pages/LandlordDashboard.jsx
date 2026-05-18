import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import useScrollReveal from '../hooks/useScrollReveal';

const LandlordDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useScrollReveal();

  useEffect(() => {
    API.get('/dashboard/summary').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <LoadingSpinner />;

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Your property portfolio at a glance</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <StatCard label="Properties" value={data.totalProperties} icon="⌂" color="purple" />
          <StatCard label="Total Units" value={data.totalUnits} icon="◫" color="blue" />
          <StatCard label="Occupied" value={data.occupiedUnits} icon="◉" color="green" />
          <StatCard label="Vacant" value={data.vacantUnits} icon="○" color="yellow" />
          <StatCard label="Active Tenants" value={data.totalTenants} icon="◆" color="pink" />
          <StatCard label="Rent This Month" value={`$${data.rentCollectedThisMonth}`} icon="◈" color="green" />
          <StatCard label="Overdue" value={data.overduePayments} icon="⚠" color="red" />
          <StatCard label="Open Requests" value={data.openMaintenanceRequests} icon="⚙" color="yellow" />
        </div>

        {/* Recent Payments */}
        <div className="scroll-reveal" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '16px' }}>Recent Payments</h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table className="nexas-table">
              <thead><tr><th>Tenant</th><th>Property</th><th>Unit</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {(data.recentPayments || []).map(p => (
                  <tr key={p.payment_id}>
                    <td style={{ fontWeight: 500 }}>{p.tenant_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.property_name}</td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{p.unit_number}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>${parseFloat(p.amount).toLocaleString()}</td>
                    <td><span className={`badge ${p.status === 'Paid' ? 'badge-green' : p.status === 'Overdue' ? 'badge-red' : 'badge-yellow'}`}>{p.status}</span></td>
                  </tr>
                ))}
                {(!data.recentPayments || data.recentPayments.length === 0) && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No recent payments</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Maintenance */}
        <div className="scroll-reveal">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '16px' }}>Open Maintenance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {(data.recentMaintenance || []).map(m => (
              <div key={m.request_id} className={`priority-${m.priority?.toLowerCase()}`} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: '12px', padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>{m.title}</h3>
                  <span className={`badge ${m.priority === 'High' || m.priority === 'Emergency' ? 'badge-red' : m.priority === 'Medium' ? 'badge-yellow' : 'badge-blue'}`}>{m.priority}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.tenant_name} · {m.unit_number} · {m.property_name}</p>
                <span className={`badge ${m.status === 'Pending' ? 'badge-yellow' : m.status === 'In Progress' ? 'badge-purple' : 'badge-green'}`} style={{ marginTop: '8px' }}>{m.status}</span>
              </div>
            ))}
            {(!data.recentMaintenance || data.recentMaintenance.length === 0) && (
              <p style={{ color: 'var(--text-muted)', padding: '20px' }}>No open maintenance requests</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LandlordDashboard;
