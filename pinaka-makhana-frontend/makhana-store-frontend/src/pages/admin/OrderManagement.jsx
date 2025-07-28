import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/context/ToastContext';
import apiService from '../../services/api';
import { getProductImage } from '../../utils/productImageMapper';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Use the corrected API that now uses order history
      const ordersData = await apiService.getAllOrders();
      
      // Sort orders by date (most recent first)
      const sortedOrders = (ordersData || []).sort((a, b) => 
        new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0)
      );
      
      setOrders(sortedOrders);
      console.log('Loaded orders:', sortedOrders); // Debug log
    } catch (error) {
      console.error('Failed to load orders:', error);
      showError('Failed to load orders. Please make sure you are logged in.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await apiService.updateOrderStatus(orderId, newStatus);

      // Update local state immediately for better UX
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, lastUpdated: new Date().toISOString() }
          : order
      ));

      showSuccess(result.message || `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      showError(`Failed to update order status: ${error.message}`);
    }
  };

  // Helper function to get comprehensive order details
  const getOrderDetails = (order) => {
    const items = order.orderItems || order.items || [];
    const user = order.user || {};

    return {
      ...order,
      items,
      user: {
        id: user.id || 'N/A',
        name: user.name || 'Unknown User',
        email: user.email || order.userEmail || 'No email',
        phone: user.phone || order.phone || 'N/A',
        address: user.address || order.address || 'N/A',
        city: user.city || order.city || 'N/A',
        state: user.state || order.state || 'N/A',
        zipCode: user.zipCode || order.zipCode || 'N/A',
        country: user.country || order.country || 'N/A',
        role: user.role || 'ROLE_USER'
      },
      orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
      status: order.status || 'placed',
      totalAmount: order.totalAmount || 0,
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      showSuccess(`Order status updated to ${newStatus}`);
      loadOrders(); // Reload orders to reflect changes
    } catch (error) {
      console.error('Failed to update order status:', error);
      showError('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
              <p className="text-gray-600">Manage customer orders and track deliveries</p>
            </div>
            <Link
              to="/admin/dashboard"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              All Orders ({orders.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
              <p className="text-gray-600">Orders will appear here once customers start purchasing.</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {orders.map((order) => {
                const orderDetails = getOrderDetails(order);
                return (
                  <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gray-50 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              Order #{order.id}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{formatDate(orderDetails.orderDate)}</span>
                              <span>•</span>
                              <span>{orderDetails.user.name}</span>
                              <span>•</span>
                              <span>{orderDetails.totalQuantity} items</span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.status)}`}>
                            {orderDetails.status?.charAt(0).toUpperCase() + orderDetails.status?.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₹{orderDetails.totalAmount.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">
                              {orderDetails.itemCount} {orderDetails.itemCount === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleOrderDetails(order.id)}
                            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <span>{expandedOrder === order.id ? 'Hide Details' : 'View Details'}</span>
                            <svg
                              className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                  {expandedOrder === order.id && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-white">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Items */}
                        <div className="lg:col-span-2">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Order Items ({orderDetails.itemCount})
                          </h5>
                          <div className="space-y-3">
                            {orderDetails.items.length === 0 ? (
                              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 text-sm">No items found in this order</p>
                              </div>
                            ) : (
                              orderDetails.items.map((item, index) => {
                                const product = item.product || item;
                                const unitPrice = item.quantity > 0 ? (item.price || 0) / item.quantity : 0;
                                return (
                                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <img
                                      className="h-14 w-14 rounded-lg object-cover border border-gray-200"
                                      src={getProductImage(product)}
                                      alt={product.name || 'Product'}
                                      onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center";
                                      }}
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{product.name || 'Unknown Product'}</p>
                                      <div className="text-sm text-gray-600 space-y-1">
                                        <p>Quantity: {item.quantity || 0}</p>
                                        <p>Unit Price: ₹{formatPrice(unitPrice)}</p>
                                        {product.flavor && <p>Flavor: {product.flavor}</p>}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900">₹{formatPrice(item.price || 0)}</p>
                                      <p className="text-xs text-gray-500">Total</p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Order Summary */}
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h6 className="font-medium text-blue-900 mb-2">Order Summary</h6>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-800">Total Items:</span>
                                <span className="text-blue-900 font-medium">{orderDetails.totalQuantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-800">Order Total:</span>
                                <span className="text-blue-900 font-bold">₹{orderDetails.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Actions & Customer Info */}
                        <div className="space-y-6">
                          {/* Customer Information */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Customer Details
                            </h5>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                              {/* Basic Info */}
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-900">Name:</span>
                                  <span className="text-sm text-blue-800 font-medium">{orderDetails.user.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-900">Email:</span>
                                  <span className="text-sm text-blue-800">{orderDetails.user.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-900">Phone:</span>
                                  <span className="text-sm text-blue-800">{orderDetails.user.phone}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-900">Customer ID:</span>
                                  <span className="text-sm text-blue-800">#{orderDetails.user.id}</span>
                                </div>
                              </div>

                              {/* Address Information */}
                              <div className="border-t border-blue-200 pt-3">
                                <h6 className="text-sm font-semibold text-blue-900 mb-2">Shipping Address</h6>
                                <div className="space-y-1">
                                  {orderDetails.user.address && orderDetails.user.address !== 'N/A' ? (
                                    <>
                                      <div className="text-sm text-blue-800">{orderDetails.user.address}</div>
                                      <div className="text-sm text-blue-800">
                                        {[orderDetails.user.city, orderDetails.user.state, orderDetails.user.zipCode]
                                          .filter(item => item && item !== 'N/A')
                                          .join(', ')}
                                      </div>
                                      {orderDetails.user.country && orderDetails.user.country !== 'N/A' && (
                                        <div className="text-sm text-blue-800">{orderDetails.user.country}</div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-sm text-gray-500 italic">
                                      No shipping address provided
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Customer Status */}
                              <div className="border-t border-blue-200 pt-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-900">Account Status:</span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    orderDetails.user.active !== false
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {orderDetails.user.active !== false ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-sm font-medium text-blue-900">Role:</span>
                                  <span className="text-sm text-blue-800">{orderDetails.user.role?.replace('ROLE_', '') || 'USER'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Status Update */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Update Status
                            </h5>
                            <div className="space-y-2">
                              {[
                                { status: 'placed', label: 'Placed', color: 'blue' },
                                { status: 'confirmed', label: 'Confirmed', color: 'yellow' },
                                { status: 'shipped', label: 'Shipped', color: 'purple' },
                                { status: 'delivered', label: 'Delivered', color: 'green' }
                              ].map(({ status, label, color }) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusUpdate(order.id, status)}
                                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                                    orderDetails.status?.toLowerCase() === status
                                      ? `bg-${color}-100 text-${color}-800 border-2 border-${color}-300`
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-transparent hover:border-gray-300'
                                  }`}
                                >
                                  <span>{label}</span>
                                  {orderDetails.status?.toLowerCase() === status && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Order Metadata */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Order Information
                            </h5>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-medium text-gray-900">#{order.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Order Date:</span>
                                <span className="font-medium text-gray-900">{formatDate(orderDetails.orderDate)}</span>
                              </div>
                              {orderDetails.lastUpdated && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Last Updated:</span>
                                  <span className="font-medium text-gray-900">{formatDate(orderDetails.lastUpdated)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
