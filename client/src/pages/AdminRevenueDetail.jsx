import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { C, DarkTooltip, Stat, Pill, SectionHead, Card, PageShell } from '../components/AdminChartKit';

const AdminRevenueDetail = () => {
  const [dash, setDash] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([API.get('/admin/dashboard'), API.get('/admin/payments')])
      .then(([d, p]) => { setDash(d.data.data); setPayments(p.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !dash) return <LoadingSpinner />;

  const months = [...new Set([
    ...(dash.monthlyRevenue||[]).map(r=>r.month),
    ...(dash.monthlyExpenses||[]).map(e=>e.month)
  ])].sort();
  const revMap = Object.fromEntries((dash.monthlyRevenue||[]).map(r=>[r.month,parseFloat(r.revenue)]));
  const expMap = Object.fromEntries((dash.monthlyExpenses||[]).map(e=>[e.month,parseFloat(e.expense)]));
  const shortMo = m => new Date(+m.split('-')[0], +m.split('-')[1]-1,1).toLocaleString('default',{month:'short'});

  const chartData = months.map(m => ({
    month: shortMo(m),
    Revenue: +(revMap[m]||0).toFixed(0),
    Expenses: +(expMap[m]||0).toFixed(0),
    Profit: +((revMap[m]||0)-(expMap[m]||0)).toFixed(0),
  }));

  const totalPaid    = payments.filter(p=>p.status==='Paid').reduce((a,p)=>a+parseFloat(p.amount),0);
  const totalPending = payments.filter(p=>p.status==='Pending').reduce((a,p)=>a+parseFloat(p.amount),0);
  const totalOverdue = payments.filter(p=>p.status==='Overdue').reduce((a,p)=>a+parseFloat(p.amount),0);
  const collRate = (totalPaid+totalPending+totalOverdue)>0 ? Math.round((totalPaid/(totalPaid+totalPending+totalOverdue))*100) : 100;

  const filtered = filter==='All' ? payments : payments.filter(p=>p.status===filter);

  const fBtn = (s, col) => (
    <button key={s} onClick={()=>setFilter(s)} style={{
      padding:'5px 14px', borderRadius:'7px', border:`1px solid ${filter===s?C[col]:C.border}`,
      background: filter===s?`${C[col]}18`:'transparent',
      color: filter===s?C[col]:'rgba(255,255,255,0.35)',
      fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'JetBrains Mono, monospace', transition:'all 0.15s'
    }}>{s}</button>
  );

  return (
    <PageShell title="Revenue Analytics" sub="Collection graph, profit margin, and full payment history" pillLabel="Revenue · Live" pillColor="lime" onBack={()=>navigate('/admin')}>
      <LoadingSpinner duration={400} />

      {/* KPI row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
        <Stat label="Total Collected" value={`৳${(totalPaid/1000).toFixed(1)}K`} sub="All-time paid" color={C.lime} />
        <Stat label="Pending" value={`৳${(totalPending/1000).toFixed(1)}K`} sub="Awaiting payment" color={C.amber} />
        <Stat label="Overdue" value={`৳${(totalOverdue/1000).toFixed(1)}K`} sub={`${payments.filter(p=>p.status==='Overdue').length} invoices`} color={C.red} />
        <Stat label="Collection Rate" value={`${collRate}%`} sub="Paid / total billed" color={C.cyan} />
      </div>

      {/* Area Chart */}
      <Card style={{marginBottom:'16px'}}>
        <SectionHead dot={C.indigo} label="Revenue vs Expenses vs Profit · Monthly" right={
          <div style={{display:'flex',gap:'16px'}}>
            {[{l:'Revenue',c:C.indigoL},{l:'Expenses',c:C.red},{l:'Net Profit',c:C.lime}].map(x=>(
              <span key={x.l} style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',color:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono, monospace'}}>
                <span style={{width:'10px',height:'2px',background:x.c,borderRadius:'99px',display:'inline-block'}}/>{x.l}
              </span>
            ))}
          </div>
        } />
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{top:5,right:10,left:10,bottom:5}}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.indigoL} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={C.indigoL} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.red} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={C.red} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.lime} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={C.lime} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
            <XAxis dataKey="month" tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`} tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
            <Tooltip content={<DarkTooltip/>}/>
            <Area type="monotone" dataKey="Revenue" stroke={C.indigoL} strokeWidth={2} fill="url(#gRev)" dot={false}/>
            <Area type="monotone" dataKey="Expenses" stroke={C.red} strokeWidth={2} fill="url(#gExp)" dot={false}/>
            <Area type="monotone" dataKey="Profit" stroke={C.lime} strokeWidth={2} fill="url(#gProfit)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly cards */}
      <div style={{display:'flex',gap:'8px',marginBottom:'20px',overflowX:'auto',paddingBottom:'4px'}}>
        {months.slice(-6).map(m=>{
          const rev=revMap[m]||0, exp=expMap[m]||0, profit=rev-exp;
          return (
            <div key={m} style={{flex:'0 0 auto',minWidth:'130px',background:C.bg,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'12px 14px'}}>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',fontFamily:'JetBrains Mono, monospace',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>{shortMo(m)} {m.split('-')[0]}</div>
              <div style={{fontSize:'13px',fontWeight:700,color:C.indigoL,fontFamily:'JetBrains Mono, monospace'}}>৳{rev.toLocaleString()}</div>
              <div style={{fontSize:'11px',color:C.red,fontFamily:'JetBrains Mono, monospace'}}>-৳{exp.toLocaleString()}</div>
              <div style={{fontSize:'12px',fontWeight:700,color:profit>=0?C.lime:C.red,fontFamily:'JetBrains Mono, monospace',marginTop:'4px',borderTop:`1px solid ${C.border}`,paddingTop:'4px'}}>{profit>=0?'+':''}৳{profit.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* Payments table */}
      <Card>
        <SectionHead dot={C.purple} label={`All Payments · ${filtered.length} records`} right={
          <div style={{display:'flex',gap:'6px'}}>
            {[['All','indigoL'],['Paid','lime'],['Pending','amber'],['Overdue','red']].map(([s,c])=>fBtn(s,c))}
          </div>
        }/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Tenant','Property','Unit','Amount','Due Date','Method','Status'].map(h=>(
                <th key={h} style={{textAlign:'left',padding:'8px 12px',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.slice(0,50).map((p,i)=>(
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} style={{transition:'background 0.15s'}}>
                  <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:600,color:'#eeeef8',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.tenant_name}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.property_name}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{p.unit_number}</td>
                  <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:700,color:C.lime,fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>৳{parseFloat(p.amount).toLocaleString()}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.due_date||p.payment_date||'—'}</td>
                  <td style={{padding:'9px 12px',borderBottom:`1px solid rgba(255,255,255,0.04)`}}><Pill label={p.method} color="indigo"/></td>
                  <td style={{padding:'9px 12px',borderBottom:`1px solid rgba(255,255,255,0.04)`}}><Pill label={p.status} color={p.status==='Paid'?'lime':p.status==='Overdue'?'red':'amber'}/></td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan="7" style={{textAlign:'center',padding:'32px',color:'rgba(255,255,255,0.28)',fontSize:'13px',fontFamily:'JetBrains Mono, monospace'}}>No records</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
};

export default AdminRevenueDetail;
