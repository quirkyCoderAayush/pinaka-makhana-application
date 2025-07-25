import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Star, Check, Minus, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useFavorites } from './context/FavoritesContext';
import { useCart } from './context/CartContext';
import { useToast } from './context/ToastContext';

const ProductComparison = ({ products = [], onClose, onAddProduct }) => {
  const { isAuthenticated } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToCart, loading } = useCart();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [compareProducts, setCompareProducts] = useState(products);
  const maxProducts = 3;

  useEffect(() => {
    setCompareProducts(products);
  }, [products]);

  const removeProduct = (productId) => {
    setCompareProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addProductToComparison = () => {
    if (compareProducts.length < maxProducts) {
      onAddProduct?.();
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      showInfo('Please login to add items to cart');
      return;
    }
    
    try {
      await addToCart(product);
      showSuccess(`${product.name} added to cart!`);
    } catch (error) {
      showError('Failed to add to cart');
    }
  };

  const toggleFavorite = async (product) => {
    if (!isAuthenticated) {
      showInfo('Please login to manage favorites');
      return;
    }

    try {
      const isFavorite = favorites.some(fav => fav.id === product.id);
      if (isFavorite) {
        await removeFromFavorites(product.id);
        showSuccess('Removed from favorites');
      } else {
        await addToFavorites(product);
        showSuccess('Added to favorites');
      }
    } catch (error) {
      showError('Failed to update favorites');
    }
  };

  const comparisonFeatures = [
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'weight', label: 'Weight', type: 'text' },
    { key: 'flavor', label: 'Flavor', type: 'text' },
    { key: 'rating', label: 'Rating', type: 'rating' },
    { key: 'calories', label: 'Calories (per 100g)', type: 'number', unit: 'kcal' },
    { key: 'protein', label: 'Protein (per 100g)', type: 'number', unit: 'g' },
    { key: 'carbohydrates', label: 'Carbs (per 100g)', type: 'number', unit: 'g' },
    { key: 'fat', label: 'Fat (per 100g)', type: 'number', unit: 'g' },
    { key: 'fiber', label: 'Fiber (per 100g)', type: 'number', unit: 'g' },
    { key: 'isPremium', label: 'Premium Quality', type: 'boolean' },
    { key: 'stockQuantity', label: 'Stock', type: 'stock' },
  ];

  const renderFeatureValue = (product, feature) => {
    const value = product[feature.key];
    
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    switch (feature.type) {
      case 'currency':
        return <span className="font-semibold text-primary-600">₹{value}</span>;
      
      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            <div className="flex text-accent-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(value) ? 'fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({value})</span>
          </div>
        );
      
      case 'number':
        return <span>{value}{feature.unit && ` ${feature.unit}`}</span>;
      
      case 'boolean':
        return value ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Minus className="w-5 h-5 text-gray-400" />
        );
      
      case 'stock':
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            value > 10 
              ? 'bg-green-100 text-green-800' 
              : value > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
          }`}>
            {value > 0 ? `${value} in stock` : 'Out of stock'}
          </span>
        );
      
      default:
        return <span>{value}</span>;
    }
  };

  const getBestValue = (feature) => {
    if (compareProducts.length === 0) return null;

    switch (feature.key) {
      case 'price':
        return Math.min(...compareProducts.map(p => p.price || Infinity));
      case 'rating':
        return Math.max(...compareProducts.map(p => p.rating || 0));
      case 'calories':
      case 'protein':
      case 'fiber':
        return Math.max(...compareProducts.map(p => p[feature.key] || 0));
      case 'fat':
        return Math.min(...compareProducts.map(p => p[feature.key] || Infinity));
      default:
        return null;
    }
  };

  const isHighlighted = (product, feature) => {
    const bestValue = getBestValue(feature);
    if (bestValue === null) return false;
    
    const productValue = product[feature.key];
    return productValue === bestValue;
  };

  if (compareProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No products to compare</h3>
        <p className="text-gray-600 mb-4">Add products to start comparing</p>
        <button
          onClick={addProductToComparison}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Add Products
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Product Comparison</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 opacity-90">
            Compare up to {maxProducts} products side by side
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 min-w-full">
            
            {/* Feature Labels Column */}
            <div className="bg-gray-50 border-r border-gray-200">
              <div className="h-80 border-b border-gray-200 p-4 flex items-center">
                <span className="font-semibold text-gray-900">Products</span>
              </div>
              {comparisonFeatures.map((feature) => (
                <div
                  key={feature.key}
                  className="p-4 border-b border-gray-200 h-16 flex items-center"
                >
                  <span className="font-medium text-gray-700">{feature.label}</span>
                </div>
              ))}
              <div className="p-4 h-20 flex items-center">
                <span className="font-medium text-gray-700">Actions</span>
              </div>
            </div>

            {/* Product Columns */}
            {Array.from({ length: maxProducts }).map((_, index) => {
              const product = compareProducts[index];
              
              if (!product) {
                return (
                  <div key={`empty-${index}`} className="border-r border-gray-200 last:border-r-0">
                    <div className="h-80 border-b border-gray-200 p-4 flex items-center justify-center">
                      <button
                        onClick={addProductToComparison}
                        className="flex flex-col items-center space-y-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                      >
                        <Plus className="w-8 h-8" />
                        <span className="text-sm">Add Product</span>
                      </button>
                    </div>
                    {comparisonFeatures.map((feature) => (
                      <div
                        key={feature.key}
                        className="p-4 border-b border-gray-200 h-16 flex items-center justify-center"
                      >
                        <span className="text-gray-300">-</span>
                      </div>
                    ))}
                    <div className="p-4 h-20 flex items-center justify-center">
                      <span className="text-gray-300">-</span>
                    </div>
                  </div>
                );
              }

              const isFavorite = favorites.some(fav => fav.id === product.id);

              return (
                <div key={product.id} className="border-r border-gray-200 last:border-r-0">
                  {/* Product Card */}
                  <div className="p-4 border-b border-gray-200 h-80">
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <img
                        src={product.image || product.imageUrl}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{product.weight}</span>
                        {product.hasDiscount?.() && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {Math.round(product.getDiscountPercentage?.() || 0)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Feature Values */}
                  {comparisonFeatures.map((feature) => (
                    <div
                      key={feature.key}
                      className={`p-4 border-b border-gray-200 h-16 flex items-center ${
                        isHighlighted(product, feature) ? 'bg-green-50 border-green-200' : ''
                      }`}
                    >
                      {renderFeatureValue(product, feature)}
                    </div>
                  ))}

                  {/* Actions */}
                  <div className="p-4 h-20 flex items-center space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={loading}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-lg text-xs transition-colors duration-200 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(product)}
                      className={`p-2 rounded-lg text-xs transition-colors duration-200 ${
                        isFavorite 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductComparison;