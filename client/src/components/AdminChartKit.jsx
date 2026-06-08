/* ─────────────────────────────────────────────────────────
   Shared chart primitives for Nexas Admin dark theme
   Import these in every admin detail page.
───────────────────────────────────────────────────────── */

// ── Color palette ──────────────────────────────────────
export const C = {
  indigo:  '#6366f1',
  indigoL: '#818cf8',
  lime:    '#a3e635',
  red:     '#f87171',
  amber:   '#fbbf24',
  cyan:    '#22d3ee',
  pink:    '#e879f9',
  purple:  '#a78bfa',
  grid:    'rgba(255,255,255,0.05)',
  axis:    'rgba(255,255,255,0.28)',
  bg:      '#0e0e1a',
  surface: '#12121c',
  border:  'rgba(255,255,255,0.07)',
};

// ── Recharts custom tooltip ─────────────────────────────
export const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1c1c2e',
      border: '1px solid rgba(99,102,241,0.35)',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '3px' }}>
          <span style={{ fontSize: '11px', color: entry.color }}>{entry.name}</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#eeeef8' }}>
            {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('rate')
              ? `${entry.value}%`
              : typeof entry.value === 'number' && entry.value > 100
              ? `৳${Number(entry.value).toLocaleString()}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Shared axis tick style ──────────────────────────────
export const axisStyle = {
  fontSize: 10,
  fill: C.axis,
  fontFamily: 'JetBrains Mono, monospace',
};

// ── Stat block ─────────────────────────────────────────
export const Stat = ({ label, value, sub, color = '#eeeef8' }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '10px', padding: '18px 20px',
  }}>
    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>{label}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>{sub}</div>}
  </div>
);

// ── Pill badge ─────────────────────────────────────────
export const Pill = ({ label, color = 'indigo' }) => {
  const map = {
    lime:   { bg: 'rgba(163,230,53,0.12)',  text: '#a3e635' },
    amber:  { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24' },
    red:    { bg: 'rgba(248,113,113,0.12)', text: '#f87171' },
    indigo: { bg: 'rgba(99,102,241,0.15)',  text: '#818cf8' },
    cyan:   { bg: 'rgba(34,211,238,0.12)',  text: '#22d3ee' },
    pink:   { bg: 'rgba(232,121,249,0.12)', text: '#e879f9' },
  };
  const c = map[color] || map.indigo;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: c.bg, color: c.text, padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.text }} />
      {label}
    </span>
  );
};

// ── Section header ──────────────────────────────────────
export const SectionHead = ({ dot = C.indigo, label, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, display: 'inline-block' }} />
      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
    </div>
    {right}
  </div>
);

// ── Card shell ──────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '22px', ...style }}>
    {children}
  </div>
);

// ── Page wrapper ────────────────────────────────────────
export const PageShell = ({ children, title, sub, pillLabel, pillColor, onBack }) => (
  <>
    <div style={{ animation: 'modalIn 0.4s ease', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 14px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', fontWeight: 600 }}>
          ← Back
        </button>
        <div style={{ width: '1px', height: '20px', background: C.border }} />
        <Pill label={pillLabel} color={pillColor || 'indigo'} />
      </div>
      <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.9rem', fontWeight: 800, color: '#eeeef8', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '6px' }}>{title}</h1>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '28px' }}>{sub}</p>
      {children}
    </div>
  </>
);
