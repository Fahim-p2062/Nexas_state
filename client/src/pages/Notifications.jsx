import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role } = useAuth();

  const load = () => API.get('/notifications/me').then(r => { setNotifs(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markRead = async (e, id) => {
    e.stopPropagation();
    try { await API.put(`/notifications/${id}/read`); toast.success('Marked as read'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleNotifClick = (n) => {
    const type = (n.type || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();
    
    // Auto-mark as read on click if it isn't already
    if (!n.is_read) {
      API.put(`/notifications/${n.notification_id}/read`).then(load).catch(()=>{});
    }
    
    if (type === 'payment') navigate(role === 'Landlord' ? '/payments' : '/tenant-portal');
    else if (type === 'maintenance') navigate('/maintenance');
    else if (type === 'lease') navigate('/leases');
    else if (type === 'booking' || msg.includes('booking') || msg.includes('rent')) navigate(role === 'Landlord' ? '/landlord-bookings' : '/my-bookings');
    else if (type === 'objection' || type === 'complaint' || msg.includes('objection')) navigate('/complaints');
  };

  const typeIcon = { Payment: '◈', Maintenance: '⚙', Lease: '◫', Booking: '📬', Objection: '⚑', General: '◆' };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '32px' }}>Notifications</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '700px' }}>
          {notifs.map(n => (
            <div key={n.notification_id} onClick={() => handleNotifClick(n)} style={{
              background: n.is_read ? 'var(--bg-card)' : 'var(--bg-secondary)',
              border: `1px solid ${n.is_read ? 'var(--border-subtle)' : 'rgba(64,47,181,0.3)'}`,
              borderRadius: '14px', padding: '18px 20px',
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '20px', opacity: 0.5, flexShrink: 0, marginTop: '2px' }}>{typeIcon[n.type] || '◆'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', lineHeight: 1.5, marginBottom: '6px', color: n.is_read ? 'var(--text-muted)' : 'white' }}>{n.message}</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className={`badge badge-${n.type === 'Payment' ? 'green' : n.type === 'Maintenance' ? 'yellow' : n.type === 'Booking' ? 'pink' : 'purple'}`}>{n.type}</span>
                  <span style={{ fontSize: '11px', color: '#555' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {!n.is_read && (
                <button onClick={(e) => markRead(e, n.notification_id)} style={{
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
                  background: 'transparent', color: 'var(--text-muted)', fontSize: '11px',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
                >Mark Read</button>
              )}
            </div>
          ))}
          {notifs.length === 0 && !loading && <p style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>No notifications</p>}
        </div>
      </div>
    </>
  );
};
export default Notifications;
