import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../api/axios';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    API.get('/notifications/me').then(res => {
      const count = res.data.data?.filter(n => !n.is_read).length || 0;
      setUnread(count);
    }).catch(() => {});
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: '220px', right: 0, height: '60px',
      background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)', zIndex: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
    }}>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Welcome back, <span style={{ color: 'white', fontWeight: 600 }}>{user?.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/notifications')} style={{
          position: 'relative', background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px',
          transition: 'color 0.3s',
        }}
        onMouseEnter={e => e.target.style.color = 'white'}
        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          🔔
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-6px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: 'var(--accent-pink)', fontSize: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700,
            }}>{unread}</span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
