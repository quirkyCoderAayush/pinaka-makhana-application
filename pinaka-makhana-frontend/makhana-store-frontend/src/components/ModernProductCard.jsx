import React, { useState } from 'react';
import { formatPrice } from '../utils/formatPrice';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuantitySelector from './QuantitySelector';
import FavoriteButton from './FavoriteButton';
import { getProductImage } from '../utils/productImageMapper';

const ModernProductCard = ({
  product,
  onAddToCart,
  loading = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product, quantity);
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  return (
    <motion.div
      className={`group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-red-200/50 ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,248,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: isHovered
          ? '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.05)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Gradient Overlay for Enhanced Visual Appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Premium Badge with Enhanced Styling */}
      {(product.isPremium || product.featured) && (
        <motion.div
          className="absolute top-4 left-4 z-20 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Sparkles className="w-3 h-3 fill-white animate-pulse" />
          <span className="uppercase tracking-wider">Premium</span>
        </motion.div>
      )}

      {/* Enhanced Wishlist Button */}
      <div className="absolute top-4 right-4 z-20">
        <FavoriteButton
          product={product}
          size="md"
          className="shadow-lg"
        />
      </div>

      {/* Compact Product Image with Modern Effects */}
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 group-hover:p-3 transition-all duration-300">
          {/* Loading State with Modern Shimmer */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
            </div>
          )}

          {/* Image with Enhanced Hover Effects */}
          <motion.img
            src={(() => {
              const imageUrl = getProductImage(product);
              console.log(`🖼️ ModernProductCard: Product ID ${product.id} using image:`, imageUrl);
              return imageUrl;
            })()}
            alt={product.name}
            className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110"
            onLoad={() => setImageLoaded(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: imageLoaded ? 1 : 0,
              scale: imageLoaded ? 1 : 0.9
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              filter: isHovered
                ? 'brightness(1.05) contrast(1.05) saturate(1.1) drop-shadow(0 5px 15px rgba(239, 68, 68, 0.1))'
                : 'brightness(1) contrast(1) saturate(1) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08))'
            }}
          />
        </div>
      </Link>

      {/* Compact Quick Action Buttons */}
      <motion.div
        className="absolute bottom-[100px] left-0 right-0 flex justify-center gap-2 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >

      </motion.div>

      {/* Compact Product Details */}
      <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
        {/* Compact Rating */}
        {product.rating && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 transition-colors duration-200 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              {product.rating}
            </span>
          </div>
        )}

        {/* Compact Product Name */}
        <Link to={`/product/${product.id}`}>
          <h3
            className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-1 line-clamp-2 hover:text-red-600 transition-colors duration-300 leading-tight"
            style={{
              background: isHovered
                ? 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)'
                : 'transparent',
              WebkitBackgroundClip: isHovered ? 'text' : 'initial',
              WebkitTextFillColor: isHovered ? 'transparent' : 'initial',
              backgroundClip: isHovered ? 'text' : 'initial'
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Compact Category Badge */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-orange-100 text-red-700">
            {product.flavor || product.category || 'Premium'}
          </span>
          {product.weight && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {product.weight}
            </span>
          )}
        </div>

        {/* Compact Price and Discount Section */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
            <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              ₹{formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                ₹{formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Compact Quantity Selector */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            min={1}
            max={10}
            size="sm"
            variant="compact"
          />
        </div>

        {/* Compact Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Button Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Adding...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 relative z-10">
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Compact Loading Overlay */}
      {loading && (
        <motion.div
          className="absolute inset-0 bg-white/95 backdrop-blur-xl flex items-center justify-center z-30 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-8 h-8 border-3 border-red-200 border-t-red-500 rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Subtle Border Glow Effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)'
        }}
      />
    </motion.div>
  );
};

export default ModernProductCard;