import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ property_id: '', category: 'Other', amount: '', expense_date: '', description: '' });
  const load = () => API.get('/expenses').then(r => { setExpenses(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await API.post('/expenses', form); toast.success('Expense recorded!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const total = expenses.reduce((a, e) => a + parseFloat(e.amount), 0);

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600 }}>Expenses</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Total: <span style={{ color: '#ff7b7b', fontFamily: 'var(--font-mono)' }}>${total.toLocaleString()}</span></p>
          </div>
          <button onClick={() => setModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+ Add Expense</button>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table className="nexas-table">
            <thead><tr><th>Property</th><th>Category</th><th>Amount</th><th>Date</th><th>Description</th></tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.expense_id}>
                  <td style={{ fontWeight: 500 }}>{e.property_name}</td>
                  <td><span className="badge badge-yellow">{e.category}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#ff7b7b' }}>${parseFloat(e.amount).toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{e.expense_date}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description || '—'}</td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No expenses</td></tr>}
            </tbody>
          </table>
        </div>
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Expense">
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Property ID *</label><input className="nexas-input" value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} required /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Category</label><select className="nexas-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Repair</option><option>Utility</option><option>Tax</option><option>Insurance</option><option>Salary</option><option>Other</option></select></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Amount *</label><input className="nexas-input" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
              <div><label style={labelStyle}>Date *</label><input className="nexas-input" type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required /></div>
            </div>
            <div style={{ marginBottom: '24px' }}><label style={labelStyle}>Description</label><textarea className="nexas-input" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Record Expense</button>
          </form>
        </Modal>
      </div>
    </>
  );
};
export default Expenses;
