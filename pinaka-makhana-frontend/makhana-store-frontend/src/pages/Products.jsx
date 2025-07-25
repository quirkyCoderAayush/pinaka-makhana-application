import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../components/context/CartContext";
import { useAuth } from "../components/context/AuthContext";
import { useToast } from "../components/context/ToastContext";
import { useNavigate, Link } from "react-router-dom";
import QuantitySelector from "../components/QuantitySelector";
import FavoriteButton from "../components/FavoriteButton";
import apiService from "../services/api";
import pack1 from "../images/pack1.jpg";
import pack2 from "../images/pack2.jpg";
import pack3 from "../images/pack3.jpg";
import pack4 from "../images/pack4.png";

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
    try {
      const backendProducts = await apiService.getProducts();
      
      if (backendProducts && backendProducts.length > 0) {
        // Map backend products with local images
        const productsWithImages = backendProducts.map((product, index) => {
          const localImages = [pack1, pack2, pack3, pack4];
          return {
            ...product,
            imageUrl: localImages[index] || pack1 // Use local images as fallback
          };
        });
        setProducts(productsWithImages);
      } else {
        // Fallback to local data if no backend products
        setProducts([
          {
            id: 1,
            name: "Premium Roasted Makhana Pack 1",
            price: 199,
            weight: "30g",
            description: "Premium roasted makhana with authentic flavors",
            imageUrl: pack1
          },
          {
            id: 2,
            name: "Deluxe Flavor Collection Pack 2",
            price: 229,
            weight: "35g",
            description: "Deluxe collection of premium makhana varieties",
            imageUrl: pack2
          },
          {
            id: 3,
            name: "Special Variety Pack 3",
            price: 249,
            weight: "40g",
            description: "Special blend of flavored makhana varieties",
            imageUrl: pack3
          },
          {
            id: 4,
            name: "Premium Variety Pack 4",
            price: 269,
            weight: "25g",
            description: "Premium variety pack with multiple flavors",
            imageUrl: pack4
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products. Using demo data.');
      // Use local fallback data
      setProducts([
        {
          id: 1,
          name: "Premium Roasted Makhana Pack 1",
          price: 199,
          weight: "30g",
          description: "Premium roasted makhana with authentic flavors",
          imageUrl: pack1
        },
        {
          id: 2,
          name: "Deluxe Flavor Collection Pack 2",
          price: 229,
          weight: "35g",
          description: "Deluxe collection of premium makhana varieties",
          imageUrl: pack2
        },
        {
          id: 3,
          name: "Special Variety Pack 3",
          price: 249,
          weight: "40g",
          description: "Special blend of flavored makhana varieties",
          imageUrl: pack3
        },
        {
          id: 4,
          name: "Premium Variety Pack 4",
          price: 269,
          weight: "25g",
          description: "Premium variety pack with multiple flavors",
          imageUrl: pack4
        }
      ]);
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

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      showInfo('Please login to add items to cart');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }

    const quantity = quantities[product.id] || 1;
    
    // Add the specified quantity to cart
    for (let i = 0; i < quantity; i++) {
      await addToCart(product);
    }
    
    // Reset quantity selector for this product
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
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

  return (
    <>
      {/* Custom CSS for range slider */}
      <style jsx>{`
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
      
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h1>
          <p className="text-gray-600 text-lg">Discover our premium collection of roasted makhana</p>
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mt-4 max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sticky top-28 min-h-[400px] transition-all duration-300 z-20">
              <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight border-b pb-3 border-gray-100">Filters</h3>
              {/* Search */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:border-red-400"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

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

              {/* Price Range */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                {/* Min and Max Price Inputs */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = Math.max(0, parseInt(e.target.value) || 0);
                          setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
                        }}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all duration-200 hover:border-red-400"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const value = Math.max(0, parseInt(e.target.value) || 0);
                          setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
                        }}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all duration-200 hover:border-red-400"
                        placeholder={maxPrice.toString()}
                      />
                    </div>
                  </div>
                </div>
                {/* Range Slider */}
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">₹0</span>
                    <div className="flex-1 relative">
                      {/* Background track */}
                      <div className="h-2 bg-gray-200 rounded-lg"></div>
                      {/* Active track */}
                      <div 
                        className="absolute h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg"
                        style={{
                          left: `${(priceRange[0] / maxPrice) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`
                        }}
                      ></div>
                      {/* Min handle */}
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
                        }}
                        className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
                        style={{ zIndex: 1 }}
                      />
                      {/* Max handle */}
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
                        }}
                        className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
                        style={{ zIndex: 2 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">₹{maxPrice}+</span>
                  </div>
                  {/* Quick price filters */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(() => {
                      const quarter = Math.ceil(maxPrice / 4);
                      return [
                        { label: `Under ₹${quarter}`, min: 0, max: quarter },
                        { label: `₹${quarter}-₹${quarter * 2}`, min: quarter, max: quarter * 2 },
                        { label: `₹${quarter * 2}-₹${quarter * 3}`, min: quarter * 2, max: quarter * 3 },
                        { label: `Above ₹${quarter * 3}`, min: quarter * 3, max: maxPrice }
                      ];
                    })().map((range, index) => (
                      <button
                        key={index}
                        onClick={() => setPriceRange([range.min, range.max])}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors duration-200 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 hover:bg-red-50 hover:text-red-600 ${
                          priceRange[0] === range.min && priceRange[1] === range.max
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-red-300 hover:text-red-600'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setPriceRange([0, maxPrice]);
                  setSortBy('relevance');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm font-semibold mt-2 shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Sorting and Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white rounded-lg shadow-sm p-4">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-600">
                  Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
            >
              <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden cursor-pointer">
                <img 
                  src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=center"} 
                  alt={product.name} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                />
              </Link>
              {/* Favorite Button */}
              <div className="absolute top-4 right-4">
                <FavoriteButton product={product} size="md" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.weight || "30g"}</p>
                {product.description && (
                  <p className="text-gray-500 text-sm mb-4">{product.description}</p>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-red-600">₹{product.price}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Qty:</span>
                    <QuantitySelector
                      quantity={quantities[product.id] || 1}
                      onQuantityChange={(qty) => handleQuantityChange(product.id, qty)}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-2 rounded-lg border ${
                          isCurrentPage
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* No Products Found */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.501-.881-6.128-2.334C7.76 11.906 9.801 11 12 11s4.24.906 6.128 1.666A7.962 7.962 0 0112 15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange([0, maxPrice]);
                setSortBy('relevance');
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Products;