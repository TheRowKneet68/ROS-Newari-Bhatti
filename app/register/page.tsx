'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: 'Pokhara',
      state: 'Gandaki Province',
      zipCode: '33700',
    },
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const key = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // 1) Count users in DB to decide first user type (superadmin) vs user
      const { count: usersCount, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      if (countError) throw countError;

      // If no rows exist, usersCount === 0 -> make first user superadmin
      const user_type = (typeof usersCount === 'number' && usersCount === 0) ? 'superadmin' : 'user';

      // Normalise address shape for DB: use `zip` property in jsonb (your DB shows "zip")
      const addressForDb = {
        street: formData.address.street || null,
        city: formData.address.city || null,
        state: formData.address.state || null,
        zip: formData.address.zipCode || null,
      };

      // 2) Create user in Supabase Auth (signUp) with metadata
      // supabase-js v2 uses options.data (user_metadata) for metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: user_type, // store role in metadata (still enforce server-side)
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: addressForDb,
          },
        },
      });

      if (authError) throw authError;
      if (!authData?.user?.id) throw new Error('Registration failed: no user returned from auth');

      // 3) Insert the user row into your users table with the same auth UID
      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id, // use the auth UID
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        // write JSON address (jsonb)
        address: addressForDb,
        // write flattened address columns for legacy compatibility
        address_street: addressForDb.street,
        address_city: addressForDb.city,
        address_state: addressForDb.state,
        address_zip_code: addressForDb.zip,
        // set server-visible user type / role columns (frontend fallback)
        user_type,
        role: user_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        // If DB insert fails, you might want to rollback the auth user — consider handling that in production.
        throw insertError;
      }

      // 4) Redirect user according to user_type
      if (user_type === 'superadmin') {
        router.push('/dashboard');
      } else {
        router.push('/menu');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrors({ general: err?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-add-line text-2xl text-orange-600"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join Newari Bhatti & Kathmandu Momo Ghar family</p>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <i className="ri-error-warning-line text-red-600"></i>
                <p className="text-red-800">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`w-full p-3 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`w-full p-3 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>

            {/* Email & Phone */}
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full p-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

            <input
              type="tel"
              placeholder="Phone Number (+977-XXXXXXXXXX)"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full p-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}

            {/* Address */}
            <input
              type="text"
              placeholder="Street Address"
              value={formData.address.street}
              onChange={(e) => handleChange('address.street', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />

            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="ZIP"
                value={formData.address.zipCode}
                onChange={(e) => handleChange('address.zipCode', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full p-3 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full p-3 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
