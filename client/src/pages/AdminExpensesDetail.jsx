import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { C, DarkTooltip, Stat, Pill, SectionHead, Card, PageShell } from '../components/AdminChartKit';

const PIE_COLORS = [C.pink, C.purple, C.cyan, C.amber, C.lime, C.red];

const AdminExpensesDetail = () => {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/dashboard').then(r => { setDash(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !dash) return <LoadingSpinner />;

  const months = [...new Set([
    ...(dash.monthlyRevenue||[]).map(r=>r.month),
    ...(dash.monthlyExpenses||[]).map(e=>e.month)
  ])].sort();
  const expMap = Object.fromEntries((dash.monthlyExpenses||[]).map(e=>[e.month,parseFloat(e.expense)]));
  const shortMo = m => new Date(+m.split('-')[0], +m.split('-')[1]-1,1).toLocaleString('default',{month:'short'});

  const barData = months.map(m => ({ month: shortMo(m), Expenses: +(expMap[m]||0).toFixed(0) }));
  const pieData = (dash.expenseByCategory||[]).map((c,i) => ({ name: c.category||'Other', value: parseFloat(c.total) }));

  return (
    <PageShell title="Expense Analytics" sub="Monthly spend, cost breakdown by category, and trend analysis" pillLabel="Expenses · Live" pillColor="red" onBack={()=>navigate('/admin')}>
      <LoadingSpinner duration={400} />

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'20px'}}>
        <Stat label="Total Expenses" value={`৳${(dash.totalExpenses/1000).toFixed(1)}K`} sub="All-time costs" color={C.red}/>
        <Stat label="This Month" value={`৳${(dash.expensesThisMonth||0).toLocaleString()}`} sub="Current period" color={C.amber}/>
        <Stat label="Categories" value={pieData.length} sub="Expense categories" color={C.pink}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <Card>
          <SectionHead dot={C.red} label="Monthly Expense Trend"/>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{top:5,right:10,left:10,bottom:5}}>
              <defs>
                <linearGradient id="gExpBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.red} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={C.pink} stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`} tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<DarkTooltip/>}/>
              <Bar dataKey="Expenses" fill="url(#gExpBar)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHead dot={C.pink} label="Expense by Category"/>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                  paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(v)=>`৳${Number(v).toLocaleString()}`} contentStyle={{background:'#1c1c2e',border:`1px solid ${C.border}`,borderRadius:'10px',fontFamily:'JetBrains Mono, monospace',fontSize:'12px'}}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'11px',fontFamily:'JetBrains Mono, monospace',color:'rgba(255,255,255,0.5)'}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{height:'280px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>No data</div>}
        </Card>
      </div>

      <Card>
        <SectionHead dot={C.purple} label="Category Breakdown"/>
        {(dash.expenseByCategory||[]).map((cat,i) => {
          const max = parseFloat(dash.expenseByCategory[0]?.total||1);
          const w = (parseFloat(cat.total)/max)*100;
          return (
            <div key={i} style={{marginBottom:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono, monospace'}}>{cat.category||'Other'}</span>
                <span style={{fontSize:'13px',fontWeight:700,color:PIE_COLORS[i%PIE_COLORS.length],fontFamily:'JetBrains Mono, monospace'}}>৳{parseFloat(cat.total).toLocaleString()}</span>
              </div>
              <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'99px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${w}%`,background:PIE_COLORS[i%PIE_COLORS.length],borderRadius:'99px',transition:'width 0.8s'}}/>
              </div>
            </div>
          );
        })}
      </Card>
    </PageShell>
  );
};

export default AdminExpensesDetail;
