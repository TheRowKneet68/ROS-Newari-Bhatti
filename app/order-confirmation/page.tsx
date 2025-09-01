'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function OrderConfirmationPage() {
  const [orderNumber] = useState('ORD-2024-001234');
  const [estimatedTime] = useState(35);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const orderDetails = {
    items: [
      { id: 1, name: 'Margherita Pizza', price: 16.99, quantity: 2 },
      { id: 2, name: 'Classic Burger', price: 12.99, quantity: 1 }
    ],
    subtotal: 46.97,
    deliveryFee: 4.99,
    tax: 3.76,
    total: 55.72,
    paymentMethod: 'Credit Card ending in 4242',
    deliveryAddress: '123 Main Street, Apt 4B, New York, NY 10001'
  };

  const estimatedDeliveryTime = new Date(currentTime.getTime() + estimatedTime * 60000);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-4xl text-green-600"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your order. We're preparing your food now.</p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Order #{orderNumber}</h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                Confirmed
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                <i className="ri-time-line text-2xl text-orange-600"></i>
                <div>
                  <p className="font-semibold text-gray-800">Estimated Delivery Time</p>
                  <p className="text-orange-600" suppressHydrationWarning={true}>
                    {estimatedDeliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    ({estimatedTime} minutes)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <i className="ri-map-pin-line text-2xl text-gray-600 mt-1"></i>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Delivery Address</p>
                  <p className="text-gray-600">{orderDetails.deliveryAddress}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${orderDetails.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <div className="flex items-center space-x-3">
                <i className="ri-bank-card-line text-xl text-gray-600"></i>
                <span className="text-gray-600">{orderDetails.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Status</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-sm"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Order Placed</p>
                  <p className="text-sm text-gray-600" suppressHydrationWarning={true}>
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <i className="ri-restaurant-line text-white text-sm"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Preparing</p>
                  <p className="text-sm text-gray-600">Your food is being prepared</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <i className="ri-truck-line text-gray-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">On the Way</p>
                  <p className="text-sm text-gray-400">Driver will pick up your order</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <i className="ri-home-line text-gray-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Delivered</p>
                  <p className="text-sm text-gray-400">Enjoy your meal!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/orders" 
              className="block w-full bg-orange-600 text-white text-center py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Track Order
            </Link>
            
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/menu" 
                className="block text-orange-600 text-center py-3 rounded-lg font-semibold border border-orange-600 hover:bg-orange-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Order Again
              </Link>
              <Link 
                href="/" 
                className="block text-gray-600 text-center py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 rounded-2xl p-6 mt-6 text-center">
            <i className="ri-customer-service-2-line text-3xl text-blue-600 mb-3"></i>
            <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">Contact our support team if you have any questions about your order.</p>
            <div className="flex justify-center space-x-4">
              <a href="tel:+15551234567" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer">
                <i className="ri-phone-line"></i>
                <span>(555) 123-4567</span>
              </a>
              <a href="mailto:support@foodexpress.com" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer">
                <i className="ri-mail-line"></i>
                <span>Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}