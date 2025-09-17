// app/orders/page.tsx
'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrdersPage() {
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const pollingRef = useRef<number | null>(null);
  const realtimeRef = useRef<any>(null);

  // ---------- Load orders directly from Supabase ----------
  const loadOrders = async () => {
    setLoading(true);
    try {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const type = localStorage.getItem('userType') || 'user';
      const currentUserId = localStorage.getItem('userId') || null;
      const storedEmail = localStorage.getItem('userEmail') || null;

      let query = supabase.from('orders').select('*');

      // Admins get all orders
      if (!['admin', 'superadmin'].includes(type)) {
        // For regular users: attempt to filter by user id, fallback to email
        if (currentUserId) {
          query = query.eq('user_id', currentUserId).or(`userId.eq.${currentUserId}`);
        } else if (storedEmail) {
          // Some setups store user_email on order
          query = query.or(`user_email.eq.${storedEmail},customer_email.eq.${storedEmail}`);
        } else {
          // If not logged in or no id/email found — return empty list
          setOrders([]);
          setLoading(false);
          return;
        }
      }

      // Order newest first
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders from Supabase:', error);
        setOrders([]);
      } else {
        // normalize some field names to match your UI expectations
        const normalized = (data || []).map((o: any) => ({
          ...o,
          id: o.id ?? o.order_number ?? o.public_token ?? o.orderId,
          created_at: o.created_at ?? o.orderDate ?? o.createdAt,
          // items might be JSON string in some setups
          items: typeof o.items === 'string' ? (() => {
            try { return JSON.parse(o.items); } catch { return []; }
          })() : (o.items || []),
          // unify user fields
          userId: o.user_id ?? o.userId ?? o.user,
        }));
        setOrders(normalized);
      }
    } catch (err) {
      console.error('Exception loading orders from Supabase:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Load stats ----------
  const loadStats = async () => {
    try {
      // total orders excluding cancelled
      const totalResp = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'cancelled');
      const cancelledResp = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'cancelled');
      const activeResp = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', ['completed', 'cancelled']);

      const totalsRows = await supabase.from('orders').select('total, status');

      const totalCount = totalResp.count || 0;
      const cancelledCount = cancelledResp.count || 0;
      const activeCount = activeResp.count || 0;
      const totalRevenueNum = Array.isArray(totalsRows.data)
        ? totalsRows.data.filter((r: any) => (r.status || '') !== 'cancelled').reduce((s: number, r: any) => s + (Number(r.total) || 0), 0)
        : 0;

      setTotalOrders(totalCount);
      setCancelledOrders(cancelledCount);
      setActiveOrders(activeCount);
      setTotalRevenue(totalRevenueNum);
    } catch (err) {
      console.error('Error loading stats from Supabase:', err);
    }
  };

  // ---------- Cancel order (updates DB only) ----------
  const handleCancelOrder = async (orderId: string) => {
    if (processingOrderId) return;
    setProcessingOrderId(orderId);

    try {
      // Try direct update via Supabase client
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (!updateErr) {
        showSuccessToast('Order cancelled successfully.');
        await loadOrders();
        await loadStats();
        return;
      }

      console.warn('Direct update failed:', updateErr);
      // fallback: call serverless function if you have one
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/order-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'updateOrderStatus',
          orderId,
          status: 'cancelled'
        })
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => '');
        console.warn('Edge function update returned non-OK:', response.status, txt);
        showErrorToast('Failed to cancel order (network).');
        return;
      }

      const data = await response.json().catch(() => null);
      if (data && data.success) {
        showSuccessToast('Order cancelled successfully (Edge Function).');
        await loadOrders();
        await loadStats();
        return;
      }

      console.warn('Edge function update failed:', data?.error || data);
      showErrorToast('Unable to cancel order. Please contact support.');
    } catch (error) {
      console.error('Error cancelling order:', error);
      showErrorToast('Error cancelling order. Please try again.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // ---------- Reorder helper ----------
  const handleReorder = async (order: any) => {
    try {
      const cartData: { [key: number]: number } = {};
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          cartData[item.id] = item.quantity;
        });
      }
      localStorage.setItem('cartItems', JSON.stringify(cartData));
      showSuccessToast(`${order.items?.length || 0} items added to cart from Order #${order.id}`);
      setTimeout(() => {
        window.location.href = '/cart';
      }, 800);
    } catch (error) {
      console.error('Error reordering:', error);
      showErrorToast('Failed to reorder. Please try again.');
    }
  };

  // ---------- Toasts ----------
  const showSuccessToast = (message: string) => {
    const successToast = document.createElement('div');
    successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    successToast.innerHTML = `<div class="flex items-center space-x-2"><i class="ri-check-circle-line text-xl"></i><span>${message}</span></div>`;
    document.body.appendChild(successToast);
    setTimeout(() => {
      successToast.style.opacity = '0';
      successToast.style.transform = 'translateX(100%)';
      setTimeout(() => { if (document.body.contains(successToast)) document.body.removeChild(successToast); }, 300);
    }, 2500);
  };

  const showErrorToast = (message: string) => {
    const errorToast = document.createElement('div');
    errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorToast.innerHTML = `<div class="flex items-center space-x-2"><i class="ri-error-warning-line text-xl"></i><span>${message}</span></div>`;
    document.body.appendChild(errorToast);
    setTimeout(() => { if (document.body.contains(errorToast)) document.body.removeChild(errorToast); }, 4000);
  };

  // ---------- Helpers ----------
  const getStatusColor = (status: string) => {
    switch ((status || '').toString()) {
      case 'placed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'on-the-way': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch ((status || '').toString()) {
      case 'placed': return 'ri-check-line';
      case 'preparing': return 'ri-restaurant-line';
      case 'ready': return 'ri-store-line';
      case 'on-the-way': return 'ri-truck-line';
      case 'completed': return 'ri-home-line';
      case 'cancelled': return 'ri-close-circle-line';
      default: return 'ri-time-line';
    }
  };

  const formatOrderItems = (items: any) => {
    if (!Array.isArray(items)) return 'Order details';
    return items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ');
  };

  // Fetch the logged-in user's first_name from public.users (tries id then email)
  const loadLoggedInUserName = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const storedEmail = localStorage.getItem('userEmail') || null;

      if (currentUserId) {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', currentUserId)
          .maybeSingle();
        if (!error && data) {
          if (data.first_name) setUserName(data.first_name);
          if (!userEmail && data.email) setUserEmail(data.email);
          return;
        }
      }

      if (storedEmail) {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, id')
          .eq('email', storedEmail)
          .maybeSingle();
        if (!error && data) {
          if (data.first_name) setUserName(data.first_name);
          if (data.id && !localStorage.getItem('userId')) {
            localStorage.setItem('userId', data.id);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Exception loading user name:', err);
    }
  };

  // ---------- Refresh button handler ----------
  const handleRefreshClick = async () => {
    await loadOrders();
    await loadStats();
    showSuccessToast('Refreshed from server');
  };

  // ---------- useEffect: initial load + realtime subscription + polling fallback ----------
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const type = localStorage.getItem('userType') || 'user';
    const email = localStorage.getItem('userEmail') || null;

    setIsLoggedIn(loggedIn);
    setUserType(type);
    setUserEmail(email);

    (async () => {
      await loadLoggedInUserName();
    })();

    if (!loggedIn) {
      setLoading(false);
      return;
    }

    // initial load
    loadOrders();
    loadStats();

    // Try realtime subscription (Supabase v2 .channel)
    try {
      if ((supabase as any).channel) {
        const channel = (supabase as any)
          .channel('public:orders')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
            const event = payload.event;
            const newRow = payload.new ?? payload.record ?? null;
            const oldRow = payload.old ?? null;

            if (event === 'INSERT' && newRow) {
              setOrders(prev => [newRow, ...prev].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
              loadStats().catch(() => {});
            } else if (event === 'UPDATE' && newRow) {
              setOrders(prev => prev.map(o => (o.id === newRow.id ? newRow : o)));
              loadStats().catch(() => {});
            } else if (event === 'DELETE') {
              const deletedId = oldRow?.id ?? payload?.record?.id ?? null;
              if (deletedId) {
                setOrders(prev => prev.filter(o => o.id !== deletedId));
                loadStats().catch(() => {});
              }
            }
          })
          .subscribe();
        realtimeRef.current = channel;
      } else if ((supabase as any).from && (supabase as any).from('').on) {
        // older v1 style fallback
        const sub = (supabase as any)
          .from('orders')
          .on('*', (payload: any) => {
            const event = payload.event || payload.eventType;
            const newRow = payload.new ?? payload.record ?? null;
            const oldRow = payload.old ?? null;

            if (event === 'INSERT' && newRow) {
              setOrders(prev => [newRow, ...prev].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
              loadStats().catch(() => {});
            } else if (event === 'UPDATE' && newRow) {
              setOrders(prev => prev.map(o => (o.id === newRow.id ? newRow : o)));
              loadStats().catch(() => {});
            } else if (event === 'DELETE') {
              const deletedId = oldRow?.id ?? payload?.record?.id ?? null;
              if (deletedId) {
                setOrders(prev => prev.filter(o => o.id !== deletedId));
                loadStats().catch(() => {});
              }
            }
          })
          .subscribe();
        realtimeRef.current = sub;
      } else {
        console.warn('Supabase realtime not available; falling back to polling.');
      }
    } catch (e) {
      console.warn('Realtime subscription failed, using polling fallback', e);
    }

    // Polling fallback (keeps UI in sync if realtime not working)
    if (!realtimeRef.current) {
      const id = window.setInterval(() => {
        loadOrders();
        loadStats();
      }, 5000);
      pollingRef.current = id;
    }

    return () => {
      try { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } } catch (e) {}
      try {
        if (realtimeRef.current) {
          if (typeof realtimeRef.current.unsubscribe === 'function') {
            realtimeRef.current.unsubscribe().catch(() => {});
          } else if (typeof realtimeRef.current.remove === 'function') {
            realtimeRef.current.remove();
          } else if (realtimeRef.current && realtimeRef.current.channel) {
            try { realtimeRef.current.channel.unsubscribe(); } catch (er) {}
          }
        }
      } catch (e) {
        console.warn('Error unsubscribing realtime', e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- UI ----------
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Orders</h1>
            <p className="text-gray-600">Track your current and past orders</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshClick}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200"
              title="Fetch latest from server"
            >
              <i className="ri-refresh-line"></i>
              Refresh
            </button>

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
            {/* Active Orders */}
            {orders.filter(order => !['completed', 'cancelled'].includes((order.status || '').toString())).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <i className="ri-time-line text-orange-600 mr-2"></i>
                  Active Orders
                </h2>

                <div className="space-y-4">
                  {orders.filter(order => !['completed', 'cancelled'].includes((order.status || '').toString())).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <i className={`${getStatusIcon(order.status || 'placed')} text-orange-600`}></i>
                          </div>
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">{new Date(order.created_at || order.orderDate || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor((order.status || 'placed').toString())}`}>
                          {((order.status || 'placed').toString()).charAt(0).toUpperCase() + ((order.status || 'placed').toString()).slice(1)}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Items: {formatOrderItems(order.items)}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800">₨{(order.total || 0).toLocaleString()}</span>
                          <span className="text-sm text-gray-500 capitalize">{order.order_type || order.orderType || 'pickup'}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Link
                          href={`/track-order/${order.id}`}
                          className="flex-1 bg-orange-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Track Order
                        </Link>

                        {order.status !== 'cancelled' && (
                          <button onClick={() => handleCancelOrder(order.id)} className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 cursor-pointer">
                            <i className="ri-close-circle-line mr-1"></i> Cancel
                          </button>
                        )}

                        <a href="tel:+977-61-523456" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(order.status || 'placed') === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <i className={`${getStatusIcon(order.status || 'placed')} ${(order.status || 'placed') === 'completed' ? 'text-green-600' : 'text-gray-600'}`}></i>
                        </div>
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">{new Date(order.created_at || order.orderDate || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor((order.status || 'placed').toString())}`}>
                        {((order.status || 'placed').toString()).charAt(0).toUpperCase() + ((order.status || 'placed').toString()).slice(1)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Items: {formatOrderItems(order.items)}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">₨{(order.total || 0).toLocaleString()}</span>
                        <span className="text-sm text-gray-500 capitalize">{order.order_type || order.orderType || 'pickup'}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {!['completed', 'cancelled'].includes((order.status || 'placed').toString()) ? (
                        <Link href={`/track-order/${order.id}`} className="flex-1 bg-orange-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
                          Track Order
                        </Link>
                      ) : (
                        <button onClick={() => handleReorder(order)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap">
                          <i className="ri-repeat-line mr-2"></i> Reorder
                        </button>
                      )}

                      <Link href={`/track-order/${order.id}`} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <i className="ri-eye-line"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/menu" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><i className="ri-restaurant-line text-orange-600"></i></div>
                  <div><h3 className="font-semibold">Browse Menu</h3><p className="text-sm text-gray-600">Explore our dishes</p></div>
                </Link>

                <a href="tel:+977-61-523456" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><i className="ri-phone-line text-green-600"></i></div>
                  <div><h3 className="font-semibold">Call Restaurant</h3><p className="text-sm text-gray-600">Get help or support</p></div>
                </a>

                <Link href="/contact" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><i className="ri-message-line text-blue-600"></i></div>
                  <div><h3 className="font-semibold">Contact Us</h3><p className="text-sm text-gray-600">Send us a message</p></div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
