import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const BrowsePropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [bookingForm, setBookingForm] = useState({ booking_type: 'Rent', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get(`/bookings/browse/${id}`)
      .then(r => { setProperty(r.data.data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/browse-properties'); });
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/bookings', {
        property_id: parseInt(id),
        unit_id: selectedUnit?.unit_id || null,
        booking_type: bookingForm.booking_type,
        message: bookingForm.message,
      });
      toast.success('Booking request submitted! The landlord will review it shortly.');
      setBookingModal(false);
      setBookingForm({ booking_type: 'Rent', message: '' });
      setSelectedUnit(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  const openBookingModal = (unit = null) => {
    setSelectedUnit(unit);
    setBookingModal(true);
  };

  if (loading || !property) return <LoadingSpinner />;

  const sectionCard = {
    background: 'var(--bg-card)', borderRadius: '16px',
    border: '1px solid var(--border-subtle)', padding: '24px', marginBottom: '24px',
  };
  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <button onClick={() => navigate('/browse-properties')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '13px', marginBottom: '16px', fontFamily: 'var(--font-body)',
        }}>← Back to Browse</button>

        {/* Property Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
          borderRadius: '20px', padding: '40px', marginBottom: '32px',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 600, marginBottom: '8px' }}>
                {property.name || 'Property'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '12px' }}>
                📍 {property.address}{property.city ? `, ${property.city}` : ''}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-purple">{property.type}</span>
                <span className="badge badge-blue">{property.units?.length || 0} vacant units</span>
              </div>
              {property.landlord_name && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>
                  <strong>Managed by:</strong> {property.landlord_name}
                  {property.landlord_contact && ` · ${property.landlord_contact}`}
                </p>
              )}
            </div>
            <button onClick={() => openBookingModal()} style={{
              padding: '14px 32px', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
              color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all 0.3s',
              boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
            }}>
              🏠 Book This Property
            </button>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div style={sectionCard}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '12px' }}>About This Property</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7' }}>{property.description}</p>
          </div>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div style={sectionCard}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px' }}>Amenities</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {property.amenities.map((a, i) => (
                <span key={i} style={{
                  padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                  background: 'rgba(139,92,246,0.08)', color: 'var(--text-primary)',
                  border: '1px solid rgba(139,92,246,0.15)', transition: 'all 0.3s',
                }}>✓ {a}</span>
              ))}
            </div>
          </div>
        )}

        {/* All Units */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '16px' }}>
            Units ({property.units?.length || 0})
            {property.units?.filter(u => u.status === 'Vacant').length > 0 && (
              <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 500, marginLeft: '8px' }}>
                · {property.units.filter(u => u.status === 'Vacant').length} available
              </span>
            )}
          </h2>
          {property.units && property.units.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {property.units.map((u, i) => {
                const isVacant = u.status === 'Vacant';
                const statusBadge = isVacant ? 'badge-green' : u.status === 'Occupied' ? 'badge-red' : 'badge-yellow';
                return (
                  <div key={u.unit_id} style={{
                    background: 'var(--bg-card)', borderRadius: '16px',
                    border: `1px solid ${isVacant ? 'rgba(16,185,129,0.2)' : 'var(--border-subtle)'}`,
                    padding: '20px', position: 'relative', overflow: 'hidden',
                    opacity: isVacant ? 1 : 0.65,
                    transition: 'all 0.3s',
                    animation: `fadeSlideUp 0.4s ease ${i * 0.06}s both`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600 }}>Unit {u.unit_number}</h3>
                      <span className={`badge ${statusBadge}`}>{u.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '12px' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Floor:</span> {u.floor || '—'}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Bed:</span> {u.bedrooms}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Bath:</span> {u.bathrooms}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Area:</span> {u.area_sqft ? `${u.area_sqft} sqft` : '—'}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', color: 'var(--accent-green)', fontWeight: 600, marginBottom: '14px' }}>
                      ৳{parseFloat(u.rent_amount).toLocaleString()}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/mo</span>
                    </div>
                    {isVacant ? (
                      <button onClick={(e) => { e.stopPropagation(); openBookingModal(u); }} style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
                        color: 'var(--accent-purple)', fontSize: '13px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.3s',
                        border: '1px solid rgba(139,92,246,0.2)',
                      }}>Book This Unit</button>
                    ) : (
                      <div style={{
                        width: '100%', padding: '10px', borderRadius: '10px', textAlign: 'center',
                        background: 'rgba(255,255,255,0.03)', fontSize: '12px', color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                      }}>{u.status === 'Occupied' ? 'Currently Occupied' : 'Under Maintenance'}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ ...sectionCard, textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No units listed for this property yet
            </div>
          )}
        </div>

        {/* Booking Modal */}
        <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Book Property">
          <form onSubmit={handleBook}>
            {/* Property Info */}
            <div style={{
              background: 'rgba(139,92,246,0.05)', borderRadius: '12px',
              padding: '16px', marginBottom: '20px',
              border: '1px solid rgba(139,92,246,0.1)',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>{property.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{property.address}{property.city ? `, ${property.city}` : ''}</p>
              {selectedUnit && (
                <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  Unit {selectedUnit.unit_number} · ৳{parseFloat(selectedUnit.rent_amount).toLocaleString()}/mo
                </p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Booking Type</label>
              <select
                className="nexas-select"
                value={bookingForm.booking_type}
                onChange={e => setBookingForm({ ...bookingForm, booking_type: e.target.value })}
              >
                <option value="Rent">Rent</option>
                <option value="Buy">Buy</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Message to Landlord (optional)</label>
              <textarea
                className="nexas-input"
                value={bookingForm.message}
                onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })}
                placeholder="Introduce yourself, mention move-in date preferences, etc."
                rows={4}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: submitting ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
              color: 'white', fontSize: '14px', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
            }}>
              {submitting ? 'Submitting...' : '🏠 Submit Booking Request'}
            </button>
          </form>
        </Modal>
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

export default BrowsePropertyDetail;
