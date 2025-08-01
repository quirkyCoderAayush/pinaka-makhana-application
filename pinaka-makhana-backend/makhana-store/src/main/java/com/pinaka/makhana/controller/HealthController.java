package com.pinaka.makhana.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check endpoint for deployment platforms
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        System.out.println("🏥 Health check endpoint called at: " + LocalDateTime.now());
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Pinaka Makhana Backend");
        response.put("version", "1.0.0");
        response.put("port", System.getProperty("server.port", "10000"));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        System.out.println("🏠 Root endpoint called at: " + LocalDateTime.now());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Pinaka Makhana API is running!");
        response.put("status", "healthy");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        System.out.println("🏓 Ping endpoint called at: " + LocalDateTime.now());
        return ResponseEntity.ok("pong");
    }
}
