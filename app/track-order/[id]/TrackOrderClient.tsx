'use client';

import Header from '../../../components/Header';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TrackOrderClientProps {
  orderId: string;
}

export default function TrackOrderClient({ orderId }: TrackOrderClientProps) {
  const [orderStatus, setOrderStatus] = useState<string>('placed');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [userType, setUserType] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // New: restaurant contact/info loaded from DB
  const [restaurantInfo, setRestaurantInfo] = useState<{ name?: string; phone?: string; address?: string } | null>(null);

  // status -> label/color helper
  const getStatusInfo = (s: string) => {
    const status = (s || '').toLowerCase();
    switch (status) {
      case 'placed': return { label: 'Placed', color: 'bg-blue-400 text-blue-800' };
      case 'preparing': return { label: 'Preparing', color: 'bg-yellow-400 text-yellow-800' };
      case 'ready': return { label: 'Ready', color: 'bg-orange-400 text-orange-800' };
      case 'on-the-way': return { label: 'On the Way', color: 'bg-purple-400 text-purple-800' };
      case 'completed': return { label: 'Completed', color: 'bg-green-400 text-green-800' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-red-400 text-red-800' };
      case 'delivery': return { label: 'Delivery', color: 'bg-teal-400 text-teal-800' };
      case 'pickup': return { label: 'Pickup', color: 'bg-cyan-400 text-cyan-800' };
      default: return { label: s || 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const userTypeStored = localStorage.getItem('userType') || 'user';
    setUserType(userTypeStored);

    // load everything
    (async () => {
      await Promise.all([loadRestaurantInfo(), loadOrderDetails()]);
    })();

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const formatTimeAgo = (time: Date | null) => {
    if (!time) return '';
    const diffMs = currentTime.getTime() - time.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  const callOrderService = async (id: string) => {
    const authToken = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/order-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ action: 'getOrder', orderId: id })
      });
      if (!response.ok) {
        console.warn('Order-service returned non-OK status', response.status);
        return null;
      }
      const data = await response.json().catch(() => null);
      return data;
    } catch (err) {
      console.error('Error calling order-service:', err);
      return null;
    }
  };

  // Load restaurant_info (name, phone, address)
  const loadRestaurantInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_info')
        .select('name, phone, address')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('restaurant_info fetch error:', error);
        return;
      }
      if (data) {
        setRestaurantInfo({
          name: data.name ?? undefined,
          phone: data.phone ?? undefined,
          address: data.address ?? undefined
        });
      }
    } catch (err) {
      console.error('Exception fetching restaurant info:', err);
    }
  };

  // Given a base order, ensure items have images by looking up menu_items table.
  const enrichItemsWithImages = async (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) return items;
    try {
      const ids = items.map(i => Number(i.id)).filter(Boolean);
      if (ids.length === 0) return items;
      // batch fetch
      const { data: imagesData, error } = await supabase
        .from('menu_items')
        .select('id, image_url')
        .in('id', ids);

      if (!error && Array.isArray(imagesData)) {
        const mapById = new Map(imagesData.map((r: any) => [String(r.id), r.image_url]));
        return items.map(item => ({
          ...item,
          image: item.image || mapById.get(String(item.id)) || item.image || undefined
        }));
      }
      return items;
    } catch (err) {
      console.warn('Failed to enrich items images:', err);
      return items;
    }
  };

  // load order details (server-first, localStorage fallback)
  const loadOrderDetails = async () => {
    setLoading(true);
    setIsAuthorized(false);
    setOrderDetails(null);

    try {
      // Step 1: server function
      const serverResult = await callOrderService(orderId);
      let baseOrder: any = null;

      if (serverResult && serverResult.success && serverResult.order) {
        baseOrder = mapServerOrder(serverResult.order);
        setIsAuthorized(checkAuthorization(serverResult.order));
      } else {
        // fallback localStorage
        const currentUserId = localStorage.getItem('userId');
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');

        const matchesId = (o: any, id: string) =>
          [String(o.id), String(o.public_token || o.order_number || '')].filter(Boolean).some(p => p === id);

        let found = userOrders.find((o: any) => matchesId(o, orderId));
        if (found) {
          baseOrder = found;
          setIsAuthorized(true);
        } else {
          const isAdmin = ['admin', 'superadmin'].includes(localStorage.getItem('userType') || '');
          if (isAdmin) {
            const adminOrder = allOrders.find((o: any) => matchesId(o, orderId));
            if (adminOrder) {
              baseOrder = adminOrder;
              setIsAuthorized(true);
            }
          }
        }
      }

      // If baseOrder found, sync status from DB and enrich items with images
      if (baseOrder) {
        try {
          const { data: statusRow, error } = await supabase
            .from('orders')
            .select('id, status')
            .eq('id', orderId)
            .maybeSingle();

          if (!error && statusRow) {
            baseOrder = { ...baseOrder, status: statusRow.status ?? baseOrder.status };
          }
        } catch (err) {
          console.warn('Failed to sync status from DB:', err);
        }

        // enrich item images
        const items = Array.isArray(baseOrder.items) ? baseOrder.items : [];
        const enriched = await enrichItemsWithImages(items);
        baseOrder.items = enriched;

        // attach restaurant info fallback from order row if present
        baseOrder.restaurantInfo = baseOrder.restaurantInfo || {
          name: baseOrder.restaurant_name || undefined,
          address: baseOrder.restaurant_address || undefined,
          phone: baseOrder.restaurant_phone || undefined
        };

        setOrderDetails(baseOrder);
        setOrderStatus(String(baseOrder.status ?? 'placed'));
      } else {
        // demo fallback
        const demo = createDemoOrder();
        // attempt to enrich demo items too
        demo.items = await enrichItemsWithImages(demo.items || []);
        setOrderDetails(demo);
        setOrderStatus('placed');
        setIsAuthorized(true);
      }
    } catch (err) {
      console.error('Error loading order details:', err);
      const demo = createDemoOrder();
      demo.items = await enrichItemsWithImages(demo.items || []);
      setOrderDetails(demo);
      setOrderStatus('placed');
      setIsAuthorized(true);
    } finally {
      setLoading(false);
    }
  };

  const seededTimes = useMemo(() => {
    if (!orderDetails) return { placed: null, preparing: null, ready: null, onTheWay: null, completed: null };
    const created = new Date(orderDetails.orderDate || orderDetails.created_at || Date.now());
    const offsets = { preparing: 5, ready: 15, onTheWay: 25, completed: 40 };
    return {
      placed: created,
      preparing: new Date(created.getTime() + offsets.preparing * 60000),
      ready: new Date(created.getTime() + offsets.ready * 60000),
      onTheWay: new Date(created.getTime() + offsets.onTheWay * 60000),
      completed: new Date(created.getTime() + offsets.completed * 60000)
    };
  }, [orderDetails?.id]);

  const statusSteps = useMemo(() => {
    if (!orderDetails) return [];
    const isDelivery = (orderDetails.orderType || orderDetails.order_type) === 'delivery';
    return [
      { id: 'placed', title: 'Order Placed', description: 'Your order has been received and confirmed', icon: 'ri-check-line', completed: true, time: seededTimes.placed },
      { id: 'preparing', title: 'Preparing', description: 'Your food is being prepared with care by our chefs', icon: 'ri-restaurant-line', completed: ['preparing', 'ready', 'on-the-way', 'completed'].includes(orderStatus), time: ['preparing', 'ready', 'on-the-way', 'completed'].includes(orderStatus) ? seededTimes.preparing : null },
      { id: 'ready', title: isDelivery ? 'Ready for Delivery' : 'Ready for Pickup', description: isDelivery ? 'Food is ready, delivery driver has been assigned' : 'Your order is ready for pickup', icon: isDelivery ? 'ri-user-line' : 'ri-store-line', completed: ['ready', 'on-the-way', 'completed'].includes(orderStatus), time: ['ready', 'on-the-way', 'completed'].includes(orderStatus) ? seededTimes.ready : null },
      { id: 'completed', title: isDelivery ? 'Delivered' : 'Order Picked Up', description: isDelivery ? 'Order delivered successfully! Enjoy your meal!' : 'Order completed! Thank you for visiting us!', icon: isDelivery ? 'ri-home-line' : 'ri-store-line', completed: orderStatus === 'completed', time: orderStatus === 'completed' ? seededTimes.completed : null }
    ];
  }, [orderDetails?.id, orderStatus, seededTimes]);

  const mapServerOrder = (dbOrder: any) => {
    return {
      ...dbOrder,
      customer: {
        firstName: dbOrder.customer_first_name || dbOrder.customer?.firstName || dbOrder.customer?.first_name || '',
        lastName: dbOrder.customer_last_name || dbOrder.customer?.lastName || dbOrder.customer?.last_name || '',
        email: dbOrder.customer_email || dbOrder.customer?.email || '',
        phone: dbOrder.customer_phone || dbOrder.customer?.phone || dbOrder.phone || ''
      },
      orderType: dbOrder.order_type || dbOrder.orderType || 'pickup',
      paymentMethod: dbOrder.payment_method || dbOrder.paymentMethod || 'Cash on Delivery',
      estimatedTime: dbOrder.estimated_time || dbOrder.estimatedTime || 30,
      orderDate: dbOrder.created_at || dbOrder.orderDate || new Date().toISOString(),
      address: dbOrder.delivery_address || dbOrder.address,
      subtotal: dbOrder.subtotal || 0,
      total: dbOrder.total || 0,
      specialInstructions: dbOrder.special_instructions || dbOrder.specialInstructions || '',
      items: dbOrder.items || []
    };
  };

  const checkAuthorization = (orderRow: any) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const viewerType = localStorage.getItem('userType') || 'user';
      if (viewerType === 'admin' || viewerType === 'superadmin') return true;
      const owner = orderRow.user_id || orderRow.userId || orderRow.user || null;
      if (!owner) return !!currentUserId && String(currentUserId) === String(owner);
      return String(owner) === String(currentUserId);
    } catch (err) {
      console.warn('Auth check failed', err);
      return false;
    }
  };

  const createDemoOrder = () => ({
    id: orderId,
    customer: { firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', phone: '+977-9841234567' },
    items: [
      { id: 1, name: 'Kathmandu Momo (Steam)', quantity: 10, price: 250 },
      { id: 4, name: 'Dal Bhat Tarkari', quantity: 1, price: 300 }
    ],
    subtotal: 2750,
    total: 2800,
    orderType: 'delivery',
    address: { street: 'Lakeside Road', city: 'Pokhara', state: 'Gandaki Province', zipCode: '33700' },
    phone: '+977-9841234567',
    estimatedTime: 30,
    orderDate: new Date().toISOString(),
    restaurantInfo: { name: 'Newari Bhatti and Kathmandu Momo Ghar', address: 'Nadipur, Pokhara 33700, Nepal', phone: '+977-9829117277' },
    paymentMethod: 'Cash on Delivery'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-4xl text-red-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order ID you're looking for doesn't exist or you don't have permission to view it.</p>
          <div className="space-y-4">
            <Link href="/orders" className="block bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap max-w-xs mx-auto">
              View Your Orders
            </Link>
            <p className="text-sm text-gray-500">Orders are private and can only be viewed by the person who placed them.</p>
          </div>
        </div>
      </div>
    );
  }

  // compute ETA / remaining time
  const estimatedDeliveryTime = new Date(new Date(orderDetails.orderDate || orderDetails.created_at).getTime() + (orderDetails.estimatedTime || orderDetails.estimated_time || 30) * 60000);
  const remainingTime = Math.max(0, Math.floor((estimatedDeliveryTime.getTime() - currentTime.getTime()) / 60000));

  // choose restaurant phone with priority: restaurantInfo (DB), orderDetails.restaurantInfo.phone, fallback constant
  const phoneToCall = restaurantInfo?.phone || orderDetails?.restaurantInfo?.phone || orderDetails?.restaurant_phone || '+977-61-523456';
  const restaurantName = restaurantInfo?.name || orderDetails?.restaurantInfo?.name || 'Our Restaurant';
  const restaurantAddress = restaurantInfo?.address || orderDetails?.restaurantInfo?.address || orderDetails?.restaurant_address || '';

  const statusInfo = getStatusInfo(orderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/orders" className="text-orange-600 hover:text-orange-700 cursor-pointer"><i className="ri-arrow-left-line text-xl"></i></Link>
            <h1 className="text-3xl font-bold text-gray-800">Track Order</h1>
            {(userType === 'admin' || userType === 'superadmin') && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {userType === 'superadmin' ? 'Owner View' : 'Admin View'}
              </span>
            )}
            {orderStatus !== 'completed' && (
              <div className="text-center ml-auto">
                <button onClick={() => loadOrderDetails()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200">
                  <i className="ri-refresh-line"></i><span>Refresh Status</span>
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Order #{orderDetails.id}</h2>
                <p className="text-gray-600">{restaurantName}</p>
                <p className="text-sm text-gray-500">{new Date(orderDetails.orderDate || orderDetails.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{orderDetails.customer?.firstName} {orderDetails.customer?.lastName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{orderDetails.customer?.phone || orderDetails.phone}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{orderDetails.customer?.email}</p>
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="bg-orange-50 rounded-lg p-4 mb-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <i className="ri-time-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Estimated {((orderDetails?.orderType || orderDetails?.order_type) === 'pickup') ? 'Pickup' : 'Delivery'} Time
                  </p>
                  <p className="text-orange-600" suppressHydrationWarning={true}>
                    {orderStatus === 'completed'
                      ? `${(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'Picked up' : 'Delivered'}!`
                      : remainingTime > 0 ? `${remainingTime} minutes remaining` : 'Should arrive any moment'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center"><i className="ri-time-line text-orange-600 mr-2"></i>Order Status</h3>
            <div className="space-y-4">
              {statusSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : orderStatus === step.id ? 'bg-orange-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
                    <i className={`${step.icon} text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>{step.title}</h3>
                      {step.time && (<span className="text-sm text-gray-500" suppressHydrationWarning={true}>{step.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {formatTimeAgo(step.time)}</span>)}
                    </div>
                    <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>{step.description}</p>
                  </div>
                  {index < statusSteps.length - 1 && (<div className={`absolute left-5 top-10 w-0.5 h-8 ${statusSteps[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'}`}></div>)}
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><i className="ri-restaurant-line text-orange-600 mr-2"></i>Order Items ({(orderDetails.items || []).length})</h3>
            <div className="space-y-3 mb-4">
              {(orderDetails.items || []).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || `https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20${encodeURIComponent(item.name || '')}&width=60&height=60&seq=order-item-${index}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">₨{(item.price || 0).toLocaleString()} each</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">₨{(((item.price || 0) * (item.quantity || 1)) || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Subtotal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Summary - NOTE: delivery fee and VAT removed as requested */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><i className="ri-bill-line text-orange-600 mr-2"></i>Billing Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Items Subtotal</span>
                <span className="font-semibold">₨{(orderDetails.subtotal || ((orderDetails.total || 0))).toLocaleString()}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-bold text-orange-600">₨{(orderDetails.total || 0).toLocaleString()}</span>
                </div>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-800">{orderDetails.paymentMethod || orderDetails.payment_method || 'Cash on Delivery'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery / Pickup Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><i className="ri-map-pin-line text-orange-600 mr-2"></i>{(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'Pickup' : 'Delivery'} Information</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <i className={`${(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'ri-store-line' : 'ri-map-pin-line'} text-xl text-gray-600 mt-1`}></i>
                <div>
                  <p className="font-semibold text-gray-800">{(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'Pickup Location' : 'Delivery Address'}</p>
                  {(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? (
                    <div>
                      <p className="text-gray-600">{restaurantName}</p>
                      <p className="text-gray-600">{restaurantAddress}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {orderDetails.delivery_address ? `${orderDetails.delivery_address.street}, ${orderDetails.delivery_address.city}, ${orderDetails.delivery_address.state} ${orderDetails.delivery_address.zipCode}`
                        : orderDetails.address ? `${orderDetails.address.street}, ${orderDetails.address.city}, ${orderDetails.address.state} ${orderDetails.address.zipCode}` : 'Address not available'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <i className="ri-phone-line text-xl text-gray-600"></i>
                <div>
                  <p className="font-semibold text-gray-800">Contact Number</p>
                  <a href={`tel:${phoneToCall}`} className="text-orange-600 hover:text-orange-700 cursor-pointer font-medium">
                    {phoneToCall}
                  </a>
                </div>
              </div>

              {orderDetails.specialInstructions && (
                <div className="flex items-start space-x-3">
                  <i className="ri-message-line text-xl text-gray-600 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Special Instructions</p>
                    <p className="text-gray-600">{orderDetails.specialInstructions}</p>
                  </div>
                </div>
              )}

              {(orderDetails.orderType || orderDetails.order_type) === 'pickup' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <i className="ri-information-line text-blue-600 mt-1"></i>
                    <div>
                      <p className="text-blue-800 font-medium">Pickup Instructions</p>
                      <p className="text-blue-700 text-sm">Please come to the counter and show this order ID: <strong>{orderDetails.id}</strong></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/orders" className="block text-orange-600 text-center py-3 rounded-lg font-semibold border border-orange-600 hover:bg-orange-50 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-arrow-left-line mr-2"></i>Back to Orders
              </Link>

              <a href={`tel:${phoneToCall}`} className="flex items-center justify-center text-white bg-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-phone-line mr-2"></i>Call Restaurant
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
