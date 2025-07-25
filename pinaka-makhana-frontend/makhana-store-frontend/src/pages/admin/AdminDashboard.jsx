import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../components/context/AdminContext';
import { useToast } from '../../components/context/ToastContext';
import apiService from '../../services/api';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
import logo from '../../images/logo.png';

const AdminDashboard = () => {
  const { adminUser, adminLogout } = useAdmin();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalCoupons: 0,
    revenue: 0
  });
  const [analyticsData, setAnalyticsData] = useState({
    ordersByStatus: [],
    topProducts: [],
    monthlyOrders: [],
    userActivity: [],
    couponUsage: []
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Get products
      const products = await apiService.getProducts();
      
      // Get orders using the corrected API
      const orders = await apiService.getAllOrders();
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Get users using the corrected API
      const users = await apiService.getAllUsers();
      
      // Get coupons
      const coupons = await apiService.getAllCoupons();
      
      setStats({
        totalProducts: products?.length || 0,
        totalOrders: orders?.length || 0,
        totalUsers: users?.length || 0,
        totalCoupons: coupons?.length || 0,
        revenue: totalRevenue || 0
      });

      // Generate analytics data (now async)
      await generateAnalyticsData(products, orders, users);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Set some default values if API fails
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCoupons: 0,
        revenue: 0
      });
    }
  };

  const generateAnalyticsData = async (products, orders, users) => {
    // Get coupons for analytics
    let coupons = [];
    try {
      coupons = await apiService.getAllCoupons();
    } catch (error) {
      console.error('Failed to load coupons for analytics:', error);
    }
    // Orders by status
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.status || 'placed';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));

    // Top products by orders
    const productOrders = {};
    orders.forEach(order => {
      (order.orderItems || order.items || []).forEach(item => {
        const productName = item.product?.name || item.name || 'Unknown Product';
        productOrders[productName] = (productOrders[productName] || 0) + (item.quantity || 1);
      });
    });

    const topProducts = Object.entries(productOrders)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        label: name.substring(0, 15) + (name.length > 15 ? '...' : ''),
        value: count
      }));

    // Monthly orders (last 6 months)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      }).length;
      
      monthlyData.push({
        label: monthName,
        value: monthOrders
      });
    }

    // User activity (users with orders)
    const userActivity = users.slice(0, 5).map(user => ({
      label: user.name?.split(' ')[0] || 'User',
      value: user.totalOrders || 0
    }));

    // Coupon usage analytics
    const topCoupons = coupons
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map(coupon => ({
        label: coupon.code,
        value: coupon.usageCount || 0
      }));

    setAnalyticsData({
      ordersByStatus: ordersByStatus.length > 0 ? ordersByStatus : [
        { label: 'Placed', value: 0 },
        { label: 'Confirmed', value: 0 },
        { label: 'Shipped', value: 0 },
        { label: 'Delivered', value: 0 }
      ],
      topProducts: topProducts.length > 0 ? topProducts : [
        { label: 'No data', value: 0 }
      ],
      monthlyOrders: monthlyData,
      userActivity: userActivity.length > 0 ? userActivity : [
        { label: 'No data', value: 0 }
      ],
      couponUsage: topCoupons.length > 0 ? topCoupons : [
        { label: 'No data', value: 0 }
      ]
    });
  };

  const handleLogout = () => {
    adminLogout();
    showSuccess('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={logo} 
                  alt="Pinaka Logo" 
                  className="h-10 w-auto object-contain"
                />
                <h1 className="text-xl font-bold text-gray-800">Pinaka Admin</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 backdrop-blur-lg rounded-full px-4 py-2 border border-gray-200 hover:border-gray-300 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(adminUser?.name || 'Admin').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-800 font-medium text-sm">
                      {adminUser?.name?.split(' ')[0] || 'Admin'}
                    </span>
                    <svg className={`w-4 h-4 text-gray-600 transform transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(adminUser?.name || 'Admin').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{adminUser?.name || 'Admin'}</p>
                          <p className="text-xs text-gray-600">{adminUser?.email || 'admin@pinaka.com'}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Administrator
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/admin/products"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Products</span>
                      </Link>
                      
                      <Link
                        to="/admin/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Orders</span>
                      </Link>
                      
                      <Link
                        to="/admin/users"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v4.01" />
                        </svg>
                        <span>Users</span>
                      </Link>
                      
                      <Link
                        to="/admin/coupons"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span>Coupons</span>
                      </Link>
                      
                      <Link
                        to="/"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Store</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg bg-red-50 text-red-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/admin/products"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 18V9h6v9h-6z" clipRule="evenodd" />
                </svg>
                <span>Products</span>
              </Link>
              
              <Link
                to="/admin/orders"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h6v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>Orders</span>
              </Link>
              
              <Link
                to="/admin/users"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <span>Users</span>
              </Link>
              
              <Link
                to="/admin/coupons"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                </svg>
                <span>Coupons</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            <p className="text-gray-600">Welcome to your Pinaka Makhana admin panel</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h6v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCoupons}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.revenue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to="/admin/products/new"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Product</span>
              </Link>
              
              <Link
                to="/admin/coupons"
                className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                </svg>
                <span>Manage Coupons</span>
              </Link>
              
              <Link
                to="/admin/orders"
                className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h6v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
                <span>View Orders</span>
              </Link>
              
              <Link
                to="/"
                className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>View Store</span>
              </Link>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Analytics & Insights</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                title="Orders by Status"
                data={analyticsData.ordersByStatus}
                type="donut"
                color="blue"
              />
              <AnalyticsChart
                title="Top Selling Products"
                data={analyticsData.topProducts}
                type="bar"
                color="green"
              />
              <AnalyticsChart
                title="Monthly Order Trend"
                data={analyticsData.monthlyOrders}
                type="bar"
                color="purple"
              />
              <AnalyticsChart
                title="Top Customers by Orders"
                data={analyticsData.userActivity}
                type="bar"
                color="orange"
              />
              <AnalyticsChart
                title="Most Used Coupons"
                data={analyticsData.couponUsage}
                type="bar"
                color="pink"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Dashboard loaded successfully with {stats.totalProducts} products</span>
                <span className="ml-auto text-gray-400">Just now</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Found {stats.totalOrders} orders in the system</span>
                <span className="ml-auto text-gray-400">Just now</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Analytics generated for {stats.totalUsers} users</span>
                <span className="ml-auto text-gray-400">Just now</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
