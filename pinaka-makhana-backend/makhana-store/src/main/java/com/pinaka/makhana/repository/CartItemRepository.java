package com.pinaka.makhana.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pinaka.makhana.entity.CartItem;
import com.pinaka.makhana.entity.Product;
import com.pinaka.makhana.entity.User;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

	List<CartItem> findByUser(User user);

	Optional<CartItem> findByUserAndProduct(User user, Product product);

	void deleteByUserAndProduct(User user, Product product);

}
