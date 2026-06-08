import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { C, DarkTooltip, Stat, Pill, SectionHead, Card, PageShell } from '../components/AdminChartKit';

const AdminUsersDetail = () => {
  const [dash, setDash] = useState(null);
  const [landlords, setLandlords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/admin/dashboard'),
      API.get('/admin/landlords'),
      API.get('/admin/tenants'),
      API.get('/admin/staff'),
    ]).then(([d,l,t,s]) => {
      setDash(d.data.data);
      setLandlords(l.data.data||[]);
      setTenants(t.data.data||[]);
      setStaff(s.data.data||[]);
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  if (loading||!dash) return <LoadingSpinner/>;

  const total = dash.totalLandlords + dash.totalTenants + dash.totalStaff;
  const pieData = [
    {name:'Landlords', value:dash.totalLandlords},
    {name:'Tenants',   value:dash.totalTenants},
    {name:'Staff',     value:dash.totalStaff},
  ];
  const PIE_COLORS = [C.indigoL, C.pink, C.cyan];

  // Monthly join simulation from created_at
  const joinData = {};
  [...landlords,...tenants,...staff].forEach(u => {
    if (!u.created_at) return;
    const mo = u.created_at.slice(0,7);
    joinData[mo] = (joinData[mo]||0)+1;
  });
  const joinChart = Object.entries(joinData).sort(([a],[b])=>a.localeCompare(b)).slice(-6).map(([m,v])=>({
    month: new Date(+m.split('-')[0],+m.split('-')[1]-1,1).toLocaleString('default',{month:'short'}),
    Users: v
  }));

  return (
    <PageShell title="Platform Users" sub="Landlords, tenants, staff — distribution and registration history" pillLabel="Users · Live" pillColor="indigo" onBack={()=>navigate('/admin')}>
      <LoadingSpinner duration={400}/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
        <Stat label="Total Users" value={total} sub="All roles" color={C.indigoL}/>
        <Stat label="Landlords" value={dash.totalLandlords} sub="Property owners" color={C.indigoL}/>
        <Stat label="Tenants" value={dash.totalTenants} sub="Active renters" color={C.pink}/>
        <Stat label="Staff" value={dash.totalStaff} sub="Operations team" color={C.cyan}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:'16px',marginBottom:'16px'}}>
        <Card>
          <SectionHead dot={C.indigoL} label="User Distribution"/>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip formatter={v=>`${v} users`} contentStyle={{background:'#1c1c2e',border:`1px solid ${C.border}`,borderRadius:'10px',fontFamily:'JetBrains Mono, monospace',fontSize:'12px'}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {pieData.map((d,i)=>(
              <div key={d.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'11px',color:PIE_COLORS[i],fontFamily:'JetBrains Mono, monospace',display:'flex',alignItems:'center',gap:'6px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:PIE_COLORS[i],display:'inline-block'}}/>{d.name}</span>
                <span style={{fontSize:'12px',fontWeight:700,color:PIE_COLORS[i],fontFamily:'JetBrains Mono, monospace'}}>{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHead dot={C.cyan} label="Monthly User Registrations"/>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={joinChart} margin={{top:5,right:10,left:10,bottom:5}}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.indigoL} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={C.pink} stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={false} tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<DarkTooltip/>}/>
              <Bar dataKey="Users" fill="url(#gUsers)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
        {[{title:'Recent Landlords',data:landlords.slice(0,5),color:C.indigoL,role:'Landlord'},
          {title:'Recent Tenants',data:tenants.slice(0,5),color:C.pink,role:'Tenant'},
          {title:'Staff Members',data:staff.slice(0,5),color:C.cyan,role:'Staff'}].map(g=>(
          <Card key={g.title}>
            <SectionHead dot={g.color} label={g.title}/>
            {g.data.map((u,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                <div>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#eeeef8'}}>{u.name}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono, monospace'}}>{u.email}</div>
                </div>
                <Pill label={g.role} color={g.role==='Landlord'?'indigo':g.role==='Tenant'?'pink':'cyan'}/>
              </div>
            ))}
            {g.data.length===0&&<p style={{color:'rgba(255,255,255,0.28)',fontSize:'12px',textAlign:'center',padding:'16px 0'}}>No data</p>}
          </Card>
        ))}
      </div>
    </PageShell>
  );
};

export default AdminUsersDetail;
