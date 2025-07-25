import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../components/context/CartContext';
import { useAuth } from '../components/context/AuthContext';
import { useToast } from '../components/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/productImageMapper';
import apiService from '../services/api';

const Checkout = () => {
  const { cartItems, clearCart, loading } = useContext(CartContext);
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderForm, setOrderForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod', // cod = Cash on Delivery
    couponCode: ''
  });
  
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
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

  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 1;
    return acc + (price * quantity);
  }, 0);
  
  // Calculate total after discount
  const total = subtotal - couponDiscount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset coupon if coupon code is changed
    if (name === 'couponCode' && couponApplied) {
      setCouponApplied(false);
      setCouponDiscount(0);
    }
  };
  
  const handleApplyCoupon = async () => {
    if (!orderForm.couponCode) {
      showError('Please enter a coupon code');
      return;
    }
    
    setValidatingCoupon(true);
    try {
      // First validate the coupon
      const isValid = await apiService.validateCoupon(
        orderForm.couponCode, 
        subtotal, 
        !user.hasOrders // Assuming first time user if no orders
      );
      
      if (isValid) {
        // If valid, calculate the discount
        const discount = await apiService.calculateDiscount(
          orderForm.couponCode, 
          subtotal, 
          !user.hasOrders
        );
        
        setCouponDiscount(discount);
        setCouponApplied(true);
        showSuccess(`Coupon applied! You saved ₹${discount}`);
      } else {
        showError('Invalid coupon or cannot be applied to this order');
        setCouponApplied(false);
        setCouponDiscount(0);
      }
    } catch (error) {
      console.error('Coupon validation failed:', error);
      showError('Failed to apply coupon. Please try again.');
    } finally {
      setValidatingCoupon(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setOrderForm(prev => ({ ...prev, couponCode: '' }));
    showSuccess('Coupon removed');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showError('Please login to place order');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      showError('Your cart is empty');
      navigate('/cart');
      return;
    }

    // Basic validation
    if (!orderForm.fullName || !orderForm.phone || !orderForm.address || !orderForm.city || !orderForm.pincode) {
      showError('Please fill all required fields');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      if (orderForm.paymentMethod === 'card') {
        showSuccess('Processing payment...');
        // Simulate 2 second payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Prepare order data
      const orderData = {
        ...orderForm,
        couponCode: couponApplied ? orderForm.couponCode : null,
        subtotal,
        discount: couponDiscount,
        total
      };
      
      // Place order in backend
      const response = await apiService.placeOrder(orderData);
      
      // If coupon was applied, increment its usage
      if (couponApplied) {
        try {
          // Call the API service to increment coupon usage
          await apiService.incrementCouponUsage(orderForm.couponCode);
        } catch (error) {
          console.error('Failed to update coupon usage:', error);
          // Non-critical error, don't show to user
        }
      }
      
      // Clear cart and redirect
      clearCart();
      showSuccess('Order placed successfully! You will receive confirmation shortly.');
      
      // Redirect to orders page
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
      
    } catch (error) {
      console.error('Order placement failed:', error);
      showError('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Checkout</h1>
          <p className="text-gray-600 mb-8">Please login to proceed with checkout</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Checkout</h1>
          <p className="text-gray-600 mb-8">Your cart is empty</p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Delivery Information</h2>
              
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={orderForm.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={orderForm.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={orderForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    name="address"
                    value={orderForm.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={orderForm.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={orderForm.pincode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={orderForm.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Cash on Delivery
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={orderForm.paymentMethod === 'card'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Credit/Debit Card
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing Order...' : `Place Order - ₹${total}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => {
                  const product = item.product || item;
                  const quantity = item.quantity || 1;
                  return (
                    <div key={item.id || index} className="flex items-center space-x-3">
                      <img 
                        src={getProductImage(product)} 
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800">{product.name}</h4>
                        <p className="text-xs text-gray-600">Qty: {quantity}</p>
                      </div>
                      <span className="text-sm font-medium">₹{product.price * quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code Section */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Apply Coupon</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="couponCode"
                    value={orderForm.couponCode}
                    onChange={handleInputChange}
                    placeholder="Enter coupon code"
                    disabled={couponApplied}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                  />
                  {couponApplied ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !orderForm.couponCode}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {validatingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                
                {loadingCoupons ? (
                  <p className="text-xs text-gray-500 mt-2">Loading available coupons...</p>
                ) : availableCoupons.length > 0 ? (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Available coupons:</p>
                    <div className="mt-1 space-y-1">
                      {availableCoupons.slice(0, 3).map(coupon => (
                        <div key={coupon.id} className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                          <div className="flex justify-between">
                            <span className="font-medium">{coupon.code}</span>
                            <button 
                              type="button" 
                              onClick={() => {
                                setOrderForm(prev => ({ ...prev, couponCode: coupon.code }));
                                setCouponApplied(false);
                                setCouponDiscount(0);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Use
                            </button>
                          </div>
                          <p className="text-gray-600">{coupon.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-red-600">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
