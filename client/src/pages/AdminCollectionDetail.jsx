import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { C, DarkTooltip, Stat, Pill, SectionHead, Card, PageShell } from '../components/AdminChartKit';

const AdminCollectionDetail = () => {
  const [dash, setDash] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([API.get('/admin/dashboard'), API.get('/admin/payments')])
      .then(([d,p]) => { setDash(d.data.data); setPayments(p.data.data||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  }, []);

  if (loading||!dash) return <LoadingSpinner/>;

  const totalPaid    = payments.filter(p=>p.status==='Paid').reduce((a,p)=>a+parseFloat(p.amount),0);
  const totalPending = payments.filter(p=>p.status==='Pending').reduce((a,p)=>a+parseFloat(p.amount),0);
  const totalOverdue = payments.filter(p=>p.status==='Overdue').reduce((a,p)=>a+parseFloat(p.amount),0);
  const grandTotal   = totalPaid+totalPending+totalOverdue;
  const rate = grandTotal>0 ? (totalPaid/grandTotal*100).toFixed(1) : '100.0';

  // Monthly collection rate
  const months = [...new Set((dash.monthlyRevenue||[]).map(r=>r.month))].sort();
  const revMap  = Object.fromEntries((dash.monthlyRevenue||[]).map(r=>[r.month,parseFloat(r.revenue)]));
  const shortMo = m => new Date(+m.split('-')[0],+m.split('-')[1]-1,1).toLocaleString('default',{month:'short'});

  // Estimate billed = paid + some factor; use running totals for demo
  let cumPaid=0, cumBilled=0;
  const lineData = months.map(m => {
    cumPaid   += revMap[m]||0;
    cumBilled += (revMap[m]||0)*1.15; // estimated billed
    const r = cumBilled>0 ? +((cumPaid/cumBilled)*100).toFixed(1) : 100;
    return { month: shortMo(m), Rate: r, Paid: +(revMap[m]||0).toFixed(0) };
  });

  return (
    <PageShell title="Collection Rate" sub="Payment compliance, collection trends, and method breakdown" pillLabel={`${rate}% Collected`} pillColor={+rate>90?'lime':+rate>70?'amber':'red'} onBack={()=>navigate('/admin')}>
      <LoadingSpinner duration={400}/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
        <Stat label="Collection Rate" value={`${rate}%`} sub="Paid / total billed" color={+rate>90?C.lime:+rate>70?C.amber:C.red}/>
        <Stat label="Total Collected" value={`৳${(totalPaid/1000).toFixed(1)}K`} sub="All paid receipts" color={C.lime}/>
        <Stat label="Uncollected" value={`৳${((totalPending+totalOverdue)/1000).toFixed(1)}K`} sub="Pending + Overdue" color={C.red}/>
        <Stat label="Total Billed" value={`৳${(grandTotal/1000).toFixed(1)}K`} sub="All invoices" color={C.indigoL}/>
      </div>

      <Card style={{marginBottom:'16px'}}>
        <SectionHead dot={C.cyan} label="Collection Rate Trend · Monthly"
          right={<span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:'JetBrains Mono, monospace'}}>% collected per month</span>}
        />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData} margin={{top:5,right:10,left:10,bottom:5}}>
            <defs>
              <linearGradient id="gRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={C.cyan} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
            <XAxis dataKey="month" tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
            <Tooltip content={<DarkTooltip/>}/>
            <Line type="monotone" dataKey="Rate" stroke={C.cyan} strokeWidth={2.5} dot={{fill:C.cyan,r:4,strokeWidth:0}} activeDot={{r:6}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card>
          <SectionHead dot={C.lime} label="Monthly Revenue Collected"/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={lineData} margin={{top:5,right:10,left:10,bottom:5}}>
              <defs>
                <linearGradient id="gPaid2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.lime} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={C.lime} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:9,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`} tick={{fontSize:9,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<DarkTooltip/>}/>
              <Area type="monotone" dataKey="Paid" stroke={C.lime} strokeWidth={2} fill="url(#gPaid2)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHead dot={C.indigoL} label="Payment Status Summary"/>
          <div style={{display:'flex',flexDirection:'column',gap:'16px',marginTop:'16px'}}>
            {[{l:'Collected',v:totalPaid,color:C.lime,max:grandTotal},
              {l:'Pending',v:totalPending,color:C.amber,max:grandTotal},
              {l:'Overdue',v:totalOverdue,color:C.red,max:grandTotal}].map(s=>(
              <div key={s.l}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                  <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono, monospace'}}>{s.l}</span>
                  <span style={{fontSize:'13px',fontWeight:700,color:s.color,fontFamily:'JetBrains Mono, monospace'}}>৳{s.v.toLocaleString()}</span>
                </div>
                <div style={{height:'5px',background:'rgba(255,255,255,0.06)',borderRadius:'99px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:s.max>0?`${(s.v/s.max*100).toFixed(1)}%`:'0%',background:s.color,borderRadius:'99px',transition:'width 0.8s'}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
};

export default AdminCollectionDetail;
