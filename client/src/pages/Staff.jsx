import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffStats, setStaffStats] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', phone: '' });
  const load = () => API.get('/staff').then(r => { setStaff(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  const openProfile = async (s) => {
    setSelectedStaff(s);
    setStaffStats(null);
    setProfileModal(true);
    try {
      const res = await API.get(`/staff/${s.staff_id}/stats`);
      setStaffStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await API.post('/staff', form); toast.success('Staff added!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div><h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>Staff</h1><p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{staff.length} team members</p></div>
          <button onClick={() => setModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ Add Staff</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {staff.map(s => (
            <div key={s.staff_id} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => openProfile(s)}>
              <div className="shimmer"></div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.name.charAt(0)}</div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{s.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {s.role && <span className="badge badge-purple">{s.role}</span>}
                    {s.phone && <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{s.phone}</span>}
                  </div>
                  {(s.Total_Tasks_Assigned > 0 || s.Average_Rating > 0) && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', fontWeight: 600 }}>
                      {s.Average_Rating > 0 && <span style={{ color: '#f59e0b' }}>⭐ {parseFloat(s.Average_Rating).toFixed(1)}</span>}
                      {s.Total_Tasks_Assigned > 0 && <span style={{ color: '#10b981' }}>✓ {s.Tasks_Completed} / {s.Total_Tasks_Assigned} Tasks</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {staff.length === 0 && !loading && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><p>No staff members yet</p></div>}
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Staff">
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Name *</label><input className="nexas-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Email *</label><input className="nexas-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Password</label><input className="nexas-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Role</label><input className="nexas-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Electrician, Plumber" /></div>
            <div style={{ marginBottom: '24px' }}><label style={labelStyle}>Phone</label><input className="nexas-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Add Staff</button>
          </form>
        </Modal>

        {/* Profile Details Modal */}
        <Modal isOpen={profileModal} onClose={() => setProfileModal(false)} title="Staff Profile">
          {selectedStaff && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>{selectedStaff.name.charAt(0)}</div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>{selectedStaff.name}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{selectedStaff.role || 'Staff Member'}</p>
              
              {staffStats ? (
                <>
                  {staffStats.avgRating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 24px', borderRadius: '30px', color: '#f59e0b', fontWeight: 700, fontSize: '18px' }}>
                      <span style={{ fontSize: '24px' }}>⭐</span> {staffStats.avgRating} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>({staffStats.reviews?.length} Reviews)</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <div style={{ padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontWeight: 700 }}>
                      {staffStats.completed} Completed
                    </div>
                    <div style={{ padding: '6px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '20px', fontWeight: 700 }}>
                      {staffStats.remaining} Pending
                    </div>
                  </div>

                  <div style={{ width: '100%', textAlign: 'left', marginTop: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      Customer Reviews <span style={{ background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>{staffStats.reviews?.length || 0}</span>
                    </h3>
                    
                    {staffStats.reviews && staffStats.reviews.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                        {staffStats.reviews.map(review => (
                          <div key={review.review_id} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: '14px' }}>{review.reviewer_name}</span>
                              <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span key={star} style={{ color: star <= review.rating ? '#f59e0b' : 'var(--border-subtle)', fontSize: '14px' }}>★</span>
                                ))}
                              </div>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>"{review.comment}"</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px' }}><LoadingSpinner duration={0} /></div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};
export default Staff;
