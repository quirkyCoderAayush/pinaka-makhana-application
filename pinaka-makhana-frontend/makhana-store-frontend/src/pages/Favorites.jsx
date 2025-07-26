import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FavoritesContext } from '../components/context/FavoritesContext';
import { CartContext } from '../components/context/CartContext';
import { useToast } from '../components/context/ToastContext';
import { getProductImage } from '../utils/productImageMapper';

const Favorites = () => {
  const { favorites, removeFromFavorites } = useContext(FavoritesContext);
  const { addToCart, loading } = useContext(CartContext);
  const { showSuccess } = useToast();
  


  const handleAddToCart = async (product) => {
    await addToCart(product);
    showSuccess(`${product.name} added to cart`);
  };

  const handleRemoveFromFavorites = (product) => {
    removeFromFavorites(product.id);
    showSuccess(`${product.name} removed from favorites`);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600 mt-1">Products you've saved as favorites</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Your favorites list is empty</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                Start adding products you love to your favorites. We'll save them here for you.
              </p>
              <div className="mt-8">
                <Link 
                  to="/products"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600 mt-1">Products you've saved as favorites</p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="relative">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image || product.imageUrl || getProductImage(product)} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <button
                  onClick={() => handleRemoveFromFavorites(product)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <Link to={`/product/${product.id}`} className="block mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors">{product.name}</h3>
                </Link>
                {product.weight && <p className="text-sm text-gray-600 mb-2">{product.weight}</p>}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-red-600">₹{product.price}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;