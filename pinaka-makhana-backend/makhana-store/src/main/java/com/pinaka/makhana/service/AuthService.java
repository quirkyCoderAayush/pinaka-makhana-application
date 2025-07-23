package com.pinaka.makhana.service;

import com.pinaka.makhana.dto.AuthRequest;
import com.pinaka.makhana.dto.AuthResponse;
import com.pinaka.makhana.entity.User;

public interface AuthService {
	AuthResponse register(AuthRequest request);

	AuthResponse login(AuthRequest request);

	String getEmailFromToken(String authHeader);

	User getUserByEmail(String email);
}
