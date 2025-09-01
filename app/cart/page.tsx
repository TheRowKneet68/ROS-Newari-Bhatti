'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    loadMenuAndCart();
  }, []);

  const loadMenuAndCart = async () => {
    try {
      // First load menu items from database
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'getMenuData'
        })
      });

      const data = await response.json();
      if (data.success && data.menuItems) {
        setMenuItems(data.menuItems);
        
        // Now load cart with real menu data
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
        
        setCartItems(cartArray);
      } else {
        console.error('Failed to load menu items');
      }
    } catch (error) {
      console.error('Error loading menu and cart:', error);
    }
    setLoading(false);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      const updatedItems = cartItems.filter(item => item.id !== id);
      setCartItems(updatedItems);
      
      // Update localStorage
      const savedCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
      delete savedCart[id];
      localStorage.setItem('cartItems', JSON.stringify(savedCart));
    } else {
      const updatedItems = cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      
      // Update localStorage
      const savedCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
      savedCart[id] = newQuantity;
      localStorage.setItem('cartItems', JSON.stringify(savedCart));
    }
  };

  const updateInstructions = (id: number, instructions: string) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, specialInstructions: instructions } : item
      )
    );
  };

  const applyPromoCode = () => {
    const code = promoCode.toLowerCase().trim();
    if (code === 'newari10') {
      setDiscount(0.1);
      alert('Promo code applied! 10% discount');
    } else if (code === 'welcome15') {
      setDiscount(0.15);
      alert('Promo code applied! 15% discount');
    } else if (code === 'pokhara20') {
      setDiscount(0.2);
      alert('Promo code applied! 20% discount');
    } else {
      alert('Invalid promo code. Try: NEWARI10, WELCOME15, or POKHARA20');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * discount;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const tax = Math.round((subtotal - discountAmount) * 0.13); // 13% VAT in Nepal
  const total = subtotal - discountAmount + deliveryFee + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shopping-cart-line text-4xl text-gray-400"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some delicious Newari dishes from our menu!</p>
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
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/menu" className="text-orange-600 hover:text-orange-700 cursor-pointer">
            <i className="ri-arrow-left-line text-xl"></i>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Order Items</h2>
              
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                  <img 
                    src={item.image_url || 'https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20traditional%20authentic%20restaurant%20quality%20presentation%20simple%20clean%20background&width=300&height=200&seq=cartitem&orientation=landscape'} 
                    alt={item.name}
                    className="w-20 h-20 object-cover object-top rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-orange-600 font-bold">₨{item.price.toLocaleString()}</p>
                    
                    <div className="mt-3">
                      <textarea
                        placeholder="Special instructions (optional)"
                        value={item.specialInstructions}
                        onChange={(e) => updateInstructions(item.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                        rows={2}
                        maxLength={500}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 cursor-pointer"
                      >
                        <i className="ri-subtract-line"></i>
                      </button>
                      <span className="font-semibold px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 cursor-pointer"
                      >
                        <i className="ri-add-line"></i>
                      </button>
                    </div>
                    
                    <p className="font-bold text-gray-800">
                      ₨{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Promo Code</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter promo code (NEWARI10, WELCOME15, POKHARA20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={applyPromoCode}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <p className="text-green-600 mt-2 text-sm">
                  Promo code applied! {(discount * 100)}% discount
                </p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₨{subtotal.toLocaleString()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({(discount * 100)}%)</span>
                    <span>-₨{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₨${deliveryFee}`}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>VAT (13%)</span>
                  <span>₨{tax.toLocaleString()}</span>
                </div>
                
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">₨{total.toLocaleString()}</span>
                </div>
              </div>
              
              {subtotal < 500 && (
                <p className="text-sm text-gray-600 mt-3 p-3 bg-yellow-50 rounded-lg">
                  Add ₨{(500 - subtotal).toLocaleString()} more for free delivery!
                </p>
              )}
              
              <Link 
                href="/checkout" 
                className="block w-full bg-orange-600 text-white text-center py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap mt-6"
              >
                Proceed to Checkout
              </Link>
              
              <Link 
                href="/menu" 
                className="block w-full text-orange-600 text-center py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors cursor-pointer whitespace-nowrap mt-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}