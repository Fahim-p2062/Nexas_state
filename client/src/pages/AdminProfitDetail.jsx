import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, ComposedChart, Area, Bar,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine
} from 'recharts';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { C, DarkTooltip, Stat, Pill, SectionHead, Card, PageShell } from '../components/AdminChartKit';

const AdminProfitDetail = () => {
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
  const revMap = Object.fromEntries((dash.monthlyRevenue||[]).map(r=>[r.month,parseFloat(r.revenue)]));
  const expMap = Object.fromEntries((dash.monthlyExpenses||[]).map(e=>[e.month,parseFloat(e.expense)]));
  const shortMo = m => new Date(+m.split('-')[0],+m.split('-')[1]-1,1).toLocaleString('default',{month:'short'});

  const chartData = months.map(m => ({
    month: shortMo(m),
    Revenue: +(revMap[m]||0).toFixed(0),
    Expenses: +(expMap[m]||0).toFixed(0),
    Profit: +((revMap[m]||0)-(expMap[m]||0)).toFixed(0),
  }));

  const profitMargin = dash.totalRevenue > 0 ? ((dash.totalProfit/dash.totalRevenue)*100).toFixed(1) : 0;

  return (
    <PageShell title="Net Profit Analysis" sub="Revenue minus expenses, profit margin, and monthly performance" pillLabel="Profit · Live" pillColor={dash.totalProfit>=0?'lime':'red'} onBack={()=>navigate('/admin')}>
      <LoadingSpinner duration={400}/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
        <Stat label="Net Profit" value={`${dash.totalProfit>=0?'+':''}৳${(dash.totalProfit/1000).toFixed(1)}K`} sub="All-time" color={dash.totalProfit>=0?C.lime:C.red}/>
        <Stat label="Profit Margin" value={`${profitMargin}%`} sub="Of total revenue" color={C.cyan}/>
        <Stat label="This Month" value={`${(dash.profitThisMonth||0)>=0?'+':''}৳${(dash.profitThisMonth||0).toLocaleString()}`} sub="Current period" color={(dash.profitThisMonth||0)>=0?C.lime:C.red}/>
        <Stat label="Total Revenue" value={`৳${(dash.totalRevenue/1000).toFixed(1)}K`} sub="Gross income" color={C.indigoL}/>
      </div>

      <Card style={{marginBottom:'16px'}}>
        <SectionHead dot={C.lime} label="Revenue · Expenses · Net Profit · Monthly Composed Chart"/>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData} margin={{top:5,right:10,left:10,bottom:5}}>
            <defs>
              <linearGradient id="gProfitArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.lime} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={C.lime} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
            <XAxis dataKey="month" tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`} tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
            <Tooltip content={<DarkTooltip/>}/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 2"/>
            <Bar dataKey="Revenue" fill={C.indigoL} opacity={0.6} radius={[3,3,0,0]}/>
            <Bar dataKey="Expenses" fill={C.red} opacity={0.6} radius={[3,3,0,0]}/>
            <Area type="monotone" dataKey="Profit" stroke={C.lime} strokeWidth={2.5} fill="url(#gProfitArea)" dot={{fill:C.lime,strokeWidth:0,r:3}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
        {chartData.slice(-6).map((d,i)=>(
          <div key={i} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'14px 16px'}}>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',fontFamily:'JetBrains Mono, monospace',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>{d.month}</div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}>
              <span style={{fontSize:'11px',color:C.indigoL,fontFamily:'JetBrains Mono, monospace'}}>Rev</span>
              <span style={{fontSize:'11px',fontWeight:700,color:C.indigoL,fontFamily:'JetBrains Mono, monospace'}}>৳{d.Revenue.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}>
              <span style={{fontSize:'11px',color:C.red,fontFamily:'JetBrains Mono, monospace'}}>Exp</span>
              <span style={{fontSize:'11px',fontWeight:700,color:C.red,fontFamily:'JetBrains Mono, monospace'}}>৳{d.Expenses.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',borderTop:`1px solid ${C.border}`,paddingTop:'6px',marginTop:'4px'}}>
              <span style={{fontSize:'12px',color:d.Profit>=0?C.lime:C.red,fontFamily:'JetBrains Mono, monospace',fontWeight:700}}>Profit</span>
              <span style={{fontSize:'12px',fontWeight:800,color:d.Profit>=0?C.lime:C.red,fontFamily:'JetBrains Mono, monospace'}}>{d.Profit>=0?'+':''}৳{d.Profit.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default AdminProfitDetail;
