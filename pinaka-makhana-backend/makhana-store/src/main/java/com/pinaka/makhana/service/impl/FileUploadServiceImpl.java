package com.pinaka.makhana.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.pinaka.makhana.service.FileUploadService;

@Service
public class FileUploadServiceImpl implements FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadServiceImpl.class);
    
    @Value("${app.upload.dir:uploads/images/}")
    private String uploadDir;
    
    @Value("${server.port:8081}")
    private String serverPort;
    
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
            
            // Create upload directory if it doesn't exist
            createUploadDirectoryIfNotExists();
            
            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = FilenameUtils.getExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
            
            // Save file to disk
            Path targetLocation = Paths.get(uploadDir).resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Generate URL to access the file
            String imageUrl = generateImageUrl(uniqueFilename);
            
            logger.info("✅ Image uploaded successfully: {}", imageUrl);
            return imageUrl;
            
        } catch (IOException e) {
            logger.error("❌ Failed to upload image: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @Override
    public boolean deleteImage(String imageUrl) {
        try {
            if (imageUrl == null || !imageUrl.contains("/uploads/images/")) {
                return false; // Not our uploaded image
            }
            
            // Extract filename from URL
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir).resolve(filename);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("🗑️ Deleted image file: {}", filename);
                return true;
            }
            
            return false;
        } catch (IOException e) {
            logger.error("❌ Failed to delete image: {}", e.getMessage(), e);
            return false;
        }
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
    
    private void createUploadDirectoryIfNotExists() throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            logger.info("📁 Created upload directory: {}", uploadPath.toAbsolutePath());
        }
    }
    
    private String generateImageUrl(String filename) {
        // Generate URL that can be accessed via the static file serving endpoint
        return String.format("http://localhost:%s/uploads/images/%s", serverPort, filename);
    }
}
