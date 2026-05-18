import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ lease_id: '', amount: '', payment_date: '', due_date: '', method: 'Cash', status: 'Paid', reference_no: '', notes: '' });
  const [filter, setFilter] = useState('');

  const load = () => API.get('/payments').then(r => { setPayments(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await API.post('/payments', form); toast.success('Payment recorded!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter ? payments.filter(p => p.status === filter) : payments;
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((a, p) => a + parseFloat(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((a, p) => a + parseFloat(p.amount), 0);
  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>Payments</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{payments.length} total records</p>
          </div>
          <button onClick={() => setModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ Record Payment</button>
        </div>

        {/* Wallet Card */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="wallet" style={{ flexShrink: 0 }}>
            <div className="card stripe">
              <div className="card-inner">
                <div className="card-top"><span>NexasEstate</span><div className="chip"></div></div>
                <div className="card-bottom">
                  <div className="card-info"><span className="label">Status</span><span className="value">Collected</span></div>
                  <div className="card-number-wrapper"><span className="card-number" style={{ fontFamily: 'var(--font-mono)' }}>${totalPaid.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
            <div className="card wise">
              <div className="card-inner">
                <div className="card-top"><span>Pending</span><div className="chip"></div></div>
                <div className="card-bottom">
                  <div className="card-info"><span className="label">Awaiting</span><span className="value">Payment</span></div>
                  <div className="card-number-wrapper"><span className="card-number" style={{ fontFamily: 'var(--font-mono)' }}>${totalPending.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
            <div className="pocket">
              <svg className="pocket-svg" viewBox="0 0 280 160" fill="none">
                <path d="M 0 20 C 0 10, 5 10, 10 10 C 20 10, 25 25, 40 25 L 240 25 C 255 25, 260 10, 270 10 C 275 10, 280 10, 280 20 L 280 120 C 280 155, 260 160, 240 160 L 40 160 C 20 160, 0 155, 0 120 Z" fill="#1e341e"></path>
                <path d="M 8 22 C 8 16, 12 16, 15 16 C 23 16, 27 29, 40 29 L 240 29 C 253 29, 257 16, 265 16 C 268 16, 272 16, 272 22 L 272 120 C 272 150, 255 152, 240 152 L 40 152 C 25 152, 8 152, 8 120 Z" stroke="#3d5635" strokeWidth="1.5" strokeDasharray="6 4"></path>
              </svg>
              <div className="pocket-content">
                <div style={{ position: 'relative', height: '24px', width: '100%' }}>
                  <div className="balance-stars">******</div>
                  <div className="balance-real">${(totalPaid + totalPending).toLocaleString()}</div>
                </div>
                <div style={{ color: '#698263', fontSize: '12px', fontWeight: 500 }}>Total Balance</div>
              </div>
            </div>
          </div>

          {/* Quick Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['', 'Paid', 'Pending', 'Overdue'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none', textAlign: 'left',
                background: filter === s ? 'rgba(var(--accent-purple), 0.1)' : 'var(--bg-card)',
                color: filter === s ? 'var(--accent-green)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                borderLeft: filter === s ? '2px solid var(--accent-green)' : '2px solid transparent',
              }}>{s || 'All Payments'}</button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table className="nexas-table">
            <thead><tr><th>Tenant</th><th>Property</th><th>Unit</th><th>Amount</th><th>Date</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.payment_id}>
                  <td style={{ fontWeight: 500 }}>{p.tenant_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.property_name}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{p.unit_number}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>${parseFloat(p.amount).toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.payment_date}</td>
                  <td><span className="badge badge-purple">{p.method}</span></td>
                  <td><span className={`badge ${p.status === 'Paid' ? 'badge-green' : p.status === 'Overdue' ? 'badge-red' : 'badge-yellow'}`}>{p.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No payments found</td></tr>}
            </tbody>
          </table>
        </div>

        <Modal isOpen={modal} onClose={() => setModal(false)} title="Record Payment">
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Lease ID *</label><input className="nexas-input" value={form.lease_id} onChange={e => setForm({ ...form, lease_id: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Amount *</label><input className="nexas-input" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Payment Date *</label><input className="nexas-input" type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} required /></div>
              <div><label style={labelStyle}>Due Date</label><input className="nexas-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Method</label><select className="nexas-select" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}><option>Cash</option><option>Bank Transfer</option><option>Mobile Banking</option><option>Card</option></select></div>
              <div><label style={labelStyle}>Status</label><select className="nexas-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>Paid</option><option>Pending</option><option>Overdue</option></select></div>
            </div>
            <div style={{ marginBottom: '24px' }}><label style={labelStyle}>Reference No.</label><input className="nexas-input" value={form.reference_no} onChange={e => setForm({ ...form, reference_no: e.target.value })} /></div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Record Payment</button>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Payments;
