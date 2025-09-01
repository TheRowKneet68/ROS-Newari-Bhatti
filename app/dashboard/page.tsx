
'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import OrderModal from './OrderModal';

export default function DashboardPage() {
  const [userType, setUserType] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [showRestaurantInfoModal, setShowRestaurantInfoModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Newari Bhatti and Kathmandu Momo Ghar',
    phone: '+977-61-523456',
    email: 'info@newaribhatti.com',
    address: 'Nadipur, Pokhara 33700, Nepal',
    coordinates: '28.22886241546525, 83.99098268394296'
  });

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const type = localStorage.getItem('userType') || 'user';
    
    setIsLoggedIn(loggedIn);
    setUserType(type);

    if (loggedIn && (type === 'admin' || type === 'superadmin')) {
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      // Load all data simultaneously
      await Promise.all([
        loadOrders(),
        loadMenuData(),
        loadReviews(),
        loadRestaurantInfo(),
        loadAdmins()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setDataLoading(false);
  };

  const loadOrders = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/order-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'getOrders'
        })
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        // Fallback for admin - show all orders from localStorage
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        setOrders(allOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback for admin
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      setOrders(allOrders);
    }
  };

  const loadMenuData = async () => {
    try {
      console.log('Loading menu data from database...');
      
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Menu data response:', data);
      
      if (data.success) {
        console.log('Categories loaded:', data.categories?.length || 0);
        console.log('Menu items loaded:', data.menuItems?.length || 0);
        
        setCategories(data.categories || []);
        setMenuItems(data.menuItems || []);
      } else {
        console.error('Failed to load menu data:', data.error);
        // Keep empty state on error
        setCategories([]);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error loading menu data from database:', error);
      // Keep empty state on error
      setCategories([]);
      setMenuItems([]);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'getAllReviews'
        })
      });

      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const loadRestaurantInfo = () => {
    const savedInfo = JSON.parse(localStorage.getItem('restaurantInfo') || 'null');
    if (savedInfo) {
      setRestaurantInfo(savedInfo);
    }
  };

  const loadAdmins = () => {
    const savedAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    setAdmins(savedAdmins);
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

  const handleAddCategory = async (categoryData: any) => {
    setLoading(true);
    try {
      console.log('Adding category:', categoryData);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'addCategory',
          categoryData: {
            name: categoryData.name,
            description: categoryData.description,
            icon: categoryData.icon,
            displayOrder: categoryData.displayOrder || 99
          }
        })
      });

      const data = await response.json();
      console.log('Add category response:', data);
      
      if (data.success) {
        // Reload menu data to show the new category
        await loadMenuData();
        setShowAddCategoryModal(false);
        
        // Reset form fields
        const form = document.querySelector('#addCategoryForm') as HTMLFormElement;
        if (form) form.reset();
        
        showSuccessToast(`Category "${categoryData.name}" added successfully!`);
      } else {
        showErrorToast(`Error: ${data.error || 'Failed to add category'}`);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showErrorToast('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const handleEditCategory = async (categoryData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'updateCategory',
          categoryId: selectedCategory.id,
          categoryData
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMenuData();
        setShowEditCategoryModal(false);
        setSelectedCategory(null);
        showSuccessToast('Category updated successfully!');
      } else {
        showErrorToast('Error updating category: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showErrorToast('Error updating category. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'deleteCategory',
          categoryId
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMenuData();
        showSuccessToast('Category deleted successfully!');
      } else {
        showErrorToast('Error deleting category: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showErrorToast('Error deleting category. Please try again.');
    }
    setLoading(false);
  };

  const handleAddMenuItem = async (itemData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'addMenuItem',
          itemData
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMenuData();
        setShowAddItemModal(false);
        showSuccessToast('Menu item added successfully!');
      } else {
        showErrorToast('Error adding menu item: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      showErrorToast('Error adding menu item. Please try again.');
    }
    setLoading(false);
  };

  const handleEditMenuItem = async (itemData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'updateMenuItem',
          itemId: selectedItem.id,
          itemData
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMenuData();
        setShowEditItemModal(false);
        setSelectedItem(null);
        showSuccessToast('Menu item updated successfully!');
      } else {
        showErrorToast('Error updating menu item: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      showErrorToast('Error updating menu item. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'deleteMenuItem',
          itemId
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMenuData();
        showSuccessToast('Menu item deleted successfully!');
      } else {
        showErrorToast('Error deleting menu item: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showErrorToast('Error deleting menu item. Please try again.');
    }
    setLoading(false);
  };

  const updateRestaurantInfo = (info: any) => {
    setRestaurantInfo(info);
    localStorage.setItem('restaurantInfo', JSON.stringify(info));
    setShowRestaurantInfoModal(false);
  };

  const approveReview = async (reviewId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'approveReview',
          reviewId
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadReviews();
        showSuccessToast('Review approved successfully!');
      } else {
        showErrorToast('Error approving review: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving review:', error);
      showErrorToast('Error approving review. Please try again.');
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'deleteReview',
          reviewId
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadReviews();
        showSuccessToast('Review deleted successfully!');
      } else {
        showErrorToast('Error deleting review: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showErrorToast('Error deleting review. Please try again.');
    }
  };

  const addAdmin = (adminData: any) => {
    const newAdmin = {
      id: Date.now(),
      ...adminData,
      role: 'admin',
      addedBy: userType,
      addedDate: new Date().toISOString()
    };
    const updatedAdmins = [...admins, newAdmin];
    setAdmins(updatedAdmins);
    localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
  };

  const removeAdmin = (adminId: number) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      const updatedAdmins = admins.filter(admin => admin.id !== adminId);
      setAdmins(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
    }
  };

  const toggleFeaturedReview = async (reviewId: number, currentFeatured: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'toggleFeatured',
          reviewId,
          reviewData: {
            isFeatured: currentFeatured
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadReviews();
        showSuccessToast(`Review ${currentFeatured ? 'unfeatured' : 'featured'} successfully!`);
      } else {
        showErrorToast('Error updating review: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showErrorToast('Error updating review. Please try again.');
    }
  };

  if (!isLoggedIn || (userType !== 'admin' && userType !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-lock-line text-4xl text-red-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You need admin privileges to access this dashboard.</p>
          <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
            Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);

  const handleViewCategory = (category: any) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
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
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadOrders();
        showSuccessToast('Order status updated successfully!');
      } else {
        // Fallback to localStorage update
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        const updatedOrders = allOrders.map((order: any) => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
        
        // Also update user orders if exists
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        const updatedUserOrders = userOrders.map((order: any) => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        localStorage.setItem('userOrders', JSON.stringify(updatedUserOrders));
        
        await loadOrders();
        showSuccessToast('Order status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showErrorToast('Error updating order status. Please try again.');
    }
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

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {userType === 'superadmin' ? 'Owner' : 'Admin'}!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
              {userType === 'superadmin' ? 'Owner' : 'Admin'} Panel
            </span>
            {userType === 'superadmin' && (
              <button
                onClick={() => setShowOwnerPanel(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap text-sm"
              >
                <i className="ri-settings-line mr-2"></i>
                Owner Settings
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 rounded-full p-1 mb-8 max-w-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
              activeTab === 'overview'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
              activeTab === 'orders'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('menu-items')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
              activeTab === 'menu-items'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
              activeTab === 'categories'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Categories
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-shopping-bag-line text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Orders</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-time-line text-orange-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ₨{orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Menu Items</p>
                    <p className="text-2xl font-bold text-gray-800">{menuItems.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="ri-restaurant-line text-purple-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-orange-600 hover:text-orange-700 font-medium cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'placed')}`}>
                            {(order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.customer_first_name} {order.customer_last_name} - ₨{(order.total || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at || Date.now()).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reviews Management (Owner Only) */}
            {userType === 'superadmin' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews yet</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{review.customer_name}</h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-yellow-400 text-sm`}
                                ></i>
                              ))}
                            </div>
                            {!review.is_approved && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                Pending
                              </span>
                            )}
                            {review.is_featured && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{review.review_text}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          {!review.is_approved && (
                            <button
                              onClick={() => approveReview(review.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-xs"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => toggleFeaturedReview(review.id, review.is_featured)}
                            className={`px-3 py-1 rounded-lg cursor-pointer text-xs ${
                              review.is_featured 
                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {review.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">All Orders</h2>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders found</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'placed')}`}>
                          {(order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {(order.order_type || 'pickup').charAt(0).toUpperCase() + (order.order_type || 'pickup').slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Customer: {order.customer_first_name} {order.customer_last_name}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Items: {Array.isArray(order.items) ? order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: ₨{(order.total || 0).toLocaleString()} - {new Date(order.created_at || Date.now()).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === 'menu-items' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Menu Items</h2>
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="bg-orange-600 text-white px-1 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Menu Item
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {menuItems.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-restaurant-line text-2xl text-gray-400"></i>
                    </div>
                    <p className="text-gray-500 mb-4">No menu items yet</p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                    >
                      Add First Item
                    </button>
                  </div>
                ) : (
                  menuItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.image_url || 'https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20traditional%20authentic%20restaurant%20quality%20presentation%20simple%22clean%20background&width=120&height=120&seq=menu-item&orientation=squarish'} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">{item.category?.name || 'No Category'}</p>
                            <p className="text-lg font-bold text-orange-600">₨{item.price}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{item.preparation_time || 15} min prep</span>
                        {item.is_vegetarian && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Vegetarian
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditItemModal(true);
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Menu Categories</h2>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Category
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-1">
                      <i className="ri-folder-line text-2xl text-gray-400"></i>
                    </div>
                    <p className="text-gray-500 mb-4">No categories yet</p>
                    <button
                      onClick={() => setShowAddCategoryModal(true)}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                    >
                      Add First Category
                    </button>
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            {category.icon && category.icon.startsWith('data:image') ? (
                              <img 
                                src={category.icon} 
                                alt={category.name}
                                className="w-8 h-8 object-cover rounded-full"
                              />
                            ) : (
                              <i className={`${category.icon || 'ri-restaurant-line'} text-orange-600`}></i>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-gray-600">
                              {menuItems.filter(item => item.category_id === category.id).length} items
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCategory(category)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowEditCategoryModal(true);
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Category</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form 
              id="addCategoryForm"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleAddCategory({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  icon: formData.get('icon') as string || 'ri-restaurant-line',
                  displayOrder: parseInt(formData.get('displayOrder') as string) || 99
                });
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Appetizers"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <select
                  name="icon"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
                >
                  <option value="ri-restaurant-line">🍽️ Restaurant</option>
                  <option value="ri-cake-2-line">🥟 Dumplings</option>
                  <option value="ri-cup-line">☕ Beverages</option>
                  <option value="ri-cake-line">🍰 Desserts</option>
                  <option value="ri-bowl-line">🍲 Main Dishes</option>
                  <option value="ri-cake-3-line">🧁 Sweets</option>
                  <option value="ri-fire-line">🌶️ Spicy</option>
                  <option value="ri-leaf-line">🌱 Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of this category"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Category</h3>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleEditCategory({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                icon: formData.get('icon') as string,
                displayOrder: parseInt(formData.get('displayOrder') as string) || 99
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedCategory.name}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <select
                  name="icon"
                  defaultValue={selectedCategory.icon}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
                >
                  <option value="ri-restaurant-line">🍽️ Restaurant</option>
                  <option value="ri-cake-2-line">🥟 Dumplings</option>
                  <option value="ri-cup-line">☕ Beverages</option>
                  <option value="ri-cake-line">🍰 Desserts</option>
                  <option value="ri-bowl-line">🍲 Main Dishes</option>
                  <option value="ri-cake-3-line">🧁 Sweets</option>
                  <option value="ri-fire-line">🌶️ Spicy</option>
                  <option value="ri-leaf-line">🌱 Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={selectedCategory.description}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Menu Item</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddMenuItem({
                categoryId: formData.get('categoryId') as string,
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                imageUrl: formData.get('imageUrl') as string,
                ingredients: formData.get('ingredients') as string,
                isVegetarian: formData.get('isVegetarian') === 'on',
                preparationTime: parseInt(formData.get('preparationTime') as string) || 15,
                isAvailable: formData.get('isAvailable') !== 'off'
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="categoryId"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Chicken Momo"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of the dish"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₨)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    placeholder="250"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (min)</label>
                  <input
                    type="number"
                    name="preparationTime"
                    min="1"
                    defaultValue="15"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (Optional)</label>
                <input
                  type="text"
                  name="ingredients"
                  placeholder="Chicken, flour, onions, spices"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input type="checkbox" name="isVegetarian" className="mr-2 w-4 h-4 text-orange-600" />
                  <span className="text-sm">Vegetarian</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="isAvailable" defaultChecked className="mr-2 w-4 h-4 text-orange-600" />
                  <span className="text-sm">Available</span>
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Menu Item</h3>
              <button
                onClick={() => setShowEditItemModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleEditMenuItem({
                categoryId: formData.get('categoryId') as string,
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                imageUrl: formData.get('imageUrl') as string,
                ingredients: formData.get('ingredients') as string,
                isVegetarian: formData.get('isVegetarian') === 'on',
                preparationTime: parseInt(formData.get('preparationTime') as string) || 15,
                isAvailable: formData.get('isAvailable') === 'on'
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="categoryId"
                  defaultValue={selectedItem.category_id}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedItem.name}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={selectedItem.description}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₨)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    defaultValue={selectedItem.price}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (min)</label>
                  <input
                    type="number"
                    name="preparationTime"
                    min="1"
                    defaultValue={selectedItem.preparation_time}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  name="imageUrl"
                  defaultValue={selectedItem.image_url}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (Optional)</label>
                <input
                  type="text"
                  name="ingredients"
                  defaultValue={selectedItem.ingredients}
                  placeholder="Chicken, flour, onions, spices"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="isVegetarian" 
                    defaultChecked={selectedItem.is_vegetarian}
                    className="mr-2 w-4 h-4 text-orange-600" 
                  />
                  <span className="text-sm">Vegetarian</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="isAvailable" 
                    defaultChecked={selectedItem.is_available}
                    className="mr-2 w-4 h-4 text-orange-600" 
                  />
                  <span className="text-sm">Available</span>
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditItemModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner Settings Modal */}
      {showOwnerPanel && userType === 'superadmin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Owner Settings</h2>
                <button
                  onClick={() => setShowOwnerPanel(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Restaurant Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Restaurant Information</h3>
                    <button
                      onClick={() => setShowRestaurantInfoModal(true)}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {restaurantInfo.name}</p>
                    <p><strong>Phone:</strong> {restaurantInfo.phone}</p>
                    <p><strong>Email:</strong> {restaurantInfo.email}</p>
                    <p><strong>Address:</strong> {restaurantInfo.address}</p>
                  </div>
                </div>

                {/* Admin Management */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Admin Management</h3>
                    <button
                      onClick={() => setShowAdminModal(true)}
                      className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 cursor-pointer text-sm"
                    >
                      Add Admin
                    </button>
                  </div>
                  <div className="space-y-2">
                    {admins.length === 0 ? (
                      <p className="text-gray-500 text-sm">No admins added yet</p>
                    ) : (
                      admins.map((admin) => (
                        <div key={admin.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{admin.name}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </div>
                          <button
                            onClick={() => removeAdmin(admin.id)}
                            className="text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Review Management Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Review Management</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.approved).length}</p>
                      <p className="text-gray-600">Approved</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600">{reviews.filter(r => !r.approved).length}</p>
                      <p className="text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Info Modal */}
      {showRestaurantInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Restaurant Info</h3>
              <button
                onClick={() => setShowRestaurantInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              updateRestaurantInfo({
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                address: formData.get('address') as string,
                coordinates: formData.get('coordinates') as string
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={restaurantInfo.name}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={restaurantInfo.phone}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={restaurantInfo.email}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={restaurantInfo.address}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coordinates (lat, lng)</label>
                <input
                  type="text"
                  name="coordinates"
                  defaultValue={restaurantInfo.coordinates}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="28.22886241546525, 83.99098268394296"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRestaurantInfoModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Admin</h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              addAdmin({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string
              });
              setShowAdminModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Category Details</h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      {selectedCategory.icon && selectedCategory.icon.startsWith('data:image') ? (
                        <img 
                          src={selectedCategory.icon} 
                          alt={selectedCategory.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <i className={`${selectedCategory.icon || 'ri-restaurant-line'} text-2xl text-orange-600`}></i>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedCategory.name}</h3>
                      <p className="text-gray-600">
                        {menuItems.filter(item => item.category_id === selectedCategory.id).length} items in this category
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{selectedCategory.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-blue-600">
                        {menuItems.filter(item => item.category_id === selectedCategory.id).length}
                      </p>
                      <p className="text-sm text-gray-600">Total Items</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-green-600">
                        {menuItems.filter(item => item.category_id === selectedCategory.id && item.is_available).length}
                      </p>
                      <p className="text-sm text-gray-600">Available Items</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Items in this Category</h4>
                  <div className="space-y-3">
                    {(() => {
                      const categoryItems = menuItems.filter(item => item.category_id === selectedCategory.id);
                      
                      if (categoryItems.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                            </div>
                            <p className="text-gray-500 mb-4">No items in this category yet</p>
                            <button 
                              onClick={() => {
                                setShowCategoryModal(false);
                                setShowAddItemModal(true);
                              }}
                              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                            >
                              Add First Item
                            </button>
                          </div>
                        );
                      }
                      
                      return categoryItems.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={item.image_url || 'https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20traditional%20authentic%20restaurant%20quality%20presentation%20simple%20clean%20background&width=120&height=120&seq=menu-item&orientation=squarish'} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <h5 className="font-semibold">{item.name}</h5>
                              <p className="text-sm text-gray-600">₨{item.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.is_available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.is_available ? 'Available' : 'Out of Stock'}
                            </span>
                            <button 
                              onClick={() => {
                                setSelectedItem(item);
                                setShowCategoryModal(false);
                                setShowEditItemModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-700 cursor-pointer"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      setShowCategoryModal(false);
                      setShowAddItemModal(true);
                    }}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                  >
                    Add New Item
                  </button>
                  <button 
                    onClick={() => {
                      setShowCategoryModal(false);
                      setShowEditCategoryModal(true);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                  >
                    Edit Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
