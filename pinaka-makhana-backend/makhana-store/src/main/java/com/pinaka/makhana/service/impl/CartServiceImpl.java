package com.pinaka.makhana.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinaka.makhana.entity.CartItem;
import com.pinaka.makhana.entity.Product;
import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.CartItemRepository;
import com.pinaka.makhana.repository.ProductRepository;
import com.pinaka.makhana.repository.UserRepository;
import com.pinaka.makhana.service.CartService;

@Service
public class CartServiceImpl implements CartService {

	private static final Logger logger = LoggerFactory.getLogger(CartServiceImpl.class);

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
		logger.info("🛒 Adding to cart - Email: {}, ProductId: {}, Quantity: {}", email, productId, quantity);

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new RuntimeException("Product not found"));

		CartItem cartItem = cartItemRepository.findByUserAndProduct(user, product).map(existing -> {
			logger.info("📝 Existing cart item found - Old quantity: {}, New quantity: {}", existing.getQuantity(), quantity);
			existing.setQuantity(quantity); // Set to new quantity (replace behavior)
			return existing;
		}).orElse(new CartItem(user, product, quantity));

		CartItem savedItem = cartItemRepository.save(cartItem);
		logger.info("✅ Cart item saved - ID: {}, Quantity: {}", savedItem.getId(), savedItem.getQuantity());
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
		logger.info("📦 Getting cart for user: {}", email);
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		List<CartItem> cartItems = cartItemRepository.findByUser(user);
		logger.info("📊 Found {} cart items for user {}", cartItems.size(), email);

		for (CartItem item : cartItems) {
			logger.info("🔍 Cart item - Product: {}, Quantity: {}", item.getProduct().getName(), item.getQuantity());
		}

		return cartItems;
	}

}
