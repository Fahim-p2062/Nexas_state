import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => API.get('/notifications/me').then(r => { setNotifs(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try { await API.put(`/notifications/${id}/read`); toast.success('Marked as read'); load(); }
    catch { toast.error('Failed'); }
  };

  const typeIcon = { Payment: '◈', Maintenance: '⚙', Lease: '◫', General: '◆' };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '32px' }}>Notifications</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '700px' }}>
          {notifs.map(n => (
            <div key={n.notification_id} style={{
              background: n.is_read ? 'var(--bg-card)' : 'var(--bg-secondary)',
              border: `1px solid ${n.is_read ? 'var(--border-subtle)' : 'rgba(64,47,181,0.3)'}`,
              borderRadius: '14px', padding: '18px 20px',
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              transition: 'all 0.3s',
            }}>
              <span style={{ fontSize: '20px', opacity: 0.5, flexShrink: 0, marginTop: '2px' }}>{typeIcon[n.type] || '◆'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', lineHeight: 1.5, marginBottom: '6px', color: n.is_read ? 'var(--text-muted)' : 'white' }}>{n.message}</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className={`badge badge-${n.type === 'Payment' ? 'green' : n.type === 'Maintenance' ? 'yellow' : 'purple'}`}>{n.type}</span>
                  <span style={{ fontSize: '11px', color: '#555' }}>{n.created_at}</span>
                </div>
              </div>
              {!n.is_read && (
                <button onClick={() => markRead(n.notification_id)} style={{
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
                  background: 'transparent', color: 'var(--text-muted)', fontSize: '11px',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                }}>Mark Read</button>
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
