import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'admin', label: 'Admin Panel', path: '/admin', icon: '⚜', roles: ['Admin'] },
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '◆', roles: ['Landlord'] },
  { id: 'properties', label: 'Properties', path: '/properties', icon: '⌂', roles: ['Landlord'] },
  { id: 'bookings-l', label: 'Bookings', path: '/landlord-bookings', icon: '📬', roles: ['Landlord'] },
  { id: 'tenants', label: 'Tenants', path: '/tenants', icon: '◉', roles: ['Landlord'] },
  { id: 'payments', label: 'Payments', path: '/payments', icon: '◈', roles: ['Landlord'] },
  { id: 'maintenance-l', label: 'Maintenance', path: '/maintenance', icon: '⚙', roles: ['Landlord', 'Staff'] },
  { id: 'leases', label: 'Leases', path: '/leases', icon: '◫', roles: ['Landlord'] },
  { id: 'staff', label: 'Staff', path: '/staff', icon: '◎', roles: ['Landlord'] },
  { id: 'objections-l', label: 'Objections', path: '/complaints', icon: '⚑', roles: ['Landlord'] },
  { id: 'tenant-portal', label: 'My Portal', path: '/tenant-portal', icon: '◆', roles: ['Tenant'] },
  { id: 'browse-props', label: 'Browse Properties', path: '/browse-properties', icon: '🏘️', roles: ['Tenant'] },
  { id: 'my-bookings', label: 'My Bookings', path: '/my-bookings', icon: '📋', roles: ['Tenant'] },
  { id: 'maintenance-t', label: 'Maintenance', path: '/maintenance', icon: '⚙', roles: ['Tenant'] },
  { id: 'notifications', label: 'Notifications', path: '/notifications', icon: '🔔', roles: ['Tenant', 'Landlord', 'Staff'] },
  { id: 'objections-t', label: 'Objections', path: '/complaints', icon: '⚑', roles: ['Tenant'] },
  { id: 'objections-a', label: 'Objections', path: '/complaints', icon: '⚑', roles: ['Admin'] },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout, user } = useAuth();
  const filtered = navItems.filter(item => item.roles.includes(role));
  const activeIndex = filtered.findIndex(item => location.pathname.startsWith(item.path));

  return (
    <aside style={{ position:'fixed',left:0,top:0,bottom:0,width:'220px',background:'var(--bg-secondary)',borderRight:'1px solid var(--border-subtle)',display:'flex',flexDirection:'column',zIndex:50,padding:'24px 0' }}>
      <div style={{ padding:'0 20px',marginBottom:'40px' }}>
        <h1 className="gradient-text" style={{ fontFamily:'var(--font-heading)',fontSize:'1.6rem',fontWeight:600,letterSpacing:'-0.5px',cursor:'pointer' }} onClick={()=>navigate('/')}>NexasEstate</h1>
        <p style={{ color:'var(--text-muted)',fontSize:'11px',marginTop:'2px',letterSpacing:'1px',textTransform:'uppercase' }}>
          {role==='Admin'?'Admin Panel':role==='Tenant'?'Tenant Portal':'Property Management'}
        </p>
      </div>
      <nav style={{ flex:1,padding:'0 12px' }}>
        <div className="radio-container" style={{ '--total-radio':filtered.length }}>
          {filtered.map((item,index)=>(
            <div key={item.id}>
              <input type="radio" id={`radio-${item.id}`} name="nav-radio" checked={activeIndex===index} onChange={()=>navigate(item.path)} />
              <label htmlFor={`radio-${item.id}`} onClick={()=>navigate(item.path)}>
                <span style={{ fontSize:'16px',opacity:0.7 }}>{item.icon}</span>{item.label}
              </label>
            </div>
          ))}
          <div className="glider-container"><div className="glider" style={{ transform:`translateY(${Math.max(0,activeIndex)*100}%)` }}></div></div>
        </div>
      </nav>
      <div style={{ padding:'16px 20px',borderTop:'1px solid var(--border-subtle)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px' }}>
          <div style={{ width:'36px',height:'36px',borderRadius:'50%',background:role==='Admin'?'linear-gradient(135deg,#ff7b7b,#cf30aa)':'linear-gradient(135deg,var(--accent-purple),var(--accent-pink))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:700,color:'white' }}>
            {user?.name?.charAt(0)?.toUpperCase()||'U'}
          </div>
          <div>
            <div style={{ fontSize:'13px',fontWeight:600,color:'white' }}>{user?.name||'User'}</div>
            <div style={{ fontSize:'11px',color:'var(--text-muted)' }}>{role}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width:'100%',padding:'8px',borderRadius:'8px',background:'rgba(255,80,80,0.1)',border:'1px solid rgba(255,80,80,0.2)',color:'#ff7b7b',fontSize:'12px',fontWeight:600,cursor:'pointer',transition:'all 0.3s',fontFamily:'var(--font-body)' }}
          onMouseEnter={e=>e.target.style.background='rgba(255,80,80,0.2)'}
          onMouseLeave={e=>e.target.style.background='rgba(255,80,80,0.1)'}>Sign Out</button>
      </div>
    </aside>
  );
};

export default Sidebar;
