import { useState, useEffect } from 'react';
import { getStats } from '../api/client';

const StatsBar = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-center gap-8">
          <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-gray-400">Repos Analyzed:</span>
          <span className="text-white font-semibold">{stats.total_repos_analyzed || 0}</span>
        </div>
        
        <div className="w-px h-4 bg-gray-700"></div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-gray-400">Chat Sessions:</span>
          <span className="text-white font-semibold">{stats.total_chat_sessions || 0}</span>
        </div>
        
        <div className="w-px h-4 bg-gray-700"></div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
          <span className="text-gray-400">Bobcoins Used:</span>
          <span className="text-white font-semibold">{stats.total_bobcoins_used || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;

// Made with Bob
