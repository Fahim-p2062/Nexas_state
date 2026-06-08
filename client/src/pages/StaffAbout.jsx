import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal';
import LoadingSpinner from '../components/LoadingSpinner';

const RatingSlider = ({ rating }) => {
  const pct = (rating / 5) * 100;
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px' }}>
      <div style={{ flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          borderRadius: '99px', transition: 'width 1s ease'
        }} />
      </div>
      <span style={{ fontSize: '14px', fontWeight: 700, color, minWidth: '28px' }}>{rating}/5</span>
    </div>
  );
};

const StaffAbout = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useScrollReveal();

  useEffect(() => {
    API.get('/staff/me/stats').then(r => {
      setStats(r.data.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const isAhon = user?.name?.toLowerCase().includes('ahon');
  const avatarImage = isAhon ? '/ahon.png' : null;

  if (loading) return <LoadingSpinner duration={500} />;

  return (
    <div style={{ animation: 'modalIn 0.5s ease', maxWidth: '700px', margin: '40px auto' }}>
      
      {/* Profile & Stats Section */}
      <div className="scroll-reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
        <div className="stat-card" style={{ cursor: 'default', background: 'var(--bg-card)', padding: '40px', width: '100%', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div className="shimmer"></div>
          
          <div style={{ 
            width: '160px', height: '160px', borderRadius: '50%', margin: '0 auto 24px', 
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)',
            border: '4px solid var(--bg-card)'
          }}>
            {avatarImage ? (
              <img src={avatarImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '64px', fontWeight: 700, color: 'white' }}>{user?.name?.charAt(0) || 'S'}</span>
            )}
          </div>
          
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>{user?.name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ padding: '6px 20px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', borderRadius: '20px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '14px' }}>
              {user?.job_title || 'Maintenance Staff'}
            </div>
            {stats?.avgRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '6px 16px', borderRadius: '20px', fontWeight: 700 }}>
                <span>⭐</span> {stats.avgRating}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>{stats?.completed || 0}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Completed Tasks</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>{stats?.remaining || 0}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Remaining Tasks</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Email Address</span>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Phone Number</span>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>{user?.phone || 'Not Provided'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="scroll-reveal">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Customer Reviews <span style={{ background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>{stats?.reviews?.length || 0}</span>
        </h3>
        
        {stats?.reviews && stats.reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.reviews.map(review => (
              <div key={review.review_id} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{review.reviewer_name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <RatingSlider rating={review.rating} />
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>"{review.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default StaffAbout;
