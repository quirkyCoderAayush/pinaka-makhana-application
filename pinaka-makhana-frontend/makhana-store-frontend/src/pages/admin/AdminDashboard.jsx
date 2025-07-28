import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';

const AdminDashboard = () => {
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
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alerts, setAlerts] = useState([]);


  useEffect(() => {
    loadDashboardStats();

    // Set up auto-refresh every 30 seconds for real-time data
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      loadDashboardStats();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    loadDashboardStats();
  };



  const loadDashboardStats = async () => {
    try {
      setDashboardLoading(true);
      console.log('Loading dashboard statistics...');

      // Load data in parallel for better performance
      const [products, orders, users, coupons] = await Promise.allSettled([
        apiService.getProducts(),
        apiService.getAllOrders(),
        apiService.getAllUsers(),
        apiService.getAllCoupons()
      ]);

      // Extract successful results
      const productsData = products.status === 'fulfilled' ? products.value : [];
      const ordersData = orders.status === 'fulfilled' ? orders.value : [];
      const usersData = users.status === 'fulfilled' ? users.value : [];
      const couponsData = coupons.status === 'fulfilled' ? coupons.value : [];

      // Calculate revenue more accurately
      const totalRevenue = ordersData.reduce((sum, order) => {
        const amount = parseFloat(order.totalAmount) || 0;
        return sum + amount;
      }, 0);

      // Update stats with accurate data
      const newStats = {
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalUsers: usersData?.length || 0,
        totalCoupons: couponsData?.length || 0,
        revenue: totalRevenue
      };

      setStats(newStats);
      console.log('Dashboard stats updated:', newStats);

      // Generate analytics data
      await generateAnalyticsData(productsData, ordersData, usersData);

      // Generate alerts based on data
      generateAlerts(productsData, ordersData, couponsData);

      setLastUpdated(new Date());

      // Log any failed requests
      if (products.status === 'rejected') console.error('Failed to load products:', products.reason);
      if (orders.status === 'rejected') console.error('Failed to load orders:', orders.reason);
      if (users.status === 'rejected') console.error('Failed to load users:', users.reason);
      if (coupons.status === 'rejected') console.error('Failed to load coupons:', coupons.reason);

    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Set default values if everything fails
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCoupons: 0,
        revenue: 0
      });

      // Add error alert
      setAlerts([{
        id: 'dashboard-error',
        type: 'error',
        title: 'Dashboard Loading Error',
        message: 'Failed to load some dashboard data. Please refresh the page.',
        action: 'Refresh'
      }]);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Generate system alerts based on data
  const generateAlerts = (products, orders, coupons) => {
    const newAlerts = [];

    // Low stock alerts
    const lowStockProducts = products.filter(p => p.stockQuantity && p.stockQuantity < 10);
    if (lowStockProducts.length > 0) {
      newAlerts.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} products are running low on stock`,
        action: 'View Products',
        link: '/admin/products'
      });
    }

    // Pending orders alert
    const pendingOrders = orders.filter(o => o.status === 'placed');
    if (pendingOrders.length > 5) {
      newAlerts.push({
        id: 'pending-orders',
        type: 'info',
        title: 'Pending Orders',
        message: `${pendingOrders.length} orders are waiting for confirmation`,
        action: 'View Orders',
        link: '/admin/orders'
      });
    }

    // Expiring coupons alert
    const expiringCoupons = coupons.filter(c => {
      const endDate = new Date(c.endDate);
      const now = new Date();
      const daysUntilExpiry = (endDate - now) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    });
    if (expiringCoupons.length > 0) {
      newAlerts.push({
        id: 'expiring-coupons',
        type: 'warning',
        title: 'Expiring Coupons',
        message: `${expiringCoupons.length} coupons will expire within 7 days`,
        action: 'View Coupons',
        link: '/admin/coupons'
      });
    }

    setAlerts(newAlerts);
  };

  // Export data functionality
  const exportData = async (type) => {
    try {
      let data = [];
      let filename = '';

      switch (type) {
        case 'orders':
          data = await apiService.getAllOrders();
          filename = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'users':
          data = await apiService.getAllUsers();
          filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'products':
          data = await apiService.getProducts();
          filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          return;
      }

      if (data.length === 0) {
        showError(`No ${type} data to export`);
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]).join(',');
      const csvContent = [
        headers,
        ...data.map(row =>
          Object.values(row).map(value =>
            typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value
          ).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      showError(`Failed to export ${type} data`);
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



  return (
    <ModernAdminLayout
      title="Dashboard Overview"
      subtitle="Welcome to your Pinaka Makhana admin panel"
    >
      {/* Real-time Status and Refresh Controls */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${dashboardLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {dashboardLoading ? 'Updating...' : 'Live Data'}
              </span>
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={dashboardLoading}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border-l-4 backdrop-blur-xl ${
                  alert.type === 'warning'
                    ? 'bg-yellow-50/80 border-yellow-400'
                    : alert.type === 'error'
                    ? 'bg-red-50/80 border-red-400'
                    : 'bg-blue-50/80 border-blue-400'
                } shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-semibold ${
                      alert.type === 'warning'
                        ? 'text-yellow-800'
                        : alert.type === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm ${
                      alert.type === 'warning'
                        ? 'text-yellow-700'
                        : alert.type === 'error'
                        ? 'text-red-700'
                        : 'text-blue-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                  {alert.action && (
                    <button
                      onClick={handleManualRefresh}
                      className={`text-sm font-medium hover:underline ${
                        alert.type === 'warning'
                          ? 'text-yellow-800'
                          : alert.type === 'error'
                          ? 'text-red-800'
                          : 'text-blue-800'
                      }`}
                    >
                      {alert.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Enhanced Dashboard Stats Cards */}
      <div className="relative">
        {dashboardLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-3xl z-10 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-blue-600 font-medium">Loading dashboard data...</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {[
          {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: '📦',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100',
            trend: '+12%',
            trendColor: 'text-green-600'
          },
          {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: '📋',
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-100',
            trend: '+8%',
            trendColor: 'text-green-600'
          },
          {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: '👥',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-100',
            trend: '+15%',
            trendColor: 'text-green-600'
          },
          {
            title: 'Total Coupons',
            value: stats.totalCoupons,
            icon: '🎫',
            color: 'from-pink-500 to-pink-600',
            bgColor: 'from-pink-50 to-pink-100',
            trend: '+3%',
            trendColor: 'text-green-600'
          },
          {
            title: 'Revenue',
            value: `₹${stats.revenue.toFixed(2)}`,
            icon: '💰',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'from-orange-50 to-orange-100',
            trend: '+22%',
            trendColor: 'text-green-600'
          }
        ].map((stat, index) => (
          <div key={stat.title} className="group">
            <div className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 h-full min-h-[180px] flex flex-col justify-between`}>
              {/* Header with Icon and Value */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  {stat.icon}
                </div>
                <div className="text-right flex-1 ml-4">
                  <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 font-medium leading-tight">{stat.title}</p>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${stat.trendColor}`}>{stat.trend}</span>
                  <svg className={`w-4 h-4 ${stat.trendColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/50 rounded-full h-2 mt-3">
                <div
                  className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: `${Math.min(75 + (index * 5), 95)}%`,
                    animationDelay: `${index * 200}ms`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8 mb-8 border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/products/new"
            className="group bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add Product</span>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span>View Orders</span>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span>Manage Users</span>
            </div>
          </Link>

          <Link
            to="/admin/coupons"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
              </svg>
              <span>Manage Coupons</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          Analytics & Insights
        </h3>
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
    </ModernAdminLayout>
  );
};

export default AdminDashboard;
