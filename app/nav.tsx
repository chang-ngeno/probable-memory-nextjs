
'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type User = { id: string; name?: string; email?: string; role?: string } | null;

export default function Nav() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  async function fetchMe() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      setUser(data?.id ? data : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    // server attempts to clear cookie; if cookie still present, clear via document as a fallback
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'demo_user_id=; Path=/; Max-Age=0';
      }
    } catch {}
    await fetchMe();
  }

  useEffect(() => {
    fetchMe();
  }, []);

  const isAdmin = !!user?.role && user?.role === 'admin';
  let initial = '?';
  if (user?.name) {
    initial = user.name.charAt(0).toUpperCase();
  } else if (user?.email) {
    initial = user.email.charAt(0).toUpperCase();
  }

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/next.svg" alt="Logo" width={40} height={24} className="dark:invert" priority />
            </Link>

            <ul className="ml-6 flex items-center space-x-6 text-sm font-medium">
              <li>
                <Link href="/" className="text-zinc-900 dark:text-zinc-100 hover:underline">
                  Home
                </Link>
              </li>
              {isAdmin && (
                <>
                  <li>
                    <Link href="/admin/user/create" className="text-zinc-900 dark:text-zinc-100 hover:underline">
                      Create User
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/user/edit" className="text-zinc-900 dark:text-zinc-100 hover:underline">
                      Edit User
                    </Link>
                  </li>
                </>
              )}
              {user && (
                <li>
                  <Link href="/user/profile/update" className="text-zinc-900 dark:text-zinc-100 hover:underline">
                    Update Profile
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            {(() => {
              if (loading) return <span className="text-sm text-zinc-500">Checking session…</span>;
              if (!user) {
                return (
                  <Link href="/login" className="text-sm text-blue-600 hover:underline">
                    Sign in
                  </Link>
                );
              }

              // signed in: show avatar + caret dropdown with Update Profile and Sign out
              return (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    aria-haspopup="true"
                    className="flex items-center gap-2"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-sm font-medium text-zinc-800 dark:text-zinc-50">
                      {initial}
                    </span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-200">▾</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-zinc-900 shadow-lg border border-gray-200 dark:border-zinc-800 z-10">
                      <div className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200">{user?.name || user?.email}</div>
                      {user?.role && <div className="px-3 text-xs text-zinc-500">{user.role}</div>}
                      <div className="border-t border-gray-100 dark:border-zinc-800 mt-2" />
                      <ul>
                        <li className="px-3 py-2">
                          <Link href="/user/profile/update" className="w-full text-left text-sm text-zinc-900 dark:text-zinc-100 hover:underline">
                            Update Profile
                          </Link>
                        </li>
                        <li className="px-3 py-2">
                          <button onClick={signOut} className="text-sm text-blue-600 hover:underline">Sign out</button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </nav>
  );
}