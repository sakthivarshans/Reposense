import { useState } from 'react';

function RepoInput({ onAnalyze, isLoading, error }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch,  setBranch]  = useState('main');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) onAnalyze(repoUrl.trim(), branch.trim());
  };

  return (
    <div style={{
      background: '#111111',
      border: '1px solid #2A2A2A',
      borderRadius: 16,
      padding: '28px 28px 24px',
    }}>
      <form onSubmit={handleSubmit}>
        {/* URL input */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="repo-input-url" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#A0A0A0', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            GitHub Repository URL
          </label>
          <input
            id="repo-input-url"
            type="url"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="input"
            required
            disabled={isLoading}
          />
        </div>

        {/* Branch input */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="repo-input-branch" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#A0A0A0', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Branch <span style={{ color: '#444', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            id="repo-input-branch"
            type="text"
            value={branch}
            onChange={e => setBranch(e.target.value)}
            placeholder="main"
            className="input"
            disabled={isLoading}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          }}>
            <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !repoUrl.trim()}
          className="btn-primary"
          style={{ width: '100%', padding: '13px 0' }}
        >
          {isLoading ? (
            <>
              <svg style={{ width: 16, height: 16, animation: 'spin 0.9s linear infinite' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing…
            </>
          ) : 'Analyze Repository'}
        </button>
      </form>

      {/* Examples */}
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1A1A1A' }}>
        <p style={{ fontSize: 12, color: '#555', marginBottom: 10 }}>Try an example:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'React',   url: 'https://github.com/facebook/react' },
            { label: 'Vue.js',  url: 'https://github.com/vuejs/vue' },
            { label: 'Node.js', url: 'https://github.com/nodejs/node' },
          ].map(({ label, url }) => (
            <button
              key={label}
              type="button"
              disabled={isLoading}
              onClick={() => setRepoUrl(url)}
              style={{
                padding: '5px 14px', borderRadius: 999,
                background: 'transparent', border: '1px solid #2A2A2A',
                color: '#A0A0A0', fontSize: 12, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#C8920A'; e.currentTarget.style.color = '#C8920A'; }}
              onMouseOut={e =>  { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#A0A0A0'; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RepoInput;
