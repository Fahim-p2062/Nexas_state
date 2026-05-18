import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import useScrollReveal from '../hooks/useScrollReveal';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  useScrollReveal();

  useEffect(() => {
    API.get('/admin/dashboard').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <LoadingSpinner />;

  const tabStyle = (active) => ({
    padding: '10px 20px', borderRadius: '10px', border: 'none',
    background: active ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' : 'var(--bg-secondary)',
    color: active ? 'white' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.3s',
  });

  const sectionCard = { background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '24px', marginBottom: '24px' };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '8px' }}>
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Complete platform overview — revenue, expenses, and system health
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {['overview', 'financials', 'activity'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(activeTab === tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <StatCard label="Total Properties" value={data.totalProperties} icon="⌂" color="purple" />
              <StatCard label="Total Units" value={data.totalUnits} icon="◫" color="blue" />
              <StatCard label="Occupied" value={data.occupiedUnits} icon="◉" color="green" />
              <StatCard label="Vacant" value={data.vacantUnits} icon="○" color="yellow" />
              <StatCard label="Landlords" value={data.totalLandlords} icon="◆" color="purple" />
              <StatCard label="Tenants" value={data.totalTenants} icon="◉" color="pink" />
              <StatCard label="Staff" value={data.totalStaff} icon="◎" color="blue" />
              <StatCard label="Active Leases" value={data.activeLeases} icon="◫" color="green" />
            </div>

            {/* Quick Financials */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={sectionCard}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Total Revenue</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-green)' }}>
                  ৳{data.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div style={sectionCard}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Total Expenses</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ff7b7b' }}>
                  ৳{data.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div style={sectionCard}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Net Profit</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: data.totalProfit >= 0 ? 'var(--accent-green)' : '#ff7b7b' }}>
                  {data.totalProfit >= 0 ? '+' : ''}৳{data.totalProfit.toLocaleString()}
                </p>
              </div>
            </div>

            {/* System Health */}
            <div style={sectionCard}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '16px' }}>System Health</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Overdue Payments</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: data.overduePayments > 0 ? '#ff7b7b' : 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{data.overduePayments}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Overdue Amount</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ff7b7b', fontFamily: 'var(--font-mono)' }}>৳{data.overdueAmount.toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Collections</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f7e479', fontFamily: 'var(--font-mono)' }}>৳{data.pendingAmount.toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Open Maintenance</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: data.openMaintenanceRequests > 0 ? '#f7e479' : 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{data.openMaintenanceRequests}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === 'financials' && (
          <>
            {/* Monthly Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={sectionCard}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Revenue This Month</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-green)' }}>
                  ৳{data.revenueThisMonth.toLocaleString()}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Last month: ৳{data.revenueLastMonth.toLocaleString()}
                </p>
              </div>
              <div style={sectionCard}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Expenses This Month</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ff7b7b' }}>
                  ৳{data.expensesThisMonth.toLocaleString()}
                </p>
              </div>
              <div style={sectionCard}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Profit This Month</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: data.profitThisMonth >= 0 ? 'var(--accent-green)' : '#ff7b7b' }}>
                  {data.profitThisMonth >= 0 ? '+' : ''}৳{data.profitThisMonth.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Revenue Trend */}
            {data.monthlyRevenue?.length > 0 && (
              <div style={sectionCard}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '20px' }}>Revenue Trend (Last 6 Months)</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 8px' }}>
                  {data.monthlyRevenue.map((m, i) => {
                    const maxRev = Math.max(...data.monthlyRevenue.map(r => parseFloat(r.revenue)));
                    const height = maxRev > 0 ? (parseFloat(m.revenue) / maxRev) * 160 : 0;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          ৳{parseFloat(m.revenue).toLocaleString()}
                        </span>
                        <div style={{
                          width: '100%', maxWidth: '60px', height: `${Math.max(height, 4)}px`,
                          background: 'linear-gradient(180deg, var(--accent-green), rgba(173,255,47,0.3))',
                          borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease',
                        }}></div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Expense Breakdown */}
            {data.expenseByCategory?.length > 0 && (
              <div style={sectionCard}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '16px' }}>Expense Breakdown</h3>
                {data.expenseByCategory.map((cat, i) => {
                  const maxExp = parseFloat(data.expenseByCategory[0]?.total || 1);
                  const width = (parseFloat(cat.total) / maxExp) * 100;
                  return (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{cat.category || 'Other'}</span>
                        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: '#ff7b7b' }}>৳{parseFloat(cat.total).toLocaleString()}</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg, #ff7b7b, var(--accent-pink))', borderRadius: '3px', transition: 'width 0.5s' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <>
            {/* Recent Payments */}
            <div className="scroll-reveal" style={{ marginBottom: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '16px' }}>Recent Payments</h2>
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table className="nexas-table">
                  <thead><tr><th>Tenant</th><th>Property</th><th>Unit</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {(data.recentPayments || []).map(p => (
                      <tr key={p.payment_id}>
                        <td style={{ fontWeight: 500 }}>{p.tenant_name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.property_name}</td>
                        <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{p.unit_number}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>৳{parseFloat(p.amount).toLocaleString()}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.payment_date}</td>
                        <td><span className={`badge ${p.status === 'Paid' ? 'badge-green' : p.status === 'Overdue' ? 'badge-red' : 'badge-yellow'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                    {(!data.recentPayments || data.recentPayments.length === 0) && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No payments yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="scroll-reveal">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '16px' }}>Recent Expenses</h2>
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table className="nexas-table">
                  <thead><tr><th>Property</th><th>Category</th><th>Amount</th><th>Date</th><th>Description</th></tr></thead>
                  <tbody>
                    {(data.recentExpenses || []).map(e => (
                      <tr key={e.expense_id}>
                        <td style={{ fontWeight: 500 }}>{e.property_name}</td>
                        <td><span className="badge badge-purple">{e.category}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#ff7b7b' }}>৳{parseFloat(e.amount).toLocaleString()}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{e.expense_date}</td>
                        <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description || '-'}</td>
                      </tr>
                    ))}
                    {(!data.recentExpenses || data.recentExpenses.length === 0) && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No expenses recorded</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
