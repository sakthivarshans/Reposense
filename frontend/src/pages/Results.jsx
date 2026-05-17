import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArchMap from '../components/ArchMap';
import Heatmap from '../components/Heatmap';
import ChatPanel from '../components/ChatPanel';
import OnboardingGuide from '../components/OnboardingGuide';

const TABS = [
  { id: 'summary',      label: 'Summary',           icon: '📄' },
  { id: 'architecture', label: 'Architecture Map',   icon: '🗺️' },
  { id: 'heatmap',      label: 'Complexity Heatmap', icon: '🌡️' },
  { id: 'onboarding',   label: 'Onboarding Guide',   icon: '📖' },
  { id: 'chat',         label: 'Chat with Code',     icon: '💬' },
];

const GOLD = '#C8920A';

function Results() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [analysis,   setAnalysis]   = useState(null);
  const [repoUrl,    setRepoUrl]    = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState('summary');

  useEffect(() => {
    if (location.state?.analysisData) {
      setAnalysis(location.state.analysisData);
      setRepoUrl(location.state.repoUrl || '');
      setLoading(false);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#A0A0A0' }}>Loading analysis…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  const repoName = repoUrl.split('/').slice(-2).join('/');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Sticky header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => navigate('/')}
                style={{ color: '#A0A0A0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseOver={e => e.currentTarget.style.color='#fff'}
                onMouseOut={e =>  e.currentTarget.style.color='#A0A0A0'}
              >
                ← Back
              </button>
              <div style={{ width: 1, height: 20, background: '#2A2A2A' }} />
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>{repoName}</p>
                <p style={{ color: '#555', fontSize: 11, margin: 0, marginTop: 1 }}>{repoUrl}</p>
              </div>
              {analysis?.cached && <span className="badge badge-primary">Cached</span>}
            </div>

            {/* Tech badges */}
            {analysis?.tech_stack?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 480 }}>
                {analysis.tech_stack.slice(0, 5).map((t, i) => (
                  <span key={i} className="badge badge-primary">{t}</span>
                ))}
                {analysis.tech_stack.length > 5 && (
                  <span style={{ fontSize: 12, color: '#555', alignSelf: 'center' }}>+{analysis.tech_stack.length - 5} more</span>
                )}
              </div>
            )}
          </div>

          {/* Tab row */}
          <div style={{ display: 'flex', overflowX: 'auto' }} className="hide-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
              >
                <span style={{ marginRight: 6 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 24px' }}>

        {/* Summary */}
        {activeTab === 'summary' && (
          <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <SectionHeader icon="📄" title="Plain English Summary" subtitle="What this project does, who it's for, and why it exists" />

            <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 16, padding: 32, marginTop: 24 }}>
              {analysis?.summary
                ? analysis.summary.split('\n\n').filter(Boolean).map((p, i) => (
                    <p key={i} style={{ color: '#A0A0A0', lineHeight: 1.75, marginBottom: 16, fontSize: 14 }}>{p}</p>
                  ))
                : <p style={{ color: '#555', fontStyle: 'italic' }}>No summary available.</p>
              }
            </div>

            {analysis?.tech_stack?.length > 0 && (
              <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 16, padding: 24, marginTop: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Technologies Detected</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysis.tech_stack.map((t, i) => <span key={i} className="badge badge-primary">{t}</span>)}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginTop: 16 }}>
              {TABS.filter(t => t.id !== 'summary').map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: '#111', border: '1px solid #2A2A2A',
                    borderRadius: 14, padding: '18px 16px', textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 0 14px rgba(200,146,10,0.1)`; }}
                  onMouseOut={e =>  { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{tab.icon}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{tab.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Architecture */}
        {activeTab === 'architecture' && (
          <div className="animate-fade-in">
            <SectionHeader icon="🗺️" title="Architecture Map" subtitle="Interactive graph — drag nodes, scroll to zoom, click for details" />
            <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 16, marginTop: 24, minHeight: 600 }}>
              <ArchMap data={analysis?.architecture || { nodes: [], edges: [] }} repoUrl={repoUrl} />
            </div>
          </div>
        )}

        {/* Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="animate-fade-in">
            <SectionHeader icon="🌡️" title="Complexity Heatmap" subtitle="Every file scored 0–10 by risk. Red = approach carefully. Green = safe to edit." />
            <div style={{ marginTop: 24 }}>
              <Heatmap data={analysis?.complexity_map || []} />
            </div>
          </div>
        )}

        {/* Onboarding */}
        {activeTab === 'onboarding' && (
          <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <SectionHeader icon="📖" title="Onboarding Guide" subtitle="Written by AI as if a senior engineer is personally onboarding you" />
            <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 16, padding: 32, marginTop: 24 }}>
              <OnboardingGuide content={analysis?.onboarding_guide} />
            </div>
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="animate-fade-in" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ChatPanel repoUrl={repoUrl} summary={analysis?.summary} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: '#1A1A1A', border: '1px solid #2A2A2A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{title}</h2>
        <p style={{ color: '#555', fontSize: 13, margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  );
}

export default Results;
