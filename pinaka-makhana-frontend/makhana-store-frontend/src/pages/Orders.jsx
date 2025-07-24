import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { useToast } from '../components/context/ToastContext';
import { CartContext } from '../components/context/CartContext';
import { getProductImage } from '../utils/productImageMapper';
import apiService from '../services/api';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { addToCart } = useContext(CartContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await apiService.getOrderHistory();
      // Sort orders by date (most recent first)
      const sortedOrders = ordersData.sort((a, b) => 
        new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load order history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const downloadInvoice = (order) => {
    // Generate a simple invoice (in a real app, this would be a PDF)
    const invoiceContent = `
      PINAKA MAKHANA - INVOICE
      
      Order ID: ${order.id}
      Date: ${formatDate(order.orderDate || order.createdAt)}
      
      Items:
      ${order.orderItems?.map(item => 
        `${item.product?.name} - Qty: ${item.quantity} - ₹${item.price}`
      ).join('\n') || 'No items'}
      
      Total: ₹${order.totalAmount}
      Status: ${order.status}
      
      Thank you for your order!
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Invoice downloaded successfully!');
  };

  const trackOrder = (order) => {
    showSuccess(`Order #${order.id} is currently ${order.status?.toLowerCase() || 'being processed'}`);
  };

  const reorderItems = async (order) => {
    try {
      // Get order items and add them to cart
      const items = order.orderItems || order.items || order.cartItems || [];
      
      if (items.length === 0) {
        showError('No items found in this order to reorder.');
        return;
      }

      let addedItems = 0;
      
      for (const item of items) {
        try {
          const product = item.product || item;
          const quantity = item.quantity || 1;
          
          // Add items to cart multiple times based on quantity
          for (let i = 0; i < quantity; i++) {
            await addToCart(product);
            addedItems++;
          }
        } catch (itemError) {
          console.error('Error adding item to cart:', itemError);
        }
      }
      
      if (addedItems > 0) {
        showSuccess(`${addedItems} item${addedItems > 1 ? 's' : ''} added to cart successfully!`);
      } else {
        showError('Failed to add items to cart. Please try again.');
      }
    } catch (error) {
      console.error('Reorder error:', error);
      showError('Failed to reorder items. Please try again.');
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Order History</h1>
          <p className="text-gray-600 mb-8">Please login to view your order history.</p>
          <a href="/login" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
            Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order History</h1>
          <p className="text-gray-600">Track all your Pinaka Makhana orders</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-8">Start shopping to see your order history here!</p>
            <a href="/products" className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Shop Now
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                {/* Order Header */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Placed on {formatShortDate(order.orderDate || order.createdAt)}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Placed'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {order.orderItems?.length || 0} {(order.orderItems?.length || 0) === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:items-end">
                      <p className="text-2xl font-bold text-gray-900 mb-2">₹{order.totalAmount}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
                        >
                          <span>{expandedOrders.has(order.id) ? 'Hide' : 'View'} Details</span>
                          <svg className={`w-4 h-4 transform transition-transform ${expandedOrders.has(order.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => trackOrder(order)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Track</span>
                        </button>
                        <button
                          onClick={() => downloadInvoice(order)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => reorderItems(order)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5m0 0v0a1 1 0 001 1h1m0 0h8a1 1 0 001-1v0m0 0V9a1 1 0 00-1-1H8a1 1 0 00-1 1v4.01" />
                          </svg>
                          <span>Reorder</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expandable Order Details */}
                {expandedOrders.has(order.id) && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order Items */}
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Order Items
                        </h4>
                        <div className="space-y-4">
                          {(() => {
                            // Handle different possible data structures from backend
                            const items = order.orderItems || order.items || order.cartItems || [];
                            
                            if (items.length === 0) {
                              return (
                                <p className="text-gray-600 text-sm bg-white rounded-lg p-4">No items found in this order</p>
                              );
                            }
                            
                            return items.map((item, index) => {
                              // Handle different item structures
                              const product = item.product || item;
                              const productName = product.name || product.productName || 'Unknown Product';
                              const productId = product.id || product.productId || index;
                              const quantity = item.quantity || 1;
                              const price = item.price || item.totalPrice || product.price || 0;
                              const unitPrice = quantity > 0 ? (price / quantity) : price;
                              
                              return (
                                <div key={productId} className="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-sm">
                                  <div className="flex-shrink-0">
                                    <img 
                                      className="h-16 w-16 rounded-lg object-cover border-2 border-gray-100" 
                                      src={getProductImage(product)} 
                                      alt={productName} 
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-semibold text-gray-900">{productName}</h5>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Quantity: {quantity} × ₹{unitPrice.toFixed(2)}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        In Stock
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">₹{price.toFixed(2)}</p>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                      
                      {/* Order Summary & Delivery Info */}
                      <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Order Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery:</span>
                              <span className="font-medium text-green-600">Free</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span className="font-medium">₹0</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between">
                              <span className="font-semibold text-gray-900">Total:</span>
                              <span className="font-bold text-lg text-red-600">₹{order.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Delivery Timeline */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Delivery Timeline
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Order Placed</p>
                                <p className="text-xs text-gray-600">{formatShortDate(order.orderDate || order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                ['confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) 
                                  ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                                <p className="text-xs text-gray-600">Usually within 2 hours</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                ['shipped', 'delivered'].includes(order.status?.toLowerCase()) 
                                  ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Shipped</p>
                                <p className="text-xs text-gray-600">1-2 business days</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                order.status?.toLowerCase() === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Delivered</p>
                                <p className="text-xs text-gray-600">3-5 business days</p>
                              </div>
                            </div>
                          </div>
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
  );
};

export default Orders;
