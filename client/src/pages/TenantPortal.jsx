import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const TenantPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    API.get('/tenant-portal/dashboard')
      .then(r => { setData(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <LoadingSpinner />;

  const sectionCard = {
    background: 'var(--bg-card)', borderRadius: '16px',
    border: '1px solid var(--border-subtle)', padding: '24px', marginBottom: '24px',
    transition: 'all 0.3s ease',
  };

  const clickableCard = {
    ...sectionCard,
    cursor: 'pointer',
  };

  const statCards = [
    {
      label: 'Active Lease', value: data.activeLease ? '1' : '0',
      icon: '◫', color: '#8b5cf6', action: () => setExpandedSection(expandedSection === 'lease' ? null : 'lease'),
    },
    {
      label: 'Browse Properties', value: '🏘️',
      icon: '⌂', color: '#3b82f6', action: () => navigate('/browse-properties'),
    },
    {
      label: 'My Bookings', value: '📋',
      icon: '◈', color: '#10b981', action: () => navigate('/my-bookings'),
    },
    {
      label: 'Maintenance', value: data.maintenanceRequests?.length || 0,
      icon: '⚙', color: '#f59e0b', action: () => setExpandedSection(expandedSection === 'maintenance' ? null : 'maintenance'),
    },
  ];

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '8px' }}>
          Welcome, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          Your personal rental dashboard
        </p>

        {/* Profile Card */}
        <div style={sectionCard}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px' }}>My Profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</span>
              <p style={{ fontWeight: 600, marginTop: '4px' }}>{user?.name}</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</span>
              <p style={{ fontWeight: 500, marginTop: '4px', color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Role</span>
              <p style={{ marginTop: '4px' }}><span className="badge badge-purple">Tenant</span></p>
            </div>
          </div>
        </div>

        {/* Quick Action Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {statCards.map((card, i) => (
            <div
              key={i}
              onClick={card.action}
              style={{
                background: 'var(--bg-card)', borderRadius: '16px',
                border: '1px solid var(--border-subtle)', padding: '24px',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transition: 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.3s ease, border-color 0.3s',
                animation: `fadeSlideUp 0.4s ease ${i * 0.08}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 36px ${card.color}22`;
                e.currentTarget.style.borderColor = `${card.color}44`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: `${card.color}10`, filter: 'blur(10px)',
              }} />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                {card.label}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: card.color }}>
                {card.value}
              </div>
              <div style={{
                marginTop: '10px', fontSize: '11px', color: card.color, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                Click to view →
              </div>
            </div>
          ))}
        </div>

        {/* Active Lease (expandable) */}
        {expandedSection === 'lease' && (
          <div style={{ ...sectionCard, animation: 'fadeSlideUp 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px' }}>
              My Active Lease
              <span onClick={() => setExpandedSection(null)} style={{ float: 'right', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)' }}>✕</span>
            </h2>
            {data.activeLease ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Property</span>
                  <p style={{ fontWeight: 600, marginTop: '4px' }}>{data.activeLease.property_name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Address</span>
                  <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '13px' }}>{data.activeLease.property_address}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Unit</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '4px' }}>{data.activeLease.unit_number}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Rent</span>
                  <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 600, marginTop: '4px' }}>
                    ৳{parseFloat(data.activeLease.monthly_rent).toLocaleString()}/mo
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Lease Period</span>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>{data.activeLease.start_date} → {data.activeLease.end_date}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</span>
                  <p style={{ marginTop: '4px' }}><span className="badge badge-green">{data.activeLease.status}</span></p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                <p>No active lease found</p>
                <button onClick={() => navigate('/browse-properties')} style={{
                  marginTop: '12px', padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                  color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>Browse Properties</button>
              </div>
            )}
          </div>
        )}

        {/* Maintenance (expandable) */}
        {expandedSection === 'maintenance' && data.maintenanceRequests?.length > 0 && (
          <div style={{ ...sectionCard, animation: 'fadeSlideUp 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px' }}>
              My Maintenance Requests
              <span onClick={() => setExpandedSection(null)} style={{ float: 'right', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)' }}>✕</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {data.maintenanceRequests.map(m => (
                <div key={m.request_id} style={{
                  background: 'rgba(139,92,246,0.03)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)', padding: '16px',
                  transition: 'all 0.3s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600 }}>{m.title}</h3>
                    <span className={`badge ${m.priority==='High'||m.priority==='Emergency'?'badge-red':m.priority==='Medium'?'badge-yellow':'badge-blue'}`}>{m.priority}</span>
                  </div>
                  {m.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{m.description}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unit {m.unit_number}</p>
                    <span className={`badge ${m.status==='Pending'?'badge-yellow':m.status==='In Progress'?'badge-purple':m.status==='Resolved'?'badge-green':'badge-blue'}`}>{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lease History */}
        {data.allLeases?.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2
              onClick={() => setExpandedSection(expandedSection === 'leaseHistory' ? null : 'leaseHistory')}
              style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-purple)'}
              onMouseLeave={e => e.target.style.color = ''}
            >
              My Lease History
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', transform: expandedSection === 'leaseHistory' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
            </h2>
            {expandedSection === 'leaseHistory' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', animation: 'fadeSlideUp 0.3s ease' }}>
                <table className="nexas-table">
                  <thead><tr><th>Property</th><th>Unit</th><th>Rent</th><th>Period</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.allLeases.map(l => (
                      <tr key={l.lease_id}>
                        <td style={{ fontWeight: 500 }}>{l.property_name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{l.unit_number}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>৳{parseFloat(l.monthly_rent).toLocaleString()}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{l.start_date} → {l.end_date}</td>
                        <td><span className={`badge ${l.status === 'Active' ? 'badge-green' : l.status === 'Expired' ? 'badge-yellow' : 'badge-red'}`}>{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Payment History */}
        {data.recentPayments?.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2
              onClick={() => setExpandedSection(expandedSection === 'payments' ? null : 'payments')}
              style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-green)'}
              onMouseLeave={e => e.target.style.color = ''}
            >
              My Payment History
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', transform: expandedSection === 'payments' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
            </h2>
            {expandedSection === 'payments' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', animation: 'fadeSlideUp 0.3s ease' }}>
                <table className="nexas-table">
                  <thead><tr><th>Amount</th><th>Date</th><th>Method</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.recentPayments.map(p => (
                      <tr key={p.payment_id}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>৳{parseFloat(p.amount).toLocaleString()}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.payment_date}</td>
                        <td><span className="badge badge-purple">{p.method}</span></td>
                        <td><span className={`badge ${p.status === 'Paid' ? 'badge-green' : p.status === 'Overdue' ? 'badge-red' : 'badge-yellow'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default TenantPortal;
