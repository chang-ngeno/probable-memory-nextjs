
 'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type User = { id: string; name?: string; email?: string; role?: string } | null;

export default function Nav() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchMe = useCallback(async () => {
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
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    // server attempts to clear cookie; if cookie still present, clear via document as a fallback
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'demo_user_id=; Path=/; Max-Age=0';
      }
    } catch {}
    await fetchMe();
  }, [fetchMe]);

  const router = useRouter();

  // signOutAndRedirect: sign out then redirect to homepage
  const signOutAndRedirect = useCallback(async () => {
    await signOut();
    try {
      router.replace('/');
    } catch {
      // fallback to location change
      try {
        location.href = '/';
      } catch {}
    }
  }, [router, signOut]);

  // inactivity timeout (3 minutes)
  const inactivityMs = 1000 * 60 * 3; // 3 minutes
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearInactivityTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startInactivityTimeout = useCallback(() => {
    clearInactivityTimeout();
    timeoutRef.current = setTimeout(() => {
      // automatically sign out and redirect after inactivity
      signOutAndRedirect();
    }, inactivityMs);
  }, [clearInactivityTimeout, inactivityMs, signOutAndRedirect]);

  // (resetInactivityTimer will be defined after the wrapper so it uses the wrapper)

  

  // Warning modal state and refs
  const warningMs = 30 * 1000; // show warning 30s before sign-out
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(Math.floor(warningMs / 1000));

  const clearWarningTimeout = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const clearWarningInterval = useCallback(() => {
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, []);

  const showWarning = useCallback(() => {
    // show modal and start countdown
    setWarningVisible(true);
    setWarningSecondsLeft(Math.floor(warningMs / 1000));
    clearWarningInterval();
    warningIntervalRef.current = setInterval(() => {
      setWarningSecondsLeft((s) => {
        if (s <= 1) {
          // time's up — ensure cleanup and sign out
          clearWarningInterval();
          setWarningVisible(false);
          signOutAndRedirect();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [clearWarningInterval, signOutAndRedirect, warningMs]);

  // extend the session (user clicked "Stay signed in")
  function extendSession() {
    setWarningVisible(false);
    clearWarningInterval();
    clearWarningTimeout();
    startInactivityTimeoutWithWarning();
  }

  // sign out immediately from modal
  function signOutNow() {
    setWarningVisible(false);
    clearWarningInterval();
    clearWarningTimeout();
    signOutAndRedirect();
  }

  // hook warning timers into startInactivityTimeout
  const origStartInactivityTimeout = startInactivityTimeout;
  const startInactivityTimeoutWithWarning = useCallback(() => {
    // clear any previous warning timers
    clearWarningInterval();
    clearWarningTimeout();
    origStartInactivityTimeout();
    // schedule warning only if inactivityMs > warningMs
    if (inactivityMs > warningMs) {
      const warnDelay = inactivityMs - warningMs;
      warningTimeoutRef.current = setTimeout(() => {
        showWarning();
      }, warnDelay);
    }
  }, [origStartInactivityTimeout, inactivityMs, warningMs, showWarning, clearWarningInterval, clearWarningTimeout]);

  // reset timer on user interaction (use wrapper)
  const resetInactivityTimer = useCallback(() => {
    startInactivityTimeoutWithWarning();
  }, [startInactivityTimeoutWithWarning]);

  // attach listeners and start timer when signed in
  useEffect(() => {
    if (!user) {
      clearInactivityTimeout();
      clearWarningInterval();
      clearWarningTimeout();
      return;
    }

    startInactivityTimeoutWithWarning();
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    for (const ev of events) {
      (globalThis as unknown as Window).addEventListener(ev, resetInactivityTimer, { passive: true });
    }

    return () => {
      clearInactivityTimeout();
      clearWarningInterval();
      clearWarningTimeout();
      for (const ev of events) {
        (globalThis as unknown as Window).removeEventListener(ev, resetInactivityTimer as EventListenerOrEventListenerObject);
      }
    };
  }, [user, startInactivityTimeoutWithWarning, resetInactivityTimer, clearInactivityTimeout, clearWarningInterval, clearWarningTimeout]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const isAdmin = !!user?.role && user?.role === 'admin';
  let initial = '?';
  if (user?.name) {
    initial = user.name.charAt(0).toUpperCase();
  } else if (user?.email) {
    initial = user.email.charAt(0).toUpperCase();
  }

  return (
    <>
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
              {/* profile is available from the avatar menu; remove top-level nav link */}
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
                            <button onClick={signOutAndRedirect} className="text-sm text-blue-600 hover:underline">Sign out</button>
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
      {warningVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">You will be signed out</h2>
            <p className="text-sm mb-4">For your security, you will be signed out due to inactivity in <strong>{warningSecondsLeft}s</strong>.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={signOutNow} className="px-3 py-2 text-sm text-red-600">Sign out now</button>
              <button onClick={extendSession} className="rounded bg-blue-600 text-white px-3 py-2 text-sm">Stay signed in</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}