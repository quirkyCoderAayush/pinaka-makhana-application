package com.pinaka.makhana.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinaka.makhana.dto.AuthRequest;
import com.pinaka.makhana.dto.AuthResponse;
import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.UserRepository;
import com.pinaka.makhana.service.AuthService;
import com.pinaka.makhana.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	public AuthController(AuthService authService, UserRepository userRepository, JwtUtil jwtUtil,
			PasswordEncoder passwordEncoder) {
		super();
		this.authService = authService;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
		AuthResponse response = authService.register(request);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
		AuthResponse response = authService.login(request);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/profile")
	public ResponseEntity<User> getProfile(@RequestHeader("Authorization") String authHeader) {
		String email = authService.getEmailFromToken(authHeader); // optional helper
		User user = authService.getUserByEmail(email);
		return ResponseEntity.ok(user);
	}

}
