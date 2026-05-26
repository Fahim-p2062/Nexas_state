import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { C, DarkTooltip, Stat, Pill, SectionHead, Card, PageShell } from '../components/AdminChartKit';

const AdminOccupancyDetail = () => {
  const [dash, setDash] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([API.get('/admin/dashboard'), API.get('/admin/properties')])
      .then(([d,p]) => { setDash(d.data.data); setProperties(p.data.data||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  }, []);

  if (loading||!dash) return <LoadingSpinner/>;

  const occ = dash.totalUnits>0 ? Math.round((dash.occupiedUnits/dash.totalUnits)*100) : 0;
  const propBarData = properties.slice(0,10).map(p => ({
    name: p.name?.slice(0,14)||(p.name||'?'),
    Occupied: p.unit_count - p.vacant_count,
    Vacant: p.vacant_count,
    Total: p.unit_count,
  }));

  const radialData = [{name:'Occupied',value:occ,fill:C.lime},{name:'Vacant',value:100-occ,fill:'rgba(255,255,255,0.07)'}];

  return (
    <PageShell title="Occupancy Analytics" sub="Unit status, property-level occupancy, and vacancy breakdown" pillLabel="Occupancy · Live" pillColor={occ>70?'lime':occ>40?'amber':'red'} onBack={()=>navigate('/admin')}>
      <LoadingSpinner duration={400}/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
        <Stat label="Occupancy Rate" value={`${occ}%`} sub="Platform-wide" color={occ>70?C.lime:occ>40?C.amber:C.red}/>
        <Stat label="Occupied Units" value={dash.occupiedUnits} sub="Currently rented" color={C.lime}/>
        <Stat label="Vacant Units" value={dash.vacantUnits} sub="Available now" color={C.amber}/>
        <Stat label="Total Units" value={dash.totalUnits} sub={`Across ${dash.totalProperties} properties`} color={C.indigoL}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'16px',marginBottom:'16px'}}>
        <Card>
          <SectionHead dot={C.lime} label="Occupied vs Vacant by Property"/>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propBarData} margin={{top:5,right:10,left:10,bottom:30}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:9,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false} angle={-25} textAnchor="end"/>
              <YAxis allowDecimals={false} tick={{fontSize:10,fill:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<DarkTooltip/>}/>
              <Bar dataKey="Occupied" fill={C.lime} radius={[3,3,0,0]} stackId="a"/>
              <Bar dataKey="Vacant" fill={C.amber} radius={[3,3,0,0]} opacity={0.7} stackId="a"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <SectionHead dot={C.lime} label="Rate Gauge"/>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={6} background={{fill:'rgba(255,255,255,0.04)'}}/>
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{textAlign:'center',marginTop:'-40px'}}>
            <div style={{fontSize:'2.5rem',fontWeight:800,color:occ>70?C.lime:occ>40?C.amber:C.red,fontFamily:'JetBrains Mono, monospace',letterSpacing:'-2px'}}>{occ}%</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono, monospace'}}>occupied</div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead dot={C.indigoL} label="All Properties"/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Property','Landlord','Total Units','Occupied','Vacant','Rate'].map(h=>(
              <th key={h} style={{textAlign:'left',padding:'8px 12px',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.28)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {properties.map((p,i) => {
                const occ2 = p.unit_count>0?Math.round(((p.unit_count-p.vacant_count)/p.unit_count)*100):0;
                return (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} style={{transition:'background 0.15s'}}>
                    <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:600,color:'#eeeef8',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.name}</td>
                    <td style={{padding:'9px 12px',fontSize:'11px',color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`,whiteSpace:'nowrap'}}>{p.landlord_name}</td>
                    <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:700,color:C.indigoL,fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{p.unit_count}</td>
                    <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:700,color:C.lime,fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{p.unit_count-p.vacant_count}</td>
                    <td style={{padding:'9px 12px',fontSize:'13px',fontWeight:700,color:C.amber,fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>{p.vacant_count}</td>
                    <td style={{padding:'9px 12px',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                      <Pill label={`${occ2}%`} color={occ2>70?'lime':occ2>40?'amber':'red'}/>
                    </td>
                  </tr>
                );
              })}
              {properties.length===0&&<tr><td colSpan="6" style={{textAlign:'center',padding:'32px',color:'rgba(255,255,255,0.28)',fontSize:'13px'}}>No properties</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
};

export default AdminOccupancyDetail;
