import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../components/context/CartContext";
import { useAuth } from "../components/context/AuthContext";
import { useToast } from "../components/context/ToastContext";
import { Link, useNavigate } from "react-router-dom";
import { getProductImage } from "../utils/productImageMapper";
import apiService from "../services/api";

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, loading } = useContext(CartContext);
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  
  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      if (isAuthenticated) {
        setLoadingCoupons(true);
        try {
          const coupons = await apiService.getActiveCoupons();
          setAvailableCoupons(coupons);
        } catch (error) {
          console.error('Failed to fetch coupons:', error);
        } finally {
          setLoadingCoupons(false);
        }
      }
    };
    
    fetchCoupons();
  }, [isAuthenticated]);
  
  // Calculate total - handle both backend and local cart formats
  const total = cartItems.reduce((acc, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 1;
    return acc + (price * quantity);
  }, 0);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      showError('Your cart is empty');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5m0 0v0a1 1 0 001 1h1m0 0h8a1 1 0 001-1v0m0 0V9a1 1 0 00-1-1H8a1 1 0 00-1 1v4.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Start shopping and add some delicious makhana to your cart!</p>
            <Link 
              to="/products" 
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Cart Items</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => {
                    const product = item.product || item;
                    const quantity = item.quantity || 1;
                    return (
                      <div key={item.id || index} className="p-6 flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img 
                            className="h-20 w-20 rounded-lg object-cover" 
                            src={getProductImage(product)} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-800">{product.name}</h4>
                          <p className="text-gray-600 text-sm">{product.weight || "30g"}</p>
                          {quantity > 1 && (
                            <p className="text-gray-500 text-sm">Quantity: {quantity}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xl font-bold text-red-600">₹{product.price * quantity}</span>
                          <button
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                            onClick={() => removeFromCart(product.id || index)}
                            title="Remove item"
                            disabled={loading}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-red-600">₹{total}</span>
                    </div>
                  </div>
                </div>
                
                {/* Available Coupons Section */}
                {isAuthenticated && availableCoupons.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Available Coupons</h3>
                    {loadingCoupons ? (
                      <p className="text-xs text-gray-500">Loading coupons...</p>
                    ) : (
                      <div className="space-y-2">
                        {availableCoupons.slice(0, 2).map(coupon => (
                          <div key={coupon.id} className="text-xs bg-white p-2 rounded border border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-red-600">{coupon.code}</span>
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Save up to ₹{coupon.maximumDiscountAmount || '?'}</span>
                            </div>
                            <p className="text-gray-600 text-xs mt-1">{coupon.description}</p>
                          </div>
                        ))}
                        {availableCoupons.length > 2 && (
                          <p className="text-xs text-gray-500 mt-1">+ {availableCoupons.length - 2} more coupons</p>
                        )}
                        <p className="text-xs text-gray-600 mt-1 italic">Proceed to checkout to apply coupons</p>
                      </div>
                    )}
                  </div>
                )}
                
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                </button>
                
                <Link 
                  to="/products" 
                  className="block text-center text-red-600 hover:text-red-700 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;