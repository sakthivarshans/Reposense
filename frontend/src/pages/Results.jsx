import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArchMap from '../components/ArchMap';
import Heatmap from '../components/Heatmap';
import ChatPanel from '../components/ChatPanel';
import OnboardingGuide from '../components/OnboardingGuide';

// Tab definitions matching the 5 RepoSense objectives
const TABS = [
  { id: 'summary',      label: 'Summary',          icon: '📄' },
  { id: 'architecture', label: 'Architecture Map',  icon: '🗺️' },
  { id: 'heatmap',      label: 'Complexity Heatmap', icon: '🌡️' },
  { id: 'onboarding',   label: 'Onboarding Guide',  icon: '📖' },
  { id: 'chat',         label: 'Chat with Code',    icon: '💬' },
];

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading repository analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const repoName = repoUrl.split('/').slice(-2).join('/');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <div className="h-5 w-px bg-gray-700" />
            <div>
              <p className="text-white font-semibold text-sm">{repoName}</p>
              <p className="text-gray-500 text-xs truncate max-w-xs">{repoUrl}</p>
            </div>
            {analysis?.cached && (
              <span className="badge badge-secondary text-xs">Cached</span>
            )}
          </div>
          {/* Tech stack badges in header */}
          {analysis?.tech_stack?.length > 0 && (
            <div className="hidden md:flex items-center gap-2 overflow-hidden">
              {analysis.tech_stack.slice(0, 5).map((tech, i) => (
                <span key={i} className="badge badge-primary text-xs">{tech}</span>
              ))}
              {analysis.tech_stack.length > 5 && (
                <span className="text-xs text-gray-500">+{analysis.tech_stack.length - 5} more</span>
              )}
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-1 pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">

        {/* ── Tab 1: Summary ─────────────────────────────────────────── */}
        {activeTab === 'summary' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <SectionHeader
              icon="📄"
              title="Plain English Summary"
              subtitle="What this project does, who it's for, and why it exists"
            />

            {/* Summary text */}
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 space-y-4">
              {analysis?.summary
                ? analysis.summary.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="text-gray-300 leading-relaxed">{para}</p>
                  ))
                : <p className="text-gray-500 italic">No summary available.</p>
              }
            </div>

            {/* Tech stack */}
            {analysis?.tech_stack?.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Technologies Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.tech_stack.map((tech, i) => (
                    <span key={i} className="badge badge-primary">{tech}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick nav — invite user to explore other tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TABS.filter(t => t.id !== 'summary').map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700 hover:border-blue-500/50 rounded-xl p-4 text-left transition-all duration-200 group"
                >
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{tab.icon}</span>
                  <p className="text-sm font-semibold text-white">{tab.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: Architecture Map ─────────────────────────────────── */}
        {activeTab === 'architecture' && (
          <div className="animate-fade-in">
            <SectionHeader
              icon="🗺️"
              title="Architecture Map"
              subtitle="Interactive graph — drag nodes, scroll to zoom, click for details"
            />
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden mt-6" style={{ minHeight: '600px' }}>
              <ArchMap data={analysis?.architecture || { nodes: [], edges: [] }} repoUrl={repoUrl} />
            </div>
          </div>
        )}

        {/* ── Tab 3: Complexity Heatmap ────────────────────────────────── */}
        {activeTab === 'heatmap' && (
          <div className="animate-fade-in">
            <SectionHeader
              icon="🌡️"
              title="Complexity Heatmap"
              subtitle="Every file scored 0–10 by risk. Red = approach carefully. Green = safe to edit."
            />
            <div className="mt-6">
              <Heatmap data={analysis?.complexity_map || []} />
            </div>
          </div>
        )}

        {/* ── Tab 4: Onboarding Guide ──────────────────────────────────── */}
        {activeTab === 'onboarding' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <SectionHeader
              icon="📖"
              title="Onboarding Guide"
              subtitle="Written by AI as if a senior engineer is personally onboarding you"
            />
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mt-6">
              <OnboardingGuide content={analysis?.onboarding_guide} />
            </div>
          </div>
        )}

        {/* ── Tab 5: Chat ─────────────────────────────────────────────── */}
        {activeTab === 'chat' && (
          <div className="animate-fade-in">
            <SectionHeader
              icon="💬"
              title="Chat with the Codebase"
              subtitle="Ask anything in plain English — the AI has read the entire repository"
            />
            <div className="mt-6 max-w-3xl mx-auto" style={{ height: '70vh' }}>
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
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-blue-500/20">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export default Results;

// Made with Bob
