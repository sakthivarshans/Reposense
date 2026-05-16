import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RepoInput from '../components/RepoInput';
import StatsBar from '../components/StatsBar';
import { analyzeRepo } from '../api/client';

function Home() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (repoUrl, branch) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeRepo(repoUrl, false);
      // Navigate to results page with analysis data
      navigate('/results', { state: { analysisData: result, repoUrl } });
    } catch (err) {
      setError(err.message || 'Failed to analyze repository');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-6xl font-bold text-white mb-4">
          Repo<span className="text-blue-500">Sense</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          AI-powered codebase intelligence tool for developers
        </p>
        <p className="text-gray-400 mt-2">
          Analyze, understand, and navigate repositories with ease
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl animate-slide-up">
        <RepoInput 
          onAnalyze={handleAnalyze} 
          isLoading={isAnalyzing}
          error={error}
        />

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon="🔍"
            title="Deep Analysis"
            description="Comprehensive code structure and architecture analysis"
          />
          <FeatureCard
            icon="🗺️"
            title="Visual Maps"
            description="Interactive architecture maps and dependency graphs"
          />
          <FeatureCard
            icon="💬"
            title="AI Assistant"
            description="Ask questions about your codebase in natural language"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>Powered by Bob AI • Built with React & FastAPI</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

export default Home;

// Made with Bob
