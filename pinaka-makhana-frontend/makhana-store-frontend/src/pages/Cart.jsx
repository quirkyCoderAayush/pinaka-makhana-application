import React, { useContext, useState, useEffect } from "react";
import { formatPrice } from "../utils/formatPrice";
import { CartContext } from "../components/context/CartContext";
import { useFavorites } from "../components/context/FavoritesContext";
import { useAuth } from "../components/context/AuthContext";
import { useToast } from "../components/context/ToastContext";
import { Link, useNavigate } from "react-router-dom";
import { getProductImage } from "../utils/productImageMapper";
import { Trash2, ShoppingBag, ArrowLeft, ShoppingCart, Tag, Heart, AlertTriangle } from "lucide-react";
import apiService from "../services/api";
import QuantitySelector from "../components/QuantitySelector";

const Cart = () => {
  const { cartItems, removeFromCart, loading, updateCartItem, clearCart } = useContext(CartContext);
  const { addToFavorites, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
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

  // Handle saving item to wishlist and removing from cart
  const handleSaveForLater = (product) => {
    try {
      addToFavorites(product);
      removeFromCart(product.id);
      showSuccess(`${product.name} saved to wishlist`);
    } catch (error) {
      console.error('Error saving to wishlist:', error);
      showError('Failed to save item to wishlist');
    }
  };

  // Handle clearing entire cart
  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Compact Professional Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Shopping Cart
            </h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <ShoppingCart className="w-4 h-4 text-red-600" />
              <span className="text-sm">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-red-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear Cart</span>
              </button>
            )}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-red-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <ShoppingBag className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">
                Start shopping and add some delicious makhana to your cart!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compact Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="py-4 px-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4 text-red-600" />
                    <span>Cart Items</span>
                  </h2>
                  <span className="text-sm text-gray-500">
                    {cartItems.length} {cartItems.length === 1 ? 'product' : 'products'}
                  </span>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => {
                    const product = item.product || item;
                    // Fix: Use proper quantity handling - don't default to 1 if quantity is 0
                    const quantity = typeof item.quantity === 'number' ? item.quantity : 1;

                    return (
                      <div
                        key={product.id || index}
                        className="py-4 px-3 sm:px-6 hover:bg-gray-50 transition-colors duration-200"
                      >
                        {/* Mobile-first responsive layout */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          {/* Product Image and Basic Info */}
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0">
                              <Link to={`/product/${product.id}`}>
                                <img
                                  className="h-16 w-16 sm:h-16 sm:w-16 rounded-lg object-cover border border-gray-200 hover:border-red-300 transition-colors duration-200 cursor-pointer"
                                  src={getProductImage(product)}
                                  alt={product.name}
                                />
                              </Link>
                            </div>

                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${product.id}`}>
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 hover:text-red-600 transition-colors duration-200 line-clamp-2 cursor-pointer">
                                  {product.name}
                                </h4>
                              </Link>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                <span className="text-xs sm:text-sm text-gray-500">
                                  {product.weight || "30g"}
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-red-600">
                                  ₹{formatPrice(product.price)} each
                                </span>
                              </div>
                            </div>

                            {/* Price - Desktop */}
                            <div className="hidden sm:block text-right">
                              <div className="text-lg font-bold text-red-600">
                                ₹{formatPrice(product.price * quantity)}
                              </div>
                            </div>
                          </div>

                          {/* Mobile Price */}
                          <div className="sm:hidden flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total:</span>
                            <div className="text-lg font-bold text-red-600">
                              ₹{formatPrice(product.price * quantity)}
                            </div>
                          </div>

                          {/* Quantity and Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full sm:w-auto">
                            {/* Quantity Selector */}
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <span className="text-sm text-gray-700">Qty:</span>
                              <QuantitySelector
                                quantity={quantity}
                                onQuantityChange={(newQty) => updateCartItem(product.id, newQty)}
                                min={1}
                                max={20}
                                disabled={loading}
                                size="sm"
                                variant="compact"
                              />
                            </div>

                            {/* Action Buttons - Mobile Optimized */}
                            <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                              {/* Save to Wishlist Button */}
                              <button
                                onClick={() => handleSaveForLater(product)}
                                disabled={loading}
                                className="flex items-center justify-center min-w-[44px] h-[44px] sm:min-w-auto sm:h-auto sm:px-3 sm:py-1 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
                                title="Save to wishlist"
                              >
                                <Heart className="h-4 w-4" />
                                <span className="text-sm hidden sm:inline ml-1">Save</span>
                              </button>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(product.id)}
                                disabled={loading}
                                className="flex items-center justify-center min-w-[44px] h-[44px] sm:min-w-auto sm:h-auto sm:px-3 sm:py-1 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
                                title="Remove from cart"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="text-sm hidden sm:inline ml-1">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Compact Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Order Summary</span>
                </h2>

                {/* Compact Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span>₹{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-red-600">₹{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Compact Available Coupons Section */}
                {isAuthenticated && availableCoupons.length > 0 && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span>Available Coupons</span>
                    </h3>
                    {loadingCoupons ? (
                      <p className="text-sm text-gray-600">Loading coupons...</p>
                    ) : (
                      <div className="space-y-2">
                        {availableCoupons.slice(0, 2).map(coupon => (
                          <div key={coupon.id} className="bg-white p-3 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-green-700 text-sm">{coupon.code}</span>
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                Save ₹{coupon.maximumDiscountAmount ? formatPrice(coupon.maximumDiscountAmount) : '?'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs">{coupon.description}</p>
                          </div>
                        ))}
                        {availableCoupons.length > 2 && (
                          <p className="text-xs text-green-600 text-center">
                            + {availableCoupons.length - 2} more coupons
                          </p>
                        )}
                        <p className="text-xs text-gray-600 text-center italic">
                          Apply coupons at checkout
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Compact Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Proceed to Checkout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Dialog */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Clear Cart</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to remove all {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} from your cart?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCart}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Clearing...' : 'Clear Cart'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;