<<<<<<< HEAD
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // adjust path if needed

export default function ResetPasswordPage() {
  const router = useRouter();
  const [tokenHandled, setTokenHandled] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const hash = window.location.hash || '';
    const search = window.location.search || '';

    const parseParams = (s: string) => {
      const params = new URLSearchParams(s.replace(/^#/, '').replace(/^\?/, ''));
      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        type: params.get('type'),
      };
    };

    const tokensFromHash = hash.includes('access_token') ? parseParams(hash) : null;
    const tokensFromQuery = search.includes('access_token') ? parseParams(search) : null;

    const tokens = tokensFromHash || tokensFromQuery;
    if (!tokens || !tokens.access_token) {
      // Friendly message — token missing (maybe wrong redirect)
      setMsg('No valid reset token found in the link. Please request a new password reset and open the emailed link.');
      setTokenHandled(true);
      return;
    }

    (async () => {
      try {
        console.debug('Reset tokens found, setting session...', { tokens: !!tokens.access_token });
        // v2: setSession accepts { access_token, refresh_token }
        const { error: setErr } = await supabase.auth.setSession({
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token ?? undefined
        } as any);

        if (setErr) {
          console.error('supabase.auth.setSession error', setErr);
          setMsg('Token could not be validated. It may be expired. Request a new reset link.');
        } else {
          setMsg('Token validated — enter your new password below.');
        }
      } catch (err) {
        console.error('Unexpected setSession error', err);
        setMsg('Token invalid or expired. Request a new reset link.');
      } finally {
        setTokenHandled(true);
      }
    })();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      // supabase-js v2:
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword } as any);

      if (updateErr) {
        console.error('updateUser error', updateErr);
        setError(updateErr.message ?? 'Failed to update password.');
        return;
      }

      setMsg('Password updated successfully. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1400);
    } catch (err: any) {
      console.error('updateUser unexpected error', err);
      setError(err?.message ?? 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow">
        <h2 className="text-xl font-semibold mb-4">Reset your password</h2>

        <p className="text-sm text-gray-600 mb-4">{msg ?? 'Validating token...'}</p>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}

        <form onSubmit={handleChangePassword} className="space-y-4" aria-disabled={!tokenHandled}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border rounded"
            required
            aria-label="New password"
          />
          <button
            type="submit"
            disabled={loading || !tokenHandled}
            className={`w-full py-3 rounded ${loading ? 'bg-gray-300 text-gray-600' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
          >
            {loading ? 'Updating...' : 'Set new password'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>If the link expired, request a new password reset from the login page.</p>
        </div>
      </div>
    </div>
  );
}
=======
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // adjust path if needed

export default function ResetPasswordPage() {
  const router = useRouter();
  const [tokenHandled, setTokenHandled] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const hash = window.location.hash || '';
    const search = window.location.search || '';

    const parseParams = (s: string) => {
      const params = new URLSearchParams(s.replace(/^#/, '').replace(/^\?/, ''));
      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        type: params.get('type'),
      };
    };

    const tokensFromHash = hash.includes('access_token') ? parseParams(hash) : null;
    const tokensFromQuery = search.includes('access_token') ? parseParams(search) : null;

    const tokens = tokensFromHash || tokensFromQuery;
    if (!tokens || !tokens.access_token) {
      // Friendly message — token missing (maybe wrong redirect)
      setMsg('No valid reset token found in the link. Please request a new password reset and open the emailed link.');
      setTokenHandled(true);
      return;
    }

    (async () => {
      try {
        console.debug('Reset tokens found, setting session...', { tokens: !!tokens.access_token });
        // v2: setSession accepts { access_token, refresh_token }
        const { error: setErr } = await supabase.auth.setSession({
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token ?? undefined
        } as any);

        if (setErr) {
          console.error('supabase.auth.setSession error', setErr);
          setMsg('Token could not be validated. It may be expired. Request a new reset link.');
        } else {
          setMsg('Token validated — enter your new password below.');
        }
      } catch (err) {
        console.error('Unexpected setSession error', err);
        setMsg('Token invalid or expired. Request a new reset link.');
      } finally {
        setTokenHandled(true);
      }
    })();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      // supabase-js v2:
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword } as any);

      if (updateErr) {
        console.error('updateUser error', updateErr);
        setError(updateErr.message ?? 'Failed to update password.');
        return;
      }

      setMsg('Password updated successfully. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1400);
    } catch (err: any) {
      console.error('updateUser unexpected error', err);
      setError(err?.message ?? 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow">
        <h2 className="text-xl font-semibold mb-4">Reset your password</h2>

        <p className="text-sm text-gray-600 mb-4">{msg ?? 'Validating token...'}</p>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}

        <form onSubmit={handleChangePassword} className="space-y-4" aria-disabled={!tokenHandled}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border rounded"
            required
            aria-label="New password"
          />
          <button
            type="submit"
            disabled={loading || !tokenHandled}
            className={`w-full py-3 rounded ${loading ? 'bg-gray-300 text-gray-600' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
          >
            {loading ? 'Updating...' : 'Set new password'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>If the link expired, request a new password reset from the login page.</p>
        </div>
      </div>
    </div>
  );
}
>>>>>>> origin/main
