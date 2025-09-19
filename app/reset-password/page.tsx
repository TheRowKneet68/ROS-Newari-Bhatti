'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // update path if needed

export default function ResetPasswordPage() {
  const router = useRouter();
  const [tokenHandled, setTokenHandled] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
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
      setMsg('No valid reset token found in the link. Request a new password reset and open the emailed link.');
      setTokenHandled(true);
      return;
    }

    (async () => {
      try {
        // Set session so updateUser works
        await supabase.auth.setSession({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token
        });
        setMsg('Token validated — enter your new password below.');
      } catch (err) {
        console.error('setSession error', err);
        setMsg('Token invalid or expired. Request a new reset link.');
      } finally {
        setTokenHandled(true);
      }
    })();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMsg('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMsg('Password updated. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1400);
    } catch (err: any) {
      console.error('updateUser error', err);
      setMsg(err?.message ?? 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow">
        <h2 className="text-xl font-semibold mb-4">Reset your password</h2>
        <p className="text-sm text-gray-600 mb-4">{msg ?? 'Validating token...'}</p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading || !tokenHandled}
            className={`w-full py-3 rounded ${loading ? 'bg-gray-300' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
          >
            {loading ? 'Updating...' : 'Set new password'}
          </button>
        </form>
      </div>
    </div>
  );
}
