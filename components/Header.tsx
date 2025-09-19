'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);



export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');
  const [userName, setUserName] = useState('');
  const [cartCount, setCartCount] = useState(0);
const [restaurant_info, setrestaurant_info] = useState<any | null>(null);


const [restaurantLoading, setRestaurantLoading] = useState(true);
const [restaurantError, setRestaurantError] = useState<string | null>(null);












  
useEffect(() => {
  let mounted = true;

  // --------------------------
  // 1) Handle login + user data
  // --------------------------
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const type = localStorage.getItem('userType') || 'user';
  const userData = localStorage.getItem('userData');

  setIsLoggedIn(loggedIn);
  setUserType(type);

  if (userData) {
    const user = JSON.parse(userData);
    setUserName(user.firstName || user.email || 'User');
  }

  // --------------------------
  // 2) Load restaurant info from Supabase
  // --------------------------
  async function loadFromSupabase() {
    try {
      setRestaurantLoading(true);
      setRestaurantError(null);

      const { data, error, status } = await supabase
        .from('restaurant_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error && status !== 406) {
        throw error;
      }

      if (mounted) {
        const row = Array.isArray(data) && data.length ? data[0] : null;
        setrestaurant_info(row);
      }
    } catch (err: any) {
      console.error('Failed to load restaurant_info from Supabase:', err);
      if (mounted) {
        setRestaurantError(err?.message ?? 'Failed to load restaurant info');
      }
    } finally {
      if (mounted) {
        setRestaurantLoading(false);
      }
    }
  }

  loadFromSupabase();

  // --------------------------
  // 3) Cart handling
  // --------------------------
  updateCartCount();

  const handleStorageChange = () => {
    updateCartCount();
  };

  window.addEventListener('storage', handleStorageChange);
  const interval = setInterval(updateCartCount, 1000);

  // Cleanup
  return () => {
    mounted = false;
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(interval);
  };
}, []);


  const updateCartCount = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
    const count = Object.values(cartItems).reduce((sum: number, qty: any) => sum + qty, 0);
    setCartCount(count);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserType('');
    setUserName('');
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-['Pacifico'] text-orange-600 cursor-pointer">
             {restaurant_info?.name ?? 'Our Restaurant'}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
              Home
            </Link>
            <Link href="/menu" className="text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
              Menu
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
              Contact
            </Link>
            <Link href="/reviews" className="text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
              Reviews
            </Link>
            
            {isLoggedIn && (
              <>
                <Link href="/orders" className="text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
                  Orders
                </Link>
                {(userType === 'admin' || userType === 'superadmin') && (
                  <Link href="/dashboard" className="text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
              <i className="ri-shopping-cart-line text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
                  <i className="ri-user-line text-xl"></i>
                  <span>{userName}</span>
                  <i className="ri-arrow-down-s-line"></i>
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <i className="ri-user-line mr-2"></i>
                      Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <i className="ri-shopping-bag-line mr-2"></i>
                      My Orders
                    </Link>
                    {(userType === 'admin' || userType === 'superadmin') && (
                      <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <i className="ri-dashboard-line mr-2"></i>
                        Dashboard
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <i className="ri-logout-box-line mr-2"></i>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
                  Login
                </Link>
                <Link href="/register" className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 cursor-pointer"
          >
            <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="py-4 space-y-2">
              <Link href="/" className="block py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                Home
              </Link>
              <Link href="/menu" className="block py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                Menu
              </Link>
              <Link href="/contact" className="block py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                Contact
              </Link>
              <Link href="/reviews" className="block py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                Reviews
              </Link>
              
              {isLoggedIn && (
                <>
                  <Link href="/profile" className="block py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                    Profile
                  </Link>
                  <Link href="/orders" className="block py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                    Orders
                  </Link>
                  {(userType === 'admin' || userType === 'superadmin') && (
                    <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                      Dashboard
                    </Link>
                  )}
                </>
              )}
              
              <Link href="/cart" className="flex items-center py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                <i className="ri-shopping-cart-line mr-2"></i>
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>

              <hr className="my-2" />

              {isLoggedIn ? (
                <div>
                  <p className="py-2 text-gray-600 font-medium">Welcome, {userName}</p>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-red-600 cursor-pointer"
                  >
                    <i className="ri-logout-box-line mr-2"></i>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" className="block py-2 text-gray-700 hover:text-orange-600 cursor-pointer">
                    Login
                  </Link>
                  <Link href="/register" className="block py-2 bg-orange-600 text-white text-center rounded-full hover:bg-orange-700 cursor-pointer">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
