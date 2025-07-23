package com.pinaka.makhana.service;

import java.util.List;

import com.pinaka.makhana.entity.CartItem;

public interface CartService {

	void addToCart(String email, Long productId, int quantity);

	void removeFromCart(String email, Long productId);

	List<CartItem> getUserCart(String email);

}
