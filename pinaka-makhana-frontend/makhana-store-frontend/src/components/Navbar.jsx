import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { getProductImage } from "../utils/productImageMapper";
import logo from "../images/logo.png";

function Navbar() {
  const { cartItems, updateCartItem, removeFromCart, loading } = useContext(CartContext);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const profileRef = useRef(null);
  const cartRef = useRef(null);

  const handleLogout = () => {
    logout();
  };

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      await updateCartItem(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-gray-200/50 shadow-2xl overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="flex items-center justify-between h-20 min-w-0">
          
          {/* Clean Logo */}
          <Link to="/" className="group flex items-center">
            <img 
              src={logo} 
              alt="Pinaka Makhana" 
              className="h-16 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform duration-300 bg-transparent mix-blend-multiply"
              style={{
                filter: 'drop-shadow(0 0 0 transparent)',
                background: 'transparent'
              }}
            />
          </Link>
          
          {/* Modern Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            {[
              { name: 'Home', path: '/' },
              { name: 'About', path: '/about' },
              { name: 'Products', path: '/products' },
              ...(isAuthenticated ? [
                { name: 'Orders', path: '/orders' }
              ] : [])
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 lg:px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Cart Dropdown */}
            {isAuthenticated && (
              <div className="dropdown-container" ref={cartRef}>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className={`relative px-3 lg:px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    isActive('/cart')
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  Cart
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                      {cartItems.length}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="cart-dropdown w-80 lg:w-96 max-h-96 overflow-y-auto mt-2">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Shopping Cart ({cartItems.length})</h3>
                    </div>
                    
                    {cartItems.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-500 mb-4">Your cart is empty</p>
                        <Link 
                          to="/products" 
                          onClick={() => setIsCartOpen(false)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-64 overflow-y-auto">
                          {cartItems.map((item, index) => {
                            const product = item.product || item;
                            const quantity = item.quantity || 1;
                            return (
                              <div key={item.id || index} className="p-4 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={getProductImage(product)} 
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-800 truncate">{product.name}</h4>
                                    <p className="text-xs text-gray-500">₹{product.price}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border border-gray-200 rounded-lg">
                                      <button
                                        onClick={() => handleQuantityChange(product.id, quantity, -1)}
                                        disabled={loading || quantity <= 1}
                                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 h-7 flex items-center justify-center text-sm font-medium border-l border-r border-gray-200">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={() => handleQuantityChange(product.id, quantity, 1)}
                                        disabled={loading}
                                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        +
                                      </button>
                                    </div>
                                    {/* Remove Button */}
                                    <button
                                      onClick={() => handleRemoveItem(product.id)}
                                      disabled={loading}
                                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Remove item"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="p-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-gray-800">Total:</span>
                            <span className="font-bold text-red-600">
                              ₹{cartItems.reduce((acc, item) => {
                                const product = item.product || item;
                                const quantity = item.quantity || 1;
                                return acc + (product.price * quantity);
                              }, 0)}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Link 
                              to="/cart"
                              onClick={() => setIsCartOpen(false)}
                              className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                              View Cart
                            </Link>
                            <Link 
                              to="/checkout"
                              onClick={() => setIsCartOpen(false)}
                              className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                              Checkout
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Modern Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                {/* Profile Dropdown Trigger */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 backdrop-blur-lg rounded-full px-4 py-2 border border-gray-200 hover:border-gray-300 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-800 font-medium text-sm">
                      {user?.fullName?.split(' ')[0] || user?.username || 'User'}
                    </span>
                    <svg className={`w-4 h-4 text-gray-600 transform transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user?.fullName || user?.username || 'User'}</p>
                          <p className="text-xs text-gray-600">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Account</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>My Orders</span>
                      </Link>
                      
                      <Link
                        to="/cart"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5m0 0v0a1 1 0 001 1h1m0 0h8a1 1 0 001-1v0m0 0V9a1 1 0 00-1-1H8a1 1 0 00-1 1v4.01" />
                          </svg>
                          <span>My Cart</span>
                        </div>
                        {cartItems.length > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {cartItems.length}
                          </span>
                        )}
                      </Link>
                      
                      <Link
                        to="/favorites"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Favorites</span>
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Wishlist</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout Section */}
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
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-red-600 font-medium px-4 py-2 rounded-full hover:bg-red-50 transition-all duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
          
          {/* Modern Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden bg-gray-100 backdrop-blur-lg p-3 rounded-2xl border border-gray-200 hover:bg-gray-200 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* Modern Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-200 shadow-2xl z-50">
            <div className="px-6 py-8 space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'Products', path: '/products' },
                ...(isAuthenticated ? [
                  { name: 'Cart', path: '/cart', badge: cartItems.length },
                  { name: 'Orders', path: '/orders' }
                ] : [])
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.badge > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-800">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user?.fullName || user?.username}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 px-4 py-3 rounded-2xl font-medium transition-all duration-300 border border-red-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center text-gray-700 hover:text-red-600 font-medium px-4 py-3 rounded-2xl hover:bg-red-50 transition-all duration-300"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl transition-all duration-300"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
