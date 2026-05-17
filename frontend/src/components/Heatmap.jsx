import { useState, useMemo } from 'react';

const Heatmap = ({ data }) => {
  const [filter,      setFilter]      = useState('all');
  const [hoveredFile, setHoveredFile] = useState(null);

  const getRiskColor = (score) => {
    if (score >= 7) return { bg: 'rgba(239,68,68,0.07)',   border: '#7f1d1d', text: '#f87171', badge: '#ef4444' };
    if (score >= 4) return { bg: 'rgba(200,146,10,0.07)',  border: '#78350f', text: '#C8920A', badge: '#C8920A' };
    return              { bg: 'rgba(34,197,94,0.07)',  border: '#14532d', text: '#4ade80', badge: '#22c55e' };
  };

  const getRiskLabel = (score) => {
    if (score >= 7) return 'High Risk';
    if (score >= 4) return 'Medium Risk';
    return 'Low Risk';
  };

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    let d = [...data].sort((a, b) => b.risk_score - a.risk_score);
    if (filter === 'high')   d = d.filter(f => f.risk_score >= 7);
    if (filter === 'medium') d = d.filter(f => f.risk_score >= 4 && f.risk_score < 7);
    if (filter === 'low')    d = d.filter(f => f.risk_score < 4);
    return d;
  }, [data, filter]);

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) return { high: 0, medium: 0, low: 0 };
    return {
      high:   data.filter(f => f.risk_score >= 7).length,
      medium: data.filter(f => f.risk_score >= 4 && f.risk_score < 7).length,
      low:    data.filter(f => f.risk_score < 4).length,
    };
  }, [data]);

  const trunc = (name, max = 40) => {
    if (name.length <= max) return name;
    const parts = name.split('/');
    const base = parts[parts.length - 1];
    return base.length <= max ? '…/' + base : base.slice(0, max - 3) + '…';
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: '#555' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌡️</div>
          <p style={{ fontSize: 15 }}>No complexity data available</p>
        </div>
      </div>
    );
  }

  const FILTER_BTNS = [
    { id: 'all',    label: `All Files (${data.length})`,     activeColor: '#fff',    activeBg: '#1A1A1A' },
    { id: 'high',   label: `High Risk (${stats.high})`,      activeColor: '#f87171', activeBg: 'rgba(239,68,68,0.12)' },
    { id: 'medium', label: `Medium Risk (${stats.medium})`,  activeColor: '#C8920A', activeBg: 'rgba(200,146,10,0.12)' },
    { id: 'low',    label: `Low Risk (${stats.low})`,        activeColor: '#4ade80', activeBg: 'rgba(34,197,94,0.12)' },
  ];

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'High Risk Files',  count: stats.high,   color: '#f87171', bg: 'rgba(239,68,68,0.07)',  border: '#7f1d1d' },
          { label: 'Medium Risk Files',count: stats.medium, color: '#C8920A', bg: 'rgba(200,146,10,0.07)', border: '#78350f' },
          { label: 'Safe Files',       count: stats.low,    color: '#4ade80', bg: 'rgba(34,197,94,0.07)',  border: '#14532d' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: s.color, margin: 0 }}>{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {FILTER_BTNS.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            style={{
              padding: '7px 16px', borderRadius: 999,
              background: filter === btn.id ? btn.activeBg : 'transparent',
              border: `1px solid ${filter === btn.id ? btn.activeColor : '#2A2A2A'}`,
              color: filter === btn.id ? btn.activeColor : '#555',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
        {processedData.map((file, idx) => {
          const c = getRiskColor(file.risk_score);
          return (
            <div
              key={`${file.filename}-${idx}`}
              style={{
                position: 'relative',
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 12, padding: '14px 14px 12px',
                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                animationDelay: `${idx * 30}ms`,
              }}
              className="animate-fade-in"
              onMouseEnter={e => { setHoveredFile(file); e.currentTarget.style.transform='scale(1.03)'; }}
              onMouseLeave={e => { setHoveredFile(null); e.currentTarget.style.transform='scale(1)'; }}
            >
              {/* Score badge */}
              <div style={{
                position: 'absolute', top: -10, right: -10,
                width: 36, height: 36, borderRadius: '50%',
                background: c.badge, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: '#000', fontSize: 14,
                boxShadow: `0 0 12px ${c.badge}60`,
              }}>{file.risk_score}</div>

              <div style={{ paddingRight: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: c.text, margin: '0 0 6px', wordBreak: 'break-all' }} title={file.filename}>
                  {trunc(file.filename)}
                </p>
                <span style={{ fontSize: 11, fontWeight: 600, color: c.text, background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4 }}>
                  {getRiskLabel(file.risk_score)}
                </span>
              </div>

              {hoveredFile === file && file.reason && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 8,
                  background: '#111', border: '1px solid #2A2A2A', borderRadius: 10,
                  padding: '10px 12px', zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Risk Factors:</p>
                  <p style={{ fontSize: 12, color: '#A0A0A0', margin: 0 }}>{file.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {processedData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
          <p style={{ fontSize: 15 }}>No files match the selected filter</p>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
