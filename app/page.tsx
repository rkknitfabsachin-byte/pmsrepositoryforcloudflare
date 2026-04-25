'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Factory, Lock, User } from 'lucide-react';
import { useUserStore } from '@/store/user';

export default function LoginPage() {
  const router = useRouter();
  const setCurrentUser = useUserStore((s) => s.setCurrentUser);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setError('Please enter both name and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        router.push(data.user.role === 'ADMIN' ? '/dashboard' : '/planning');
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
            <Factory size={32} className="text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text">Production Management</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 animate-slideUp">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label className="form-label">Username</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Enter your assigned username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                className="form-input pl-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>

          <p className="text-center text-[0.6875rem] text-text-muted mt-4">
            Secured via Google Sheets
          </p>
        </form>
      </div>
    </div>
  );
}
