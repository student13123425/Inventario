import React, { useState } from 'react';
import { adminClient } from './script/network';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await adminClient.login({ username, password });

    if (response.success) {
      onLoginSuccess();
    } else {
      setError(response.message || response.error || 'Authentication failed');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.875rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '"IBM Plex Sans", sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#1e40af', 
            fontSize: '1.5rem', 
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.025em'
          }}>
            INVENTRIO <span style={{ color: '#0d9488' }}>ANALYTICS</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Secure Administrative Access</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', color: '#475569', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Admin ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="Enter admin username"
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#475569', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Passkey
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              color: '#b91c1c',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#1e40af',
              color: 'white',
              padding: '0.75rem',
              border: '1px solid #1e3a8a',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          Inventrio Core v1.0.0 • Secured Connection
        </div>
      </div>
    </div>
  );
};

export default LoginView;