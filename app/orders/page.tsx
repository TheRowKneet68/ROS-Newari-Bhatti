'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const type = localStorage.getItem('userType') || 'user';
    
    setIsLoggedIn(loggedIn);
    setUserType(type);

    if (loggedIn) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, []);

  const loadOrders = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const currentUserId = localStorage.getItem('userId');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      let orders = [];

      // Try to load from database first if user is logged in
      if (isLoggedIn && authToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/order-service`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              action: 'getOrders'
            })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Orders response:', data);
            
            if (data.success && data.orders && data.orders.length > 0) {
              orders = data.orders;
              console.log('Loaded orders from database:', orders.length);
            }
          }
        } catch (dbError) {
          console.log('Database fetch failed, using localStorage:', dbError);
        }
      }

      // Load from localStorage (as backup or primary for guests)
      const localOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      
      // If no database orders, use localStorage orders
      if (orders.length === 0) {
        if (isLoggedIn && currentUserId) {
          // Filter orders by current user
          orders = localOrders.filter((order: any) => 
            order.userId === currentUserId || order.user_id === currentUserId
          );
        } else {
          // For guests, show all orders from localStorage
          orders = localOrders;
        }
        
        // If still no orders, try allOrders (for admin or fallback)
        if (orders.length === 0) {
          orders = allOrders;
        }
        
        console.log('Loaded orders from localStorage:', orders.length);
      }

      // Sort orders from latest to oldest
      const sortedOrders = orders.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.orderDate || 0).getTime();
        const dateB = new Date(b.created_at || b.orderDate || 0).getTime();
        return dateB - dateA; // Latest first (descending order)
      });
      
      setOrders(sortedOrders);
      console.log('Final orders set:', sortedOrders.length);

    } catch (error) {
      console.error('Error loading orders:', error);
      // Final fallback - try to load any orders from localStorage
      const fallbackOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
        .concat(JSON.parse(localStorage.getItem('allOrders') || '[]'));
      
      // Remove duplicates by ID
      const uniqueOrders = fallbackOrders.filter((order: any, index: number, self: any[]) => 
        index === self.findIndex((o: any) => o.id === order.id)
      );
      
      const sortedFallback = uniqueOrders.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.orderDate || 0).getTime();
        const dateB = new Date(b.created_at || b.orderDate || 0).getTime();
        return dateB - dateA;
      });
      
      setOrders(sortedFallback);
      console.log('Used fallback orders:', sortedFallback.length);
    }
    setLoading(false);
  };

  const handleReorder = async (order: any) => {
    try {
      // Add items to cart - using cartItems key to match other components
      const cartData: {[key: number]: number} = {};
      
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          cartData[item.id] = item.quantity;
        });
      }

      // Store in localStorage using the correct key
      localStorage.setItem('cartItems', JSON.stringify(cartData));
      
      // Show success message
      showSuccessToast(`${order.items?.length || 0} items added to cart from Order #${order.id}`);
      
      // Redirect to cart after a brief delay
      setTimeout(() => {
        window.location.href = '/cart';
      }, 1500);
      
    } catch (error) {
      console.error('Error reordering:', error);
      showErrorToast('Failed to reorder. Please try again.');
    }
  };

  const showSuccessToast = (message: string) => {
    const successToast = document.createElement('div');
    successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    successToast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="ri-check-circle-line text-xl"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(successToast);
    
    setTimeout(() => {
      successToast.style.opacity = '0';
      successToast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 300);
    }, 3000);
  };

  const showErrorToast = (message: string) => {
    const errorToast = document.createElement('div');
    errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorToast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="ri-error-warning-line text-xl"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(errorToast);
    
    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast);
      }
    }, 5000);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed': return 'ri-check-line';
      case 'preparing': return 'ri-restaurant-line';
      case 'ready': return 'ri-store-line';
      case 'on-the-way': return 'ri-truck-line';
      case 'completed': return 'ri-home-line';
      default: return 'ri-time-line';
    }
  };

  const formatOrderItems = (items: any) => {
    if (!Array.isArray(items)) return 'Order details';
    return items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shopping-bag-line text-4xl text-orange-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">View Your Orders</h1>
          <p className="text-gray-600 mb-8">Please log in to view your order history and track current orders.</p>
          <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Orders</h1>
            <p className="text-gray-600">Track your current and past orders</p>
          </div>
          {(userType === 'admin' || userType === 'superadmin') && (
            <Link 
              href="/dashboard"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-dashboard-line mr-2"></i>
              Admin Dashboard
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-shopping-bag-line text-4xl text-gray-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet. Start by exploring our delicious menu!</p>
            <Link href="/menu" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <i className="ri-user-line text-blue-600"></i>
                <p className="text-blue-800">
                  <strong>Viewing orders for:</strong> {localStorage.getItem('userEmail') || 'Current User'}
                </p>
              </div>
            </div>

            {/* Active Orders */}
            {orders.filter(order => !['completed', 'cancelled'].includes(order.status || 'placed')).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <i className="ri-time-line text-orange-600 mr-2"></i>
                  Active Orders
                </h2>
                
                <div className="space-y-4">
                  {orders.filter(order => !['completed', 'cancelled'].includes(order.status || 'placed')).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <i className={`${getStatusIcon(order.status || 'placed')} text-orange-600`}></i>
                          </div>
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at || order.orderDate || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status || 'placed')}`}>
                          {(order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1)}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          Items: {formatOrderItems(order.items)}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800">₨{(order.total || 0).toLocaleString()}</span>
                          <span className="text-sm text-gray-500 capitalize">
                            {order.order_type || order.orderType || 'pickup'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link
                          href={`/track-order/${order.id}`}
                          className="flex-1 bg-orange-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Track Order
                        </Link>
                        <a
                          href="tel:+977-61-523456"
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <i className="ri-phone-line"></i>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <i className="ri-history-line text-gray-600 mr-2"></i>
                Order History
              </h2>
              
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders found</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            (order.status || 'placed') === 'completed' 
                              ? 'bg-green-100' 
                              : 'bg-gray-100'
                          }`}>
                            <i className={`${getStatusIcon(order.status || 'placed')} ${
                              (order.status || 'placed') === 'completed' 
                                ? 'text-green-600' 
                                : 'text-gray-600'
                            }`}></i>
                          </div>
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at || order.orderDate || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status || 'placed')}`}>
                          {(order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1)}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          Items: {formatOrderItems(order.items)}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800">₨{(order.total || 0).toLocaleString()}</span>
                          <span className="text-sm text-gray-500 capitalize">
                            {order.order_type || order.orderType || 'pickup'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        {!['completed', 'cancelled'].includes(order.status || 'placed') ? (
                          <Link
                            href={`/track-order/${order.id}`}
                            className="flex-1 bg-orange-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Track Order
                          </Link>
                        ) : (
                          <button 
                            onClick={() => handleReorder(order)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-repeat-line mr-2"></i>
                            Reorder
                          </button>
                        )}
                        <Link
                          href={`/track-order/${order.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <i className="ri-eye-line"></i>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/menu"
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-restaurant-line text-orange-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold">Browse Menu</h3>
                    <p className="text-sm text-gray-600">Explore our dishes</p>
                  </div>
                </Link>
                
                <a
                  href="tel:+977-61-523456"
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-phone-line text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold">Call Restaurant</h3>
                    <p className="text-sm text-gray-600">Get help or support</p>
                  </div>
                </a>
                
                <Link
                  href="/contact"
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-message-line text-blue-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold">Contact Us</h3>
                    <p className="text-sm text-gray-600">Send us a message</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}