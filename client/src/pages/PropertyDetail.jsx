import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ unit_number: '', floor: '', bedrooms: 1, bathrooms: 1, area_sqft: '', rent_amount: '' });
  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  useEffect(() => {
    Promise.all([API.get(`/properties/${id}`), API.get(`/units/property/${id}`)])
      .then(([p, u]) => { setProperty(p.data.data); setUnits(u.data.data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/properties'); });
  }, [id]);

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    try { await API.post(`/units/property/${id}`, form); toast.success('Unit added!'); setModal(false); const r = await API.get(`/units/property/${id}`); setUnits(r.data.data); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading || !property) return <LoadingSpinner />;

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <button onClick={() => navigate('/properties')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', fontFamily: 'var(--font-body)' }}>← Back to Properties</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>{property.name || 'Property'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{property.address}{property.city ? `, ${property.city}` : ''}</p>
            <span className="badge badge-purple" style={{ marginTop: '8px' }}>{property.type}</span>
          </div>
          <button onClick={() => setModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ Add Unit</button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '16px' }}>Units ({units.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {units.map(u => (
            <div key={u.unit_id} className="stat-card">
              <div className="shimmer"></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600 }}>Unit {u.unit_number}</h3>
                <span className={`badge ${u.status === 'Vacant' ? 'badge-green' : u.status === 'Occupied' ? 'badge-purple' : 'badge-yellow'}`}>{u.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Floor:</span> {u.floor || '—'}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Bed:</span> {u.bedrooms}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Bath:</span> {u.bathrooms}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Area:</span> {u.area_sqft ? `${u.area_sqft} sqft` : '—'}</div>
              </div>
              <div style={{ marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--accent-green)', fontWeight: 600 }}>${parseFloat(u.rent_amount).toLocaleString()}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/mo</span></div>
              {u.tenant_name && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Tenant: {u.tenant_name}</p>}
            </div>
          ))}
        </div>
        {units.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>No units yet</p>}

        <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Unit">
          <form onSubmit={handleCreateUnit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Unit Number *</label><input className="nexas-input" value={form.unit_number} onChange={e => setForm({ ...form, unit_number: e.target.value })} required /></div>
              <div><label style={labelStyle}>Floor</label><input className="nexas-input" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Bedrooms</label><input className="nexas-input" type="number" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} /></div>
              <div><label style={labelStyle}>Bathrooms</label><input className="nexas-input" type="number" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div><label style={labelStyle}>Area (sqft)</label><input className="nexas-input" type="number" step="0.01" value={form.area_sqft} onChange={e => setForm({ ...form, area_sqft: e.target.value })} /></div>
              <div><label style={labelStyle}>Rent *</label><input className="nexas-input" type="number" step="0.01" value={form.rent_amount} onChange={e => setForm({ ...form, rent_amount: e.target.value })} required /></div>
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Add Unit</button>
          </form>
        </Modal>
      </div>
    </>
  );
};
export default PropertyDetail;
