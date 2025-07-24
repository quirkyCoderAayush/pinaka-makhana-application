import React from 'react';
import { useFavorites } from './context/FavoritesContext';
import { useToast } from './context/ToastContext';

const FavoriteButton = ({ product, size = 'md', className = '' }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showSuccess } = useToast();
  
  const isProductFavorite = isFavorite(product.id);
  
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

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleFavorite(product);
    
    if (isProductFavorite) {
      showSuccess(`${product.name} removed from favorites`);
    } else {
      showSuccess(`${product.name} added to favorites`);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`
        ${buttonSizeClasses[size]} 
        rounded-full 
        transition-all 
        duration-300 
        hover:scale-110 
        ${isProductFavorite 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
        }
        ${className}
      `}
      title={isProductFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg 
        className={`${sizeClasses[size]} transition-all duration-300`}
        fill={isProductFavorite ? 'currentColor' : 'none'}
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;
