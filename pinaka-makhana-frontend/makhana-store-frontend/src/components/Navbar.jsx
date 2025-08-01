import { useContext, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { useFavorites } from "./context/FavoritesContext";
import { useAdmin } from "./context/AdminContext";
import { Heart, ShoppingCart, Search, Menu, X, User, Package, Home, Info, ShoppingBag, Phone, LogOut } from "lucide-react";
import logo from "../images/logo.png";
import "../styles/navbar-enhancements.css";
import apiService from "../services/api";
import { getProductImage } from "../utils/productImageMapper";


function Navbar() {
  const { cartItems } = useContext(CartContext);
  const { isAuthenticated, user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [navbarOpacity, setNavbarOpacity] = useState(1);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const handleLogout = () => {
    logout();
  };

  // Mobile menu handlers
  const handleMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileSearchOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const handleMobileSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  // Fetch search suggestions
  const fetchSearchSuggestions = async (query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const products = await apiService.getProducts();

      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5); // Limit to 5 suggestions

      setSearchSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search functionality
  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      // Focus the input when expanding
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Clear search when collapsing
      setSearchQuery('');
    }
  };

  // Handle keyboard events for search
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchExpanded]);

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && isMobileSearchOpen) {
        fetchSearchSuggestions(searchQuery);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isMobileSearchOpen]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };

  // Detect page background and set adaptive navbar styling
  useEffect(() => {
    const detectPageBackground = () => {
      const currentPath = location.pathname;

      // Define pages with dark backgrounds that need light navbar
      const darkBackgroundPages = ['/', '/home'];

      // Define pages with light backgrounds that need dark navbar
      const lightBackgroundPages = ['/products', '/about', '/contact', '/cart', '/wishlist', '/profile', '/login', '/register'];

      if (darkBackgroundPages.includes(currentPath)) {
        setIsDarkBackground(true); // Use light navbar for dark page backgrounds
      } else if (lightBackgroundPages.includes(currentPath)) {
        setIsDarkBackground(false); // Use dark navbar for light page backgrounds
      } else {
        // Default to light navbar for unknown pages
        setIsDarkBackground(true);
      }
    };

    detectPageBackground();
  }, [location.pathname]);

  // Comprehensive page load positioning and navbar visibility management
  useEffect(() => {
    // Robust scroll-to-top function with multiple fallbacks
    const forceScrollToTop = () => {
      // Method 1: Standard window.scrollTo with immediate behavior
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

      // Method 2: Direct property assignment for cross-browser compatibility
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Method 3: Additional fallback for older browsers
      if (window.pageYOffset !== 0) {
        window.pageYOffset = 0;
      }

      // Method 4: Force scroll using scrollIntoView on body
      document.body.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    // Force navbar to be immediately visible with full opacity
    const forceNavbarVisible = () => {
      setIsVisible(true);
      setNavbarOpacity(1);
      setIsInitialLoad(true);
    };

    // Immediate execution
    forceScrollToTop();
    forceNavbarVisible();

    // Multiple fallback timers for different scenarios
    const immediateTimer = setTimeout(() => {
      forceScrollToTop();
      forceNavbarVisible();
    }, 0);

    const shortTimer = setTimeout(() => {
      forceScrollToTop();
      forceNavbarVisible();
    }, 50);

    const mediumTimer = setTimeout(() => {
      forceScrollToTop();
      forceNavbarVisible();
    }, 150);

    const longTimer = setTimeout(() => {
      forceScrollToTop();
      forceNavbarVisible();
      // Allow scroll behavior to activate after initial load
      setTimeout(() => setIsInitialLoad(false), 500);
    }, 300);

    return () => {
      clearTimeout(immediateTimer);
      clearTimeout(shortTimer);
      clearTimeout(mediumTimer);
      clearTimeout(longTimer);
    };
  }, [location.pathname]); // Re-run on route changes

  // Additional browser-specific scroll handling for cross-browser compatibility
  useEffect(() => {
    const handlePageShow = (event) => {
      // Handle browser back/forward navigation and page cache
      if (event.persisted) {
        // Force scroll to top for cached pages
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        setIsVisible(true);
        setNavbarOpacity(1);
        setIsInitialLoad(true);
        setTimeout(() => setIsInitialLoad(false), 500);
      }
    };

    const handleBeforeUnload = () => {
      // Prepare for page reload
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Enhanced scroll behavior with initial load protection
  useEffect(() => {
    const handleScroll = () => {
      // Don't apply scroll behavior during initial load
      if (isInitialLoad) {
        return;
      }

      const currentScrollY = window.scrollY;

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce scroll handling for better performance
      scrollTimeoutRef.current = setTimeout(() => {
        if (currentScrollY < 50) {
          // Full opacity when near top
          setIsVisible(true);
          setNavbarOpacity(1);
        } else if (currentScrollY < 100) {
          // Gradual fade when approaching threshold
          setIsVisible(true);
          const opacity = 1 - ((currentScrollY - 50) / 50) * 0.3; // Fade to 70% opacity
          setNavbarOpacity(Math.max(opacity, 0.7));
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Hide when scrolling down past threshold
          setIsVisible(false);
          setNavbarOpacity(0);
        } else if (currentScrollY < lastScrollY) {
          // Show when scrolling up with fade-in effect
          setIsVisible(true);
          setNavbarOpacity(1);
        }

        setLastScrollY(currentScrollY);
      }, 10); // Small debounce delay
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [lastScrollY, isInitialLoad]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent body scrolling when mobile menu or search is open
  useEffect(() => {
    if (isMenuOpen || isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isMobileSearchOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu CSS */}
      <style jsx>{`
        .mobile-menu-overlay {
          display: block;
        }
        @media (min-width: 1024px) {
          .mobile-menu-overlay {
            display: none !important;
          }
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-lg transition-all duration-400 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isDarkBackground
            ? 'bg-white/5 border-b border-white/20'
            : 'bg-gray-800/60 border-b border-gray-700/30'
        }`}
        style={{ opacity: navbarOpacity }}
      >
      {/* Subtle gradient overlay for enhanced transparency */}
      <div className={`absolute inset-0 ${
        isDarkBackground
          ? 'bg-gradient-to-r from-white/2 via-white/5 to-white/2'
          : 'bg-gradient-to-r from-gray-800/3 via-gray-800/5 to-gray-800/3'
      }`}></div>
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 relative">
        <div className="flex items-center justify-between h-20">

          {/* Enhanced Logo with Visibility Optimization */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img
                src={logo}
                alt="Pinaka Makhana"
                className="h-16 w-auto transition-all duration-300 group-hover:scale-105"
                style={{
                  filter: isDarkBackground
                    ? 'brightness(1.3) contrast(1.4) saturate(1.2) drop-shadow(0 2px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                    : 'brightness(1.4) contrast(1.5) saturate(1.3) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.4))',
                  transition: 'all 0.3s ease-in-out'
                }}
              />
            </Link>
          </div>

          {/* Enhanced Navigation Links - Center Section */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'Products', path: '/products' },
                { name: 'Contact Us', path: '/contact' },
                ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin/dashboard' }] : [])
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 font-medium text-base transition-all duration-600 ease-in-out group ${
                    isActive(item.path)
                      ? 'text-red-500'
                      : isDarkBackground
                        ? 'text-white hover:text-red-500'
                        : 'text-white hover:text-red-500'
                  }`}
                  style={{
                    textShadow: isDarkBackground
                      ? '0 1px 3px rgba(0, 0, 0, 0.3)'
                      : '0 1px 3px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <span className="relative z-10">{item.name}</span>

                  {/* Enhanced bidirectional underline animation */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 shadow-lg nav-underline ${
                      isActive(item.path)
                        ? 'w-full opacity-100'
                        : 'w-0 opacity-0'
                    }`}
                    style={{
                      transformOrigin: 'left',
                      transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '2px'
                    }}
                  ></div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right Section - Actions & Auth */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Compact Expandable Search */}
            <div className="relative" ref={searchRef}>
              <div className={`flex items-center transition-all duration-400 ease-in-out ${
                isSearchExpanded ? 'w-80' : 'w-auto'
              }`}>
                {!isSearchExpanded ? (
                  <button
                    onClick={handleSearchToggle}
                    className={`p-3 transition-colors duration-300 ${
                      isDarkBackground
                        ? 'text-white hover:text-red-300'
                        : 'text-white hover:text-red-300'
                    }`}
                    aria-label="Open search"
                    style={{
                      filter: isDarkBackground
                        ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                        : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                    }}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-red-500" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full pl-12 pr-12 py-3 bg-white/95 backdrop-blur-xl border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 placeholder-gray-500 shadow-lg"
                      placeholder="Search for makhana products..."
                      autoComplete="off"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
                        </button>
                      )}
                      <button
                        onClick={handleSearchToggle}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                        aria-label="Close search"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Adaptive Heart Icon for Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className={`relative p-3 transition-colors duration-300 ${
                  isDarkBackground
                    ? 'text-white hover:text-red-300'
                    : 'text-white hover:text-red-300'
                }`}
                aria-label="Wishlist"
                style={{
                  filter: isDarkBackground
                    ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                    : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                }}
              >
                <Heart className="h-5 w-5 hover:fill-red-300 transition-all duration-300" />
                {favorites && favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                    {favorites.length}
                  </span>
                )}
              </Link>
            )}

            {/* Adaptive Cart Icon */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className={`relative p-3 transition-colors duration-300 ${
                  isDarkBackground
                    ? 'text-white hover:text-orange-300'
                    : 'text-white hover:text-orange-300'
                }`}
                aria-label="Shopping Cart"
                style={{
                  filter: isDarkBackground
                    ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                    : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}
            {/* Modern Minimalist Profile Section */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                {/* Minimalist Profile Dropdown Trigger */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 transition-all duration-300 hover:opacity-80"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <span className="text-white font-bold text-sm">
                      {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span
                      className={`font-medium text-sm ${
                        isDarkBackground ? 'text-white' : 'text-white'
                      }`}
                      style={{
                        textShadow: isDarkBackground
                          ? '0 1px 2px rgba(0, 0, 0, 0.3)'
                          : '0 1px 2px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      {user?.fullName?.split(' ')[0] || user?.username || 'User'}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-300 ${
                      isProfileOpen ? 'rotate-180' : ''
                    } ${isDarkBackground ? 'text-white' : 'text-white'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      filter: isDarkBackground
                        ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                        : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Enhanced Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                    {/* Enhanced User Info Header */}
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-base">{user?.fullName || user?.username || 'User'}</p>
                          <p className="text-sm text-gray-500 mt-1">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Account</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Wishlist</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Enhanced Logout Section */}
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center space-x-3 px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`font-medium px-4 py-2 transition-colors duration-300 ${
                    isDarkBackground
                      ? 'text-white hover:text-red-300'
                      : 'text-white hover:text-red-300'
                  }`}
                  style={{
                    textShadow: isDarkBackground
                      ? '0 1px 2px rgba(0, 0, 0, 0.3)'
                      : '0 1px 2px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Icons - Between Logo and Hamburger */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Search Icon */}
            <button
              onClick={handleSearchClick}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 cursor-pointer ${
                isDarkBackground
                  ? 'text-white hover:text-red-300 hover:bg-white/10 active:bg-white/20'
                  : 'text-white hover:text-red-300 hover:bg-white/10 active:bg-white/20'
              }`}
              style={{
                filter: isDarkBackground
                  ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                  : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
              aria-label="Open search"
              type="button"
            >
              <Search className="h-5 w-5 transition-transform duration-200" />
            </button>

            {/* Mobile Wishlist Icon */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 ${
                  isDarkBackground
                    ? 'text-white hover:text-red-500 hover:bg-white/10 active:bg-white/20'
                    : 'text-white hover:text-red-500 hover:bg-white/10 active:bg-white/20'
                }`}
                style={{
                  filter: isDarkBackground
                    ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                    : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                }}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5 transition-transform duration-200" />
                {favorites && favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Cart Icon */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 ${
                  isDarkBackground
                    ? 'text-white hover:text-orange-300 hover:bg-white/10 active:bg-white/20'
                    : 'text-white hover:text-orange-300 hover:bg-white/10 active:bg-white/20'
                }`}
                style={{
                  filter: isDarkBackground
                    ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                    : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                }}
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5 transition-transform duration-200" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Profile Icon */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 ${
                    isDarkBackground
                      ? 'text-white hover:text-red-300 hover:bg-white/10 active:bg-white/20'
                      : 'text-white hover:text-red-300 hover:bg-white/10 active:bg-white/20'
                  }`}
                  style={{
                    filter: isDarkBackground
                      ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                  }}
                  aria-label="Profile Menu"
                >
                  <User className="h-5 w-5 transition-transform duration-200" />
                </button>

                {/* Mobile Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 z-50">
                    <div className="p-4 space-y-3">
                      {/* User Info */}
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{user?.fullName || user?.username}</p>
                          <p className="text-xs text-gray-600">Welcome back!</p>
                        </div>
                      </div>

                      {/* Profile Links */}
                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-700 text-sm">My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-700 text-sm">My Orders</span>
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Authentication Icons for Non-Authenticated Users */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 ${
                    isDarkBackground
                      ? 'text-white hover:text-red-300 hover:bg-white/10 active:bg-white/20'
                      : 'text-white hover:text-red-300 hover:bg-white/10 active:bg-white/20'
                  }`}
                  style={{
                    filter: isDarkBackground
                      ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                  }}
                  aria-label="Sign In"
                >
                  <User className="h-5 w-5 transition-transform duration-200" />
                </Link>
              </>
            )}
          </div>

          {/* Adaptive Mobile Menu Button */}
          <button
            onClick={handleMenuToggle}
            className={`lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 cursor-pointer ${
              isDarkBackground
                ? 'text-white hover:text-red-300 hover:bg-white/10 active:bg-white/20'
                : 'text-white hover:text-red-300 hover:bg-white/10 active:bg-white/20'
            }`}
            style={{
              filter: isDarkBackground
                ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            type="button"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 transition-transform duration-200" />
            ) : (
              <Menu className="w-6 h-6 transition-transform duration-200" />
            )}
          </button>
        </div>
        


        {/* Mobile Menu - React Portal Implementation */}
        {isMenuOpen && createPortal(
          <div
            className="fixed inset-0 z-50 lg:hidden"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleMenuClose();
              }
            }}
          >
            <div
              className="bg-white/95 backdrop-blur-lg rounded-2xl mx-4 mt-16 mb-4 shadow-2xl border border-white/20 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                    Menu
                  </h2>
                  <button
                    onClick={handleMenuClose}
                    className="p-2 rounded-xl hover:bg-red-50 transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                        setIsMenuOpen(false);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    placeholder="Search products..."
                  />
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {[
                    { name: 'Home', path: '/', icon: Home },
                    { name: 'About', path: '/about', icon: Info },
                    { name: 'Products', path: '/products', icon: ShoppingBag },
                    { name: 'Contact', path: '/contact', icon: Phone },
                    ...(isAuthenticated ? [
                      { name: 'Cart', path: '/cart', badge: cartItems.length, icon: ShoppingCart },
                      { name: 'Wishlist', path: '/wishlist', badge: favorites?.length, icon: Heart }
                    ] : []),
                    ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin/dashboard' }] : [])
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleMenuClose}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200'
                          : 'hover:bg-gray-50 text-gray-700 hover:text-red-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Authentication Section */}
                <div className="pt-4 border-t border-gray-200">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user?.fullName || user?.username}</p>
                          <p className="text-sm text-gray-600">Welcome back!</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link
                          to="/profile"
                          onClick={handleMenuClose}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                        >
                          <User className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={handleMenuClose}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Package className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">My Orders</span>
                        </Link>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={handleMenuClose}
                        className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl font-medium transition-colors duration-200"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={handleMenuClose}
                        className="block text-center bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white p-3 rounded-xl font-medium transition-colors duration-200"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && createPortal(
          <div
            className="fixed inset-0 z-50 lg:hidden"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleMobileSearchClose();
              }
            }}
          >
            <div
              className="bg-white/95 backdrop-blur-lg rounded-2xl mx-4 mt-20 mb-4 shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                    Search Products
                  </h2>
                  <button
                    onClick={handleMobileSearchClose}
                    className="p-2 rounded-xl hover:bg-red-50 transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleMobileSearchSubmit();
                      }
                      if (e.key === 'Escape') {
                        handleMobileSearchClose();
                      }
                    }}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 text-lg"
                    placeholder="Search for makhana products..."
                    autoFocus
                  />
                </div>

                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                    {searchSuggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate(`/products/${product.id}`);
                          setIsMobileSearchOpen(false);
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-600 truncate">{product.description}</p>
                            <p className="text-sm font-semibold text-red-600">₹{product.price}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Button */}
                <button
                  onClick={handleMobileSearchSubmit}
                  disabled={!searchQuery.trim()}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white p-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search Products</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </nav>
    </>
  );
}

export default Navbar;
