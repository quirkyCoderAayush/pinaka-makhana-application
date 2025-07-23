package com.pinaka.makhana.dto;

public class AuthResponse {
	private String token;
	private String name;
	private String role;

	public AuthResponse(String token, String name, String role) {
	    this.token = token;
	    this.name = name;
	    this.role = role;
	}

	public String getToken() {
		return token;
	}

	public String getName() {
		return name;
	}

	public String getRole() {
		return role;
	}

	@Override
	public String toString() {
		return "AuthResponse [token=" + token + ", name=" + name + ", role=" + role + "]";
	}

}
