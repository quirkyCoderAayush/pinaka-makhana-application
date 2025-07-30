package com.pinaka.makhana.service.impl;

import java.io.IOException;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pinaka.makhana.service.ImageUploadService;

@Service
public class ImageUploadServiceImpl implements ImageUploadService {

    private static final Logger logger = LoggerFactory.getLogger(ImageUploadServiceImpl.class);

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        try {
            logger.info("🔄 Processing image upload: {} (size: {} bytes)", file.getOriginalFilename(), file.getSize());
            
            // Convert to base64 for storage
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
            logger.error("❌ Failed to process image upload", e);
            throw e;
        } catch (Exception e) {
            logger.error("❌ Unexpected error during image processing", e);
            throw new IOException("Failed to process image", e);
        }
    }
}
