 'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdateProfilePage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            if (data?.id) {
              setId(data.id);
              setName(data.name || '');
              setEmail(data.email || '');
            } else {
              // not signed in — redirect to login and preserve return URL
              router.replace(`/login?next=${encodeURIComponent('/user/profile/update')}`);
              return;
            }
          }
        } else {
          if (mounted) setMessage('Failed to fetch user');
          return;
        }
      } catch (error) {
        // log error and show friendly message
        // eslint-disable-next-line no-console
        console.error('fetch /api/auth/me failed', error);
        if (mounted) setMessage('Failed to fetch user');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!id) return setMessage('No user id');
    setLoading(true);
    try {
      const body: any = { id, name, email };
      if (password) body.password = password;
      const res = await fetch('/api/users/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessage('Profile updated');
        setPassword('');
        setName(data?.name || name);
        setEmail(data?.email || email);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err?.message || 'Update failed');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('update profile failed', error);
      setMessage('Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-4">Update Profile</h1>
      {message && <div className="mb-4 text-sm text-zinc-700">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input id="name" title="Name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" title="Email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">New password (leave blank to keep)</label>
          <input id="password" title="New password" placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2">{loading ? 'Updating…' : 'Update Profile'}</button>
        </div>
      </form>
    </main>
  );
}
