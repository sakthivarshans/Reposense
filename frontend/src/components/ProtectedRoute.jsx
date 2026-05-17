import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0A0A0A',
      }}>
        {/* Gold spinning ring */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          border: '3px solid rgba(200,146,10,0.15)',
          borderTop: '3px solid #C8920A',
          animation: 'spin 0.9s linear infinite',
          marginBottom: 20,
        }} />
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
          RepoSense
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
