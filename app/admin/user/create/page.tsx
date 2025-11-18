'use client';

import React, { useState } from 'react';

export default function CreateUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    if (!name || !email || !password) {
      setMessage('Name, email and password are required');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, role, password }) });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Created user ${data.id}`);
        setName('');
        setEmail('');
        setRole('user');
        setPassword('');
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage((err && err.message) || 'Failed to create');
      }
    } catch {
      setMessage('Failed to create');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-4">Create User</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input id="name" title="Name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" title="Email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
          <select id="role" title="Role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input id="password" title="Password" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2">
            {loading ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </main>
  );
}
