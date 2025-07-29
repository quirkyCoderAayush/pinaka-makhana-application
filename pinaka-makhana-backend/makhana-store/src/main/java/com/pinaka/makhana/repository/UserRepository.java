package com.pinaka.makhana.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pinaka.makhana.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);
	boolean existsByEmail(String email);

	// Role-based queries
	boolean existsByRole(String role);
	List<User> findByRole(String role);

	// Admin methods
	long countByActiveTrue();

}
