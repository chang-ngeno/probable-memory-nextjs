'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      // find user by email
      const list = await fetch('/api/users').then((r) => r.json()).catch(() => []);
      const found = Array.isArray(list) ? (list as Array<{ id: string; email?: string }>).find((u) => u.email === email) : null;
      let id: string;
      if (found) {
        id = found.id;
      } else {
        // create user then sign in
        const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, role }) });
        const created = await res.json();
        id = created.id;
      }
      // call login
      const res2 = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (res2.ok) {
        setMessage('Signed in');
        setTimeout(() => (location.href = '/'), 300);
      } else {
        // fallback: set client cookie
        if (typeof document !== 'undefined') {
          document.cookie = `demo_user_id=${encodeURIComponent(id)}; Path=/`;
        }
        setMessage('Signed in (fallback)');
        setTimeout(() => (location.href = '/'), 300);
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
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input id="name" title="Name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" title="Email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">Role (demo)</label>
          <select id="role" title="Role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2">{loading ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
    </main>
  );
}
