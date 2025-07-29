package com.pinaka.makhana.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinaka.makhana.entity.CartItem;
import com.pinaka.makhana.entity.Product;
import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.CartItemRepository;
import com.pinaka.makhana.repository.ProductRepository;
import com.pinaka.makhana.repository.UserRepository;
import com.pinaka.makhana.service.CartService;

// @Service
public class CartServiceImpl implements CartService {

	private final CartItemRepository cartItemRepository;
	private final UserRepository userRepository;
	private final ProductRepository productRepository;

	public CartServiceImpl(CartItemRepository cartItemRepository, UserRepository userRepository,
			ProductRepository productRepository) {
		this.cartItemRepository = cartItemRepository;
		this.userRepository = userRepository;
		this.productRepository = productRepository;
	}

	@Override
	@Transactional
	public void addToCart(String email, Long productId, int quantity) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new RuntimeException("Product not found"));

		CartItem cartItem = cartItemRepository.findByUserAndProduct(user, product).map(existing -> {
			existing.setQuantity(quantity); // Set to new quantity, don't increment
			return existing;
		}).orElse(new CartItem(user, product, quantity));

		cartItemRepository.save(cartItem);
	}

	@Override
	@Transactional
	public void removeFromCart(String email, Long productId) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new RuntimeException("Product not found"));

		cartItemRepository.deleteByUserAndProduct(user, product);
	}

	@Override
	@Transactional
	public void updateCartItem(String email, Long productId, int quantity) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new RuntimeException("Product not found"));

		CartItem cartItem = cartItemRepository.findByUserAndProduct(user, product)
				.orElseThrow(() -> new RuntimeException("Cart item not found"));

		if (quantity <= 0) {
			cartItemRepository.delete(cartItem);
		} else {
			cartItem.setQuantity(quantity);
			cartItemRepository.save(cartItem);
		}
	}

	@Override
	public List<CartItem> getUserCart(String email) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		return cartItemRepository.findByUser(user);
	}

}
