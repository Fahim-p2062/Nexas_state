import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── Pill badge ─── */
const Pill = ({ label, color = 'indigo' }) => {
  const map = {
    lime:   { bg: 'rgba(163,230,53,0.12)',  text: '#a3e635', dot: '#a3e635' },
    amber:  { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', dot: '#fbbf24' },
    red:    { bg: 'rgba(248,113,113,0.12)', text: '#f87171', dot: '#f87171' },
    indigo: { bg: 'rgba(99,102,241,0.15)',  text: '#818cf8', dot: '#818cf8' },
    cyan:   { bg: 'rgba(34,211,238,0.12)',  text: '#22d3ee', dot: '#22d3ee' },
    pink:   { bg: 'rgba(232,121,249,0.12)', text: '#e879f9', dot: '#e879f9' },
  };
  const c = map[color] || map.indigo;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: c.bg, color: c.text, padding: '3px 10px',
      borderRadius: '99px', fontSize: '11px', fontWeight: 600,
      fontFamily: 'var(--font-mono)', letterSpacing: '0.3px', flexShrink: 0,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.dot }} />
      {label}
    </span>
  );
};

/* ─── Full-width SVG Area Chart ─── */
const AreaChart = ({ series, height = 260 }) => {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const W = 900, H = height, PAD = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  if (!series || series.length === 0) return null;

  const allVals = series.flatMap(s => s.data.map(Number));
  const maxVal = Math.max(...allVals, 1);
  const labels = series[0].labels;

  const xPos = (i) => (i / (labels.length - 1)) * innerW;
  const yPos = (v) => innerH - (Number(v) / maxVal) * innerH;

  const pathD = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`).join(' ');
  const areaD = (data) => {
    const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`).join(' ');
    return `${line} L${xPos(data.length - 1).toFixed(1)},${innerH} L0,${innerH} Z`;
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    val: Math.round(maxVal * f),
    y: yPos(maxVal * f),
  }));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
        onMouseMove={(e) => {
          const rect = svgRef.current.getBoundingClientRect();
          const scaleX = W / rect.width;
          const svgX = (e.clientX - rect.left) * scaleX - PAD.left;
          const idx = Math.round((svgX / innerW) * (labels.length - 1));
          if (idx >= 0 && idx < labels.length) {
            setTooltip({
              x: (svgX / innerW) * rect.width + PAD.left / scaleX,
              y: e.clientY - rect.top,
              idx,
            });
          }
        }}
      >
        <defs>
          {series.map(s => (
            <linearGradient key={s.id} id={`area-${s.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
              <stop offset="80%" stopColor={s.color} stopOpacity="0.03" />
            </linearGradient>
          ))}
        </defs>

        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Grid lines */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={0} y1={t.y} x2={innerW} y2={t.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={-8} y={t.y + 4} fontSize="10" fill="rgba(255,255,255,0.3)" textAnchor="end" fontFamily="JetBrains Mono, monospace">
                {t.val >= 1000 ? `৳${(t.val / 1000).toFixed(0)}k` : `৳${t.val}`}
              </text>
            </g>
          ))}

          {/* X labels */}
          {labels.map((lb, i) => (
            <text key={i} x={xPos(i)} y={innerH + 22} fontSize="10" fill="rgba(255,255,255,0.3)"
              textAnchor="middle" fontFamily="JetBrains Mono, monospace">
              {lb}
            </text>
          ))}

          {/* Vertical hover line */}
          {tooltip && (
            <line
              x1={xPos(tooltip.idx)} y1={0}
              x2={xPos(tooltip.idx)} y2={innerH}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3"
            />
          )}

          {/* Area fills */}
          {series.map(s => (
            <path key={`area-${s.id}`} d={areaD(s.data)} fill={`url(#area-${s.id})`} />
          ))}

          {/* Lines */}
          {series.map(s => (
            <path key={`line-${s.id}`} d={pathD(s.data)} fill="none"
              stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          ))}

          {/* Dots on hover */}
          {tooltip && series.map(s => (
            <circle key={`dot-${s.id}`}
              cx={xPos(tooltip.idx)} cy={yPos(s.data[tooltip.idx])}
              r="4" fill={s.color} stroke="#12121c" strokeWidth="2"
            />
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute', top: Math.max(0, tooltip.y - 90), left: Math.min(tooltip.x + 12, 999),
          background: '#1c1c28', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '10px 14px', pointerEvents: 'none',
          zIndex: 10, minWidth: '140px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {labels[tooltip.idx]}
          </div>
          {series.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
              <span style={{ fontSize: '11px', color: s.color, fontFamily: 'var(--font-mono)' }}>{s.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#eeeef8', fontFamily: 'var(--font-mono)' }}>
                ৳{Number(s.data[tooltip.idx]).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Stat block ─── */
const StatBlock = ({ label, value, sub, color = '#eeeef8', onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#12121c', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px', padding: '20px 22px', cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = 'rgba(88,101,242,0.4)')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
  >
    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>{label}</div>
    <div style={{ fontSize: '1.9rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>}
  </div>
);

/* ─── Section Header ─── */
const SectionHead = ({ dot, label, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot || '#5865F2', display: 'inline-block' }} />
      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
    </div>
    {right}
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const AdminRevenue = () => {
  const [dash, setDash] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const detailRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/admin/dashboard'),
      API.get('/admin/payments'),
    ]).then(([dashRes, payRes]) => {
      setDash(dashRes.data.data);
      setPayments(payRes.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !dash) return <LoadingSpinner />;

  /* Build merged monthly series */
  const monthSet = new Set([
    ...(dash.monthlyRevenue || []).map(r => r.month),
    ...(dash.monthlyExpenses || []).map(e => e.month),
  ]);
  const months = [...monthSet].sort();
  const revMap = Object.fromEntries((dash.monthlyRevenue || []).map(r => [r.month, parseFloat(r.revenue)]));
  const expMap = Object.fromEntries((dash.monthlyExpenses || []).map(e => [e.month, parseFloat(e.expense)]));

  const shortLabel = m => {
    const [y, mo] = m.split('-');
    return new Date(+y, +mo - 1, 1).toLocaleString('default', { month: 'short' });
  };

  const chartSeries = months.length > 0 ? [
    { id: 'rev', label: 'Revenue', color: '#5865F2', data: months.map(m => revMap[m] || 0), labels: months.map(shortLabel) },
    { id: 'exp', label: 'Expenses', color: '#f87171', data: months.map(m => expMap[m] || 0), labels: months.map(shortLabel) },
    { id: 'profit', label: 'Profit', color: '#a3e635', data: months.map(m => Math.max((revMap[m] || 0) - (expMap[m] || 0), 0)), labels: months.map(shortLabel) },
  ] : [];

  /* Payment stats */
  const totalPaid    = payments.filter(p => p.status === 'Paid').reduce((a, p) => a + parseFloat(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((a, p) => a + parseFloat(p.amount), 0);
  const totalOverdue = payments.filter(p => p.status === 'Overdue').reduce((a, p) => a + parseFloat(p.amount), 0);
  const collRate = (totalPaid + totalPending + totalOverdue) > 0
    ? Math.round((totalPaid / (totalPaid + totalPending + totalOverdue)) * 100)
    : 100;

  const filtered = filter === 'All' ? payments : payments.filter(p => p.status === filter);

  const filterBtn = (label, color) => {
    const active = filter === label;
    const colors = { All: '#818cf8', Paid: '#a3e635', Pending: '#fbbf24', Overdue: '#f87171' };
    return (
      <button
        key={label}
        onClick={() => setFilter(label)}
        style={{
          padding: '6px 16px', borderRadius: '8px', border: `1px solid ${active ? colors[label] : 'rgba(255,255,255,0.07)'}`,
          background: active ? `${colors[label]}18` : 'transparent',
          color: active ? colors[label] : 'var(--text-muted)',
          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <LoadingSpinner duration={400} />
      <div style={{ animation: 'modalIn 0.4s ease', maxWidth: '1100px' }}>

        {/* ── BACK + HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 14px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            ← Back
          </button>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
          <Pill label="Revenue Analytics" color="indigo" />
        </div>

        <div style={{ marginBottom: '6px' }}>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#eeeef8', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Collection Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Revenue collected, expenses tracked, and net profit — live from database
          </p>
        </div>

        {/* ── HERO METRIC ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '24px 0 20px' }}>
          <StatBlock label="Total Collected" value={`৳${(totalPaid / 1000).toFixed(1)}K`} sub="All-time paid receipts" color="#a3e635" />
          <StatBlock label="Pending" value={`৳${(totalPending / 1000).toFixed(1)}K`} sub="Awaiting payment" color="#fbbf24" onClick={() => setFilter('Pending')} />
          <StatBlock label="Overdue" value={`৳${(totalOverdue / 1000).toFixed(1)}K`} sub={`${payments.filter(p => p.status === 'Overdue').length} invoices`} color="#f87171" onClick={() => setFilter('Overdue')} />
          <StatBlock label="Collection Rate" value={`${collRate}%`} sub="Paid / Total billed" color="#22d3ee" />
        </div>

        {/* ══ HERO CHART SECTION ══ */}
        <div style={{
          background: '#0e0e1a',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', padding: '28px 28px 16px',
          marginBottom: '28px',
        }}>
          <SectionHead
            dot="#5865F2"
            label="Collection · Revenue vs Expenses vs Profit"
            right={
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { label: 'Revenue', color: '#5865F2' },
                  { label: 'Expenses', color: '#f87171' },
                  { label: 'Net Profit', color: '#a3e635' },
                ].map(l => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ width: '10px', height: '2px', background: l.color, borderRadius: '99px', display: 'inline-block' }} />
                    {l.label}
                  </span>
                ))}
              </div>
            }
          />
          {chartSeries.length > 0 ? (
            <AreaChart series={chartSeries} height={260} />
          ) : (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No monthly data available yet
            </div>
          )}

          {/* Monthly summary row */}
          {months.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
              {months.slice(-6).map(m => {
                const rev = revMap[m] || 0;
                const exp = expMap[m] || 0;
                const profit = rev - exp;
                return (
                  <div key={m} style={{ flex: '0 0 auto', minWidth: '130px', background: '#12121c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                      {shortLabel(m)} {m.split('-')[0]}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#5865F2', fontFamily: 'var(--font-mono)' }}>৳{rev.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#f87171', fontFamily: 'var(--font-mono)' }}>-৳{exp.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: profit >= 0 ? '#a3e635' : '#f87171', fontFamily: 'var(--font-mono)', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                      {profit >= 0 ? '+' : ''}৳{profit.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════
            SCROLL ZONE — PROFIT DETAILS
        ═══════════════════════════════ */}
        <div ref={detailRef}>

          {/* Profit breakdown cards */}
          <SectionHead dot="#a3e635" label="Profit Breakdown" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'All-Time Revenue', value: `৳${dash.totalRevenue.toLocaleString()}`, sub: 'Paid payments total', color: '#5865F2' },
              { label: 'All-Time Expenses', value: `৳${dash.totalExpenses.toLocaleString()}`, sub: 'Operational costs total', color: '#f87171' },
              { label: 'Net Profit', value: `৳${dash.totalProfit.toLocaleString()}`, sub: dash.totalProfit >= 0 ? 'In the green ✓' : 'Operating at a loss', color: dash.totalProfit >= 0 ? '#a3e635' : '#f87171' },
              { label: 'This Month Revenue', value: `৳${(dash.revenueThisMonth || 0).toLocaleString()}`, sub: `Last month: ৳${(dash.revenueLastMonth || 0).toLocaleString()}`, color: '#5865F2' },
              { label: 'This Month Expenses', value: `৳${(dash.expensesThisMonth || 0).toLocaleString()}`, sub: 'Current month spend', color: '#f87171' },
              { label: 'This Month Profit', value: `${(dash.profitThisMonth || 0) >= 0 ? '+' : ''}৳${(dash.profitThisMonth || 0).toLocaleString()}`, sub: 'Revenue minus costs', color: (dash.profitThisMonth || 0) >= 0 ? '#a3e635' : '#f87171' },
            ].map((s, i) => (
              <StatBlock key={i} label={s.label} value={s.value} sub={s.sub} color={s.color} />
            ))}
          </div>

          {/* Expense by category */}
          {(dash.expenseByCategory || []).length > 0 && (
            <>
              <SectionHead dot="#e879f9" label="Expense by Category" />
              <div style={{ background: '#12121c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '22px', marginBottom: '28px' }}>
                {dash.expenseByCategory.map((cat, i) => {
                  const max = parseFloat(dash.expenseByCategory[0]?.total || 1);
                  const w = (parseFloat(cat.total) / max) * 100;
                  const colors = ['#e879f9', '#818cf8', '#22d3ee', '#fbbf24', '#a3e635', '#f87171'];
                  return (
                    <div key={i} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{cat.category || 'Other'}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: colors[i % colors.length], fontFamily: 'var(--font-mono)' }}>৳{parseFloat(cat.total).toLocaleString()}</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${w}%`, background: colors[i % colors.length], borderRadius: '99px', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Full Payments Table */}
          <div style={{ background: '#12121c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '22px', marginBottom: '12px' }}>
            <SectionHead
              dot="#818cf8"
              label={`All Payments · ${filtered.length} records`}
              right={
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['All', 'Paid', 'Pending', 'Overdue'].map(s => filterBtn(s))}
                </div>
              }
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Tenant', 'Property', 'Unit', 'Amount', 'Due Date', 'Method', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map((p, i) => (
                    <tr key={i}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,101,242,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#eeeef8', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{p.tenant_name}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{p.property_name}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{p.unit_number}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, color: '#a3e635', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>৳{parseFloat(p.amount).toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{p.due_date || p.payment_date || '—'}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Pill label={p.method} color="indigo" />
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Pill label={p.status} color={p.status === 'Paid' ? 'lime' : p.status === 'Overdue' ? 'red' : 'amber'} />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>No payments match this filter</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Pill label="live data" color="lime" />
              <Pill label="admin · revenue" color="indigo" />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Nexas Estate · Revenue Analytics Console
            </span>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminRevenue;
