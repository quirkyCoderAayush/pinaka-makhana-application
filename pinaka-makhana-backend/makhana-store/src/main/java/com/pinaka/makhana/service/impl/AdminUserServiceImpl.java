package com.pinaka.makhana.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinaka.makhana.entity.Order;
import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.OrderRepository;
import com.pinaka.makhana.repository.UserRepository;
import com.pinaka.makhana.service.AdminUserService;

@Service
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private static final Logger log = LoggerFactory.getLogger(AdminUserServiceImpl.class);

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminUserServiceImpl(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public List<User> getAllUsers() {
        log.info("🔍 Admin: Fetching all registered users");
        List<User> users = userRepository.findAll();
        log.info("✅ Found {} registered users", users.size());
        return users;
    }

    @Override
    public User getUserById(Long userId) {
        log.info("🔍 Admin: Fetching user by ID: {}", userId);
        return userRepository.findById(userId).orElse(null);
    }

    @Override
    public User updateUserStatus(Long userId, Boolean active) {
        log.info("🔄 Admin: Updating user {} status to: {}", userId, active);
        
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setActive(active);
            user.setUpdatedAt(LocalDateTime.now());
            User savedUser = userRepository.save(user);
            log.info("✅ User status updated successfully");
            return savedUser;
        }
        
        log.warn("❌ User not found: {}", userId);
        return null;
    }

    @Override
    public User updateUserRole(Long userId, String role) {
        log.info("🔄 Admin: Updating user {} role to: {}", userId, role);
        
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            // Ensure role has proper prefix
            String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
            user.setRole(normalizedRole);
            user.setUpdatedAt(LocalDateTime.now());
            User savedUser = userRepository.save(user);
            log.info("✅ User role updated successfully");
            return savedUser;
        }
        
        log.warn("❌ User not found: {}", userId);
        return null;
    }

    @Override
    public Map<String, Object> getUserStatistics(Long userId) {
        log.info("📊 Admin: Calculating statistics for user: {}", userId);
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("❌ User not found: {}", userId);
            return null;
        }

        List<Order> userOrders = orderRepository.findByUser(user);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("userId", userId);
        stats.put("userName", user.getName());
        stats.put("userEmail", user.getEmail());
        stats.put("userRole", user.getRole());
        stats.put("userActive", user.isActive());
        stats.put("joinDate", user.getCreatedAt());
        stats.put("lastUpdated", user.getUpdatedAt());
        
        // Order statistics
        stats.put("totalOrders", userOrders.size());
        
        double totalSpent = userOrders.stream()
            .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
            .sum();
        stats.put("totalSpent", totalSpent);
        
        double averageOrderValue = userOrders.isEmpty() ? 0.0 : totalSpent / userOrders.size();
        stats.put("averageOrderValue", averageOrderValue);
        
        // Last order date
        LocalDateTime lastOrderDate = userOrders.stream()
            .map(Order::getOrderDate)
            .filter(date -> date != null)
            .max(LocalDateTime::compareTo)
            .orElse(null);
        stats.put("lastOrderDate", lastOrderDate);
        
        // Order status breakdown
        Map<String, Long> orderStatusCounts = new HashMap<>();
        userOrders.forEach(order -> {
            String status = order.getStatus() != null ? order.getStatus() : "unknown";
            orderStatusCounts.put(status, orderStatusCounts.getOrDefault(status, 0L) + 1);
        });
        stats.put("orderStatusBreakdown", orderStatusCounts);
        
        log.info("✅ Statistics calculated for user {}: {} orders, ${} total spent", 
                userId, userOrders.size(), totalSpent);
        
        return stats;
    }

    @Override
    public List<Map<String, Object>> getAllUsersWithStatistics() {
        log.info("📊 Admin: Fetching all users with comprehensive statistics");
        
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> usersWithStats = new ArrayList<>();
        
        for (User user : allUsers) {
            Map<String, Object> userWithStats = getUserStatistics(user.getId());
            if (userWithStats != null) {
                // Add additional user details
                userWithStats.put("phone", user.getPhone());
                userWithStats.put("address", user.getAddress());
                userWithStats.put("city", user.getCity());
                userWithStats.put("state", user.getState());
                userWithStats.put("zipCode", user.getZipCode());
                userWithStats.put("country", user.getCountry());
                
                usersWithStats.add(userWithStats);
            }
        }
        
        // Sort by total spent (descending) and then by join date (newest first)
        usersWithStats.sort((a, b) -> {
            Double totalSpentA = (Double) a.get("totalSpent");
            Double totalSpentB = (Double) b.get("totalSpent");
            
            if (!totalSpentB.equals(totalSpentA)) {
                return totalSpentB.compareTo(totalSpentA);
            }
            
            LocalDateTime joinDateA = (LocalDateTime) a.get("joinDate");
            LocalDateTime joinDateB = (LocalDateTime) b.get("joinDate");
            
            if (joinDateA != null && joinDateB != null) {
                return joinDateB.compareTo(joinDateA);
            }
            
            return 0;
        });
        
        log.info("✅ Compiled statistics for {} users", usersWithStats.size());
        return usersWithStats;
    }

    @Override
    public long getTotalUserCount() {
        return userRepository.count();
    }

    @Override
    public long getActiveUserCount() {
        return userRepository.countByActiveTrue();
    }

    @Override
    public List<User> getRecentUsers(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return userRepository.findAll(pageRequest).getContent();
    }
}
