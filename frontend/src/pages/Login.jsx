import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GOLD = '#C8920A';

/* Inline Google "G" SVG icon */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [error,       setError]       = useState('');
  const navigate = useNavigate();

  /* Redirect if already logged in */
  useEffect(() => {
    if (!loading && user) navigate('/analyze', { replace: true });
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      navigate('/analyze', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(200,146,10,0.15)', borderTop: `3px solid ${GOLD}`, animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#111111', border: '1px solid #2A2A2A',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', color: '#fff' }}>
            RepoSense
          </span>
          <div style={{ marginTop: 6 }}>
            <span className="badge-hackathon" style={{ fontSize: 10 }}>Developed using IBM Bob</span>
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#A0A0A0', fontSize: 14, margin: 0 }}>
            Sign in to analyze any GitHub repository
          </p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#2A2A2A' }} />
          <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>Continue with</span>
          <div style={{ flex: 1, height: 1, background: '#2A2A2A' }} />
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: '13px 20px', borderRadius: 999,
            background: authLoading ? '#e8e8e8' : '#ffffff',
            border: 'none', cursor: authLoading ? 'wait' : 'pointer',
            fontSize: 15, fontWeight: 700, color: '#111',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          onMouseOver={e => { if (!authLoading) e.currentTarget.style.boxShadow = `0 0 24px rgba(200,146,10,0.3), 0 4px 16px rgba(0,0,0,0.4)`; }}
          onMouseOut={e =>  { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'; }}
        >
          {authLoading ? (
            <>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #ccc', borderTop: '2px solid #333', animation: 'spin 0.8s linear infinite' }} />
              Signing in…
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {/* Error message */}
        {error && (
          <div style={{
            marginTop: 14, padding: '8px 14px', borderRadius: 999,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            textAlign: 'center',
          }}>
            <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Terms */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 20, lineHeight: 1.6 }}>
          By signing in you agree to our terms of service
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
