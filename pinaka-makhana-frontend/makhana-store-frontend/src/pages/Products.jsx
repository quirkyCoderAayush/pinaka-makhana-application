import React, { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "../components/context/CartContext";
import { useAuth } from "../components/context/AuthContext";
import { useToast } from "../components/context/ToastContext";
import { useNavigate, Link } from "react-router-dom";
import { Filter, SlidersHorizontal, Search, X, ChevronDown, Grid, List } from "lucide-react";
import ModernProductCard from "../components/ModernProductCard";
import apiService from "../services/api";
import pack1 from "../images/pack1.jpg";
import pack2 from "../images/pack2.jpg";
import pack3 from "../images/pack3.jpg";
import pack4 from "../images/pack4.png";
import { formatPrice } from "../utils/formatPrice";

const Products = () => {
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();  
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  
  // Advanced filtering and pagination states
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);
  const [sortBy, setSortBy] = useState('relevance');
  const maxPrice = Math.max(1000, ...products.map(p => p.price || 0));
  const [priceRange, setPriceRange] = useState([0, maxPrice]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(''); // Track quantity for each product
  const [showFilters, setShowFilters] = useState(false); // For mobile filter toggle
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [favorites, setFavorites] = useState([]);
  const [activeProductId, setActiveProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update price range when products change
  useEffect(() => {
    if (products.length > 0) {
      const newMaxPrice = Math.max(1000, ...products.map(p => p.price || 0));
      setPriceRange([0, newMaxPrice]);
    }
  }, [products]);

  // Apply filters whenever products or filter criteria change
  useEffect(() => {
    applyFiltersAndSort();
  }, [products, sortBy, priceRange, selectedCategory, searchQuery]);

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory || 
        product.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popularity':
        // For now, sort by price as proxy for popularity
        filtered.sort((a, b) => b.price - a.price);
        break;
      default: // relevance
        // Keep original order or sort by ID
        filtered.sort((a, b) => a.id - b.id);
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get categories from products
  const getCategories = () => {
    const categories = [...new Set(products.map(product => 
      product.category || 'Makhana'
    ))];
    return ['all', ...categories];
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const backendProducts = await apiService.getProducts();
      
      if (backendProducts && backendProducts.length > 0) {
        // Use backend products with their uploaded images (don't override!)
        console.log('🔄 Products: Using backend products with uploaded images');
        backendProducts.forEach(product => {
          console.log(`🔍 Products: Product ID ${product.id}: imageUrl='${product.imageUrl}'`);
        });
        setProducts(backendProducts);
      } else {
        setProducts([]);
        setError('No products found from backend.');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products from server. Please check your connection or try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleToggleFavorite = (product) => {
    setFavorites(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      } else {
        return [...prev, product.id];
      }
    });
  };

  const handleAddToCart = async (product, cardQuantity = null) => {
    if (!isAuthenticated) {
      showInfo('Please login to add items to cart');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }

    // Use the quantity from the card if provided, otherwise use the page-level quantity
    const quantity = cardQuantity || quantities[product.id] || 1;
    setIsLoading(true);
    setActiveProductId(product.id);

    // Add the specified quantity to cart in one call
    await addToCart(product, quantity);

    // Reset quantity selector for this product
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));

    setIsLoading(false);
    setActiveProductId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-md max-w-md text-center">
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom CSS for range slider */}
      <style>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          position: relative;
          z-index: 3;
        }
        
        .range-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          border: none;
        }
        
        .range-slider::-webkit-slider-track {
          background: transparent;
        }
        
        .range-slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 pt-24 pb-12 relative overflow-hidden">
        {/* Enhanced Background with Makhana Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Makhana-inspired organic shapes */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-red-200/40 to-orange-200/40 rounded-full animate-float"></div>
          <div className="absolute top-32 left-32 w-8 h-8 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full animate-float delay-500"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-yellow-200/35 to-red-200/35 rounded-full animate-float delay-1000"></div>
          <div className="absolute top-60 right-40 w-6 h-6 bg-gradient-to-br from-red-300/40 to-orange-300/40 rounded-full animate-float delay-1500"></div>

          {/* Medium makhana shapes */}
          <div className="absolute top-1/3 left-1/4 w-10 h-10 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full animate-float delay-2000"></div>
          <div className="absolute top-1/2 right-1/3 w-14 h-14 bg-gradient-to-br from-red-200/25 to-yellow-200/25 rounded-full animate-float delay-2500"></div>
          <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full animate-float delay-3000"></div>

          {/* Large background makhana shapes */}
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-orange-200/20 to-pink-200/20 rounded-full animate-float delay-3500"></div>
          <div className="absolute bottom-60 right-16 w-18 h-18 bg-gradient-to-br from-red-200/25 to-orange-200/25 rounded-full animate-float delay-4000"></div>

          {/* Small scattered makhana elements */}
          <div className="absolute top-1/4 left-1/6 w-4 h-4 bg-red-300/30 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-5 h-5 bg-orange-300/25 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/8 w-3 h-3 bg-yellow-300/35 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/6 w-6 h-6 bg-red-200/30 rounded-full animate-pulse delay-3000"></div>

          {/* Subtle gradient overlays */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-50/10 via-transparent to-orange-50/10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Compact Modern Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 via-red-600 to-orange-600 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              Our Premium Collection
            </motion.h1>

            <motion.p
              className="text-gray-600 text-sm max-w-md mx-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Premium roasted makhana for healthy snacking
            </motion.p>

            {error && (
              <motion.div
                className="bg-yellow-50/90 backdrop-blur-xl border border-yellow-200/50 text-yellow-800 px-8 py-6 rounded-2xl mt-8 max-w-lg mx-auto flex items-center space-x-4 shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Enhanced Mobile Filter Button */}
          <motion.div
            className="lg:hidden flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-6 py-3 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-gray-700">Filters</span>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.div>
            </motion.button>

            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-gray-700">Sort:</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/90 backdrop-blur-xl px-4 py-3 pr-10 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                  <option value="popularity">Popularity</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Modern Sidebar - Filters */}
          <aside className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'} lg:static fixed inset-0 z-40 bg-gray-900/50 lg:bg-transparent`}>
            <motion.div
              className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:sticky lg:top-28 min-h-[400px] transition-all duration-500 z-20 lg:h-auto h-full max-w-sm w-full ml-auto"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,248,248,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Mobile Close Button */}
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Filters</h3>
                <motion.button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="hidden lg:block">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-8 tracking-tight border-b pb-4 border-red-100">
                  <div className="flex items-center space-x-3">
                    <SlidersHorizontal className="w-6 h-6 text-red-600" />
                    <span>Filters</span>
                  </div>
                </h3>
              </div>

              {/* Enhanced Search */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                  <Search className="w-4 h-4 text-red-600" />
                  <span>Search Products</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 shadow-lg hover:shadow-xl placeholder-gray-500 font-medium"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                  {searchQuery && (
                    <motion.button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-red-100 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Category Filter */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:border-red-400"
                >
                  {getCategories().map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enhanced Modern Price Range */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-4">
                  <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></span>
                  <span>Price Range</span>
                </label>

                {/* Price Display */}
                <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-red-50/80 to-orange-50/80 rounded-2xl border border-red-100/50">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Min</div>
                    <div className="text-lg font-bold text-red-600">₹{formatPrice(priceRange[0])}</div>
                  </div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-red-300 to-orange-300 rounded-full"></div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Max</div>
                    <div className="text-lg font-bold text-orange-600">₹{formatPrice(priceRange[1])}</div>
                  </div>
                </div>

                {/* Modern Dual Range Slider */}
                <div className="relative mb-6">
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    {/* Active range background */}
                    <div
                      className="absolute h-full bg-gradient-to-r from-red-500 via-red-600 to-orange-500 rounded-full transition-all duration-300 shadow-lg"
                      style={{
                        left: `${(priceRange[0] / maxPrice) * 100}%`,
                        width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`
                      }}
                    ></div>
                  </div>

                  {/* Min Range Input */}
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
                    }}
                    className="absolute top-0 w-full h-3 bg-transparent appearance-none cursor-pointer range-slider"
                    style={{ zIndex: 1 }}
                  />

                  {/* Max Range Input */}
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
                    }}
                    className="absolute top-0 w-full h-3 bg-transparent appearance-none cursor-pointer range-slider"
                    style={{ zIndex: 2 }}
                  />
                </div>

                {/* Quick Price Filter Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const quarter = Math.ceil(maxPrice / 4);
                    return [
                      { label: `Under ₹${formatPrice(quarter)}`, min: 0, max: quarter },
                      { label: `₹${formatPrice(quarter)}-₹${formatPrice(quarter * 2)}`, min: quarter, max: quarter * 2 },
                      { label: `₹${formatPrice(quarter * 2)}-₹${formatPrice(quarter * 3)}`, min: quarter * 2, max: quarter * 3 },
                      { label: `Above ₹${formatPrice(quarter * 3)}`, min: quarter * 3, max: maxPrice }
                    ];
                  })().map((range, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setPriceRange([range.min, range.max])}
                      className={`px-3 py-2 text-xs rounded-xl border transition-all duration-300 font-semibold shadow-sm ${
                        priceRange[0] === range.min && priceRange[1] === range.max
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-500 shadow-lg'
                          : 'bg-white/90 backdrop-blur-xl text-gray-600 border-gray-200/50 hover:border-red-300/50 hover:text-red-600 hover:bg-red-50/90'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {range.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Reset Filters */}
              {/* Action Buttons */}
              <div className="space-y-3 mt-8 pt-6 border-t border-gray-200/50">
                {/* Done Button - Primary Action */}
                <motion.button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 text-white py-4 px-6 rounded-2xl transition-all duration-300 text-base font-bold shadow-xl hover:shadow-2xl relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.1)'
                  }}
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    <span>Done</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </motion.button>

                {/* Reset Button - Secondary Action */}
                <motion.button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, maxPrice]);
                    setSortBy('relevance');
                  }}
                  className="w-full bg-white/90 backdrop-blur-xl hover:bg-red-50/90 text-gray-700 hover:text-red-700 py-3 px-6 rounded-2xl transition-all duration-300 text-sm font-semibold border border-gray-200/50 hover:border-red-200/50 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset All Filters
                </motion.button>
              </div>
            </motion.div>
          </aside>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Enhanced Desktop Sorting and Results Info */}
            <motion.div
              className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,248,0.9) 100%)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-700 font-medium text-lg">
                  Showing <span className="font-bold text-red-600">{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)}</span> of <span className="font-bold text-red-600">{filteredProducts.length}</span> products
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Premium makhana collection curated for you
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <label className="text-sm font-bold text-gray-700 flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-red-600" />
                  <span>Sort by:</span>
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/90 backdrop-blur-xl px-6 py-3 pr-12 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                    <option value="popularity">Popularity</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </motion.div>
            
            {/* Enhanced Mobile Results Info */}
            <motion.div
              className="lg:hidden mb-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <p className="text-gray-700 font-medium text-center">
                <span className="font-bold text-red-600">{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)}</span> of <span className="font-bold text-red-600">{filteredProducts.length}</span> products
              </p>
            </motion.div>

            {/* Enhanced Modern Products Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <AnimatePresence>
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className="w-full"
                  >
                    <ModernProductCard
                      product={product}
                      onAddToCart={(product, quantity) => handleAddToCart(product, quantity)}
                      onToggleFavorite={(product) => handleToggleFavorite(product)}
                      isFavorite={favorites.includes(product.id)}
                      loading={isLoading && activeProductId === product.id}
                      className="h-full transform transition-all duration-300 hover:z-10"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Enhanced Modern Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex justify-center items-center space-x-3 mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <motion.button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/50 text-gray-600 hover:text-red-600 hover:bg-red-50/90 hover:border-red-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                >
                  Previous
                </motion.button>

                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === currentPage;

                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <motion.button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-4 py-3 rounded-2xl border font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                            isCurrentPage
                              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-500 shadow-red-500/25'
                              : 'bg-white/90 backdrop-blur-xl border-gray-200/50 text-gray-700 hover:bg-red-50/90 hover:text-red-600 hover:border-red-200/50'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {pageNumber}
                        </motion.button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span key={pageNumber} className="px-3 text-gray-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <motion.button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/50 text-gray-600 hover:text-red-600 hover:bg-red-50/90 hover:border-red-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                  whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                >
                  Next
                </motion.button>
              </motion.div>
            )}

            {/* Enhanced No Products Found */}
            {filteredProducts.length === 0 && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="mx-auto w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </motion.div>

                <motion.h3
                  className="text-3xl font-bold text-gray-800 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  No products found
                </motion.h3>

                <motion.p
                  className="text-gray-600 mb-8 text-lg max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                </motion.p>

                <motion.button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, maxPrice]);
                    setSortBy('relevance');
                  }}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Products;