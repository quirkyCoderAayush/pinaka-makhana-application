package com.pinaka.makhana.service;

import java.util.List;

import com.pinaka.makhana.entity.Order;

public interface OrderService {

	void placeOrder(String email);

	List<Order> getOrdersByUser(String email);

}
