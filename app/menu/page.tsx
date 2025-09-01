
'use client';

import Header from '../../components/Header';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MenuContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams?.get('category') || '';
  
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<{[key: number]: number}>({});
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage on component mount
    const savedCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
    setCartItems(savedCart);

    // Load menu data from database
    loadMenuData();
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
        // Add "All Items" category
        const allCategory = { id: 'all', name: 'All Items', icon: 'ri-grid-line', slug: 'all' };
        setCategories([allCategory, ...data.categories]);
        setMenuItems(data.menuItems);
      }
    } catch (error) {
      console.error('Error loading menu data from database:', error);
      // Keep empty state on error - no fallback mock data
    }
    setLoading(false);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
                           item.category_id === selectedCategory || 
                           item.category?.slug === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (itemId: number) => {
    const newCart = {
      ...cartItems,
      [itemId]: (cartItems[itemId] || 0) + 1
    };
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      const { [itemId]: _, ...newCart } = cartItems;
      setCartItems(newCart);
      localStorage.setItem('cartItems', JSON.stringify(newCart));
    } else {
      const newCart = {
        ...cartItems,
        [itemId]: quantity
      };
      setCartItems(newCart);
      localStorage.setItem('cartItems', JSON.stringify(newCart));
    }
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
      const item = menuItems.find(i => i.id === parseInt(itemId));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const getIngredientsList = (ingredients: any) => {
    if (!ingredients) return [];
    if (Array.isArray(ingredients)) return ingredients;
    if (typeof ingredients === 'string') return ingredients.split(', ');
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Menu Header */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Our Menu</h1>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          {loading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-folder-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Available</h3>
              <p className="text-gray-500">The owner needs to add categories and menu items</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  <i className={`${category.icon} text-lg`}></i>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Menu Items */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading menu items...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-restaurant-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Menu Items Available</h3>
              <p className="text-gray-500 mb-6">The owner needs to add menu items to display here</p>
              <Link href="/" className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
                Back to Home
              </Link>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-product-shop>
              {filteredItems.map((item) => {
                const ingredientsList = getIngredientsList(item.ingredients);
                
                return (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="aspect-video relative">
                      <img 
                        src={item.image_url || 'https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20traditional%20authentic%20restaurant%20quality%20presentation%20simple%20clean%20background&width=400&height=300&seq=menu-item&orientation=landscape'} 
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                      />
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">Out of Stock</span>
                        </div>
                      )}
                      {item.is_vegetarian && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                        <span className="text-xl font-bold text-orange-600">₨{item.price}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{item.description || 'Delicious traditional dish'}</p>
                      
                      {ingredientsList.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients:</h4>
                          <div className="flex flex-wrap gap-1">
                            {ingredientsList.map((ingredient: string, index: number) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {cartItems[item.id] ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, cartItems[item.id] - 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 cursor-pointer"
                            >
                              <i className="ri-subtract-line"></i>
                            </button>
                            <span className="font-semibold text-lg">{cartItems[item.id]}</span>
                            <button
                              onClick={() => updateQuantity(item.id, cartItems[item.id] + 1)}
                              className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 cursor-pointer"
                            >
                              <i className="ri-add-line"></i>
                            </button>
                          </div>
                          <span className="font-bold text-orange-600">
                            ₨{(item.price * cartItems[item.id]).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item.id)}
                          disabled={!item.is_available}
                          className={`w-full py-3 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                            item.is_available
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {item.is_available ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-800">
                {getTotalItems()} items in cart
              </span>
              <span className="ml-4 font-bold text-orange-600 text-lg">
                ₨{getTotalPrice().toLocaleString()}
              </span>
            </div>
            <Link 
              href="/cart"
              className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
