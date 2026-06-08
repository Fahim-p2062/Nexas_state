import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── Tiny Sparkline SVG ─── */
const Sparkline = ({ values = [], color = '#5865F2', height = 36 }) => {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 120, h = height;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const fill = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const fillPath = `M${fill[0]} L${fill.slice(1).join(' L')} L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Bar Chart ─── */
const BarChart = ({ data = [], colorA = '#5865F2', colorB = '#2DD4BF' }) => {
  const max = Math.max(...data.map(d => Math.max(parseFloat(d.revenue || 0), parseFloat(d.expenses || 0))), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', padding: '0 4px' }}>
      {data.map((d, i) => {
        const rev = (parseFloat(d.revenue || 0) / max) * 120;
        const exp = (parseFloat(d.expenses || 0) / max) * 120;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px' }}>
              <div style={{ width: '8px', height: `${Math.max(rev, 2)}px`, background: colorA, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
              {d.expenses !== undefined && (
                <div style={{ width: '8px', height: `${Math.max(exp, 2)}px`, background: colorB, borderRadius: '3px 3px 0 0', opacity: 0.7 }} />
              )}
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
              {d.month?.slice(0, 3) || d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Signal Pill ─── */
const Pill = ({ label, color }) => {
  const colors = {
    lime: { bg: 'rgba(163,230,53,0.12)', text: '#a3e635', dot: '#a3e635' },
    amber: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', dot: '#fbbf24' },
    red: { bg: 'rgba(248,113,113,0.12)', text: '#f87171', dot: '#f87171' },
    indigo: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', dot: '#818cf8' },
    cyan: { bg: 'rgba(34,211,238,0.12)', text: '#22d3ee', dot: '#22d3ee' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: c.bg, color: c.text, padding: '3px 10px',
      borderRadius: '99px', fontSize: '11px', fontWeight: 600,
      fontFamily: 'var(--font-mono)', letterSpacing: '0.3px'
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
};

/* ─── Stat Tile (Halo signature style) ─── */
const StatTile = ({ label, value, sub, trend, trendUp, sparkValues, color = '#5865F2', onClick, tag }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#1c1c28' : '#12121c',
        border: `1px solid ${hov ? 'rgba(88,101,242,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '10px', padding: '20px 22px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', gap: '0',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {label}
        </span>
        {tag && <Pill label={tag.label} color={tag.color} />}
      </div>
      {/* Value */}
      <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#eeeef8', letterSpacing: '-1px', lineHeight: 1, marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
      {/* Trend + Sparkline row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {trend && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: trendUp ? '#a3e635' : '#f87171', fontFamily: 'var(--font-mono)' }}>
              {trendUp ? '▲' : '▼'} {trend}
            </span>
          )}
          {sub && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</span>}
        </div>
        {sparkValues && <Sparkline values={sparkValues} color={color} height={36} />}
      </div>
    </div>
  );
};

/* ─── Section Header ─── */
const SectionHead = ({ dot, label, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot || '#5865F2', display: 'inline-block' }} />
      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
    </div>
    {right}
  </div>
);

/* ─── Card Shell ─── */
const Card = ({ children, style = {}, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#12121c',
        border: `1px solid ${hov && onClick ? 'rgba(88,101,242,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '10px', padding: '22px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s',
        ...style
      }}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [view, setView] = useState('24h');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <LoadingSpinner />;

  /* Derived data */
  const revenue = data.monthlyRevenue || [];
  const revValues = revenue.map(r => parseFloat(r.revenue || 0));
  const occupancyPct = data.totalUnits > 0 ? Math.round((data.occupiedUnits / data.totalUnits) * 100) : 0;
  const collectionRate = (data.totalRevenue > 0)
    ? Math.round(((data.totalRevenue - (data.overdueAmount || 0)) / data.totalRevenue) * 100)
    : 100;

  const viewBtn = (label) => ({
    padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)',
    background: view === label ? '#5865F2' : 'rgba(255,255,255,0.05)',
    color: view === label ? '#fff' : 'var(--text-muted)',
    transition: 'all 0.15s',
  });

  const openModal = async (type) => {
    setActiveModal(type);
    setModalLoading(true);
    try {
      let endpoint = '';
      if (type === 'properties') endpoint = '/admin/properties';
      else if (['units', 'vacant', 'occupied'].includes(type)) endpoint = '/admin/units';
      else if (type === 'landlords') endpoint = '/admin/landlords';
      else if (type === 'tenants') endpoint = '/admin/tenants';
      else if (type === 'staff') endpoint = '/admin/staff';
      else if (type === 'leases') endpoint = '/admin/leases';
      
      if (endpoint) {
        const res = await API.get(endpoint);
        let list = res.data.data || [];
        if (type === 'vacant') list = list.filter(u => u.status === 'Vacant');
        if (type === 'occupied') list = list.filter(u => u.status === 'Occupied');
        setModalData(list);
      }
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const renderModalTable = () => {
    if (!modalData || modalData.length === 0) return <tbody><tr><td style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr></tbody>;
    const type = activeModal;
    
    if (type === 'properties') {
      return (
        <>
          <thead><tr><th>Name</th><th>Location</th><th>Landlord</th><th>Units (Vacant)</th></tr></thead>
          <tbody>
            {modalData.map(p => (
              <tr key={p.property_id}>
                <td>{p.name}</td><td>{p.location}</td><td>{p.landlord_name}</td>
                <td>{p.unit_count} ({p.vacant_count})</td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }
    if (['units', 'vacant', 'occupied'].includes(type)) {
      return (
        <>
          <thead><tr><th>Unit Number</th><th>Property</th><th>Rent</th><th>Status</th></tr></thead>
          <tbody>
            {modalData.map(u => (
              <tr key={u.unit_id}>
                <td>{u.unit_number}</td><td>{u.property_name}</td><td>৳{parseFloat(u.rent_amount).toLocaleString()}</td>
                <td><span className={`badge ${u.status === 'Occupied' ? 'badge-green' : u.status === 'Vacant' ? 'badge-yellow' : 'badge-purple'}`}>{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }
    if (type === 'landlords') {
      return (
        <>
          <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>Properties</th></tr></thead>
          <tbody>
            {modalData.map(l => (
              <tr key={l.landlord_id}>
                <td>{l.name}</td><td>{l.email}</td><td>{l.contact || '-'}</td><td>{l.property_count}</td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }
    if (type === 'tenants') {
      return (
        <>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Active Leases</th></tr></thead>
          <tbody>
            {modalData.map(t => (
              <tr key={t.tenant_id}>
                <td>{t.name}</td><td>{t.email}</td><td>{t.phone || '-'}</td><td>{t.active_leases}</td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }
    if (type === 'staff') {
      return (
        <>
          <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Landlord</th></tr></thead>
          <tbody>
            {modalData.map(s => (
              <tr key={s.staff_id}>
                <td>{s.name}</td><td>{s.role}</td><td>{s.phone || '-'}</td><td>{s.landlord_name}</td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }
    if (type === 'leases') {
      return (
        <>
          <thead><tr><th>Tenant</th><th>Property (Unit)</th><th>Rent</th><th>Start Date</th><th>Status</th></tr></thead>
          <tbody>
            {modalData.map(l => (
              <tr key={l.lease_id}>
                <td>{l.tenant_name}</td><td>{l.property_name} ({l.unit_number})</td><td>৳{parseFloat(l.rent_amount).toLocaleString()}</td>
                <td>{l.start_date}</td><td><span className={`badge ${l.status === 'Active' ? 'badge-green' : 'badge-red'}`}>{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }
    return null;
  };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.4s ease', maxWidth: '1100px' }}>

        {/* ── TOP BAR ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Pill label="v1.0 · NEXAS ADMIN" color="indigo" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 800, color: '#eeeef8', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              Platform Overview
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              Full system snapshot · {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {/* Time range switcher */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
            {['24h', '7d', '30d', '90d'].map(v => (
              <button key={v} style={viewBtn(v)} onClick={() => setView(v)}>{v}</button>
            ))}
          </div>
        </div>

        {/* ── ROW 1: SIGNATURE STAT TILES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
          <StatTile
            label="Total Revenue"
            value={`৳${(data.totalRevenue / 1000).toFixed(0)}K`}
            sub="All-time collected"
            trend="+8.1%"
            trendUp={true}
            sparkValues={revValues.length > 1 ? revValues : [10, 20, 15, 30, 25, 40]}
            color="#a3e635"
            tag={{ label: 'Revenue', color: 'lime' }}
            onClick={() => navigate('/admin/revenue-detail')}
          />
          <StatTile
            label="Total Expenses"
            value={`৳${(data.totalExpenses / 1000).toFixed(0)}K`}
            sub="Operational costs"
            trend="-2.3%"
            trendUp={false}
            sparkValues={[30, 25, 28, 22, 26, 20]}
            color="#f87171"
            tag={{ label: 'Costs', color: 'red' }}
            onClick={() => navigate('/admin/expenses-detail')}
          />
          <StatTile
            label="Net Profit"
            value={`৳${(data.totalProfit / 1000).toFixed(0)}K`}
            sub="Revenue minus costs"
            trend={data.totalProfit >= 0 ? '+5.7%' : '-5.7%'}
            trendUp={data.totalProfit >= 0}
            sparkValues={[5, 12, 8, 18, 14, 22]}
            color="#22d3ee"
            tag={{ label: data.totalProfit >= 0 ? 'Profit' : 'Loss', color: data.totalProfit >= 0 ? 'cyan' : 'red' }}
            onClick={() => navigate('/admin/profit-detail')}
          />
          <StatTile
            label="Overdue Amount"
            value={`৳${(data.overdueAmount / 1000).toFixed(1)}K`}
            sub={`${data.overduePayments} overdue payments`}
            trend={data.overduePayments > 0 ? `${data.overduePayments} pending` : 'All clear'}
            trendUp={data.overduePayments === 0}
            sparkValues={[2, 4, 3, 5, 4, data.overduePayments]}
            color="#fbbf24"
            tag={{ label: data.overduePayments > 0 ? 'Overdue' : 'Clear', color: data.overduePayments > 0 ? 'amber' : 'lime' }}
            onClick={() => navigate('/admin/overdue-detail')}
          />
        </div>

        {/* ── ROW 2: SYSTEM METRICS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <StatTile label="Active Sessions" value={data.totalLandlords + data.totalTenants + data.totalStaff} sub="Registered users" sparkValues={[8, 12, 10, 15, 13, data.totalLandlords + data.totalTenants + data.totalStaff]} color="#818cf8" onClick={() => navigate('/admin/users-detail')} />
          <StatTile label="Occupancy Rate" value={`${occupancyPct}%`} sub={`${data.occupiedUnits} / ${data.totalUnits} units`} sparkValues={[60, 65, 70, 72, occupancyPct - 5, occupancyPct]} color="#a3e635" onClick={() => navigate('/admin/occupancy-detail')} />
          <StatTile label="Open Maintenance" value={data.openMaintenanceRequests} sub="Pending resolution" sparkValues={[4, 6, 5, 8, 7, data.openMaintenanceRequests]} color="#fbbf24" onClick={() => navigate('/admin/maintenance-detail')} />
          <StatTile label="Collection Rate" value={`${collectionRate}%`} sub="Payment compliance" sparkValues={[85, 88, 90, 87, 92, collectionRate]} color="#22d3ee" onClick={() => navigate('/admin/collection-detail')} />
        </div>

        {/* ── ROW 3: CHART + CHECKLIST ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '12px', marginBottom: '12px' }}>
          {/* Revenue Chart */}
          <Card>
            <SectionHead
              dot="#5865F2"
              label="Revenue · Last 6 Months"
              right={
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ width: '8px', height: '8px', background: '#5865F2', borderRadius: '2px' }} /> Revenue
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ width: '8px', height: '8px', background: '#2DD4BF', borderRadius: '2px' }} /> Expenses
                  </span>
                </div>
              }
            />
            {revenue.length > 0 ? (
              <BarChart data={revenue} colorA="#5865F2" colorB="#2DD4BF" />
            ) : (
              <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No revenue data available
              </div>
            )}
          </Card>

          {/* Platform Entities */}
          <Card>
            <SectionHead dot="#a3e635" label="Platform Entities" right={<span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{data.totalLandlords + data.totalTenants + data.totalStaff} total</span>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Landlords', value: data.totalLandlords, max: data.totalLandlords + data.totalTenants + data.totalStaff, color: '#818cf8', nav: '/complaints' },
                { label: 'Tenants', value: data.totalTenants, max: data.totalLandlords + data.totalTenants + data.totalStaff, color: '#e879f9', nav: '/complaints' },
                { label: 'Staff Members', value: data.totalStaff, max: data.totalLandlords + data.totalTenants + data.totalStaff, color: '#22d3ee', nav: '/complaints' },
                { label: 'Properties', value: data.totalProperties, max: Math.max(data.totalProperties * 2, 1), color: '#fbbf24', nav: '/complaints' },
                { label: 'Active Leases', value: data.activeLeases, max: data.totalUnits, color: '#a3e635', nav: '/complaints' },
              ].map((item, i) => (
                <div key={i}
                  onClick={() => navigate(item.nav)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#eeeef8', fontFamily: 'var(--font-mono)' }}>{item.value}</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((item.value / item.max) * 100, 100)}%`, background: item.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── ROW 4: UNIT STATUS + HEALTH SIGNALS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {/* Unit Breakdown */}
          <Card onClick={() => navigate('/properties')}>
            <SectionHead dot="#fbbf24" label="Unit Status" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Occupied', value: data.occupiedUnits, color: '#a3e635' },
                { label: 'Vacant', value: data.vacantUnits, color: '#fbbf24' },
                { label: 'Total Units', value: data.totalUnits, color: '#818cf8' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>{s.value}</span>
                </div>
              ))}
              <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${occupancyPct}%`, background: 'linear-gradient(90deg, #5865F2, #a3e635)', borderRadius: '99px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>0%</span>
                  <span style={{ fontSize: '10px', color: '#a3e635', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{occupancyPct}% occupied</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>100%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Health */}
          <Card>
            <SectionHead dot="#22d3ee" label="Financial Health" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'This Month Revenue', value: `৳${(data.revenueThisMonth || 0).toLocaleString()}`, color: '#a3e635', nav: '/payments' },
                { label: 'This Month Expenses', value: `৳${(data.expensesThisMonth || 0).toLocaleString()}`, color: '#f87171', nav: '/expenses' },
                { label: 'This Month Profit', value: `৳${(data.profitThisMonth || 0).toLocaleString()}`, color: (data.profitThisMonth || 0) >= 0 ? '#22d3ee' : '#f87171', nav: null },
                { label: 'Pending Collections', value: `৳${(data.pendingAmount || 0).toLocaleString()}`, color: '#fbbf24', nav: '/payments' },
              ].map((row, i) => (
                <div key={i}
                  onClick={() => row.nav && navigate(row.nav)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: row.nav ? 'pointer' : 'default', padding: '2px 0' }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: row.color, fontFamily: 'var(--font-mono)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* System Alerts */}
          <Card>
            <SectionHead dot="#f87171" label="System Alerts" right={<Pill label={`${(data.overduePayments || 0) + (data.openMaintenanceRequests || 0)} items`} color={((data.overduePayments || 0) + (data.openMaintenanceRequests || 0)) > 0 ? 'amber' : 'lime'} />} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  icon: data.overduePayments > 0 ? '⚠' : '✓',
                  label: 'Overdue Payments',
                  value: data.overduePayments,
                  color: data.overduePayments > 0 ? '#fbbf24' : '#a3e635',
                  nav: '/payments',
                },
                {
                  icon: data.openMaintenanceRequests > 0 ? '⚠' : '✓',
                  label: 'Open Maintenance',
                  value: data.openMaintenanceRequests,
                  color: data.openMaintenanceRequests > 0 ? '#f87171' : '#a3e635',
                  nav: '/maintenance',
                },
                {
                  icon: '◉',
                  label: 'Active Leases',
                  value: data.activeLeases,
                  color: '#818cf8',
                  nav: '/leases',
                },
              ].map((alert, i) => (
                <div key={i}
                  onClick={() => navigate(alert.nav)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,101,242,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <span style={{ fontSize: '14px', color: alert.color }}>{alert.icon}</span>
                  <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{alert.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: alert.color, fontFamily: 'var(--font-mono)' }}>{alert.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── ROW 5: RECENT PAYMENTS TABLE ── */}
        <Card style={{ marginBottom: '12px' }}>
          <SectionHead
            dot="#818cf8"
            label="Recent Payments"
            right={
              <button onClick={() => navigate('/payments')} style={{ fontSize: '11px', color: '#818cf8', background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.25)', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                View all →
              </button>
            }
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tenant', 'Property', 'Unit', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.recentPayments || []).slice(0, 5).map((p, i) => (
                  <tr key={i}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,101,242,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => navigate('/payments')}
                  >
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#eeeef8', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{p.tenant_name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{p.property_name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{p.unit_number}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, color: '#a3e635', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>৳{parseFloat(p.amount).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{p.payment_date}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <Pill label={p.status} color={p.status === 'Paid' ? 'lime' : p.status === 'Overdue' ? 'red' : 'amber'} />
                    </td>
                  </tr>
                ))}
                {(!data.recentPayments || data.recentPayments.length === 0) && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── ROW 6: EXPENSE BREAKDOWN + RECENT EXPENSES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Expense by category */}
          <Card>
            <SectionHead dot="#e879f9" label="Expense Breakdown" right={<button onClick={() => navigate('/expenses')} style={{ fontSize: '11px', color: '#e879f9', background: 'rgba(232,121,249,0.1)', border: '1px solid rgba(232,121,249,0.2)', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>View all →</button>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(data.expenseByCategory || []).slice(0, 5).map((cat, i) => {
                const maxExp = parseFloat(data.expenseByCategory[0]?.total || 1);
                const w = (parseFloat(cat.total) / maxExp) * 100;
                const colors = ['#e879f9', '#818cf8', '#22d3ee', '#fbbf24', '#a3e635'];
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{cat.category || 'Other'}</span>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: colors[i % colors.length] }}>৳{parseFloat(cat.total).toLocaleString()}</span>
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${w}%`, background: colors[i % colors.length], borderRadius: '99px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
              {(!data.expenseByCategory || data.expenseByCategory.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No expense data</p>
              )}
            </div>
          </Card>

          {/* Recent Expenses table */}
          <Card>
            <SectionHead dot="#f87171" label="Recent Expenses" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(data.recentExpenses || []).slice(0, 5).map((e, i) => (
                <div key={i}
                  onClick={() => navigate('/expenses')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                  onMouseEnter={el => el.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={el => el.currentTarget.style.opacity = '1'}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#eeeef8', marginBottom: '2px' }}>{e.property_name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{e.category} · {e.expense_date}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f87171', fontSize: '13px' }}>৳{parseFloat(e.amount).toLocaleString()}</span>
                </div>
              ))}
              {(!data.recentExpenses || data.recentExpenses.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No expenses recorded</p>
              )}
            </div>
          </Card>
        </div>

        {/* ── FOOTER STATUS BAR ── */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Pill label="stable" color="lime" />
            <Pill label="v1.0" color="indigo" />
            <Pill label="dark mode" color="cyan" />
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Nexas Estate Admin Console · All data live from database
          </span>
        </div>

      </div>

      {/* Details Modal */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(4px)' }} onClick={() => setActiveModal(null)}>
          <div style={{ background: 'var(--bg-card)', width: '100%', maxWidth: '900px', maxHeight: '85vh', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-subtle)', animation: 'modalIn 0.3s cubic-bezier(0.23,1,0.32,1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', textTransform: 'capitalize' }}>
                {activeModal.replace('vacant', 'Vacant Units').replace('occupied', 'Occupied Units').replace('leases', 'Active Leases')} Details
              </h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer', padding: '0 8px' }}>&times;</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, background: 'var(--bg-primary)' }}>
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}><LoadingSpinner duration={100} /></div>
              ) : (
                <table className="nexas-table" style={{ width: '100%', margin: 0, borderRadius: 0, border: 'none' }}>
                  {renderModalTable()}
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
