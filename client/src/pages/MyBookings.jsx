import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    API.get('/bookings/my-bookings')
      .then(r => { setBookings(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking request?')) return;
    try {
      await API.put(`/bookings/cancel/${id}`);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const statusColors = {
    Pending: 'badge-yellow',
    Approved: 'badge-green',
    Rejected: 'badge-red',
    Cancelled: 'badge-red',
  };

  const sectionCard = {
    background: 'var(--bg-card)', borderRadius: '16px',
    border: '1px solid var(--border-subtle)', padding: '24px',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '4px' }}>
          My <span className="gradient-text">Bookings</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          Track your property booking requests
        </p>

        {bookings.length === 0 ? (
          <div style={{ ...sectionCard, textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📋</p>
            <p style={{ color: 'var(--text-muted)' }}>No bookings yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Browse properties and submit your first booking request!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {bookings.map(b => (
              <div key={b.booking_id} style={{
                ...sectionCard,
                position: 'relative',
                transition: 'transform 0.3s',
              }}>
                {/* Status Badge */}
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <span className={`badge ${statusColors[b.status] || 'badge-blue'}`}>{b.status}</span>
                </div>

                {/* Property Info */}
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '4px', paddingRight: '80px' }}>
                  {b.property_name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  📍 {b.address}{b.city ? `, ${b.city}` : ''}
                </p>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Type</span>
                    <p style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>{b.booking_type}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Property Type</span>
                    <p style={{ fontWeight: 500, fontSize: '13px', marginTop: '2px' }}>{b.type}</p>
                  </div>
                  {b.unit_number && (
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Unit</span>
                      <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>{b.unit_number}</p>
                    </div>
                  )}
                  {b.rent_amount && (
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Rent</span>
                      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
                        ৳{parseFloat(b.rent_amount).toLocaleString()}/mo
                      </p>
                    </div>
                  )}
                  {b.bedrooms != null && (
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Bed / Bath</span>
                      <p style={{ fontSize: '13px', marginTop: '2px' }}>{b.bedrooms} bed · {b.bathrooms} bath</p>
                    </div>
                  )}
                </div>

                {/* Message */}
                {b.message && (
                  <div style={{
                    background: 'rgba(139,92,246,0.05)', borderRadius: '8px',
                    padding: '10px 12px', marginBottom: '12px', fontSize: '12px',
                    color: 'var(--text-muted)', fontStyle: 'italic',
                    border: '1px solid rgba(139,92,246,0.08)',
                  }}>
                    "{b.message}"
                  </div>
                )}

                {/* Date & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Submitted: {new Date(b.created_at).toLocaleDateString()}
                  </span>
                  {b.status === 'Pending' && (
                    <button onClick={() => handleCancel(b.booking_id)} style={{
                      padding: '6px 14px', borderRadius: '8px',
                      border: '1px solid rgba(255,80,80,0.3)',
                      background: 'rgba(255,80,80,0.08)', color: '#ff7b7b',
                      fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings;
