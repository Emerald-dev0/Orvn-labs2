import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/admin/blog');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Failed to sign in');
        setLoading(false);
        return;
      }

      if (data.user) {
        navigate('/admin/blog');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FB' }}>
        <div style={{ color: '#94A3B8' }}>Checking authentication...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FB', padding: '20px' }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #E5E8F0',
          borderRadius: 16,
          padding: '40px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
            Admin Login
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: 14 }}>
            ORVN Labs Blog Management
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div
              style={{
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E5E8F0',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
                background: '#F7F8FB',
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E5E8F0',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
                background: '#F7F8FB',
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#5B3FD4',
              color: '#fff',
              border: 'none',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px' }}>
            Need admin access? Contact support at{' '}
            <a href="mailto:hello@orvnlabs.com" style={{ color: '#5B3FD4', textDecoration: 'none' }}>
              hello@orvnlabs.com
            </a>
          </p>
          <p style={{ margin: 0 }}>
            Make sure you've been added as an admin user in Supabase Auth.
          </p>
        </div>
      </div>
    </div>
  );
}
