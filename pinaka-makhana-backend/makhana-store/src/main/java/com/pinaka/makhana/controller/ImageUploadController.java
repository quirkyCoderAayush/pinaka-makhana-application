package com.pinaka.makhana.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pinaka.makhana.service.ImageUploadService;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class ImageUploadController {

    private static final Logger logger = LoggerFactory.getLogger(ImageUploadController.class);
    private final ImageUploadService imageUploadService;

    public ImageUploadController(ImageUploadService imageUploadService) {
        this.imageUploadService = imageUploadService;
    }

    @PostMapping("/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("📸 Uploading image: {} (size: {} bytes)", file.getOriginalFilename(), file.getSize());
            
            // Validate file
            if (file.isEmpty()) {
                logger.warn("❌ Empty file uploaded");
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File is empty");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                logger.warn("❌ Invalid file type: {}", contentType);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File must be an image");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                logger.warn("❌ File too large: {} bytes", file.getSize());
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File size must be less than 5MB");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String imageUrl = imageUploadService.uploadImage(file);
            logger.info("✅ Image uploaded successfully: {}", imageUrl);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Image uploaded successfully");
            
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("❌ Failed to upload image", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        } catch (Exception e) {
            logger.error("❌ Unexpected error during image upload", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unexpected error occurred");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
