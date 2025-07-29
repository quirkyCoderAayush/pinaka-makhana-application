package com.pinaka.makhana.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.pinaka.makhana.dto.AuthRequest;
import com.pinaka.makhana.dto.AuthResponse;
import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.UserRepository;
import com.pinaka.makhana.service.AuthService;
import com.pinaka.makhana.util.JwtUtil;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

	private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
		logger.info("AuthServiceImpl initialized successfully");
	}

	@Override
	@Transactional
	public AuthResponse register(AuthRequest request) {
		logger.info("Attempting to register user with email: {}", request.getEmail());

		// Input validation
		validateRegistrationRequest(request);

		// Check if user already exists
		if (userRepository.existsByEmail(request.getEmail())) {
			logger.warn("Registration failed: User already exists with email: {}", request.getEmail());
			throw new IllegalArgumentException("User with this email already exists");
		}

		try {
			// Dynamically assign role based on request.isAdmin
			String role = request.getIsAdmin() ? "ROLE_ADMIN" : "ROLE_USER";
			logger.debug("Assigning role: {} to user: {}", role, request.getEmail());

			User user = new User();
			user.setName(request.getName().trim());
			user.setEmail(request.getEmail().toLowerCase().trim());
			user.setPassword(passwordEncoder.encode(request.getPassword()));
			user.setRole(role);
			user.setActive(true);

			User savedUser = userRepository.save(user);
			logger.info("User registered successfully with ID: {} and email: {}", savedUser.getId(), savedUser.getEmail());

			String token = jwtUtil.generateToken(savedUser.getEmail());

			return new AuthResponse(token, savedUser.getName(), savedUser.getRole());
		} catch (Exception e) {
			logger.error("Error during user registration for email: {}", request.getEmail(), e);
			throw new RuntimeException("Registration failed. Please try again later.");
		}
	}

	@Override
	@Transactional(readOnly = true)
	public AuthResponse login(AuthRequest request) {
		logger.info("Attempting to login user with email: {}", request.getEmail());

		// Input validation
		validateLoginRequest(request);

		try {
			User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
					.orElseThrow(() -> {
						logger.warn("Login failed: User not found with email: {}", request.getEmail());
						return new IllegalArgumentException("Invalid email or password");
					});

			if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
				logger.warn("Login failed: Invalid password for email: {}", request.getEmail());
				throw new IllegalArgumentException("Invalid email or password");
			}

			if (!user.isActive()) {
				logger.warn("Login failed: User account is inactive for email: {}", request.getEmail());
				throw new IllegalArgumentException("Account is inactive. Please contact support.");
			}

			logger.info("User logged in successfully: {}", user.getEmail());
			String token = jwtUtil.generateToken(user.getEmail());

			return new AuthResponse(token, user.getName(), user.getRole());
		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			logger.error("Error during user login for email: {}", request.getEmail(), e);
			throw new RuntimeException("Login failed. Please try again later.");
		}
	}

	/**
	 * Helper method to get user from token (not part of interface)
	 */
	@Transactional(readOnly = true)
	public User getUserFromToken(String token) {
		logger.debug("Extracting user from token");

		// Input validation
		if (!StringUtils.hasText(token)) {
			logger.warn("getUserFromToken called with empty or null token");
			throw new IllegalArgumentException("Token cannot be null or empty");
		}

		try {
			// Remove "Bearer " prefix if present
			String cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

			// Validate token format and expiration
			if (!jwtUtil.validateToken(cleanToken)) {
				logger.warn("Invalid or expired token provided");
				throw new IllegalArgumentException("Invalid or expired token");
			}

			String email = jwtUtil.extractEmail(cleanToken);
			logger.debug("Extracted email from token: {}", email);

			return userRepository.findByEmail(email)
					.orElseThrow(() -> {
						logger.warn("User not found for email extracted from token: {}", email);
						return new IllegalArgumentException("User not found");
					});
		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			logger.error("Error extracting user from token", e);
			throw new RuntimeException("Failed to extract user from token");
		}
	}

	/**
	 * Extracts email from authorization header
	 */
	@Override
	public String getEmailFromToken(String authHeader) {
		logger.debug("Extracting email from authorization header");

		if (!StringUtils.hasText(authHeader)) {
			logger.warn("getEmailFromToken called with empty or null auth header");
			throw new IllegalArgumentException("Authorization header cannot be null or empty");
		}

		if (!authHeader.startsWith("Bearer ")) {
			logger.warn("Invalid authorization header format");
			throw new IllegalArgumentException("Invalid authorization header format");
		}

		try {
			String token = authHeader.substring(7);

			if (!jwtUtil.validateToken(token)) {
				logger.warn("Invalid or expired token in authorization header");
				throw new IllegalArgumentException("Invalid or expired token");
			}

			String email = jwtUtil.extractEmail(token);
			logger.debug("Successfully extracted email from token: {}", email);
			return email;
		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			logger.error("Error extracting email from authorization header", e);
			throw new RuntimeException("Failed to extract email from token");
		}
	}

	/**
	 * Retrieves user by email
	 */
	@Override
	@Transactional(readOnly = true)
	public User getUserByEmail(String email) {
		logger.debug("Retrieving user by email: {}", email);

		if (!StringUtils.hasText(email)) {
			logger.warn("getUserByEmail called with empty or null email");
			throw new IllegalArgumentException("Email cannot be null or empty");
		}

		if (!isValidEmail(email)) {
			logger.warn("getUserByEmail called with invalid email format: {}", email);
			throw new IllegalArgumentException("Invalid email format");
		}

		try {
			return userRepository.findByEmail(email.toLowerCase().trim())
					.orElseThrow(() -> {
						logger.warn("User not found with email: {}", email);
						return new IllegalArgumentException("User not found");
					});
		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			logger.error("Error retrieving user by email: {}", email, e);
			throw new RuntimeException("Failed to retrieve user");
		}
	}

	/**
	 * Validates registration request input
	 */
	private void validateRegistrationRequest(AuthRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("Registration request cannot be null");
		}

		if (!StringUtils.hasText(request.getName())) {
			throw new IllegalArgumentException("Name is required");
		}

		if (!StringUtils.hasText(request.getEmail())) {
			throw new IllegalArgumentException("Email is required");
		}

		if (!StringUtils.hasText(request.getPassword())) {
			throw new IllegalArgumentException("Password is required");
		}

		// Email format validation
		if (!isValidEmail(request.getEmail())) {
			throw new IllegalArgumentException("Invalid email format");
		}

		// Password strength validation
		if (request.getPassword().length() < 6) {
			throw new IllegalArgumentException("Password must be at least 6 characters long");
		}

		// Name length validation
		if (request.getName().trim().length() < 2) {
			throw new IllegalArgumentException("Name must be at least 2 characters long");
		}
	}

	/**
	 * Validates login request input
	 */
	private void validateLoginRequest(AuthRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("Login request cannot be null");
		}

		if (!StringUtils.hasText(request.getEmail())) {
			throw new IllegalArgumentException("Email is required");
		}

		if (!StringUtils.hasText(request.getPassword())) {
			throw new IllegalArgumentException("Password is required");
		}

		// Email format validation
		if (!isValidEmail(request.getEmail())) {
			throw new IllegalArgumentException("Invalid email format");
		}
	}

	/**
	 * Simple email validation
	 */
	private boolean isValidEmail(String email) {
		return email != null &&
			   email.contains("@") &&
			   email.contains(".") &&
			   email.length() > 5 &&
			   !email.startsWith("@") &&
			   !email.endsWith("@") &&
			   !email.startsWith(".") &&
			   !email.endsWith(".");
	}
}
