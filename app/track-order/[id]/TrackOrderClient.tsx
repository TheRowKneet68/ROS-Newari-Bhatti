
'use client';

import Header from '../../../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TrackOrderClientProps {
  orderId: string;
}

export default function TrackOrderClient({ orderId }: TrackOrderClientProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [orderStatus, setOrderStatus] = useState('placed');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [userType, setUserType] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check user authorization and load order details
    const userTypeStored = localStorage.getItem('userType') || 'user';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setUserType(userTypeStored);

    // Load order details
    loadOrderDetails();

    return () => {
      clearInterval(timer);
    };
  }, []);

  const loadOrderDetails = async () => {
    try {
      // Try to load from database first
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/order-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'getOrder',
          orderId
        })
      });

      const data = await response.json();
      if (data.success && data.order) {
        // Map database fields to expected format
        const mappedOrder = {
          ...data.order,
          customer: {
            firstName: data.order.customer_first_name || data.order.customer?.firstName || '',
            lastName: data.order.customer_last_name || data.order.customer?.lastName || '',
            email: data.order.customer_email || data.order.customer?.email || '',
            phone: data.order.customer_phone || data.order.customer?.phone || data.order.phone || ''
          },
          orderType: data.order.order_type || data.order.orderType || 'pickup',
          paymentMethod: data.order.payment_method || data.order.paymentMethod || 'Cash on Delivery',
          estimatedTime: data.order.estimated_time || data.order.estimatedTime || 30,
          orderDate: data.order.created_at || data.order.orderDate || new Date().toISOString(),
          address: data.order.delivery_address || data.order.address,
          subtotal: data.order.subtotal || 0,
          deliveryFee: data.order.delivery_fee || 0,
          tax: data.order.tax || 0,
          specialInstructions: data.order.special_instructions || data.order.specialInstructions
        };
        
        setOrderDetails(mappedOrder);
        setOrderStatus(data.order.status || 'placed');
        setIsAuthorized(true);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading order from database:', error);
    }

    // Fallback to localStorage
    try {
      const currentUserId = localStorage.getItem('userId');
      
      // Check in user-specific orders
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const userOrder = userOrders.find((o: any) => o.id === orderId && 
        (o.userId === currentUserId || o.user_id === currentUserId));
      
      if (userOrder) {
        setOrderDetails(userOrder);
        setOrderStatus(userOrder.status || 'placed');
        setIsAuthorized(true);
      } else {
        // Check if admin viewing all orders
        const isAdmin = localStorage.getItem('userType') === 'admin' || 
                        localStorage.getItem('userType') === 'superadmin';
        
        if (isAdmin) {
          const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
          const adminOrder = allOrders.find((o: any) => o.id === orderId);
          
          if (adminOrder) {
            setOrderDetails(adminOrder);
            setOrderStatus(adminOrder.status || 'placed');
            setIsAuthorized(true);
          } else {
            setOrderDetails(createDemoOrder());
            setIsAuthorized(true);
          }
        } else {
          // Not authorized - user trying to access someone else's order
          setIsAuthorized(false);
        }
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setOrderDetails(createDemoOrder());
      setIsAuthorized(true);
    }
    setLoading(false);
  };

  const createDemoOrder = () => ({
    id: orderId,
    customer: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+977-9841234567'
    },
    items: [
      { id: 1, name: 'Kathmandu Momo (Steam)', quantity: 10, price: 250, image: 'https://readdy.ai/api/search-image?query=steamed%20momos%20dumplings%20nepali%20food%20traditional%20authentic%20restaurant%20quality%20presentation%20simple%20clean%20background&width=60&height=60&seq=momo-item&orientation=squarish' },
      { id: 4, name: 'Dal Bhat Tarkari', quantity: 1, price: 300, image: 'https://readdy.ai/api/search-image?query=dal%20bhat%20nepali%20traditional%20meal%20rice%20lentils%20vegetables%20authentic%20restaurant%20presentation%20simple%20clean%20background&width=60&height=60&seq=dalbhat-item&orientation=squarish' }
    ],
    subtotal: 2750,
    deliveryFee: 50,
    tax: 0,
    total: 2800,
    orderType: 'delivery',
    address: {
      street: 'Lakeside Road',
      city: 'Pokhara',
      state: 'Gandaki Province',
      zipCode: '33700'
    },
    phone: '+977-9841234567',
    estimatedTime: 30,
    orderDate: new Date().toISOString(),
    restaurantInfo: {
      name: 'Newari Bhatti and Kathmandu Momo Ghar',
      address: 'Nadipur, Pokhara 33700, Nepal',
      phone: '+977-61-523456'
    },
    paymentMethod: 'Cash on Delivery'
  });

  const statusSteps = [
    {
      id: 'placed',
      title: 'Order Placed',
      description: 'Your order has been received and confirmed',
      icon: 'ri-check-line',
      completed: true,
      time: orderDetails ? new Date(orderDetails.orderDate || orderDetails.created_at) : new Date()
    },
    {
      id: 'preparing',
      title: 'Preparing',
      description: 'Your food is being prepared with care by our chefs',
      icon: 'ri-restaurant-line',
      completed: ['preparing', 'ready', 'on-the-way', 'completed'].includes(orderStatus),
      time: ['preparing', 'ready', 'on-the-way', 'completed'].includes(orderStatus) ? 
            new Date(Date.now() - Math.random() * 600000) : null
    },
    {
      id: 'ready',
      title: orderDetails?.orderType === 'pickup' || orderDetails?.order_type === 'pickup' ? 'Ready for Pickup' : 'Ready for Delivery',
      description: orderDetails?.orderType === 'pickup' || orderDetails?.order_type === 'pickup' ? 
                  'Your order is ready for pickup at our restaurant' : 'Food is ready, delivery driver has been assigned',
      icon: orderDetails?.orderType === 'pickup' || orderDetails?.order_type === 'pickup' ? 'ri-store-line' : 'ri-user-line',
      completed: ['ready', 'on-the-way', 'completed'].includes(orderStatus),
      time: ['ready', 'on-the-way', 'completed'].includes(orderStatus) ? 
            new Date(Date.now() - Math.random() * 300000) : null
    }
  ];

  // Add delivery step only for delivery orders
  if (orderDetails?.orderType === 'delivery' || orderDetails?.order_type === 'delivery') {
    statusSteps.push({
      id: 'on-the-way',
      title: 'On the Way',
      description: 'Your order is on its way to your location',
      icon: 'ri-truck-line',
      completed: ['on-the-way', 'completed'].includes(orderStatus),
      time: ['on-the-way', 'completed'].includes(orderStatus) ? 
            new Date(Date.now() - Math.random() * 120000) : null
    });
  }

  statusSteps.push({
    id: 'completed',
    title: orderDetails?.orderType === 'pickup' || orderDetails?.order_type === 'pickup' ? 'Order Picked Up' : 'Delivered',
    description: orderDetails?.orderType === 'pickup' || orderDetails?.order_type === 'pickup' ? 
                'Order completed! Thank you for visiting us!' : 'Order delivered successfully! Enjoy your meal!',
    icon: orderDetails?.orderType === 'pickup' || orderDetails?.order_type === 'pickup' ? 'ri-store-line' : 'ri-home-line',
    completed: orderStatus === 'completed',
    time: orderStatus === 'completed' ? new Date() : null
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
            <p className="text-sm text-gray-500">
              Orders are private and can only be viewed by the person who placed them.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const estimatedDeliveryTime = new Date(new Date(orderDetails.orderDate || orderDetails.created_at).getTime() + (orderDetails.estimatedTime || orderDetails.estimated_time || 30) * 60000);
  const remainingTime = Math.max(0, Math.floor((estimatedDeliveryTime.getTime() - currentTime.getTime()) / 60000));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/orders" className="text-orange-600 hover:text-orange-700 cursor-pointer">
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Track Order</h1>
            {(userType === 'admin' || userType === 'superadmin') && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {userType === 'superadmin' ? 'Owner View' : 'Admin View'}
              </span>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Order #{orderDetails.id}</h2>
                <p className="text-gray-600">{orderDetails.restaurantInfo?.name || 'Newari Bhatti and Kathmandu Momo Ghar'}</p>
                <p className="text-sm text-gray-500">{new Date(orderDetails.orderDate || orderDetails.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                orderStatus === 'placed' ? 'bg-blue-100 text-blue-800' :
                orderStatus === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                orderStatus === 'ready' ? 'bg-green-100 text-green-800' :
                orderStatus === 'on-the-way' ? 'bg-purple-100 text-purple-800' :
                orderStatus === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {orderStatus.replace('-', ' ')}
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
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <i className="ri-time-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Estimated {(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'Pickup' : 'Delivery'} Time
                  </p>
                  <p className="text-orange-600" suppressHydrationWarning={true}>
                    {orderStatus === 'completed' 
                      ? `${(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'Picked up' : 'Delivered'}!` 
                      : remainingTime > 0 
                        ? `${remainingTime} minutes remaining`
                        : 'Should arrive any moment'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <i className="ri-time-line text-orange-600 mr-2"></i>
              Order Status
            </h3>
            
            <div className="space-y-4">
              {statusSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : orderStatus === step.id
                        ? 'bg-orange-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    <i className={`${step.icon} text-lg`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold ${
                        step.completed ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </h3>
                      {step.time && (
                        <span className="text-sm text-gray-500" suppressHydrationWarning={true}>
                          {step.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      step.completed ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {index < statusSteps.length - 1 && (
                    <div className={`absolute left-5 top-10 w-0.5 h-8 ${
                      statusSteps[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Items List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-restaurant-line text-orange-600 mr-2"></i>
              Order Items ({(orderDetails.items || []).length} {(orderDetails.items || []).length === 1 ? 'item' : 'items'})
            </h3>
            
            <div className="space-y-3 mb-4">
              {(orderDetails.items || []).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.image || `https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20$%7Bitem.name%7D%20traditional%20authentic%20restaurant%20quality%20presentation%20simple%20clean%20background&width=60&height=60&seq=order-item-${index}&orientation=squarish`} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">₨{item.price?.toLocaleString()} each</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">₨{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Subtotal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-bill-line text-orange-600 mr-2"></i>
              Billing Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Items Subtotal</span>
                <span className="font-semibold">₨{(orderDetails.subtotal || ((orderDetails.total || 0) - (orderDetails.deliveryFee || 0) - (orderDetails.tax || 0))).toLocaleString()}</span>
              </div>
              
              {(orderDetails.deliveryFee || 0) > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">₨{(orderDetails.deliveryFee || 0).toLocaleString()}</span>
                </div>
              )}
              
              {(orderDetails.tax || 0) > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">VAT (13%)</span>
                  <span className="font-semibold">₨{(orderDetails.tax || 0).toLocaleString()}</span>
                </div>
              )}
              
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

          {/* Delivery/Pickup Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-map-pin-line text-orange-600 mr-2"></i>
              {(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'Pickup' : 'Delivery'} Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <i className={`${(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'ri-store-line' : 'ri-map-pin-line'} text-xl text-gray-600 mt-1`}></i>
                <div>
                  <p className="font-semibold text-gray-800">
                    {(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                  </p>
                  {(orderDetails.orderType || orderDetails.order_type) === 'pickup' ? (
                    <div>
                      <p className="text-gray-600">{orderDetails.restaurantInfo?.name || 'Newari Bhatti and Kathmandu Momo Ghar'}</p>
                      <p className="text-gray-600">{orderDetails.restaurantInfo?.address || 'Nadipur, Pokhara 33700, Nepal'}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {orderDetails.delivery_address ? 
                        `${orderDetails.delivery_address.street}, ${orderDetails.delivery_address.city}, ${orderDetails.delivery_address.state} ${orderDetails.delivery_address.zipCode}` :
                        orderDetails.address ?
                        `${orderDetails.address.street}, ${orderDetails.address.city}, ${orderDetails.address.state} ${orderDetails.address.zipCode}` :
                        'Address not available'
                      }
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <i className="ri-phone-line text-xl text-gray-600"></i>
                <div>
                  <p className="font-semibold text-gray-800">Contact Number</p>
                  <a href={`tel:${orderDetails.customer?.phone || orderDetails.phone}`} className="text-orange-600 hover:text-orange-700 cursor-pointer">
                    {orderDetails.customer?.phone || orderDetails.phone}
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

              {((orderDetails.orderType || orderDetails.order_type) === 'pickup') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <i className="ri-information-line text-blue-600 mt-1"></i>
                    <div>
                      <p className="text-blue-800 font-medium">Pickup Instructions</p>
                      <p className="text-blue-700 text-sm">
                        Please come to the counter and show this order ID: <strong>{orderDetails.id}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/orders" 
                className="block text-orange-600 text-center py-3 rounded-lg font-semibold border border-orange-600 hover:bg-orange-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Orders
              </Link>
              <a 
                href="tel:+977-61-523456"
                className="block text-white bg-orange-600 text-center py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-phone-line mr-2"></i>
                Call Restaurant
              </a>
            </div>
            
            {orderStatus !== 'completed' && (
              <div className="text-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Refresh Status
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
