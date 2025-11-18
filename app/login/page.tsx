'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    if (!emailOrUsername || !password) {
      setMessage('Please enter your email/username and password');
      setLoading(false);
      return;
    }
    try {
        const res = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailOrUsername, password, remember }) });
        const payload = await res.json().catch(() => ({}));
        if (res.ok) {
          // server should set an HttpOnly cookie, but some environments/browsers
          // may not apply it immediately. Set a non-HttpOnly fallback cookie
          // so client-side requests can include the id until the server cookie exists.
          try {
            if (payload && payload.id && typeof document !== 'undefined') {
              const maxAge = remember ? 60 * 60 * 24 * 30 : undefined;
              let cookie = `demo_user_id=${encodeURIComponent(payload.id)}; Path=/`;
              if (typeof maxAge === 'number') cookie += `; Max-Age=${maxAge}`;
              document.cookie = cookie;
            }
          } catch {}
          setMessage('Signed in');
          setTimeout(() => (location.href = '/'), 300);
        } else {
          setMessage(payload?.message || 'Invalid credentials');
        }
    } catch {
      setMessage('Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {message && <div className="mb-4 text-red-600">{message}</div>}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email or Username</label>
          <input id="email" title="Email or username" placeholder="you@example.com" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input id="password" title="Password" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
          <div className="flex items-center">
            <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mr-2" />
            <label htmlFor="remember" className="text-sm">Remember me</label>
          </div>
        <div>
          <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2">{loading ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
    </main>
  );
}
