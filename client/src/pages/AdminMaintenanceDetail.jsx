import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { C, DarkTooltip, Stat, Pill, SectionHead, Card, PageShell } from '../components/AdminChartKit';

const STATUS_COLORS = { Pending: C.amber, 'In Progress': C.indigoL, Resolved: C.lime, Closed: 'rgba(255,255,255,0.3)' };
const PRIORITY_COLORS = { Low: C.lime, Medium: C.amber, High: C.red, Emergency: '#ff3b3b' };

const AdminMaintenanceDetail = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/maintenance').then(r => { setRequests(r.data.data||[]); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner/>;

  const byStatus = {};
  const byPriority = {};
  requests.forEach(r => {
    byStatus[r.status] = (byStatus[r.status]||0)+1;
    byPriority[r.priority] = (byPriority[r.priority]||0)+1;
  });

  const statusData = Object.entries(byStatus).map(([name,value])=>({name,value}));
  const priorityData = Object.entries(byPriority).map(([name,value])=>({name,value}));
  const barData = statusData.map(s=>({name:s.name,Count:s.value}));
  const open = requests.filter(r=>['Pending','In Progress'].includes(r.status));

  return (
    <PageShell title="Maintenance Overview" sub="Open requests, status breakdown, and priority analysis" pillLabel={`${open.length} Open`} pillColor={open.length>0?'amber':'lime'} onBack={()=>navigate('/admin')}>
      <LoadingSpinner duration={400}/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
        <Stat label="Total Requests" value={requests.length} sub="All time" color={C.indigoL}/>
        <Stat label="Open" value={open.length} sub="Pending + In Progress" color={C.amber}/>
        <Stat label="Resolved" value={requests.filter(r=>r.status==='Resolved').length} sub="Completed" color={C.lime}/>
        <Stat label="Emergency" value={requests.filter(r=>r.priority==='Emergency').length} sub="Critical priority" color={C.red}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <Card>
          <SectionHead dot={C.amber} label="Requests by Status"/>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{top:5,right:10,left:10,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={false} tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<DarkTooltip/>}/>
              <Bar dataKey="Count" radius={[4,4,0,0]}>
                {barData.map((d,i)=><Cell key={i} fill={STATUS_COLORS[d.name]||C.indigoL}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHead dot={C.red} label="Requests by Priority"/>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                {priorityData.map((d,i)=><Cell key={i} fill={PRIORITY_COLORS[d.name]||C.purple}/>)}
              </Pie>
              <Tooltip formatter={v=>`${v} requests`} contentStyle={{background:'#1c1c2e',border:`1px solid ${C.border}`,borderRadius:'10px',fontFamily:'JetBrains Mono, monospace',fontSize:'12px'}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px',justifyContent:'center'}}>
            {priorityData.map(d=>(
              <span key={d.name} style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono, monospace'}}>
                <span style={{width:'7px',height:'7px',borderRadius:'50%',background:PRIORITY_COLORS[d.name]||C.purple,display:'inline-block'}}/>{d.name}: {d.value}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead dot={C.amber} label={`All Maintenance Requests · ${requests.length} total`}/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Tenant','Property','Unit','Issue','Priority','Status','Date'].map(h=>(
              <th key={h} style={{textAlign:'left',padding:'8px 12px',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {requests.map((r,i)=>(
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='rgba(251,191,36,0.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} style={{transition:'background 0.15s'}}>
                  <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:600,color:'#eeeef8',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{r.tenant_name}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{r.property_name}</td>
                  <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{r.unit_number}</td>
                  <td style={{padding:'9px 12px',fontSize:'12px',color:'rgba(255,255,255,0.6)',borderBottom:`1px solid rgba(255,255,255,0.04)`,maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.issue_type}</td>
                  <td style={{padding:'9px 12px',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                    <Pill label={r.priority} color={r.priority==='Emergency'||r.priority==='High'?'red':r.priority==='Medium'?'amber':'lime'}/>
                  </td>
                  <td style={{padding:'9px 12px',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                    <Pill label={r.status} color={r.status==='Resolved'||r.status==='Closed'?'lime':r.status==='In Progress'?'indigo':'amber'}/>
                  </td>
                  <td style={{padding:'9px 12px',fontSize:'10px',color:'rgba(255,255,255,0.3)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{r.submitted_at?.slice(0,10)}</td>
                </tr>
              ))}
              {requests.length===0&&<tr><td colSpan="7" style={{textAlign:'center',padding:'32px',color:'rgba(255,255,255,0.28)',fontSize:'13px'}}>No maintenance requests</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
};

export default AdminMaintenanceDetail;
