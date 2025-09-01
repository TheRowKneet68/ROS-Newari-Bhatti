'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!loggedIn) {
      router.push('/login');
      return;
    }

    setIsLoggedIn(loggedIn);
    loadUserProfile();
  }, [router]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/user-profile-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ action: 'getProfile' })
      });

      const result = await response.json();
      
      if (result.success) {
        const profile = result.profile;
        setUserData(profile);
        setFormData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          gender: profile.gender || '',
          dateOfBirth: profile.date_of_birth || '',
          bio: profile.bio || '',
          address: profile.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          }
        });
      } else {
        // Fallback to localStorage if API fails
        const user = localStorage.getItem('userData');
        if (user) {
          const parsedUser = JSON.parse(user);
          setUserData(parsedUser);
          setFormData({
            firstName: parsedUser.firstName || '',
            lastName: parsedUser.lastName || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            gender: parsedUser.gender || '',
            dateOfBirth: parsedUser.dateOfBirth || '',
            bio: parsedUser.bio || '',
            address: parsedUser.address || {
              street: '',
              city: '',
              state: '',
              zipCode: ''
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Fallback to localStorage
      const user = localStorage.getItem('userData');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/user-profile-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          action: 'updateProfile',
          profileData: formData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setUserData(result.profile);
        setIsEditing(false);
        
        // Update localStorage as backup
        localStorage.setItem('userData', JSON.stringify(result.profile));
        
        showSuccessMessage('Profile updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      // Fallback to localStorage update
      const updatedUserData = {
        ...userData,
        ...formData,
        address: formData.address
      };

      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setIsEditing(false);
      showSuccessMessage('Profile updated successfully!');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorMessage('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showErrorMessage('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/user-profile-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          action: 'changePassword',
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showSuccessMessage('Password changed successfully!');
      } else {
        throw new Error(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showErrorMessage('Failed to change password. Please try again.');
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorMessage('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage('Image size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // In a real app, you would upload to Supabase Storage or another service
      // For demo, we'll create a mock URL
      const mockUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.email || 'user'}&backgroundColor=orange`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/user-profile-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          action: 'updateProfilePicture',
          profileData: { profilePictureUrl: mockUrl }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setUserData({ ...userData, profile_picture_url: result.profilePictureUrl });
        showSuccessMessage('Profile picture updated successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      showErrorMessage('Failed to update profile picture');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/user-profile-service`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'deactivateAccount' })
        });

        const result = await response.json();
        
        if (result.success) {
          localStorage.clear();
          router.push('/');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Account deletion error:', error);
        // Fallback to local logout
        localStorage.clear();
        router.push('/');
      }
    }
  };

  const showSuccessMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="ri-check-circle-line text-xl"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="ri-error-warning-line text-xl"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const getOrderHistory = () => {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    return orders.sort((a: any, b: any) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'on-the-way': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoggedIn || !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const orderHistory = getOrderHistory();
  const profilePictureUrl = userData.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}&backgroundColor=orange`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-orange-100">
                  <img 
                    src={profilePictureUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}&backgroundColor=orange`;
                    }}
                  />
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors">
                  <i className="ri-camera-line text-white text-sm"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={isUploadingPhoto}
                  />
                </label>
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">
                  {userData.first_name || userData.firstName} {userData.last_name || userData.lastName}
                </h1>
                <p className="text-gray-600">{userData.email}</p>
                {userData.bio && (
                  <p className="text-sm text-gray-500 mt-1">{userData.bio}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Member since {new Date(userData.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                  {userData.role === 'admin' ? 'Admin' : 'Active Member'}
                </div>
                <p className="text-sm text-gray-600">
                  {orderHistory.length} orders placed
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-200 rounded-full p-1 mb-8 max-w-lg">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
                activeTab === 'profile'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
                activeTab === 'orders'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
                activeTab === 'security'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
                activeTab === 'settings'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="+977-XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                          <input
                            type="text"
                            value={formData.address.state}
                            onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                          <input
                            type="text"
                            value={formData.address.zipCode}
                            onChange={(e) => setFormData({...formData, address: {...formData.address, zipCode: e.target.value}})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">First Name</h3>
                      <p className="text-gray-800 font-medium">{userData.first_name || userData.firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Last Name</h3>
                      <p className="text-gray-800 font-medium">{userData.last_name || userData.lastName || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Email Address</h3>
                      <p className="text-gray-800 font-medium">{userData.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Phone Number</h3>
                      <p className="text-gray-800 font-medium">{userData.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Gender</h3>
                      <p className="text-gray-800 font-medium">
                        {userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1).replace('_', ' ') : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Date of Birth</h3>
                      <p className="text-gray-800 font-medium">
                        {userData.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {userData.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
                      <p className="text-gray-800">{userData.bio}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800">
                        {userData.address?.street || userData.address_street || 'Street not provided'}<br/>
                        {userData.address?.city || userData.address_city || 'City not provided'}, {userData.address?.state || userData.address_state || 'State not provided'} {userData.address?.zipCode || userData.address_zip_code || ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Password</h3>
                      <p className="text-sm text-gray-600">Last changed: Recently</p>
                    </div>
                    {!isChangingPassword && (
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                      >
                        Change Password
                      </button>
                    )}
                  </div>

                  {isChangingPassword && (
                    <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                          minLength={8}
                        />
                        <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">Login Sessions</h3>
                      <p className="text-sm text-gray-600">Manage your active login sessions</p>
                    </div>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                      View Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order History Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6">Order History</h2>

              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">When you place orders, they'll appear here</p>
                  <Link href="/menu" className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap">
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order: any) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status || 'placed')}`}>
                            {(order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1)}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {(order.order_type || order.orderType || 'pickup').charAt(0).toUpperCase() + (order.order_type || order.orderType || 'pickup').slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">₨{(order.total || 0).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at || order.date || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 mb-2">Items Ordered:</h4>
                        {Array.isArray(order.items) ? (
                          order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-medium">₨{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">Order details not available</p>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <p>Order placed: {new Date(order.created_at || order.date || Date.now()).toLocaleString()}</p>
                          {order.phone && <p>Contact: {order.phone}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            href={`/track-order/${order.id}`}
                            className="px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 cursor-pointer text-sm whitespace-nowrap"
                          >
                            Track Order
                          </Link>
                          {order.status === 'completed' && (
                            <Link 
                              href="/menu"
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer text-sm whitespace-nowrap"
                            >
                              Reorder
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates about your orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">SMS Notifications</h3>
                        <p className="text-sm text-gray-600">Get order updates via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">Marketing Communications</h3>
                        <p className="text-sm text-gray-600">Receive offers and promotions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold mb-6 text-red-600">Danger Zone</h2>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-600 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 cursor-pointer whitespace-nowrap"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}