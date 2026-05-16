import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analyzeRepo } from '../api/client';
import ArchMap from '../components/ArchMap';
import Heatmap from '../components/Heatmap';
import ChatPanel from '../components/ChatPanel';
import OnboardingGuide from '../components/OnboardingGuide';

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('architecture');
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    // Get analysis data from navigation state
    if (location.state?.analysisData) {
      setAnalysis(location.state.analysisData);
      setLoading(false);
    } else {
      // If no state, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading repository analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {analysis?.repo_name}
                </h1>
                <p className="text-sm text-gray-400">{analysis?.repo_url}</p>
              </div>
            </div>
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Help
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {stats && <StatsBar stats={stats} />}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex space-x-2 bg-gray-800/50 p-2 rounded-lg">
              <TabButton
                active={activeTab === 'architecture'}
                onClick={() => setActiveTab('architecture')}
              >
                Architecture Map
              </TabButton>
              <TabButton
                active={activeTab === 'heatmap'}
                onClick={() => setActiveTab('heatmap')}
              >
                Activity Heatmap
              </TabButton>
            </div>

            {/* Content */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              {activeTab === 'architecture' && (
                <ArchMap architecture={analysis?.architecture || []} />
              )}
              {activeTab === 'heatmap' && (
                <Heatmap data={stats?.heatmap_data || []} />
              )}
            </div>
          </div>

          {/* Right Panel - Chat */}
          <div className="lg:col-span-1">
            <ChatPanel repoId={repoId} />
          </div>
        </div>
      </div>

      {/* Onboarding Guide */}
      {showOnboarding && (
        <OnboardingGuide onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

export default Results;

// Made with Bob
