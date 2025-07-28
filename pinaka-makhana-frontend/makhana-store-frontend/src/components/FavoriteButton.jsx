import React from 'react';
import { useFavorites } from './context/FavoritesContext';
import { useToast } from './context/ToastContext';
import { Heart } from 'lucide-react';

const FavoriteButton = ({ product, size = 'md', className = '' }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showSuccess } = useToast();

  const isProductInWishlist = isFavorite(product.id);
  
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Ensure the event doesn't bubble up to parent elements
    e.nativeEvent?.stopImmediatePropagation?.();

    toggleFavorite(product);

    if (isProductInWishlist) {
      showSuccess(`${product.name} removed from wishlist`);
    } else {
      showSuccess(`${product.name} added to wishlist`);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`
        ${buttonSizeClasses[size]}
        rounded-full
        transition-all
        duration-300
        hover:scale-110
        shadow-lg
        relative
        z-30
        touch-manipulation
        ${isProductInWishlist
          ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/25'
          : 'bg-white/90 backdrop-blur-xl text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-200/50'
        }
        ${className}
      `}
      title={isProductInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      style={{
        zIndex: 30,
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <Heart
        className={`${sizeClasses[size]} transition-all duration-300`}
        fill={isProductInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      />
    </button>
  );
};

export default FavoriteButton;
