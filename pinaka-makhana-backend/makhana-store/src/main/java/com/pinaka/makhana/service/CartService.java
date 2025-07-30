package com.pinaka.makhana.service;

import java.util.List;

import com.pinaka.makhana.entity.CartItem;

public interface CartService {

	void addToCart(String email, Long productId, int quantity);

	void removeFromCart(String email, Long productId);

	void updateCartItem(String email, Long productId, int quantity);

	List<CartItem> getUserCart(String email);

	void clearCart(String email);

}
