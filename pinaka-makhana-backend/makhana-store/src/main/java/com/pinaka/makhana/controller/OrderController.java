package com.pinaka.makhana.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinaka.makhana.entity.Order;
import com.pinaka.makhana.service.OrderService;
import com.pinaka.makhana.util.JwtUtil;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

	private final OrderService orderService;
	private final JwtUtil jwtUtil;

	public OrderController(OrderService orderService, JwtUtil jwtUtil) {
		this.orderService = orderService;
		this.jwtUtil = jwtUtil;
	}

	// 📦 Place Order (from cart)
	@PostMapping("/place")
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<String> placeOrder(@RequestHeader("Authorization") String authHeader) {
		String email = extractEmail(authHeader);
		orderService.placeOrder(email);
		return ResponseEntity.ok("Order placed successfully.");
	}

	// 📜 Get Order History
	@GetMapping("/history")
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<List<Order>> getOrderHistory(@RequestHeader("Authorization") String authHeader) {
		String email = extractEmail(authHeader);
		List<Order> orders = orderService.getOrdersByUser(email);
		return ResponseEntity.ok(orders);
	}

	// Utility: Extract email from token
	private String extractEmail(String authHeader) {
		String token = authHeader.replace("Bearer ", "");
		return jwtUtil.extractEmail(token);
	}

}
