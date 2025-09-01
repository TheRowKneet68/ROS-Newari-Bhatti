'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      // ✅ Get role from metadata
      const userRole = data.user.user_metadata?.role;

      if (!userRole) {
        throw new Error('User role is missing. Contact admin.');
      }

      // Save user info locally
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('userType', userRole);

      // ✅ Redirect based on role
      if (userRole === 'superadmin') {
        window.location.href = '/dashboard';
      } else if (userRole === 'admin') {
        window.location.href = '/admin-panel';
      } else {
        window.location.href = '/menu';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
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
        </div>
      </div>
    </div>
  );
}
