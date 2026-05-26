import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { C, DarkTooltip, Stat, Pill, SectionHead, Card, PageShell } from '../components/AdminChartKit';

const AdminOverdueDetail = () => {
  const [payments, setPayments] = useState([]);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([API.get('/admin/dashboard'), API.get('/admin/payments')])
      .then(([d,p]) => { setDash(d.data.data); setPayments(p.data.data||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  }, []);

  if (loading||!dash) return <LoadingSpinner/>;

  const overdue = payments.filter(p=>p.status==='Overdue');
  const pending = payments.filter(p=>p.status==='Pending');
  const totalOverdue = overdue.reduce((a,p)=>a+parseFloat(p.amount),0);
  const totalPending = pending.reduce((a,p)=>a+parseFloat(p.amount),0);

  // Group overdue by property
  const byProp = {};
  overdue.forEach(p => { byProp[p.property_name] = (byProp[p.property_name]||0)+parseFloat(p.amount); });
  const propData = Object.entries(byProp).map(([name,value])=>({name,value:+value.toFixed(0)})).sort((a,b)=>b.value-a.value);

  const pieData = [
    {name:'Overdue',value:+totalOverdue.toFixed(0)},
    {name:'Pending',value:+totalPending.toFixed(0)},
  ];

  return (
    <PageShell title="Overdue & Pending" sub="Unpaid invoices, overdue amounts, and at-risk properties" pillLabel="Overdue · Alert" pillColor="red" onBack={()=>navigate('/admin')}>
      <LoadingSpinner duration={400}/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
        <Stat label="Overdue Amount" value={`৳${(totalOverdue/1000).toFixed(1)}K`} sub={`${overdue.length} invoices`} color={C.red}/>
        <Stat label="Pending Amount" value={`৳${(totalPending/1000).toFixed(1)}K`} sub={`${pending.length} invoices`} color={C.amber}/>
        <Stat label="At-Risk Properties" value={Object.keys(byProp).length} sub="With overdue payments" color={C.pink}/>
        <Stat label="Avg Overdue" value={overdue.length>0?`৳${(totalOverdue/overdue.length).toFixed(0)}`:'৳0'} sub="Per invoice" color={C.purple}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'16px',marginBottom:'16px'}}>
        <Card>
          <SectionHead dot={C.red} label="Overdue Amount by Property"/>
          {propData.length>0?(
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={propData} layout="vertical" margin={{top:5,right:10,left:80,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false}/>
                <XAxis type="number" tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`} tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false} width={75}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="value" name="Overdue" fill={C.red} radius={[0,4,4,0]} opacity={0.85}/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{height:'280px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>No overdue data</div>}
        </Card>
        <Card>
          <SectionHead dot={C.amber} label="Overdue vs Pending"/>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                <Cell fill={C.red}/>
                <Cell fill={C.amber}/>
              </Pie>
              <Tooltip formatter={v=>`৳${Number(v).toLocaleString()}`} contentStyle={{background:'#1c1c2e',border:`1px solid ${C.border}`,borderRadius:'10px',fontFamily:'JetBrains Mono, monospace',fontSize:'12px'}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'8px'}}>
            {[{l:'Overdue',v:`৳${totalOverdue.toLocaleString()}`,c:C.red},{l:'Pending',v:`৳${totalPending.toLocaleString()}`,c:C.amber}].map(x=>(
              <div key={x.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'11px',color:x.c,fontFamily:'JetBrains Mono, monospace',display:'flex',alignItems:'center',gap:'6px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:x.c,display:'inline-block'}}/>{x.l}</span>
                <span style={{fontSize:'12px',fontWeight:700,color:x.c,fontFamily:'JetBrains Mono, monospace'}}>{x.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead dot={C.red} label={`Overdue Invoices · ${overdue.length} total`}/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Tenant','Property','Unit','Amount','Due Date','Landlord'].map(h=>(
              <th key={h} style={{textAlign:'left',padding:'8px 12px',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {overdue.map((p,i)=>(
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} style={{transition:'background 0.15s'}}>
                  <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:600,color:'#eeeef8',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.tenant_name}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.property_name}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{p.unit_number}</td>
                  <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:700,color:C.red,fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>৳{parseFloat(p.amount).toLocaleString()}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:C.red,fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.due_date||'—'}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.landlord_name}</td>
                </tr>
              ))}
              {overdue.length===0&&<tr><td colSpan="6" style={{textAlign:'center',padding:'32px',color:'rgba(255,255,255,0.28)',fontSize:'13px'}}>No overdue payments 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
};

export default AdminOverdueDetail;
