'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '../../lib/supabase'; // keep your existing client

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const [showForgot, setShowForgot] = useState(false);
const [forgotEmail, setForgotEmail] = useState('');
const [forgotMsg, setForgotMsg] = useState<string | null>(null);
const [forgotError, setForgotError] = useState<string | null>(null);
const [forgotLoading, setForgotLoading] = useState(false);




const resolveRoleFromUserObject = (user: any) => {
  if (!user) return null;
  // 1) app metadata (server-side custom claims)
  const appMetaRole = user?.app_metadata?.role ?? user?.app_metadata?.user_type ?? null;
  if (appMetaRole) return String(appMetaRole);

  // 2) user metadata (client-provided)
  const userMetaRole = user?.user_metadata?.role ?? user?.user_metadata?.user_type ?? null;
  if (userMetaRole) return String(userMetaRole);

  // 3) top-level (rare)
  if (user?.role) return String(user.role);

  return null;
};

const decodeJwtRole = (token?: string) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const obj = JSON.parse(json);
    return obj?.role ?? obj?.user_metadata?.role ?? obj?.app_metadata?.role ?? null;
  } catch (err) {
    console.debug('decodeJwtRole failed', err);
    return null;
  }
};

const handleResetPassword = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setForgotError(null);
  setForgotMsg(null);

  const emailToSend = (forgotEmail || email || '').trim();
  if (!emailToSend) {
    setForgotError('Please enter your email address.');
    return;
  }

  setForgotLoading(true);
  try {
    // pick redirect from env (must be set to your /reset-password page)
    const redirectTo = (process.env.NEXT_PUBLIC_PASSWORD_RESET_REDIRECT || '').trim() || undefined;
    console.debug('Reset password redirectTo=', redirectTo);

    // Try supabase-js v2 API first
    if (typeof (supabase.auth as any).resetPasswordForEmail === 'function') {
      const { data, error } = await (supabase.auth as any).resetPasswordForEmail(emailToSend, redirectTo ? { redirectTo } : {});
      if (error) throw error;
      // data is not very useful here; we keep neutral success message below
    } else if ((supabase as any).auth && (supabase as any).auth.api && typeof (supabase as any).auth.api.resetPasswordForEmail === 'function') {
      // legacy client fallback
      const { data, error } = await (supabase as any).auth.api.resetPasswordForEmail(emailToSend, redirectTo);
      if (error) throw error;
    } else {
      throw new Error('Supabase client does not expose resetPasswordForEmail. Ensure you use a supported supabase-js version.');
    }

    // Always show neutral message (don't reveal account existence)
    setForgotMsg('If an account exists for that email, a password reset link has been sent. Check your email (including spam).');
    setForgotEmail('');
  } catch (err: any) {
    console.error('Reset password error', err);
    // Some Supabase errors come as string or object with message
    const message = typeof err === 'string' ? err : (err?.message ?? String(err));
    // Show friendly message but include underlying reason for debugging in console
    setForgotError(message || 'Failed to send reset email. Please try again later.');
  } finally {
    setForgotLoading(false);
  }
};






// --- replace your existing handleSubmit with this improved version ---
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    // Sign in with email/password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;
    if (!data || !data.user) throw new Error('Login failed. No user returned.');

    const user = data.user;
    const token = data.session?.access_token ?? null;

    // Save token and user id locally (best-effort)
    try { if (token) localStorage.setItem('authToken', token); } catch (_) {}
    try { localStorage.setItem('userData', JSON.stringify(user)); } catch (_) {}
    try { if (user.id) localStorage.setItem('userId', user.id); } catch (_) {}

    // 1) Try role from user object (app/user metadata or top-level)
    let userRole: string | null = resolveRoleFromUserObject(user);

    // 2) Try decode JWT (access token) for custom claims
    if (!userRole) {
      userRole = decodeJwtRole(token) ?? null;
      if (userRole) console.debug('Role from JWT claims:', userRole);
    }

    // 3) Fallback: canonical profiles table (server-controlled)
    if (!userRole) {
      try {
        const { data: profileRow, error: profileErr } = await supabase
          .from('profiles') // adjust to 'users' if you store role there
          .select('role, user_type')
          .eq('id', user.id)
          .maybeSingle();

        if (!profileErr && profileRow) {
          userRole = profileRow.role ?? profileRow.user_type ?? null;
          if (userRole) console.debug('Role from profiles table:', userRole);
        } else if (profileErr) {
          console.debug('profiles lookup error', profileErr);
        }
      } catch (err) {
        console.warn('profiles lookup failed', err);
      }
    }

    // Final fallback: default to 'user' (prevents blocking login)
    if (!userRole) {
      console.warn('Role not found for user. Defaulting to "user". Please ensure role is set on creation.');
      userRole = 'user';
    }

    // Persist role + logged in flag
    try { localStorage.setItem('isLoggedIn', 'true'); } catch (_) {}
    try { localStorage.setItem('userType', String(userRole)); } catch (_) {}
    try {
      const minimalUser = { id: user.id, email: user.email, role: userRole };
      localStorage.setItem('userMinimal', JSON.stringify(minimalUser));
    } catch (_) {}

    // Redirect based on role
    if (userRole === 'superadmin') {
      window.location.href = '/dashboard';
    } else if (userRole === 'admin') {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/menu';
    }
  } catch (err: any) {
    console.error('Login error:', err);
    const msg = err?.message ?? 'Login failed. Please try again.';
    setError(msg);
  } finally {
    setIsLoading(false);
  }
};















  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-orange-600 font-semibold hover:text-orange-700">
              Sign up
            </Link>
          </p>

{/* Forgot password link */}
<div className="text-right mt-2">
  {!showForgot ? (
    <button
      type="button"
      onClick={() => { setShowForgot(true); setForgotMsg(null); setForgotError(null); }}
      className="text-sm text-orange-600 hover:text-orange-700"
    >
      Forgot password?
    </button>
  ) : (
    <form onSubmit={handleResetPassword} className="mt-3">
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email to reset"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          required
        />
        <button
          type="submit"
          disabled={forgotLoading}
          className={`px-4 rounded-lg font-semibold ${forgotLoading ? 'bg-gray-300 text-gray-500' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
        >
          {forgotLoading ? 'Sending...' : 'Send'}
        </button>
        <button type="button" onClick={() => { setShowForgot(false); setForgotEmail(''); setForgotError(null); setForgotMsg(null); }} className="px-3 rounded-lg border border-gray-200"> Cancel</button>
      </div>

      {forgotMsg && <p className="mt-2 text-sm text-green-700">{forgotMsg}</p>}
      {forgotError && <p className="mt-2 text-sm text-red-700">{forgotError}</p>}
    </form>
  )}
</div>





        </div>
      </div>
    </div>
  );
}
