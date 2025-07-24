package com.pinaka.makhana.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.UserRepository;
import com.pinaka.makhana.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.GenericFilter;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtFilter extends GenericFilter {

	private static final long serialVersionUID = 1L;

	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;

	public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository) {
		this.jwtUtil = jwtUtil;
		this.userRepository = userRepository;
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {

		HttpServletRequest http = (HttpServletRequest) request;
		String path = http.getRequestURI();

		if ((path.equals("/api/products") && http.getMethod().equals("GET"))
				|| (path.startsWith("/api/products/") && http.getMethod().equals("GET"))
				|| path.startsWith("/api/auth")) {
			chain.doFilter(request, response);
			return;
		}

		String authHeader = http.getHeader("Authorization");

		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String jwt = authHeader.substring(7);
			try {
				if (jwtUtil.validateToken(jwt)) {
					String email = jwtUtil.extractEmail(jwt);

					User user = userRepository.findByEmail(email).orElseThrow();
					List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.getRole()));

					UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(email, null,
							authorities);
					token.setDetails(new WebAuthenticationDetailsSource().buildDetails(http));

					SecurityContextHolder.getContext().setAuthentication(token);
				}
			} catch (Exception e) {
				System.err.println("Invalid JWT: " + e.getMessage());
			}
		}

		chain.doFilter(request, response);
	}
}
