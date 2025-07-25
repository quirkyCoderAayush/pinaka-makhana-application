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
      // You'll need to implement this endpoint
      await apiService.updateOrderStatus(orderId, newStatus);
      showSuccess('Order status updated successfully!');
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      showError('Failed to update order status');
    }
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
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.orderDate || order.createdAt)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Placed'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>
                          <p className="text-sm text-gray-600">
                            {(order.orderItems || order.items || []).length} items
                          </p>
                        </div>
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Order Items */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-3">Order Items</h5>
                          <div className="space-y-3">
                            {(order.orderItems || order.items || []).map((item, index) => {
                              const product = item.product || item;
                              return (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <img
                                    className="h-12 w-12 rounded-lg object-cover"
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center";
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} × ₹{((item.price || 0) / (item.quantity || 1)).toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">₹{item.price || 0}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-3">Update Status</h5>
                          <div className="space-y-2">
                            {['placed', 'confirmed', 'shipped', 'delivered'].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateOrderStatus(order.id, status)}
                                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  order.status?.toLowerCase() === status
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h6 className="font-medium text-blue-900 mb-2">Customer Info</h6>
                            <p className="text-sm text-blue-800">
                              Email: {order.userEmail || order.email || 'N/A'}
                            </p>
                            <p className="text-sm text-blue-800">
                              Phone: {order.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
