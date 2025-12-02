import React, { useState } from 'react';
import { adminClient } from './script/network';

const ChangeCredentialsView: React.FC = () => {
  const [formData, setFormData] = useState({
    currentUsername: '',
    currentPassword: '',
    newUsername: '',
    newPassword: ''
  });
  
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({
    type: 'idle',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    const response = await adminClient.changeCredentials(formData);

    setLoading(false);
    if (response.success) {
      setStatus({ type: 'success', message: 'Admin credentials updated successfully. Please re-authenticate on next session.' });
      setFormData({ currentUsername: '', currentPassword: '', newUsername: '', newPassword: '' });
    } else {
      setStatus({ type: 'error', message: response.error || response.message || 'Failed to update credentials' });
    }
  };

  const labelStyle = {
    display: 'block',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '0.5rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.875rem',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  };

  return (
    <div style={{ maxWidth: '800px', animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Security Configuration</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Manage administrative access and rotation of cryptographic keys.</p>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          borderBottom: '1px solid #e2e8f0', 
          paddingBottom: '1rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#1e40af', fontWeight: 600 }}>Update Admin Credentials</h3>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>SENSITIVE ACTION</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Current Credentials */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Current Username</label>
                <input
                  name="currentUsername"
                  type="text"
                  value={formData.currentUsername}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* New Credentials */}
            <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '6px', border: '1px solid #e0f2fe' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Identity</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>New Username</label>
                <input
                  name="newUsername"
                  type="text"
                  value={formData.newUsername}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {status.type !== 'idle' && (
            <div style={{
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: status.type === 'success' ? '#166534' : '#b91c1c',
              border: `1px solid ${status.type === 'success' ? '#86efac' : '#fca5a5'}`
            }}>
              {status.type === 'success' ? '✓' : '⚠'} {status.message}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#1e40af',
                color: 'white',
                padding: '0.6rem 1.5rem',
                border: '1px solid #1e3a8a',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '"JetBrains Mono", monospace',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {loading ? 'PROCESSING...' : 'UPDATE RECORD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeCredentialsView;