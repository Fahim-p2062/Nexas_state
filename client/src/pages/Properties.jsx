import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import useScrollReveal from '../hooks/useScrollReveal';
import toast from 'react-hot-toast';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', type: 'Residential', description: '' });
  const navigate = useNavigate();
  useScrollReveal();

  const load = () => API.get('/properties').then(r => { setProperties(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await API.post('/properties', form); toast.success('Property created!'); setModal(false); setForm({ name: '', address: '', city: '', type: 'Residential', description: '' }); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    try { await API.delete(`/properties/${id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const gradients = ['142, 249, 252', '142, 252, 204', '215, 252, 142', '252, 208, 142', '252, 142, 239', '204, 142, 252'];

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>Properties</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{properties.length} total properties</p>
          </div>
          <button onClick={() => setModal(true)} style={{
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>+ Add Property</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {properties.map((p, i) => {
            const c = gradients[i % gradients.length];
            return (
              <div key={p.property_id} className="property-card scroll-reveal" style={{ cursor: 'pointer' }} onClick={() => navigate(`/properties/${p.property_id}`)}>
                <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={`/images/property${(i % 8) + 1}.png`} 
                    alt={p.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onError={(e) => { e.target.src = '/images/property1.png'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, var(--bg-card) 0%, transparent 100%)`, pointerEvents: 'none' }}></div>
                </div>
                <div style={{ padding: '20px', paddingTop: '10px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, marginBottom: '6px' }}>{p.name || 'Unnamed Property'}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{p.address}{p.city ? `, ${p.city}` : ''}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span className="badge badge-purple">{p.type}</span>
                    <span className="badge badge-blue">{p.unit_count || 0} units</span>
                    <span className="badge badge-green">{p.vacant_count || 0} vacant</span>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.property_id); }} style={{
                      padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.3)',
                      background: 'rgba(255,80,80,0.08)', color: '#ff7b7b', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {properties.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>⌂</p>
            <p>No properties yet. Add your first one!</p>
          </div>
        )}

        <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Property">
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Name</label>
              <input className="nexas-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Address *</label>
              <input className="nexas-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>City</label>
              <input className="nexas-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Description</label>
              <textarea className="nexas-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the property..." rows={3} style={{ resize: 'vertical', minHeight: '60px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Type</label>
              <select className="nexas-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="Residential">Residential</option><option value="Commercial">Commercial</option><option value="Mixed">Mixed</option>
              </select>
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Create Property</button>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Properties;
