import { useState, useEffect } from 'react';
import { getStats } from '../api/client';

const StatsBar = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayStats, setDisplayStats] = useState({ repos: 0, sessions: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
        
        // Animate count-up
        animateValue('repos', 0, data.total_repos_analyzed || 0, 1500);
        animateValue('sessions', 0, data.total_chat_sessions || 0, 1500);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const animateValue = (key, start, end, duration) => {
    const startTime = Date.now();
    const range = end - start;
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + range * easeOutQuart);
      
      setDisplayStats(prev => ({ ...prev, [key]: current }));
      
      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16); // ~60fps
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-center gap-8">
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {/* Total Repos Analyzed */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Repos Analyzed</p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {displayStats.repos.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-700"></div>

        {/* Powered by IBM Bob */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Powered by</p>
            <p className="text-xl font-bold gradient-text">IBM Bob</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-700"></div>

        {/* Sessions Today */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Chat Sessions</p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {displayStats.sessions.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;

// Made with Bob
