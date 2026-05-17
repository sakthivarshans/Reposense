import { useNavigate } from 'react-router-dom';

const GOLD = '#C8920A';

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Architecture Map',
    desc: 'Visual interactive graph of every module and how they connect.',
  },
  {
    icon: '🌡️',
    title: 'Risk Heatmap',
    desc: 'Every file scored by complexity and risk — instantly prioritize your review.',
  },
  {
    icon: '📖',
    title: 'AI Onboarding',
    desc: 'A personal onboarding guide written by AI as a senior engineer.',
  },
];

const STEPS = [
  { n: '01', title: 'Paste a GitHub URL', desc: 'Any public or private repository — just paste the link.' },
  { n: '02', title: 'AI reads the entire codebase', desc: 'Powered by Groq AI — every file is parsed, the architecture is mapped, and complexity is scored.' },
  { n: '03', title: 'Get instant intelligence', desc: 'Receive a full report: summary, map, heatmap, guide, and AI chat.' },
];

export default function Landing() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff' }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>RepoSense</span>
        <button
          className="btn-secondary"
          style={{ padding: '8px 22px', fontSize: 13 }}
          onClick={() => navigate('/login')}
        >
          Sign In
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 100px', textAlign: 'center',
      }}>
        {/* Gold badge */}
        <div className="animate-fade-in" style={{ marginBottom: 28 }}>
          <span className="badge-hackathon">Developed using IBM Bob · Powered by AI</span>
        </div>

        {/* Headline */}
        <div className="animate-fade-in" style={{ marginBottom: 24 }}>
          <h1 style={{
            fontSize: 'clamp(44px, 7vw, 84px)', fontWeight: 900,
            lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 20px',
          }}>
            Understand Any Codebase<br />
            <span className="gradient-text">In 30 Seconds</span>
          </h1>
          <p style={{ fontSize: 17, color: '#A0A0A0', maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
            AI-powered intelligence for any GitHub repository. Architecture maps,
            risk analysis, and instant onboarding guides.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="animate-fade-in" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 80 }}>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Get Started Free
          </button>
          <button
            className="btn-secondary"
            style={{ borderColor: GOLD, color: GOLD }}
            onClick={() => scrollTo('features')}
            onMouseOver={e => { e.currentTarget.style.background = `rgba(200,146,10,0.08)`; }}
            onMouseOut={e =>  { e.currentTarget.style.background = 'transparent'; }}
          >
            See How It Works
          </button>
        </div>

        {/* ── Feature cards ─────────────────────────────────────────── */}
        <div id="features" style={{ width: '100%', maxWidth: 900, marginBottom: 96 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>
            What you get instantly
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card-gold animate-fade-in"
                style={{ animationDelay: `${i * 100}ms`, textAlign: 'left', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={e =>  e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How It Works ──────────────────────────────────────────── */}
        <div style={{ width: '100%', maxWidth: 700 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 40 }}>
            How it works
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="animate-fade-in"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 24, textAlign: 'left', animationDelay: `${i * 120}ms` }}
              >
                <span style={{
                  fontSize: 36, fontWeight: 900, color: GOLD,
                  lineHeight: 1, minWidth: 56, letterSpacing: '-0.04em',
                }}>
                  {s.n}
                </span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{ padding: '20px 40px', textAlign: 'center', borderTop: '1px solid #1A1A1A', color: '#444', fontSize: 13 }}>
        RepoSense — Developed using IBM Bob at lablab.ai Hackathon · Powered by Groq AI
      </footer>
    </div>
  );
}
