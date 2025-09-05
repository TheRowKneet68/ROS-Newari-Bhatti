
'use client';

import Header from '../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ReviewForm from '../components/ReviewForm';

export default function Home() {
  const [cartItems, setCartItems] = useState<{[key: number]: number}>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [userType, setUserType] = useState('');
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Newari Bhatti and Kathmandu Momo Ghar',
    phone: '+977-9829117277',
    email: 'info@newaribhatti.com',
    address: 'PCM College Agardi, Nadipur, Pokhara 33700, Nepal',
    coordinates: '28.22886241546525, 83.99098268394296'
  });
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user type
    const type = localStorage.getItem('userType') || 'user';
    setUserType(type);

    // Load restaurant info
    const savedInfo = JSON.parse(localStorage.getItem('restaurantInfo') || 'null');
    if (savedInfo) {
      setRestaurantInfo(savedInfo);
    } else {
      localStorage.setItem('restaurantInfo', JSON.stringify(restaurantInfo));
    }

    // Initialize empty state - no mock data
    setReviews([]);
    setFeaturedItems([]);
    setCategories([]);

    // Load menu data from database
    loadMenuData();
    loadReviews();
  }, []);

  const loadMenuData = async () => {
    try {
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
      if (data.success) {
        // Set categories with item counts from database
        const categoriesWithCounts = data.categories.map((cat: any) => ({
          ...cat,
          count: data.menuItems.filter((item: any) => item.category_id === cat.id).length
        }));
        setCategories(categoriesWithCounts);
        
        // Set featured items as first 3 items from database
        setFeaturedItems(data.menuItems.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading menu data from database:', error);
      // Keep empty state on error - no fallback mock data
    }
    setLoading(false);
  };

  const loadReviews = async () => {
    try {
      console.log('Loading reviews from database...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'getReviews'
        })
      });

      const data = await response.json();
      console.log('Reviews response:', data);
      
      if (data.success) {
        console.log('Reviews loaded:', data.reviews?.length || 0);
        setReviews(data.reviews || []);
      } else {
        console.error('Failed to load reviews:', data.error);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews from database:', error);
      setReviews([]);
    }
  };

  const addToCart = (itemId: number) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    
    // Update localStorage for cart persistence
    const currentCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
    const updatedCart = {
      ...currentCart,
      [itemId]: (currentCart[itemId] || 0) + 1
    };
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const addReview = async (newReview: any) => {
    try {
      console.log('Submitting review:', newReview);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'createReview',
          reviewData: {
            name: newReview.name,
            email: newReview.email,
            rating: newReview.rating,
            text: newReview.text
          }
        })
      });

      const data = await response.json();
      console.log('Review submission response:', data);
      
      if (data.success) {
        // Show success message with better feedback
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        successToast.innerHTML = `
          <div class="flex items-center space-x-2">
            <i class="ri-check-circle-line text-xl"></i>
            <span>Thank you for your review! It has been posted.</span>
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
        }, 4000);
        
        // Reload reviews to show the new review immediately
        await loadReviews();
      } else {
        console.error('Review submission failed:', data.error);
        alert('Error submitting review: ' + (data.error || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white py-20" 
               style={{
                 backgroundImage: `linear-gradient(rgba(251, 146, 60, 0.8), rgba(220, 38, 38, 0.8)), url('https://readdy.ai/api/search-image?query=Traditional%20Newari%20restaurant%20interior%20with%20authentic%20wooden%20furniture%2C%20brass%20decorations%2C%20warm%20lighting%2C%20traditional%20Nepali%20architecture%2C%20cozy%20dining%20atmosphere%20with%20cultural%20elements%20and%20warm%20colors%20creating%20inviting%20ambiance&width=1200&height=600&seq=hero1&orientation=landscape')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Authentic Newari Cuisine</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Experience traditional flavors at {restaurantInfo.name} in the heart of Pokhara</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu" className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
              Browse Menu
            </Link>
            <Link href="/orders" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-orange-600 transition-colors cursor-pointer whitespace-nowrap">
              Track Order
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Browse Categories</h2>
          {loading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-folder-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Yet</h3>
              <p className="text-gray-500 mb-6">Categories will appear here once the owner adds them</p>
              <Link href="/menu" className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
                View Menu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <Link key={index} href={`/menu?category=${category.slug || category.id}`} className="cursor-pointer">
                  <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow hover:bg-orange-50 group">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200">
                      <i className={`${category.icon} text-2xl text-orange-600`}></i>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.count} items</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Featured Dishes</h2>
          {loading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading featured dishes...</p>
            </div>
          ) : featuredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-restaurant-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Menu Items Yet</h3>
              <p className="text-gray-500 mb-6">Featured dishes will appear here once the owner adds menu items</p>
              <Link href="/menu" className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
                View Menu
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-product-shop>
              {featuredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-video relative">
                    <img 
                      src={item.image_url || item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                      <span className="text-xl font-bold text-orange-600">₨{item.price}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {item.category?.name || item.category}
                      </span>
                      {cartItems[item.id] ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const newQty = Math.max(0, cartItems[item.id] - 1);
                              if (newQty === 0) {
                                const { [item.id]: _, ...rest } = cartItems;
                                setCartItems(rest);
                                const currentCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
                                delete currentCart[item.id];
                                localStorage.setItem('cartItems', JSON.stringify(currentCart));
                              } else {
                                setCartItems(prev => ({ ...prev, [item.id]: newQty }));
                                const currentCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
                                currentCart[item.id] = newQty;
                                localStorage.setItem('cartItems', JSON.stringify(currentCart));
                              }
                            }}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 cursor-pointer"
                          >
                            <i className="ri-subtract-line"></i>
                          </button>
                          <span className="font-semibold text-lg">{cartItems[item.id]}</span>
                          <button
                            onClick={() => addToCart(item.id)}
                            className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 cursor-pointer"
                          >
                            <i className="ri-add-line"></i>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item.id)}
                          className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link href="/menu" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Newari Bhatti</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-restaurant-line text-2xl text-orange-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Authentic Traditional Food</h3>
              <p className="text-gray-600">Experience genuine Newari flavors prepared using traditional recipes passed down through generations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-line text-2xl text-orange-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Prime Location</h3>
              <p className="text-gray-600">Conveniently located in Nadipur, Pokhara with easy access and beautiful mountain views</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-line text-2xl text-orange-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Family Atmosphere</h3>
              <p className="text-gray-600">Warm, welcoming environment where every guest is treated like family in true Nepali tradition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What Our Customers Say</h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-8 mb-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-quote-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {reviews.slice(0, 6).map((review) => (
                <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-user-line text-orange-600 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{review.customer_name}</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-yellow-400`}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">"{review.review_text}"</p>
                  <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                  {review.is_featured && (
                    <div className="mt-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                        Featured Review
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">Share Your Experience</h3>
            <ReviewForm onSubmit={addReview} />
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Visit Us</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Restaurant Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-restaurant-line text-xl text-orange-600 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">{restaurantInfo.name}</p>
                    <p className="text-gray-600">Authentic Newari cuisine in Pokhara</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-map-pin-line text-xl text-orange-600 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Address</p>
                    <p className="text-gray-600">{restaurantInfo.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-phone-line text-xl text-orange-600"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Phone</p>
                    <a href={`tel:${restaurantInfo.phone}`} className="text-orange-600 hover:text-orange-700 cursor-pointer">
                      {restaurantInfo.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-mail-line text-xl text-orange-600"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
                    <a href={`mailto:${restaurantInfo.email}`} className="text-orange-600 hover:text-orange-700 cursor-pointer">
                      {restaurantInfo.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-time-line text-xl text-orange-600 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Opening Hours</p>
                    <p className="text-gray-600">Daily: 9:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden cursor-pointer" 
                 onClick={() => window.open(`https://www.google.com/maps/place/${restaurantInfo.coordinates}`, '_blank')}>
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.123456789!2d83.99098268394296!3d28.22886241546525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995937bbf0376ff%3A0x123456789abcdef!2sNadipur%2C%20Pokhara%2033700%2C%20Nepal!5e0!3m2!1sen!2snp!4v1234567890123!5m2!1sen!2snp`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Newari Bhatti Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <i className="ri-restaurant-line text-white text-lg"></i>
                </div>
                <span className="font-['Pacifico'] text-xl text-orange-400">Newari Bhatti & Kathmandu Momo Ghar</span>
              </div>
              <p className="text-gray-400">Serving authentic Newari cuisine and traditional Nepali flavors since 2015. Experience the taste of Nepal in Pokhara.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/menu" className="text-gray-400 hover:text-orange-400 cursor-pointer">Menu</Link></li>
                <li><Link href="/orders" className="text-gray-400 hover:text-orange-400 cursor-pointer">Track Order</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-orange-400 cursor-pointer">Contact Us</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-orange-400 cursor-pointer">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center">
                  <i className="ri-phone-line mr-2"></i> 
                  <a href={`tel:${restaurantInfo.phone}`} className="hover:text-orange-400 cursor-pointer">{restaurantInfo.phone}</a>
                </p>
                <p className="flex items-center">
                  <i className="ri-mail-line mr-2"></i> 
                  <a href={`mailto:${restaurantInfo.email}`} className="hover:text-orange-400 cursor-pointer">{restaurantInfo.email}</a>
                </p>
                <p className="flex items-center">
                  <i className="ri-map-pin-line mr-2"></i> 
                  {restaurantInfo.address}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 cursor-pointer">
                  <i className="ri-facebook-fill text-white"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 cursor-pointer">
                  <i className="ri-instagram-line text-white"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {restaurantInfo.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
