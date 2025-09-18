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
// --- add near other useState declarations ---
const [restaurantPhone, setRestaurantPhone] = useState<string | null>(null);

  // ---------- loadOrders (server-backed) ----------
  const loadOrders = async () => {
    setLoading(true);
    try {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const type = localStorage.getItem('userType') || 'user';
      const currentUserId = localStorage.getItem('userId') || '';
      const storedEmail = localStorage.getItem('userEmail') || '';

      // build query params so server can filter safely (server route still should verify in prod)
      const params = new URLSearchParams();
      params.set('role', type);
      if (currentUserId) params.set('userId', currentUserId);
      if (storedEmail) params.set('email', storedEmail);

      // include auth token in Authorization header so server can verify user identity
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('supabase.auth.token') || '';
      const res = await fetch(`/api/orders/list?${params.toString()}`, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : ''
        }
      });

      const txt = await res.text().catch(() => '');
      let payload: any = null;
      try { payload = txt ? JSON.parse(txt) : null; } catch (e) { payload = { raw: txt }; }

      if (!res.ok || payload?.success === false) {
        console.warn('orders/list returned error or non-OK:', res.status, payload);
        // fallback: try localStorage cache or empty
        const cached = JSON.parse(localStorage.getItem('allOrders') || '[]');
        if (!['admin','superadmin'].includes(type)) {
          const filtered = cached.filter((o: any) => {
            if (currentUserId) return (o.user_id ?? o.userId ?? o.user) === currentUserId;
            if (storedEmail) return (o.user_email ?? o.customer_email ?? o.email) === storedEmail;
            return false;
          });
          setOrders(filtered);
        } else {
          setOrders(cached);
        }
        return;
      }

      let data = Array.isArray(payload?.orders) ? payload.orders : [];

      // defensive client-side filter for users (server should already have done this)
      if (!['admin','superadmin'].includes(type)) {
        if (currentUserId) {
          data = data.filter((o: any) => (o.user_id ?? o.userId ?? o.user) === currentUserId);
        } else if (storedEmail) {
          data = data.filter((o: any) => (o.user_email ?? o.customer_email ?? o.email) === storedEmail);
        } else {
          data = [];
        }
      }

      const normalized = (data || []).map((o: any) => ({
        ...o,
        id: o.id ?? o.order_number ?? o.public_token ?? o.orderId,
        created_at: o.created_at ?? o.orderDate ?? o.createdAt,
        items: typeof o.items === 'string' ? (() => { try { return JSON.parse(o.items); } catch { return []; } })() : (o.items || []),
        userId: o.user_id ?? o.userId ?? o.user,
      }));

      setOrders(normalized);
      try { localStorage.setItem('allOrders', JSON.stringify(normalized)); } catch (e) {}
    } catch (err) {
      console.error('Exception loading orders via server route:', err);
      setOrders(JSON.parse(localStorage.getItem('allOrders') || '[]'));
    } finally {
      setLoading(false);
    }
  };






// --- loader for restaurant phone number ---
const loadRestaurantPhone = async () => {
  try {
    // Try reading from public table 'restaurant_info' (adjust column name if needed)
    const { data, error } = await supabase
      .from('restaurant_info')
      .select('phone')
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch restaurant phone from Supabase:', error);
      return;
    }
    // data may be { phone: "..."} or null
    const phone = data?.phone ?? null;
    if (phone) setRestaurantPhone(String(phone));
  } catch (err) {
    console.error('Exception fetching restaurant phone:', err);
  }
};




  // ---------- loadStats (server-backed) ----------
  const loadStats = async () => {
    try {
      const type = localStorage.getItem('userType') || 'user';
      const currentUserId = localStorage.getItem('userId') || '';
      const storedEmail = localStorage.getItem('userEmail') || '';

      const params = new URLSearchParams();
      params.set('role', type);
      if (currentUserId) params.set('userId', currentUserId);
      if (storedEmail) params.set('email', storedEmail);

      // include auth token in Authorization header so server can verify user identity
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('supabase.auth.token') || '';
      const res = await fetch(`/api/orders/list?${params.toString()}`, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : ''
        }
      });

      const txt = await res.text().catch(() => '');
      let payload: any = null;
      try { payload = txt ? JSON.parse(txt) : null; } catch (e) { payload = { raw: txt }; }

      let ordersData: any[] = Array.isArray(payload?.orders) ? payload.orders : [];

      // fallback to lightweight supabase fetch if server route not available
      if (!Array.isArray(ordersData) || ordersData.length === 0) {
        try {
          const { data: altData, error: altErr } = await supabase.from('orders').select('total, status');
          if (!altErr && Array.isArray(altData)) ordersData = altData;
        } catch (e) {
          console.warn('fallback supabase stats fetch failed', e);
        }
      }

      const totalCount = ordersData.filter((r:any) => (r.status || '') !== 'cancelled').length;
      const cancelledCount = ordersData.filter((r:any) => (r.status || '') === 'cancelled').length;
      const activeCount = ordersData.filter((r:any) => !['completed','cancelled'].includes((r.status || '').toString())).length;
      const totalRevenueNum = ordersData.filter((r:any) => (r.status || '') !== 'cancelled').reduce((s:number, r:any) => s + (Number(r.total) || 0), 0);

      setTotalOrders(totalCount);
      setCancelledOrders(cancelledCount);
      setActiveOrders(activeCount);
      setTotalRevenue(totalRevenueNum);
    } catch (err) {
      console.error('Error computing stats via server route:', err);
    }
  };

  // ---------- handleCancelOrder (server-backed) ----------
  const handleCancelOrder = async (orderId: string) => {
    if (processingOrderId) return;
    setProcessingOrderId(orderId);

    try {
      // Ensure token exists
      const authToken = localStorage.getItem('authToken') || '';
      if (!authToken) {
        showErrorToast('Not authenticated. Please log in again.');
        return;
      }

      // Call secure server route that validates token + enforces ownership
      const res = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ id: orderId, updates: { status: 'cancelled' } }),
      });

      const text = await res.text().catch(() => '');
      let body: any = null;
      try { body = text ? JSON.parse(text) : null; } catch(e) { body = { raw: text }; }

      if (!res.ok || body?.success === false) {
        console.warn('Server cancel failed:', res.status, body);
        showErrorToast(body?.error || 'Failed to cancel order.');
        return;
      }

      showSuccessToast('Order cancelled successfully.');
      await loadOrders();
      await loadStats();
      // fetch restaurant phone once on mount

    } catch (err) {
      console.error('Error cancelling order via server route:', err);
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
    switch (status) {
      case 'placed': return 'bg-blue-400 text-blue-1200';
      case 'preparing': return 'bg-yellow-400 text-yellow-1200';
      case 'ready': return 'bg-orange-400 text-orange-1200';
      case 'on-the-way': return 'bg-purple-400 text-purple-1200';
      case 'completed': return 'bg-green-400 text-green-1200';
      case 'cancelled': return 'bg-red-400 text-red-1200';
      case 'delivery': return 'bg-teal-400 text-teal-1200';
      case 'pickup': return 'bg-cyan-400 text-cyan-1200';
      default: return 'bg-blue-100 text-blue-800';
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

    // sync session from supabase client and ensure authToken + userId are set
    setIsLoggedIn(loggedIn);

    (async () => {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (!sessionErr && sessionData?.session) {
          const token = sessionData.session.access_token;
          const uid = sessionData.session.user?.id;
          const userEmailFromSession = sessionData.session.user?.email || null;

          if (token) localStorage.setItem('authToken', token);
          if (uid) localStorage.setItem('userId', uid);
          if (userEmailFromSession) localStorage.setItem('userEmail', userEmailFromSession);

          // attempt to load role for UI (best-effort; server enforces access)
          try {
            const { data: userRow, error: uErr } = await supabase
              .from('users')
              .select('role')
              .eq('id', uid)
              .maybeSingle();
            if (!uErr && userRow?.role) {
              localStorage.setItem('userType', userRow.role);
              setUserType(userRow.role);
            } else {
              // fallback to whatever is stored
              setUserType(localStorage.getItem('userType') || 'user');
            }
          } catch (e) {
            setUserType(localStorage.getItem('userType') || 'user');
          }
          setUserEmail(localStorage.getItem('userEmail') || userEmailFromSession);
        } else {
          // no session — rely on localStorage values (if any)
          setUserType(localStorage.getItem('userType') || 'user');
          setUserEmail(localStorage.getItem('userEmail') || null);
        }
      } catch (e) {
        console.warn('Session sync failed', e);
        setUserType(localStorage.getItem('userType') || 'user');
        setUserEmail(localStorage.getItem('userEmail') || null);
      }
    })();

    if (!loggedIn) {
      setLoading(false);
      return;
    }

    // initial load
    loadOrders();
    loadStats();
loadRestaurantPhone().catch(() => {});
    // Try realtime subscription (Supabase v2 .channel)
    try {
      if ((supabase as any).channel) {
        const channel = (supabase as any)
          .channel('public:orders')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
            // secure realtime handler: ignore events not belonging to current user
            const currentUserId = localStorage.getItem('userId') || null;
            const event = payload.event;
            const newRow = payload.new ?? payload.record ?? null;
            const oldRow = payload.old ?? null;

            // If no logged-in user id, ignore realtime updates
            if (!currentUserId) return;

            // Only process events that belong to the current user
            const belongsToCurrentUser = (row: any) => {
              if (!row) return false;
              // prefer user_id column, fallback to email or other user key
              const rowUserId = row.user_id ?? row.userId ?? row.user;
              const rowEmail = row.user_email ?? row.customer_email ?? row.email;
              if (rowUserId) return (rowUserId === currentUserId);
              const storedEmail = localStorage.getItem('userEmail') || null;
              if (rowEmail && storedEmail) return (rowEmail === storedEmail);
              return false;
            };

            if (event === 'INSERT' && newRow) {
              if (!belongsToCurrentUser(newRow)) return; // ignore others' inserts
              setOrders(prev => [newRow, ...prev].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
              loadStats().catch(() => {});
            } else if (event === 'UPDATE' && newRow) {
              if (!belongsToCurrentUser(newRow)) return; // ignore updates for other users
              setOrders(prev => prev.map(o => (o.id === newRow.id ? newRow : o)));
              loadStats().catch(() => {});
            } else if (event === 'DELETE') {
              const deletedId = oldRow?.id ?? payload?.record?.id ?? null;
              if (!deletedId) return;
              // if we have oldRow, check ownership; otherwise check previous cache
              if (oldRow && !belongsToCurrentUser(oldRow)) return;
              setOrders(prev => prev.filter(o => o.id !== deletedId));
              loadStats().catch(() => {});
            }
          })
          .subscribe();
        realtimeRef.current = channel;
      } else if ((supabase as any).from && (supabase as any).from('').on) {
        // older v1 style fallback
        const sub = (supabase as any)
          .from('orders')
          .on('*', (payload: any) => {
            // secure realtime handler: ignore events not belonging to current user
            const currentUserId = localStorage.getItem('userId') || null;
            const event = payload.event || payload.eventType;
            const newRow = payload.new ?? payload.record ?? null;
            const oldRow = payload.old ?? null;

            if (!currentUserId) return;

            const belongsToCurrentUser = (row: any) => {
              if (!row) return false;
              const rowUserId = row.user_id ?? row.userId ?? row.user;
              const rowEmail = row.user_email ?? row.customer_email ?? row.email;
              if (rowUserId) return (rowUserId === currentUserId);
              const storedEmail = localStorage.getItem('userEmail') || null;
              if (rowEmail && storedEmail) return (rowEmail === storedEmail);
              return false;
            };

            if (event === 'INSERT' && newRow) {
              if (!belongsToCurrentUser(newRow)) return;
              setOrders(prev => [newRow, ...prev].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
              loadStats().catch(() => {});
            } else if (event === 'UPDATE' && newRow) {
              if (!belongsToCurrentUser(newRow)) return;
              setOrders(prev => prev.map(o => (o.id === newRow.id ? newRow : o)));
              loadStats().catch(() => {});
            } else if (event === 'DELETE') {
              const deletedId = oldRow?.id ?? payload?.record?.id ?? null;
              if (!deletedId) return;
              if (oldRow && !belongsToCurrentUser(oldRow)) return;
              setOrders(prev => prev.filter(o => o.id !== deletedId));
              loadStats().catch(() => {});
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

                        <a href={restaurantPhone ? `tel:${restaurantPhone}` : 'tel:+977-61-523456'} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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

<a
  href={restaurantPhone ? `tel:${restaurantPhone}` : 'tel:+977-61-523456'}
  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer"
  title={restaurantPhone ? `Call ${restaurantPhone}` : 'Call restaurant'}
>
  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
    <i className="ri-phone-line text-green-600"></i>
  </div>
  <div>
    <h3 className="font-semibold">Call Restaurant</h3>
    <p className="text-sm text-gray-600">{restaurantPhone ?? '+977-61-523456'}</p>
  </div>
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
