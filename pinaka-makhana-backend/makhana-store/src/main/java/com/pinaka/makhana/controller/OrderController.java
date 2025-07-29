package com.pinaka.makhana.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinaka.makhana.entity.Order;
import com.pinaka.makhana.service.OrderService;
import com.pinaka.makhana.util.JwtUtil;

// @RestController
// @RequestMapping("/api/orders")
// @CrossOrigin(origins = "*")
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

	// 🔧 Admin: Get All Orders
	@GetMapping("/admin/all")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<Order>> getAllOrdersForAdmin() {
		List<Order> orders = orderService.getAllOrders();
		return ResponseEntity.ok(orders);
	}

	// 🔧 Admin: Get Order by ID
	@GetMapping("/admin/{orderId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Order> getOrderByIdForAdmin(@PathVariable Long orderId) {
		Order order = orderService.getOrderById(orderId);
		if (order != null) {
			return ResponseEntity.ok(order);
		}
		return ResponseEntity.notFound().build();
	}

	// 🔧 Admin: Update Order Status
	@PutMapping("/admin/{orderId}/status")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> statusUpdate) {
		String newStatus = statusUpdate.get("status");
		Order updatedOrder = orderService.updateOrderStatus(orderId, newStatus);
		if (updatedOrder != null) {
			return ResponseEntity.ok(updatedOrder);
		}
		return ResponseEntity.notFound().build();
	}

	// Utility: Extract email from token
	private String extractEmail(String authHeader) {
		String token = authHeader.replace("Bearer ", "");
		return jwtUtil.extractEmail(token);
	}

}
