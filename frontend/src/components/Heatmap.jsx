import { useState, useMemo } from 'react';

const Heatmap = ({ data }) => {
  const [filter, setFilter] = useState('all');
  const [hoveredFile, setHoveredFile] = useState(null);

  // Risk color scale
  const getRiskColor = (score) => {
    if (score >= 7) return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', badge: 'bg-red-500' };
    if (score >= 4) return { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', badge: 'bg-amber-500' };
    return { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', badge: 'bg-green-500' };
  };

  const getRiskLabel = (score) => {
    if (score >= 7) return 'High Risk';
    if (score >= 4) return 'Medium Risk';
    return 'Low Risk';
  };

  // Sort and filter data
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    let filtered = [...data].sort((a, b) => b.risk_score - a.risk_score);
    
    if (filter === 'high') {
      filtered = filtered.filter(f => f.risk_score >= 7);
    } else if (filter === 'medium') {
      filtered = filtered.filter(f => f.risk_score >= 4 && f.risk_score < 7);
    } else if (filter === 'low') {
      filtered = filtered.filter(f => f.risk_score < 4);
    }
    
    return filtered;
  }, [data, filter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) return { high: 0, medium: 0, low: 0 };
    
    return {
      high: data.filter(f => f.risk_score >= 7).length,
      medium: data.filter(f => f.risk_score >= 4 && f.risk_score < 7).length,
      low: data.filter(f => f.risk_score < 4).length,
    };
  }, [data]);

  const truncateFilename = (filename, maxLength = 40) => {
    if (filename.length <= maxLength) return filename;
    const parts = filename.split('/');
    const name = parts[parts.length - 1];
    if (name.length <= maxLength) {
      return '.../' + name;
    }
    return name.substring(0, maxLength - 3) + '...';
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg">No complexity data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">High Risk Files</p>
              <p className="text-3xl font-bold text-red-400">{stats.high}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Medium Risk Files</p>
              <p className="text-3xl font-bold text-amber-400">{stats.medium}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Safe Files</p>
              <p className="text-3xl font-bold text-green-400">{stats.low}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Files ({data.length})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'high'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          High Risk ({stats.high})
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'medium'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Medium Risk ({stats.medium})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'low'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Low Risk ({stats.low})
        </button>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedData.map((file, index) => {
          const colors = getRiskColor(file.risk_score);
          return (
            <div
              key={`${file.filename}-${index}`}
              className={`relative ${colors.bg} border ${colors.border} rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer animate-fade-in`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              onMouseEnter={() => setHoveredFile(file)}
              onMouseLeave={() => setHoveredFile(null)}
            >
              {/* Risk Score Badge */}
              <div className="absolute -top-3 -right-3 w-14 h-14 flex items-center justify-center">
                <div className={`w-full h-full ${colors.badge} rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg">{file.risk_score}</span>
                </div>
              </div>

              {/* File Info */}
              <div className="pr-8">
                <div className="flex items-start gap-2 mb-2">
                  <svg className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className={`text-sm font-semibold ${colors.text} break-all`} title={file.filename}>
                    {truncateFilename(file.filename)}
                  </h3>
                </div>

                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${colors.text} bg-gray-900/50`}>
                  {getRiskLabel(file.risk_score)}
                </div>

                {/* Reason (shown on hover) */}
                {hoveredFile === file && file.reason && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-10 text-sm text-gray-300">
                    <p className="font-semibold text-white mb-1">Risk Factors:</p>
                    <p>{file.reason}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for Filtered Results */}
      {processedData.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <p className="text-lg">No files match the selected filter</p>
        </div>
      )}
    </div>
  );
};

export default Heatmap;

// Made with Bob
