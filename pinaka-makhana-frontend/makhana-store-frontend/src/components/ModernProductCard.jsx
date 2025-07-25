import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModernProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite = false,
  loading = false,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(product);
  };

  return (
    <motion.div
      className={`group relative bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-500 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Premium Badge */}
      {product.isPremium && (
        <motion.div 
          className="absolute top-3 left-3 z-10 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="w-3 h-3 inline mr-1" />
          Premium
        </motion.div>
      )}

      {/* Favorite Button */}
      <motion.button
        onClick={handleToggleFavorite}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
          isFavorite 
            ? 'bg-primary-500 text-white shadow-glow' 
            : 'bg-white/80 text-gray-600 hover:bg-primary-500 hover:text-white'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </motion.button>

      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
          )}
          <motion.img
            src={product.image || product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onLoad={() => setImageLoaded(true)}
            initial={{ scale: 1.1 }}
            animate={{ scale: imageLoaded ? 1 : 1.1 }}
          />
          
          {/* Overlay on Hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Quick Actions */}
          <motion.div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: isHovered ? 0 : 20, 
              opacity: isHovered ? 1 : 0 
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              onClick={handleAddToCart}
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-4 h-4" />
            </motion.button>
            <Link 
              to={`/product/${product.id}`}
              className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4">
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center text-accent-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) 
                      ? 'fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.rating})
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 hover:text-primary-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Flavor/Weight */}
        {(product.flavor || product.weight) && (
          <p className="text-xs text-gray-500 mb-2">
            {product.flavor} {product.weight && `• ${product.weight}`}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-primary-600 text-lg">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          
          {/* Discount Badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Add to Cart Button (Alternative Layout) */}
        <motion.button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full mt-3 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <motion.div 
          className="absolute inset-0 bg-white/80 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ModernProductCard;