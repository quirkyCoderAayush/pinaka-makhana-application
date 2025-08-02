import React from 'react';

const QuantitySelector = ({ 
  quantity = 1, 
  onQuantityChange, 
  min = 1, 
  max = 10, 
  disabled = false,
  size = 'md',
  variant = 'default' // 'default', 'compact', or 'mini' for extremely compact version
}) => {
  const handleIncrement = () => {
    if (quantity < max && !disabled) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > min && !disabled) {
      onQuantityChange(quantity - 1);
    }
  };

  // Input change handler removed as we're only using buttons now

  // Size classes for buttons based on size and variant
  const sizeClasses = {
    sm: variant === 'mini' ? 'h-5 w-5 text-xs' : 
        variant === 'compact' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm',
    md: variant === 'mini' ? 'h-6 w-6 text-xs' : 
        variant === 'compact' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base',
    lg: variant === 'mini' ? 'h-8 w-8 text-sm' : 
        variant === 'compact' ? 'h-10 w-10 text-base' : 'h-12 w-12 text-lg'
  };

  // Size classes for input based on size and variant - now with flex-1 to fill space
  const inputSizeClasses = {
    sm: variant === 'mini' ? 'h-5 flex-1 text-xs' :
        variant === 'compact' ? 'h-6 flex-1 text-xs' : 'h-8 flex-1 text-sm',
    md: variant === 'mini' ? 'h-6 flex-1 text-xs' :
        variant === 'compact' ? 'h-8 flex-1 text-sm' : 'h-10 flex-1 text-base',
    lg: variant === 'mini' ? 'h-8 flex-1 text-sm' :
        variant === 'compact' ? 'h-10 flex-1 text-base' : 'h-12 flex-1 text-lg'
  };
  
  // Enhanced container classes with red-orange gradient theme
  const containerClasses = variant === 'mini'
    ? 'inline-flex items-center gap-0 border border-red-200/50 rounded-lg bg-gradient-to-r from-red-50/80 to-orange-50/80 shadow-lg w-20 hover:from-red-100/90 hover:to-orange-100/90 transition-all duration-300'
    : variant === 'compact'
      ? 'inline-flex items-center gap-0 border border-orange-200/60 rounded-xl bg-gradient-to-r from-red-50/70 to-orange-50/70 shadow-xl w-24 hover:from-red-100/80 hover:to-orange-100/80 transition-all duration-300'
      : 'inline-flex items-center gap-0 border border-red-300/40 rounded-xl bg-gradient-to-r from-red-50/60 to-orange-50/60 shadow-2xl w-28 hover:from-red-100/70 hover:to-orange-100/70 transition-all duration-300 hover:scale-105';

  // SVG size based on component size and variant
  const svgSize = {
    sm: variant === 'mini' ? 'w-2.5 h-2.5' : 
        variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4',
    md: variant === 'mini' ? 'w-3 h-3' : 
        variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4',
    lg: variant === 'mini' ? 'w-3.5 h-3.5' : 
        variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'
  };

  return (
    <div className={containerClasses}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        className={`${sizeClasses[size]} flex items-center justify-center text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 rounded-l-xl border-r border-red-200/40 hover:shadow-lg hover:scale-110 active:scale-95`}
      >
        <svg className={svgSize[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>

      <div className={`${inputSizeClasses[size]} flex items-center justify-center font-bold text-red-700 bg-gradient-to-r from-red-50/90 to-orange-50/90 border-r border-red-200/40`}>
        {quantity}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        className={`${sizeClasses[size]} flex items-center justify-center text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 rounded-r-xl hover:shadow-lg hover:scale-110 active:scale-95`}
      >
        <svg className={svgSize[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};

export default QuantitySelector;
