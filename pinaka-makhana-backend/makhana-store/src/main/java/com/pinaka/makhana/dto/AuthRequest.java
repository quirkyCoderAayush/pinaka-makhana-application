package com.pinaka.makhana.dto;

public class AuthRequest {
	private String name;
	private String email;
	private String password;
	private boolean isAdmin;

	public AuthRequest() {
	}

	public AuthRequest(String name, String email, String password, boolean isAdmin) {
		super();
		this.name = name;
		this.email = email;
		this.password = password;
		this.isAdmin = isAdmin;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean getIsAdmin() {
		return isAdmin;
	}

	public void setIsAdmin(boolean isAdmin) {
		this.isAdmin = isAdmin;
	}

	@Override
	public String toString() {
		return "AuthRequest [name=" + name + ", email=" + email + ", password=" + password + ", isAdmin=" + isAdmin
				+ "]";
	}

}
