import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FavoritesContext } from '../components/context/FavoritesContext';
import { CartContext } from '../components/context/CartContext';
import { useToast } from '../components/context/ToastContext';
import FavoriteButton from '../components/FavoriteButton';
import { getProductImage } from '../utils/productImageMapper';
import { formatPrice } from '../utils/formatPrice';

const Wishlist = () => {
  const { favorites, removeFromFavorites } = useContext(FavoritesContext);
  const { addToCart, loading } = useContext(CartContext);
  const { showSuccess } = useToast();

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      // Remove from wishlist when added to cart
      removeFromFavorites(product.id);
      showSuccess(`${product.name} added to cart and removed from wishlist`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRemoveFromWishlist = (product) => {
    removeFromFavorites(product.id);
    showSuccess(`${product.name} removed from wishlist`);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 mb-8">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-xl">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent">My Wishlist</h1>
                  <p className="text-gray-600 mt-1">Products you've saved for later</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Empty State */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50">
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full mb-6">
                <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
                Start adding products you love to your wishlist. We'll save them here for you to easily find later.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 mb-8">
          <div className="px-8 py-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-xl">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent">My Wishlist</h1>
                  <p className="text-gray-600 mt-1">{favorites.length} {favorites.length === 1 ? 'product' : 'products'} saved</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <span>Click the heart to remove items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group relative">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Quick Add to Cart Overlay - with heart button exclusion zone */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  {/* Exclusion zone for heart button */}
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-auto z-10"></div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={loading}
                    className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 transform translate-y-4 group-hover:translate-y-0 disabled:opacity-50 pointer-events-auto z-5"
                  >
                    {loading ? 'Adding...' : 'Quick Add'}
                  </button>
                </div>

                {/* Remove from Wishlist Button - Highest z-index to stay clickable */}
                <div className="absolute top-3 right-3 z-30 pointer-events-auto">
                  <FavoriteButton product={product} size="sm" />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-red-600 transition-colors duration-200 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  {product.weight && (
                    <p className="text-sm text-gray-600 mt-1">{product.weight}</p>
                  )}
                  {product.flavor && (
                    <p className="text-sm text-gray-600 mt-1">Flavor: {product.flavor}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-red-600">₹{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">₹{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  {product.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link 
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
