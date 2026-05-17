import { useState, useEffect } from 'react';
import { getStats } from '../api/client';

const GOLD = '#C8920A';

const StatsBar = () => {
  const [loading,      setLoading]      = useState(true);
  const [displayStats, setDisplayStats] = useState({ repos: 0, sessions: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        animateValue('repos',    0, data.total_repos_analyzed  || 0, 1400);
        animateValue('sessions', 0, data.total_chat_sessions   || 0, 1400);
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const animateValue = (key, start, end, duration) => {
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplayStats(prev => ({ ...prev, [key]: Math.floor(start + (end - start) * ease) }));
      if (p === 1) clearInterval(id);
    }, 16);
  };

  if (loading) {
    return (
      <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 14, padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 20, width: 100, background: '#1A1A1A', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#111', border: '1px solid #2A2A2A',
      borderRadius: 14, padding: '18px 28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>

        <StatItem
          label="Repos Analyzed"
          value={displayStats.repos.toLocaleString()}
          icon="📁"
        />

        <div style={{ width: 1, height: 36, background: '#2A2A2A' }} />

        <StatItem
          label="Powered by"
          value="Groq AI"
          icon="⚡"
          valueStyle={{ color: GOLD }}
        />

        <div style={{ width: 1, height: 36, background: '#2A2A2A' }} />

        <StatItem
          label="Chat Sessions"
          value={displayStats.sessions.toLocaleString()}
          icon="💬"
        />
      </div>
    </div>
  );
};

function StatItem({ label, value, icon, valueStyle = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: '#1A1A1A', border: '1px solid #2A2A2A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em', ...valueStyle }}>{value}</p>
      </div>
    </div>
  );
}

export default StatsBar;
