'use client';

import React, { useEffect, useState } from 'react';

export default function EditUserPage() {
  const [users, setUsers] = useState<Array<{ id: string; name?: string; email?: string; role?: string }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const u = users.find((x) => x.id === selected);
    if (u) {
      setName(u.name || '');
      setEmail(u.email || '');
      setRole(u.role || 'user');
    }
  }, [selected, users]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return setMessage('Pick a user');
    setMessage(null);
    try {
      const body: any = { name, email, role };
      if (password) body.password = password;
      const res = await fetch(`/api/users/${selected}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        setMessage('Updated');
        // refresh list
        const list = await fetch('/api/users').then((r) => r.json()).catch(() => []);
        setUsers(Array.isArray(list) ? list : []);
        setPassword('');
      } else {
        setMessage('Failed to update');
      }
    } catch {
      setMessage('Failed to update');
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-4">Edit / Update User</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}

      <div className="mb-4">
        <label htmlFor="selectUser" className="block text-sm font-medium mb-1">Select user</label>
        <select id="selectUser" value={selected || ''} onChange={(e) => setSelected(e.target.value || null)} className="w-full border rounded px-3 py-2">
          <option value="">-- choose --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name || u.email} {u.role ? `(${u.role})` : ''}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
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
          <label htmlFor="password" className="block text-sm font-medium mb-1">New password (leave blank to keep)</label>
          <input id="password" title="Password" placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <button type="submit" className="rounded bg-blue-600 text-white px-4 py-2">Update</button>
        </div>
      </form>
    </main>
  );
}
