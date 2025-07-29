package com.pinaka.makhana.util;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {

	@Value("${jwt.secret}")
	private String base64Secret;

	private Key key;

	@PostConstruct
	public void init() {
		byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
		key = Keys.hmacShaKeyFor(keyBytes);
	}

	public String generateToken(String email) {
		return Jwts.builder().setSubject(email).setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
				.signWith(key, SignatureAlgorithm.HS512).compact();
	}

	public String generateToken(String email, String role, String name) {
		return Jwts.builder()
				.setSubject(email)
				.claim("role", role)
				.claim("name", name)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
				.signWith(key, SignatureAlgorithm.HS512).compact();
	}

	public String extractEmail(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
	}

	public boolean validateToken(String token) {
		try {
			Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
			return true;
		} catch (JwtException e) {
			return false;
		}
	}
}
