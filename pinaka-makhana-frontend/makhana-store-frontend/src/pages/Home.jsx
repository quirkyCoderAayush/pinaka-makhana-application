import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../components/context/CartContext";
import QuantitySelector from "../components/QuantitySelector";
import FavoriteButton from "../components/FavoriteButton";
import ApiService from "../services/api";
import { useIntersectionObserver, usePerformanceOptimization } from "../hooks/useSmoothScroll";
import makhanaImage from "../images/makhana.png";
import pack1 from "../images/pack1.jpg";
import pack2 from "../images/pack2.jpg";
import pack3 from "../images/pack3.jpg";
import pack4 from "../images/pack4.png";

const productData = [
  {
    id: 1,
    name: "Premium Roasted Makhana",
    weight: "30g",
    image: pack1,
    price: 199
  },
  {
    id: 2,
    name: "Deluxe Flavor Collection",
    weight: "35g", 
    image: pack2,
    price: 229
  },
  {
    id: 3,
    name: "Special Variety Pack",
    weight: "40g",
    image: pack3,
    price: 249
  },
  {
    id: 4,
    name: "Premium Variety Pack 4",
    weight: "25g",
    image: pack4,
    price: 269
  }
];

const Home = () => {
  const { addToCart, loading } = useContext(CartContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState(productData); // Use local products as fallback
  const [quantities, setQuantities] = useState({}); // Track quantity for each product
  const [displayLimit, setDisplayLimit] = useState(4);
  const [showingAll, setShowingAll] = useState(false);

  // Initialize smooth scrolling and performance optimizations
  useIntersectionObserver();
  usePerformanceOptimization();

  // Load products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const backendProducts = await ApiService.getProducts();
      if (backendProducts && backendProducts.length > 0) {
        // Map backend products to include local images
        const productsWithImages = backendProducts.map((product, index) => ({
          ...product,
          image: productData[index]?.image || pack1 // Use local images as fallback
        }));
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error('Failed to load products from backend:', error);
      // Keep using local productData as fallback
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleAddToCart = async (product) => {
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

  const handleShowMore = () => {
    setDisplayLimit(products.length);
    setShowingAll(true);
  };

  const handleShowLess = () => {
    setDisplayLimit(4);
    setShowingAll(false);
  };

  const displayedProducts = products.slice(0, displayLimit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section id="hero" className="hero-section relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black overflow-hidden flex items-center pt-20">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply animate-pulse delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="text-white space-y-8">
              <div className="space-y-6">
                {/* Modern Badge */}
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span>Premium Superfood</span>
                </div>
                
                {/* Main Heading */}
                <h1 className="text-6xl lg:text-8xl font-black leading-none">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                    PINAKA
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 animate-pulse">
                    MAKHANA
                  </span>
                </h1>
                
                {/* Subheading */}
                <p className="text-2xl lg:text-3xl font-light text-gray-300 leading-relaxed">
                  The Future of 
                  <span className="text-red-400 font-medium"> Healthy Snacking</span>
                </p>
                
                {/* Description */}
                <p className="text-lg text-gray-400 leading-relaxed max-w-md">
                  Experience premium roasted fox nuts that redefine taste and nutrition. 
                  Zero guilt, maximum flavor.
                </p>
              </div>
              
              {/* Modern CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/products" 
                  className="group relative bg-gradient-to-r from-red-500 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <span className="relative z-10">Explore Collection</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </Link>
                
                <button className="border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 hover:scale-105">
                  Watch Story
                </button>
              </div>
              
              {/* Stats */}
              <div className="flex space-x-12 pt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-400">100%</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Natural</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400">0</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Chemicals</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">High</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Protein</div>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative">
              {/* Main Product Container */}
              <div className="relative group">
                {/* Multi-layer Glowing Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-700"></div>
                
                {/* Product Image Container with Enhanced Lighting */}
                <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl p-4 transform group-hover:scale-105 transition-all duration-500 shadow-2xl">
                  {/* Inner glow */}
                  <div className="absolute inset-4 bg-gradient-to-r from-red-500/30 via-orange-500/30 to-yellow-500/30 rounded-2xl blur-sm"></div>
                  
                  {/* Image with multiple effects */}
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-100">
                    {/* Your Local Makhana Image */}
                    <img 
                      src={makhanaImage} 
                      alt="Pinaka Premium Makhana"
                      className="relative z-10 w-full h-96 object-contain transition-all duration-500 group-hover:scale-110 p-4"
                      style={{
                        filter: 'brightness(1.2) contrast(1.1) saturate(1.3) drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                        mixBlendMode: 'normal'
                      }}
                    />
                    
                    {/* Enhanced highlighting overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 via-transparent to-orange-500/15 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-400/10 to-transparent pointer-events-none"></div>
                    
                    {/* Spotlight effect */}
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Enhanced Floating Cards with Better Highlighting */}
                <div className="absolute -top-8 -left-8 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl animate-bounce border-2 border-red-200 hover:border-red-400 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">₹199</div>
                    <div className="text-xs text-gray-700 font-semibold uppercase tracking-wider">Premium Quality</div>
                  </div>
                  {/* Small glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-2xl blur-lg -z-10"></div>
                </div>
                
                <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-5 shadow-2xl animate-pulse hover:scale-110 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-white rounded-full animate-pulse shadow-lg"></div>
                    <div className="font-bold text-sm uppercase tracking-wider">Farm Fresh</div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-2xl blur-lg -z-10"></div>
                </div>
                
                {/* Additional highlighting element */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full p-3 shadow-xl animate-pulse">
                  <div className="text-xs font-bold">100% Natural</div>
                </div>
              </div>
              
              {/* Enhanced Floating Elements */}
              <div className="absolute top-1/4 -right-12 animate-float">
                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-30 blur-sm"></div>
              </div>
              <div className="absolute bottom-1/4 -left-12 animate-float delay-1000">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full opacity-40 blur-sm"></div>
              </div>
              <div className="absolute top-1/2 right-4 animate-float delay-2000">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-25 blur-sm"></div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full animate-pulse mt-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="products-section py-16 px-8 relative overflow-hidden">
        {/* Beautiful Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 opacity-60"></div>
        
        {/* Scattered Makhana-like Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large floating shapes */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-red-200 to-pink-200 rounded-full opacity-15 animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full opacity-30 animate-pulse delay-500"></div>
          
          {/* Medium scattered shapes */}
          <div className="absolute top-60 left-1/4 w-8 h-8 bg-gradient-to-br from-red-300 to-orange-300 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-32 right-1/3 w-10 h-10 bg-gradient-to-br from-yellow-300 to-red-300 rounded-full opacity-25 animate-bounce delay-700"></div>
          <div className="absolute bottom-60 left-1/2 w-6 h-6 bg-gradient-to-br from-orange-300 to-red-300 rounded-full opacity-30 animate-bounce delay-1200"></div>
          
          {/* Small decorative dots */}
          <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-300 rounded-full opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-orange-300 rounded-full opacity-25"></div>
          <div className="absolute top-1/2 left-1/6 w-5 h-5 bg-yellow-300 rounded-full opacity-15"></div>
          
          {/* Geometric patterns */}
          <div className="absolute top-1/3 right-1/6 w-12 h-12 border-2 border-orange-200 rounded-full opacity-20 animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-8 h-8 border border-red-200 rotate-45 opacity-25"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
              Pinaka Makhana Collection
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our premium range of roasted makhana - healthy, delicious, and crafted with love for your well-being
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedProducts.map((product, index) => (
              <div key={product.id} className={`fade-in bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative`} style={{ transitionDelay: `${index * 0.1}s` }}>
                <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden cursor-pointer">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                {/* Favorite Button */}
                <div className="absolute top-3 right-3">
                  <FavoriteButton product={product} size="sm" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.weight}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-red-600">₹{product.price}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Qty:</span>
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
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button 
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-xs font-medium"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show More/Less Button */}
          {products.length > 3 && (
            <div className="text-center mt-8">
              <Link 
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
              >
                Show More Products
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;