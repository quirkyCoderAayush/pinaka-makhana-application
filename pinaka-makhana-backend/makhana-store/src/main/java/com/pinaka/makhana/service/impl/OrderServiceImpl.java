package com.pinaka.makhana.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinaka.makhana.entity.CartItem;
import com.pinaka.makhana.entity.Order;
import com.pinaka.makhana.entity.OrderItem;
import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.CartItemRepository;
import com.pinaka.makhana.repository.OrderItemRepository;
import com.pinaka.makhana.repository.OrderRepository;
import com.pinaka.makhana.repository.UserRepository;
import com.pinaka.makhana.service.OrderService;

@Service
public class OrderServiceImpl implements OrderService {

	private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

	private final UserRepository userRepository;
	private final CartItemRepository cartItemRepository;
	private final OrderRepository orderRepository;
	private final OrderItemRepository orderItemRepository;

	public OrderServiceImpl(UserRepository userRepository, CartItemRepository cartItemRepository,
			OrderRepository orderRepository, OrderItemRepository orderItemRepository) {
		this.userRepository = userRepository;
		this.cartItemRepository = cartItemRepository;
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
	}

	@Override
	@Transactional
	public void placeOrder(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("❌ User not found: " + email));

		List<CartItem> cartItems = cartItemRepository.findByUser(user);
		if (cartItems.isEmpty()) {
			throw new RuntimeException("🛒 Cart is empty. Add items to cart before placing an order.");
		}

		// Create and save initial order
		Order order = new Order();
		order.setUser(user);
		order.setOrderDate(LocalDateTime.now());
		order.setStatus("PLACED");
		Order savedOrder = orderRepository.save(order);

		// Convert cart items to order items & calculate total
		List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
			OrderItem item = new OrderItem();
			item.setOrder(savedOrder);
			item.setProduct(cartItem.getProduct());
			item.setQuantity(cartItem.getQuantity());

			double unitPrice = cartItem.getProduct().getPrice();
			item.setPrice(unitPrice);
			return item;
		}).collect(Collectors.toList());

		double totalAmount = orderItems.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();

		savedOrder.setTotalAmount(Math.round(totalAmount * 100.0) / 100.0);

		orderItemRepository.saveAll(orderItems);
		orderRepository.save(savedOrder);

		cartItemRepository.deleteAll(cartItems);

		log.info("✅ Order placed successfully for user: {}", email);
	}

	@Override
	public List<Order> getOrdersByUser(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("❌ User not found: " + email));

		return orderRepository.findByUser(user);
	}

	// Admin methods implementation
	@Override
	public List<Order> getAllOrders() {
		log.info("🔍 Admin: Fetching all orders");
		List<Order> orders = orderRepository.findAll();
		log.info("✅ Found {} orders", orders.size());
		return orders;
	}

	@Override
	public Order getOrderById(Long orderId) {
		log.info("🔍 Admin: Fetching order by ID: {}", orderId);
		return orderRepository.findById(orderId).orElse(null);
	}

	@Override
	public Order updateOrderStatus(Long orderId, String status) {
		log.info("🔄 Admin: Updating order {} status to: {}", orderId, status);

		Order order = orderRepository.findById(orderId).orElse(null);
		if (order != null) {
			order.setStatus(status);
			Order savedOrder = orderRepository.save(order);
			log.info("✅ Order status updated successfully");
			return savedOrder;
		}

		log.warn("❌ Order not found: {}", orderId);
		return null;
	}

}