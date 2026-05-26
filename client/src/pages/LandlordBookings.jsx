import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const LandlordBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [approvalModal, setApprovalModal] = useState(null);
  const [leaseParams, setLeaseParams] = useState({
    lease_start: new Date().toISOString().split('T')[0],
    lease_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    monthly_rent: '',
    security_deposit: ''
  });

  const load = () => {
    API.get('/bookings/landlord')
      .then(r => { setBookings(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    if (status === 'Approved') {
      const booking = bookings.find(b => b.booking_id === id);
      setLeaseParams({
        lease_start: new Date().toISOString().split('T')[0],
        lease_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        monthly_rent: booking.rent_amount || '',
        security_deposit: (booking.rent_amount * 2) || ''
      });
      setApprovalModal(booking);
      return;
    }

    if (!confirm(`${status} this booking request?`)) return;
    try {
      await API.put(`/bookings/landlord/${id}`, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const submitApproval = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/bookings/landlord/${approvalModal.booking_id}`, { 
        status: 'Approved',
        ...leaseParams
      });
      toast.success('Booking approved & Lease generated!');
      setApprovalModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve booking');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusColors = {
    Pending: 'badge-yellow',
    Approved: 'badge-green',
    Rejected: 'badge-red',
    Cancelled: 'badge-red',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '4px' }}>
          Booking <span className="gradient-text">Requests</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Review and manage tenant booking requests for your properties
        </p>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {['all', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)',
                background: filter === f ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' : 'var(--bg-card)',
                color: filter === f ? 'white' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.3s',
                textTransform: 'capitalize',
              }}
            >{f === 'all' ? `All (${bookings.length})` : `${f} (${bookings.filter(b => b.status === f).length})`}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)',
            textAlign: 'center', padding: '60px', color: 'var(--text-muted)',
          }}>
            <p style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📬</p>
            <p>No booking requests {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filtered.map(b => (
              <div key={b.booking_id} style={{
                background: 'var(--bg-card)', borderRadius: '16px',
                border: '1px solid var(--border-subtle)', padding: '24px',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px',
                alignItems: 'center', transition: 'all 0.3s',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600 }}>
                      {b.property_name}
                    </h3>
                    <span className={`badge ${statusColors[b.status]}`}>{b.status}</span>
                    <span className="badge badge-purple">{b.booking_type}</span>
                  </div>

                  {/* Tenant Info */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
                    background: 'rgba(139,92,246,0.05)', borderRadius: '10px',
                    padding: '10px 14px', border: '1px solid rgba(139,92,246,0.08)',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: 'white',
                    }}>{b.tenant_name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '13px' }}>{b.tenant_name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {b.tenant_email}{b.tenant_phone ? ` · ${b.tenant_phone}` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {b.unit_number && <span>Unit: <strong style={{ color: 'var(--text-primary)' }}>{b.unit_number}</strong></span>}
                    {b.rent_amount && <span>Rent: <strong style={{ color: 'var(--accent-green)' }}>৳{parseFloat(b.rent_amount).toLocaleString()}/mo</strong></span>}
                    <span>Submitted: {new Date(b.created_at).toLocaleDateString()}</span>
                  </div>

                  {b.message && (
                    <p style={{
                      fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic',
                      marginTop: '8px', padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}>"{b.message}"</p>
                  )}
                </div>

                {/* Actions */}
                {b.status === 'Pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
                    <button onClick={() => handleAction(b.booking_id, 'Approved')} style={{
                      padding: '10px 20px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))',
                      color: '#10b981', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      border: '1px solid rgba(16,185,129,0.2)', transition: 'background 0.3s'
                    }} onMouseEnter={e => e.target.style.background='rgba(16,185,129,0.2)'} onMouseLeave={e => e.target.style.background='linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))'}>✓ Approve</button>
                    <button onClick={() => handleAction(b.booking_id, 'Rejected')} style={{
                      padding: '10px 20px', borderRadius: '10px',
                      background: 'rgba(255,80,80,0.08)',
                      color: '#ff7b7b', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      border: '1px solid rgba(255,80,80,0.2)', transition: 'background 0.3s'
                    }} onMouseEnter={e => e.target.style.background='rgba(255,80,80,0.15)'} onMouseLeave={e => e.target.style.background='rgba(255,80,80,0.08)'}>✕ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {approvalModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px',
            width: '90%', maxWidth: '500px', border: '1px solid var(--border-subtle)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'modalIn 0.3s ease'
          }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '8px' }}>Finalize Lease Terms</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
              Review and adjust the lease details for {approvalModal.tenant_name} before generating the lease.
            </p>
            <form onSubmit={submitApproval} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="nexas-label">Lease Start Date</label>
                  <input type="date" className="nexas-input" value={leaseParams.lease_start} onChange={e => setLeaseParams({...leaseParams, lease_start: e.target.value})} required />
                </div>
                <div>
                  <label className="nexas-label">Lease End Date</label>
                  <input type="date" className="nexas-input" value={leaseParams.lease_end} onChange={e => setLeaseParams({...leaseParams, lease_end: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="nexas-label">Monthly Rent (৳)</label>
                  <input type="number" className="nexas-input" value={leaseParams.monthly_rent} onChange={e => setLeaseParams({...leaseParams, monthly_rent: e.target.value})} required />
                </div>
                <div>
                  <label className="nexas-label">Security Deposit (৳)</label>
                  <input type="number" className="nexas-input" value={leaseParams.security_deposit} onChange={e => setLeaseParams({...leaseParams, security_deposit: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                  color: 'white', fontWeight: 600, cursor: 'pointer',
                }}>Approve & Create Lease</button>
                <button type="button" onClick={() => setApprovalModal(null)} style={{
                  padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--border-subtle)',
                  background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LandlordBookings;
