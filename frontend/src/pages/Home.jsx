import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RepoInput from '../components/RepoInput';
import StatsBar from '../components/StatsBar';
import { analyzeRepo } from '../api/client';

function Home() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Badge */}
        <div className="mb-6 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm font-semibold text-blue-400">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Powered by Groq AI · Instant Analysis
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-5 leading-tight tracking-tight">
            Understand any
            <span className="block gradient-text">codebase instantly</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Paste a GitHub URL. Get a plain-English summary, architecture map, 
            complexity heatmap, onboarding guide, and an AI you can chat with — 
            all in under 30 seconds.
          </p>
        </div>

        {/* Repo Input */}
        <div className="w-full max-w-3xl animate-slide-up">
          <RepoInput
            onAnalyze={handleAnalyze}
            isLoading={isAnalyzing}
            error={error}
          />
        </div>

        {/* What you get */}
        <div className="w-full max-w-4xl mt-14 animate-fade-in">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
            What you get in one click
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="w-full max-w-3xl mt-12 animate-fade-in">
          <StatsBar />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-sm border-t border-gray-800/50">
        <p>RepoSense · AI-powered codebase intelligence · Built with React &amp; FastAPI</p>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: '📄',
    title: 'Plain English Summary',
    description: 'What the project does, who it\'s for, and why it exists',
  },
  {
    icon: '🗺️',
    title: 'Architecture Map',
    description: 'Interactive graph showing how all modules connect',
  },
  {
    icon: '🌡️',
    title: 'Complexity Heatmap',
    description: 'Every file scored by risk — green to red',
  },
  {
    icon: '📖',
    title: 'Onboarding Guide',
    description: 'Structured guide written by an AI senior engineer',
  },
  {
    icon: '💬',
    title: 'Chat with Code',
    description: 'Ask anything about the repo in plain English',
  },
];

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 border border-gray-700/60 hover:border-blue-500/50 hover:bg-gray-800/60 transition-all duration-300 text-center group">
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{icon}</div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

export default Home;

// Made with Bob
