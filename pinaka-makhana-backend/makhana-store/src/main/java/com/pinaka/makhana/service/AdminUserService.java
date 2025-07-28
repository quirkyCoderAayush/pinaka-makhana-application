package com.pinaka.makhana.service;

import java.util.List;
import java.util.Map;

import com.pinaka.makhana.entity.User;

public interface AdminUserService {
    
    List<User> getAllUsers();
    
    User getUserById(Long userId);
    
    User updateUserStatus(Long userId, Boolean active);
    
    User updateUserRole(Long userId, String role);
    
    Map<String, Object> getUserStatistics(Long userId);
    
    List<Map<String, Object>> getAllUsersWithStatistics();
    
    long getTotalUserCount();
    
    long getActiveUserCount();
    
    List<User> getRecentUsers(int limit);
}
