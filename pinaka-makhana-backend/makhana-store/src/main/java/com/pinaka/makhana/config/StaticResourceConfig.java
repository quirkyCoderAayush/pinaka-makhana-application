package com.pinaka.makhana.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration for serving static files (uploaded images)
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/images/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve uploaded images
        String uploadPath = Paths.get(uploadDir).toAbsolutePath().toUri().toString();
        
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(3600); // Cache for 1 hour
    }
}
