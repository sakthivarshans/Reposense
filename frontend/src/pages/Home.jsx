import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RepoInput from '../components/RepoInput';
import StatsBar from '../components/StatsBar';
import { analyzeRepo } from '../api/client';

const FEATURES = [
  { icon: '📄', title: 'Plain English Summary',  description: 'What the project does, who it\'s for, and why it exists' },
  { icon: '🗺️', title: 'Architecture Map',        description: 'Interactive graph showing how all modules connect' },
  { icon: '🌡️', title: 'Complexity Heatmap',      description: 'Every file scored by risk — green to red' },
  { icon: '📖', title: 'Onboarding Guide',        description: 'Structured guide written by an AI senior engineer' },
  { icon: '💬', title: 'Chat with Code',          description: 'Ask anything about the repo in plain English' },
];

function Home() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error,       setError]       = useState(null);

  const handleAnalyze = async (repoUrl) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeRepo(repoUrl, false);
      navigate('/results', { state: { analysisData: result, repoUrl } });
    } catch (err) {
      setError(err.message || 'Failed to analyze repository');
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>
          RepoSense
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" style={{ color: '#A0A0A0', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#A0A0A0'}>
            Features
          </a>
          <a href="#stats" style={{ color: '#A0A0A0', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#A0A0A0'}>
            Stats
          </a>
          <button className="btn-secondary" style={{ padding: '8px 20px', fontSize: 13 }}>
            Sign In
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 80px' }}>

        {/* Hackathon badge */}
        <div className="animate-fade-in" style={{ marginBottom: 28 }}>
          <span className="badge-hackathon">IBM Bob Hackathon</span>
        </div>

        {/* Headline */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontSize: 'clamp(52px, 8vw, 88px)',
            fontWeight: 900, lineHeight: 1.05,
            color: '#fff', letterSpacing: '-0.03em',
            margin: '0 0 20px',
          }}>
            Understand Any Codebase<br />
            <span className="gradient-text">In 30 Seconds</span>
          </h1>
          <p style={{
            fontSize: 17, color: '#A0A0A0', maxWidth: 420,
            margin: '0 auto', lineHeight: 1.65,
          }}>
            RepoSense gives instant AI-powered intelligence on any GitHub repository.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="animate-fade-in" style={{ display: 'flex', gap: 14, marginBottom: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn-primary"
            onClick={() => document.getElementById('repo-input-url')?.focus()}
          >
            Analyze a Repo
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleAnalyze('https://github.com/facebook/react')}
            disabled={isAnalyzing}
          >
            View Demo
          </button>
        </div>

        {/* Repo Input */}
        <div className="animate-slide-up" style={{ width: '100%', maxWidth: 660, marginBottom: 72 }}>
          <RepoInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} error={error} />
        </div>

        {/* Features section */}
        <div id="features" style={{ width: '100%', maxWidth: 960 }}>
          <p style={{
            textAlign: 'center', fontSize: 11, fontWeight: 700,
            color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            What you get in one click
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} delay={i * 80} />
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div id="stats" style={{ width: '100%', maxWidth: 660, marginTop: 56 }}>
          <StatsBar />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        padding: '20px 40px', textAlign: 'center',
        borderTop: '1px solid #1A1A1A',
        color: '#444', fontSize: 13,
      }}>
        RepoSense · AI-powered codebase intelligence · Built with React &amp; FastAPI
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <div
      className="card-gold animate-fade-in"
      style={{ animationDelay: `${delay}ms`, textAlign: 'left' }}
      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseOut={e =>  e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, margin: 0 }}>{description}</p>
    </div>
  );
}

export default Home;
