'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; // keep your existing client

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orderType, setOrderType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    loadMenuAndCart();
    fetchUserProfile();
  }, []);

  const loadMenuAndCart = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ action: 'getMenuData' })
      });

      const data = await response.json();
      if (data.success && data.menuItems) {
        setMenuItems(data.menuItems);

        const savedCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
        const cartArray = Object.entries(savedCart).map(([itemId, quantity]) => {
          const item = data.menuItems.find((i: any) => i.id === parseInt(itemId));
          if (item) {
            return {
              ...item,
              quantity: quantity as number,
              specialInstructions: ''
            };
          }
          return null;
        }).filter(item => item !== null);

        setCartItems(cartArray as any[]);
      } else {
        console.error('Failed to load menu items from function');
      }

      // Load user info if logged in (local fallback)
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userInfo.firstName || userInfo.email) {
          setCustomerInfo({
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || '',
            email: userInfo.email || '',
            phone: userInfo.phone || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading menu and cart:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  const deliveryFee = orderType === 'delivery' ? 50 : 0;
  const tax = Math.round((subtotal + deliveryFee) * 0.13);
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try to get supabase user (if logged in)
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      const currentUserId = localStorage.getItem('userId') || (user ? user.id : null);
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || !!user;

      // Prepare items payload: map to simple objects to avoid circular refs
      const itemsPayload = cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: Number(i.price || 0),
        quantity: Number(i.quantity || 0),
        specialInstructions: i.specialInstructions || ''
      }));

      const orderData = {
        customer: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        items: itemsPayload,
        order_type: orderType,
        address: orderType === 'delivery' ? address : null,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment',
        special_instructions: specialInstructions,
        estimated_time: orderType === 'delivery' ? 45 : 30,
        user_id: currentUserId,
        status: 'placed'
      };

      console.log('Placing order with data:', orderData);

      let orderId: any = null;
      let dbSaved = false;

      // Attempt Supabase insert (client-side). This requires RLS or table settings to allow insert.
      try {
        // NOTE: change column names below if your orders table uses different names
        const { data: inserted, error: insertError } = await supabase
          .from('orders')
          .insert([{
            user_id: orderData.user_id,
            customer: orderData.customer,
            items: orderData.items,
            order_type: orderData.order_type,
            address: orderData.address,
            subtotal: orderData.subtotal,
            delivery_fee: orderData.delivery_fee,
            tax: orderData.tax,
            total: orderData.total,
            payment_method: orderData.payment_method,
            special_instructions: orderData.special_instructions,
            estimated_time: orderData.estimated_time,
            status: orderData.status
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Supabase insert error:', insertError);
        } else if (inserted) {
          dbSaved = true;
          orderId = inserted.id ?? (`SB-${Date.now().toString().slice(-8)}`);
          console.log('Order inserted into Supabase:', inserted);
        }
      } catch (dbErr) {
        console.error('Error inserting order to Supabase:', dbErr);
      }

      // Fallback if DB save failed
      if (!dbSaved) {
        orderId = 'NB-' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
        console.warn('DB save failed — using local fallback id:', orderId);
      }

      // Build final order object for localStorage
      const order = {
        id: orderId,
        ...orderData,
        created_at: new Date().toISOString(),
        orderDate: new Date().toISOString()
      };

      // Save to userOrders and allOrders localStorage for immediate access
      const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      existingOrders.unshift(order);
      localStorage.setItem('userOrders', JSON.stringify(existingOrders));

      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      allOrders.unshift(order);
      localStorage.setItem('allOrders', JSON.stringify(allOrders));

      // Clear cart localStorage and state
      localStorage.removeItem('cartItems');
      setCartItems([]);

      alert(`Order placed successfully! Order ID: ${orderId}`);
      router.push('/orders');

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data?.user) {
        console.log('User not logged in', authError?.message);
        return;
      }

      const user = data.user;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('Profile fetch error:', profileError.message);
        return;
      }

      setCustomerInfo({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: user.email || '',
        phone: profile.phone || ''
      });

      setAddress({
        street: profile.street || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || ''
      });

    } catch (error) {
      console.log('Error fetching user profile:', error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shopping-cart-line text-4xl text-orange-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some delicious items to your cart before checkout.</p>
          <Link href="/menu" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

          <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-2 gap-8">
            {/* Left side (Order details) */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Type</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                      orderType === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-store-line text-2xl mb-2 block"></i>
                    <h3 className="font-semibold">Pickup</h3>
                    <p className="text-sm text-gray-600">Ready in 20-30 mins</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                      orderType === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-truck-line text-2xl mb-2 block"></i>
                    <h3 className="font-semibold">Delivery</h3>
                    <p className="text-sm text-gray-600">30-45 mins</p>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {orderType === 'delivery' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required={orderType === 'delivery'}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({...address, city: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required={orderType === 'delivery'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({...address, state: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required={orderType === 'delivery'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                        <input
                          type="text"
                          value={address.zipCode}
                          onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required={orderType === 'delivery'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Special Instructions</h2>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or dietary restrictions..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <i className="ri-money-dollar-circle-line text-xl text-green-600 mr-3"></i>
                    <div>
                      <h3 className="font-semibold">Cash on Delivery</h3>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      disabled
                      className="mr-3"
                    />
                    <i className="ri-bank-card-line text-xl text-blue-600 mr-3"></i>
                    <div>
                      <h3 className="font-semibold">Card Payment</h3>
                      <p className="text-sm text-gray-600">Coming soon</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image_url || 'https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20traditional%20authentic%20restaurant%20quality%20presentation%20simple%20clean%20background&width=120&height=120&seq=checkout-item&orientation=squarish'}
                        alt={item.name}
                        className="w-12 h-12 object-cover object-top rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-gray-600 text-sm">₨{item.price} × {item.quantity}</p>
                      </div>
                      <span className="font-semibold">₨{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₨{subtotal.toLocaleString()}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>₨{deliveryFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT (13%)</span>
                    <span>₨{tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">₨{total.toLocaleString()}</span>
                  </div>
                </div>


                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="ri-time-line text-orange-600"></i>
                    <span className="text-sm">
                      Estimated {orderType === 'pickup' ? 'pickup' : 'delivery'} time: {orderType === 'delivery' ? '30-45' : '20-30'} minutes
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Placing Order...
                    </div>
                  ) : (
                    `Place Order - ₨${total.toLocaleString()}`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
