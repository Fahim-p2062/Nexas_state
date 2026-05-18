import { useEffect, useState, useRef } from 'react';

const StatCard = ({ label, value, icon, color = 'purple' }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const numericVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const prefix = String(value).match(/^[^0-9]*/)?.[0] || '';
  const suffix = String(value).match(/[^0-9.]*$/)?.[0] || '';
  const isNum = !isNaN(numericVal) && numericVal !== null;

  useEffect(() => {
    if (!isNum) { setDisplay(value); return; }
    let start = 0;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * numericVal));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(numericVal);
    };
    requestAnimationFrame(step);
  }, [value]);

  const colors = {
    purple: 'var(--accent-purple)', pink: 'var(--accent-pink)',
    green: 'var(--accent-green)', yellow: '#f7e479', red: '#ff7b7b', blue: '#93c5fd',
  };

  return (
    <div className="stat-card">
      <div className="shimmer"></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginBottom: '8px' }}>
            {label}
          </p>
          <p className="count-animate" style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'white', lineHeight: 1 }}>
            {isNum ? `${prefix}${display.toLocaleString()}${suffix}` : display}
          </p>
        </div>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${colors[color]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', color: colors[color],
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
