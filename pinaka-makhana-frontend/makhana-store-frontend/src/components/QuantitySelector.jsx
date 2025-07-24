import React from 'react';

const QuantitySelector = ({ 
  quantity = 1, 
  onQuantityChange, 
  min = 1, 
  max = 10, 
  disabled = false,
  size = 'md' 
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

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || min;
    if (value >= min && value <= max && !disabled) {
      onQuantityChange(value);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const inputSizeClasses = {
    sm: 'h-8 w-16 text-sm',
    md: 'h-10 w-20 text-base', 
    lg: 'h-12 w-24 text-lg'
  };

  return (
    <div className="flex items-center space-x-1 border border-gray-300 rounded-lg bg-white">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        className={`${sizeClasses[size]} flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-lg`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      
      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        className={`${inputSizeClasses[size]} text-center border-0 focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium`}
      />
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        className={`${sizeClasses[size]} flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-lg`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};

export default QuantitySelector;
