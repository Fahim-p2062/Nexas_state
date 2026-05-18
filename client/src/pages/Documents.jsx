import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [leaseId, setLeaseId] = useState('');
  const [type, setType] = useState('Other');

  const load = () => API.get('/documents').then(r => { setDocs(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !leaseId) return toast.error('File and Lease ID required');
    const fd = new FormData();
    fd.append('file', file); fd.append('lease_id', leaseId); fd.append('type', type);
    try { await API.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Uploaded!'); load(); setFile(null); }
    catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
  };

  return (
    <>
      <LoadingSpinner duration={500} />
      <div style={{ animation: 'modalIn 0.5s ease' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, marginBottom: '32px' }}>Documents</h1>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Lease ID</label><input className="nexas-input" style={{ width: '120px' }} value={leaseId} onChange={e => setLeaseId(e.target.value)} /></div>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Type</label><select className="nexas-select" style={{ width: '180px' }} value={type} onChange={e => setType(e.target.value)}><option>Lease Agreement</option><option>NID Copy</option><option>Photo</option><option>Other</option></select></div>
          <div><label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>File</label><input type="file" onChange={e => setFile(e.target.files[0])} style={{ color: 'var(--text-muted)', fontSize: '13px' }} /></div>
          <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', height: '46px' }}>Upload</button>
        </form>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table className="nexas-table">
            <thead><tr><th>File</th><th>Type</th><th>Lease</th><th>Uploaded By</th><th>Date</th></tr></thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.document_id}>
                  <td><a href={d.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 500 }}>{d.file_name}</a></td>
                  <td><span className="badge badge-purple">{d.type}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>#{d.lease_id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{d.uploaded_by_role}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{d.uploaded_at}</td>
                </tr>
              ))}
              {docs.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No documents</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default Documents;
