import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await ApiService.getCart();
      setCartItems(cartData || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      showInfo('Please login to add items to cart');
      // Redirect to login page after a brief delay for toast to show
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }

    try {
      setLoading(true);

      await ApiService.addToCart(product.id, quantity);
      await loadCart(); // Reload cart to get updated data

      showSuccess(`${product.name} (${quantity}) added to cart!`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      showError('Failed to add item to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await ApiService.removeFromCart(productId);
      await loadCart(); // Reload cart to get updated data
      showSuccess('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      showError('Failed to remove item from cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      await ApiService.updateCartItem(productId, quantity);
      await loadCart(); // Reload cart to get updated data
      showSuccess('Cart updated');
    } catch (error) {
      console.error('Failed to update cart item:', error);
      showError('Failed to update cart item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await ApiService.clearCart();
      setCartItems([]);
      showSuccess('Cart cleared successfully');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      showError('Failed to clear cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
