package com.pinaka.makhana.config;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.pinaka.makhana.entity.User;
import com.pinaka.makhana.repository.UserRepository;

/**
 * Initializes default admin user on application startup if no admin users exist
 */
@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Default admin credentials
    private static final String DEFAULT_ADMIN_EMAIL = "anupamakashyap@pinaka.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";
    private static final String DEFAULT_ADMIN_NAME = "Anupama Kashyap";
    private static final String ADMIN_ROLE = "ROLE_ADMIN";

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createDefaultAdminIfNotExists();
    }

    private void createDefaultAdminIfNotExists() {
        try {
            logger.info("Checking for existing admin users...");
            
            // Check if any admin users exist
            boolean adminExists = userRepository.existsByRole(ADMIN_ROLE);
            
            if (!adminExists) {
                logger.info("No admin users found. Creating default admin user...");
                createDefaultAdmin();
            } else {
                logger.info("Admin user(s) already exist. Skipping admin creation.");
                logExistingAdmins();
            }
            
        } catch (Exception e) {
            logger.error("Error during admin user initialization", e);
        }
    }

    private void createDefaultAdmin() {
        try {
            // Check if user with admin email already exists
            if (userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
                logger.warn("User with admin email {} already exists but doesn't have admin role. Please check manually.", DEFAULT_ADMIN_EMAIL);
                return;
            }

            // Create admin user
            User adminUser = User.builder()
                    .name(DEFAULT_ADMIN_NAME)
                    .email(DEFAULT_ADMIN_EMAIL)
                    .password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                    .role(ADMIN_ROLE)
                    .active(true)
                    .phone("6207881797")
                    .address("Pinaka Foods Store, Lohianagar")
                    .city("Begusarai")
                    .state("Bihar")
                    .zipCode("851101")
                    .country("India")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            User savedAdmin = userRepository.save(adminUser);
            
            logger.info("✅ Default admin user created successfully!");
            logger.info("📧 Email: {}", DEFAULT_ADMIN_EMAIL);
            logger.info("🔑 Password: {}", DEFAULT_ADMIN_PASSWORD);
            logger.info("👤 User ID: {}", savedAdmin.getId());
            logger.info("🔐 Role: {}", savedAdmin.getRole());
            logger.info("⚠️  IMPORTANT: Please change the default password after first login!");
            
        } catch (Exception e) {
            logger.error("Failed to create default admin user", e);
            throw new RuntimeException("Admin user creation failed", e);
        }
    }

    private void logExistingAdmins() {
        try {
            var adminUsers = userRepository.findByRole(ADMIN_ROLE);
            logger.info("Found {} existing admin user(s):", adminUsers.size());
            
            adminUsers.forEach(admin -> {
                logger.info("  - ID: {}, Email: {}, Name: {}, Active: {}", 
                    admin.getId(), admin.getEmail(), admin.getName(), admin.isActive());
            });
            
        } catch (Exception e) {
            logger.warn("Could not retrieve existing admin users for logging", e);
        }
    }
}
