package com.pinaka.makhana.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pinaka.makhana.entity.CartItem;
import com.pinaka.makhana.service.CartService;
import com.pinaka.makhana.util.JwtUtil;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

	private final CartService cartService;
	private final JwtUtil jwtUtil;

	public CartController(CartService cartService, JwtUtil jwtUtil) {
		this.cartService = cartService;
		this.jwtUtil = jwtUtil;
	}

	// 🛒 Add item to cart
	@PostMapping("/add")
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<String> addToCart(@RequestHeader("Authorization") String authHeader,
			@RequestParam Long productId, @RequestParam(defaultValue = "1") int quantity) {

		String email = extractEmail(authHeader);
		cartService.addToCart(email, productId, quantity);
		return ResponseEntity.ok("Product added to cart successfully");
	}

	// ❌ Remove item from cart
	@DeleteMapping("/remove/{productId}")
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<String> removeFromCart(@RequestHeader("Authorization") String authHeader,
			@PathVariable Long productId) {

		String email = extractEmail(authHeader);
		cartService.removeFromCart(email, productId);
		return ResponseEntity.ok("Product removed from cart successfully");
	}

	// 🔄 Update cart item quantity
	@PutMapping("/update/{productId}")
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<String> updateCartItem(@RequestHeader("Authorization") String authHeader,
			@PathVariable Long productId, @RequestParam int quantity) {

		String email = extractEmail(authHeader);
		cartService.updateCartItem(email, productId, quantity);
		return ResponseEntity.ok("Cart item updated successfully");
	}

	// 📦 View user's cart
	@GetMapping
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<List<CartItem>> getCartItems(@RequestHeader("Authorization") String authHeader) {

		String email = extractEmail(authHeader);
		List<CartItem> cartItems = cartService.getUserCart(email);
		return ResponseEntity.ok(cartItems);
	}

	// 🔐 Utility method to extract email from token
	private String extractEmail(String authHeader) {
		String token = authHeader.replace("Bearer ", "");
		return jwtUtil.extractEmail(token);
	}

}
