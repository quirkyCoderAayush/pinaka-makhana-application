package com.pinaka.makhana.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pinaka.makhana.dto.AuthRequest;
import com.pinaka.makhana.dto.AuthResponse;
import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.UserRepository;
import com.pinaka.makhana.service.AuthService;
import com.pinaka.makhana.util.JwtUtil;

@Service
public class AuthServiceImpl implements AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}

	@Override
	public AuthResponse register(AuthRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new RuntimeException("User already exists");
		}

		// ✅ Dynamically assign role based on request.isAdmin
		String role = request.getIsAdmin() ? "ROLE_ADMIN" : "ROLE_USER";

		User user = User.builder().name(request.getName()).email(request.getEmail())
				.password(passwordEncoder.encode(request.getPassword())).role(role).build();

		userRepository.save(user);

		String token = jwtUtil.generateToken(user.getEmail());

		return new AuthResponse(token, user.getName(), user.getRole());
	}

	@Override
	public AuthResponse login(AuthRequest request) {
		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new RuntimeException("Invalid email or password"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new RuntimeException("Invalid email or password");
		}

		return new AuthResponse(jwtUtil.generateToken(user.getEmail()), user.getName(), user.getRole());
	}

	public String getEmailFromToken(String authHeader) {
		String token = authHeader.substring(7);
		return jwtUtil.extractEmail(token);
	}

	public User getUserByEmail(String email) {
		return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
	}
}
