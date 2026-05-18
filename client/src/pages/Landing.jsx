import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchInput from '../components/SearchInput';
import AnimatedButton from '../components/AnimatedButton';
import useScrollReveal from '../hooks/useScrollReveal';
import API from '../api/axios';

const carouselItems = [
  { name: 'Luxury Villa', image: '/images/property1.png' },
  { name: 'Modern Apartment', image: '/images/property2.png' },
  { name: 'Office Space', image: '/images/property3.png' },
  { name: 'Studio Flat', image: '/images/property4.png' },
  { name: 'Penthouse', image: '/images/property5.png' },
  { name: 'Commercial Unit', image: '/images/property6.png' },
  { name: 'Garden House', image: '/images/property7.png' },
  { name: 'Duplex', image: '/images/property8.png' },
];

const availableProperties = [
  { id: 1, name: 'Skyline Residences', address: 'Downtown Gulshan', city: 'Dhaka', type: 'Apartment', vacant_units: 3, total_units: 12, min_rent: 25000, image: '/images/AvailP1.png' },
  { id: 2, name: 'Green Valley Estate', address: 'Uttara Sector 7', city: 'Dhaka', type: 'Villa', vacant_units: 2, total_units: 8, min_rent: 45000, image: '/images/AvailP2.png' },
  { id: 3, name: 'Business Hub Tower', address: 'Banani Road 11', city: 'Dhaka', type: 'Commercial', vacant_units: 5, total_units: 20, min_rent: 35000, image: '/images/AvailP3.png' },
  { id: 4, name: 'Lake View Apartments', address: 'Dhanmondi Lake Area', city: 'Dhaka', type: 'Apartment', vacant_units: 4, total_units: 15, min_rent: 30000, image: '/images/AvailP4.png' },
  { id: 5, name: 'Garden City Homes', address: 'Mirpur DOHS', city: 'Dhaka', type: 'Duplex', vacant_units: 1, total_units: 6, min_rent: 55000, image: '/images/AvailP5.png' },
  { id: 6, name: 'Metro Station Plaza', address: 'Motijheel C/A', city: 'Dhaka', type: 'Office', vacant_units: 8, total_units: 25, min_rent: 40000, image: '/images/AvailP6.png' },
];

const gradients = ['142, 249, 252', '142, 252, 204', '215, 252, 142', '252, 208, 142', '252, 142, 239', '204, 142, 252'];

const Landing = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyDetail, setPropertyDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  useScrollReveal();

  // Load public properties
  useEffect(() => {
    API.get('/public/properties')
      .then(r => { setProperties(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Search/filter
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    API.get(`/public/properties?search=${encodeURIComponent(val)}`)
      .then(r => setProperties(r.data.data || []))
      .catch(() => {});
  };

  // View property detail
  const viewDetail = async (id) => {
    setDetailLoading(true);
    setSelectedProperty(id);
    try {
      const res = await API.get(`/public/properties/${id}`);
      setPropertyDetail(res.data.data);
    } catch { setPropertyDetail(null); }
    setDetailLoading(false);
  };

  const closeDetail = () => { setSelectedProperty(null); setPropertyDetail(null); };

  return (
    <>
      <LoadingSpinner duration={800} />
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflow: 'hidden' }}>

        {/* HERO */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', textAlign: 'center', padding: '40px 20px',
        }}>
          <div className="grid-bg" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}></div>

          {/* Top nav with login */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 40px', zIndex: 10,
          }}>
            <h2 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 600 }}>
              NexasEstate
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => navigate('/login')} style={{
                padding: '8px 20px', borderRadius: '8px',
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-purple)'; e.target.style.color = 'white'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.color = 'var(--text-muted)'; }}
              >Sign In</button>
              <button onClick={() => navigate('/register')} style={{
                padding: '8px 20px', borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                border: 'none', color: 'white', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.3s',
              }}>Register</button>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, animation: 'modalIn 0.8s cubic-bezier(0.23,1,0.32,1)' }}>
            <h1 className="gradient-text" style={{
              fontFamily: 'var(--font-heading)', fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 700, lineHeight: 1.1, marginBottom: '16px',
            }}>
              NexasEstate
            </h1>
            <p style={{
              color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              fontFamily: 'var(--font-body)', fontWeight: 300,
              letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px',
            }}>
              Premium Property Management
            </p>
            <p style={{
              color: 'var(--text-muted)', fontSize: '15px', maxWidth: '500px', margin: '0 auto 48px',
              lineHeight: 1.6, opacity: 0.7,
            }}>
              Browse available properties, find your perfect space, and connect with landlords — all in one place.
            </p>

            <div style={{ marginBottom: '40px' }}>
              <SearchInput value={search} onChange={handleSearch} placeholder="Search by name, city, or address..." />
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <AnimatedButton onClick={() => document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' })}>Browse Properties</AnimatedButton>
              <AnimatedButton onClick={() => navigate('/register')}>Get Started</AnimatedButton>
            </div>
          </div>
        </section>

        {/* 3D CAROUSEL */}
        <section className="scroll-reveal" style={{ padding: '40px 20px 80px', position: 'relative' }}>
          <h2 style={{
            textAlign: 'center', fontFamily: 'var(--font-heading)',
            fontSize: '2.2rem', fontWeight: 600, marginBottom: '8px',
          }}>
            Property <span className="gradient-text">Showcase</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '40px' }}>
            Browse our curated collection of premium properties
          </p>

          <div className="carousel-wrapper">
            <div className="carousel-inner" style={{ '--quantity': carouselItems.length }}>
              {carouselItems.map((item, i) => (
                <div key={i} className="carousel-card" style={{ '--index': i }}>
                  <div className="img" style={{ backgroundImage: `url(${item.image})` }}>
                    <span>{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AVAILABLE PROPERTIES — Public listing */}
        <section id="properties-section" className="scroll-reveal" style={{ padding: '40px 40px 80px', maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600,
            marginBottom: '8px',
          }}>
            Available <span className="gradient-text">Properties</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '40px' }}>
            {availableProperties.length} properties with vacant units available now
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {availableProperties.map((p, i) => {
              const c = gradients[i % gradients.length];
              return (
                <div key={p.id} className="property-card" style={{ cursor: 'pointer' }}
                  onClick={() => viewDetail(p.id)}>
                  <div style={{
                    height: '200px',
                    backgroundImage: `url(${p.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, marginBottom: '6px' }}>
                      {p.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      {p.address}{p.city ? `, ${p.city}` : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span className="badge badge-purple">{p.type}</span>
                      <span className="badge badge-green">{p.vacant_units} vacant</span>
                      <span className="badge badge-blue">{p.total_units} total units</span>
                    </div>
                    {p.min_rent && (
                      <p style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                        From ৳{parseFloat(p.min_rent).toLocaleString()}/mo
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROPERTY DETAIL MODAL (for visitors) */}
        {selectedProperty && (
          <div className="modal-overlay" onClick={closeDetail}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600 }}>Property Details</h2>
                <button onClick={closeDetail} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  fontSize: '24px', cursor: 'pointer', lineHeight: 1,
                }}>×</button>
              </div>

              {detailLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading...</p>
              ) : propertyDetail ? (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '8px' }}>
                    {propertyDetail.name || 'Property'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{propertyDetail.address}</p>
                  {propertyDetail.city && <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>City: {propertyDetail.city}</p>}
                  <span className="badge badge-purple" style={{ marginBottom: '16px' }}>{propertyDetail.type}</span>

                  {propertyDetail.amenities?.length > 0 && (
                    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>Amenities</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {propertyDetail.amenities.map(a => <span key={a} className="badge badge-blue">{a}</span>)}
                      </div>
                    </div>
                  )}

                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginTop: '24px', marginBottom: '12px' }}>
                    Available Units ({propertyDetail.units?.length || 0})
                  </h4>

                  {propertyDetail.units?.length > 0 ? (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden' }}>
                      <table className="nexas-table">
                        <thead><tr><th>Unit</th><th>Floor</th><th>Bed</th><th>Bath</th><th>Area</th><th>Rent</th></tr></thead>
                        <tbody>
                          {propertyDetail.units.map(u => (
                            <tr key={u.unit_id}>
                              <td style={{ fontWeight: 600 }}>{u.unit_number}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{u.floor || '-'}</td>
                              <td>{u.bedrooms}</td>
                              <td>{u.bathrooms}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{u.area_sqft ? `${u.area_sqft} sqft` : '-'}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>৳{parseFloat(u.rent_amount).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No vacant units right now.</p>
                  )}

                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
                      Interested? Sign in or register to contact the landlord.
                    </p>
                    <button onClick={() => navigate('/register')} style={{
                      padding: '12px 32px', borderRadius: '12px', border: 'none',
                      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                      color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}>Register Now</button>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#ff7b7b' }}>Failed to load property details.</p>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)', padding: '32px 20px',
          textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px',
        }}>
          <p>© 2026 <span className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>NexasEstate</span>. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Landing;
