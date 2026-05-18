import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const BrowseProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const navigate = useNavigate();

  const load = (params = {}) => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (params.search || search) qs.set('search', params.search ?? search);
    if (params.type || typeFilter) qs.set('type', params.type ?? typeFilter);
    qs.set('_t', Date.now());
    API.get(`/bookings/browse?${qs.toString()}`)
      .then(r => { setProperties(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  const gradients = [
    'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.15))',
    'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.15))',
    'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(59,130,246,0.15))',
    'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(236,72,153,0.15))',
    'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.15))',
    'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(16,185,129,0.15))',
  ];

  const typeIcons = { Residential: '🏠', Commercial: '🏢', Mixed: '🏗️' };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '4px' }}>
          Browse <span className="gradient-text">Properties</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
          Find your dream home — browse all properties and book the one you love
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <input
            className="nexas-input"
            placeholder="Search by name, city, or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 300px', minWidth: '200px' }}
          />
          <select
            className="nexas-select"
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); load({ type: e.target.value }); }}
            style={{ width: '160px' }}
          >
            <option value="">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Mixed">Mixed</option>
          </select>
          <button type="submit" style={{
            padding: '12px 28px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'all 0.3s',
          }}>Search</button>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading properties...</div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.3 }}>🏘️</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>No properties found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{properties.length}</strong> properties
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {properties.map((p, i) => (
                <div
                  key={p.property_id}
                  onClick={() => navigate(`/browse-properties/${p.property_id}`)}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '18px',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.35s ease',
                    animation: `fadeSlideUp 0.5s ease ${i * 0.07}s both`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(139,92,246,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    height: '140px', background: gradients[i % gradients.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <span style={{ fontSize: '52px', opacity: 0.45, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}>
                      {typeIcons[p.type] || '🏠'}
                    </span>
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: p.vacant_units > 0 ? 'rgba(16,185,129,0.85)' : 'rgba(255,80,80,0.85)',
                      backdropFilter: 'blur(10px)',
                      padding: '5px 14px', borderRadius: '20px', fontSize: '11px',
                      color: 'white', fontWeight: 700, letterSpacing: '0.3px',
                    }}>
                      {p.vacant_units > 0 ? `${p.vacant_units} Vacant` : 'Fully Occupied'}
                    </div>
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)',
                      padding: '4px 12px', borderRadius: '20px', fontSize: '10px',
                      color: 'rgba(255,255,255,0.9)', fontWeight: 600,
                    }}>{p.type}</div>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600,
                      marginBottom: '6px', lineHeight: '1.3',
                    }}>
                      {p.property_name || 'Property'}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      📍 {p.address}{p.city ? `, ${p.city}` : ''}
                    </p>

                    {p.description && (
                      <p style={{
                        fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px',
                        lineHeight: '1.6', opacity: 0.8,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>{p.description}</p>
                    )}

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      <span className="badge badge-blue">{p.total_units} units</span>
                      {p.min_bedrooms != null && p.max_bedrooms != null && (
                        <span className="badge badge-green">
                          {p.min_bedrooms === p.max_bedrooms ? `${p.min_bedrooms} bed` : `${p.min_bedrooms}–${p.max_bedrooms} bed`}
                        </span>
                      )}
                    </div>

                    {p.min_rent && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '17px',
                        color: 'var(--accent-green)', fontWeight: 700, marginBottom: '10px',
                      }}>
                        ৳{parseFloat(p.min_rent).toLocaleString()}
                        {p.min_rent !== p.max_rent && <span> — ৳{parseFloat(p.max_rent).toLocaleString()}</span>}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
                      </div>
                    )}

                    {p.amenities && p.amenities.length > 0 && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {p.amenities.slice(0, 3).map((a, idx) => (
                          <span key={idx} style={{
                            fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                            background: 'rgba(139,92,246,0.08)', color: 'var(--text-muted)',
                            border: '1px solid rgba(139,92,246,0.12)',
                          }}>{a}</span>
                        ))}
                        {p.amenities.length > 3 && (
                          <span style={{ fontSize: '10px', color: 'var(--accent-purple)', alignSelf: 'center', fontWeight: 600 }}>
                            +{p.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: '12px', borderTop: '1px solid var(--border-subtle)',
                    }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>
                        by {p.landlord_name}
                      </span>
                      <span style={{
                        fontSize: '12px', color: 'var(--accent-purple)', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default BrowseProperties;
