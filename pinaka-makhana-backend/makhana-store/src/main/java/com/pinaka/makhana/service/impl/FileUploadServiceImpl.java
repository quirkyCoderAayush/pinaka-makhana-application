package com.pinaka.makhana.service.impl;

import java.io.IOException;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pinaka.makhana.service.FileUploadService;

@Service
public class FileUploadServiceImpl implements FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadServiceImpl.class);
    

    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Override
    public String uploadImage(MultipartFile file) {
        logger.info("🔄 Starting image upload for file: {}", file.getOriginalFilename());

        try {
            // Validate the file
            if (!isValidImage(file)) {
                throw new IllegalArgumentException("Invalid image file");
            }

            // For deployment, convert to base64 instead of saving to disk
            // This works better on cloud platforms like Render
            byte[] imageBytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // Get content type
            String contentType = file.getContentType();
            if (contentType == null) {
                contentType = "image/jpeg"; // Default fallback
            }

            // Create data URL
            String dataUrl = "data:" + contentType + ";base64," + base64Image;

            logger.info("✅ Image converted to base64 successfully (length: {} characters)", dataUrl.length());
            return dataUrl;

        } catch (IOException e) {
            logger.error("❌ Failed to upload image: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @Override
    public boolean deleteImage(String imageUrl) {
        // For base64 images, we don't need to delete files from disk
        // Just return true to indicate "deletion" was successful
        logger.info("🗑️ Base64 image deletion requested (no file to delete): {}",
                   imageUrl != null && imageUrl.length() > 50 ? imageUrl.substring(0, 50) + "..." : imageUrl);
        return true;
    }

    @Override
    public boolean isValidImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            logger.warn("⚠️ File is null or empty");
            return false;
        }
        
        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            logger.warn("⚠️ File size too large: {} bytes (max: {} bytes)", file.getSize(), MAX_FILE_SIZE);
            return false;
        }
        
        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            logger.warn("⚠️ Original filename is null");
            return false;
        }
        
        String extension = FilenameUtils.getExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            logger.warn("⚠️ Invalid file extension: {} (allowed: {})", extension, ALLOWED_EXTENSIONS);
            return false;
        }
        
        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            logger.warn("⚠️ Invalid content type: {}", contentType);
            return false;
        }
        
        logger.debug("✅ File validation passed: {}", originalFilename);
        return true;
    }

}
