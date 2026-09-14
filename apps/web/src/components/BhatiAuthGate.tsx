'use client';

import React, { useState, useEffect } from 'react';

const AUTH_STORAGE_KEY = 'bhati_design_session';

export function BhatiAuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  // Target credentials from environment variables (set in Vercel)
  const envUsername = process.env.NEXT_PUBLIC_BHATI_USERNAME || process.env.NEXT_PUBLIC_AUTH_USERNAME || 'admin';
  const envPassword = process.env.NEXT_PUBLIC_BHATI_PASSWORD || process.env.NEXT_PUBLIC_AUTH_PASSWORD || '';
  const envAgentToken = process.env.NEXT_PUBLIC_BHATI_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN || '';

  useEffect(() => {
    // 1. Check if auth is not required (no password set in Vercel)
    if (!envPassword && !envAgentToken) {
      setIsAuthenticated(true);
      return;
    }

    // 2. Check for AI Agent query token bypass (e.g. ?token=... or ?key=...)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('token') || urlParams.get('key') || urlParams.get('api_key');
      if (queryToken && (queryToken === envAgentToken || queryToken === envPassword)) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'agent_authorized');
        setIsAuthenticated(true);
        return;
      }

      // 3. Check existing logged-in session
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession === 'authorized' || savedSession === 'agent_authorized') {
        setIsAuthenticated(true);
        return;
      }
    }

    setIsAuthenticated(false);
  }, [envPassword, envAgentToken]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    // Verify username and password
    const userMatches = !envUsername || trimmedUser === envUsername;
    const passMatches = trimmedPass === envPassword || (envAgentToken && trimmedPass === envAgentToken);

    if (userMatches && passMatches) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'authorized');
      setIsAuthenticated(true);
    } else {
      setError('Invalid username or password. Access denied.');
    }
  };

  if (isAuthenticated === null) {
    return null; // Loading initial auth check
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f1117',
        color: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '1.5rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#181b24',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
        }}
      >
        {/* Shield / Logo */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            color: '#38bdf8',
            marginBottom: '1rem',
            fontSize: '1.5rem',
          }}
        >
          🔒
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#ffffff' }}>
          Bhati Design Studio
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0 0 1.5rem 0' }}>
          Private Protected Workspace. Authenticate to access.
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.8rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.35rem' }}>
              Username
            </label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Username"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#0f1117',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#0f1117',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            Sign In to Studio
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
          Authorized AI Agent: pass <code style={{ color: '#38bdf8' }}>?token=KEY</code> in request
        </p>
      </div>
    </div>
  );
}
