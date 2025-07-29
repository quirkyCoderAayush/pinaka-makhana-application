package com.pinaka.makhana.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.service.AdminUserService;

// @RestController
// @RequestMapping("/api/admin/users")
// @CrossOrigin(origins = "*")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // 👥 Get All Users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // 👤 Get User by ID
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = adminUserService.getUserById(userId);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    // 🔄 Update User Status
    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, Boolean> statusUpdate) {
        Boolean active = statusUpdate.get("active");
        User updatedUser = adminUserService.updateUserStatus(userId, active);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    // 🔄 Update User Role
    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> roleUpdate) {
        String role = roleUpdate.get("role");
        User updatedUser = adminUserService.updateUserRole(userId, role);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    // 📊 Get User Statistics
    @GetMapping("/{userId}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        Map<String, Object> stats = adminUserService.getUserStatistics(userId);
        if (stats != null) {
            return ResponseEntity.ok(stats);
        }
        return ResponseEntity.notFound().build();
    }

    // 📊 Get All Users with Statistics
    @GetMapping("/with-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsersWithStats() {
        List<Map<String, Object>> usersWithStats = adminUserService.getAllUsersWithStatistics();
        return ResponseEntity.ok(usersWithStats);
    }
}
