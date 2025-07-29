package com.pinaka.makhana.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pinaka.makhana.service.FileUploadService;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);
    
    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    /**
     * Upload an image file
     */
    @PostMapping("/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {


        try {
            // Validate file
            if (!fileUploadService.isValidImage(file)) {

                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid image file. Please upload a valid image (JPG, PNG, GIF, WebP) under 10MB.");
                return ResponseEntity.badRequest().body(error);
            }

            // Upload file
            String imageUrl = fileUploadService.uploadImage(file);

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image uploaded successfully");
            response.put("imageUrl", imageUrl);
            response.put("filename", file.getOriginalFilename());
            response.put("size", file.getSize());


            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            logger.error("Image upload failed", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload image");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get upload information and limits
     */
    @PostMapping("/info")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUploadInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("maxFileSize", "10MB");
        info.put("allowedFormats", new String[]{"JPG", "JPEG", "PNG", "GIF", "WebP"});
        info.put("uploadEndpoint", "/api/upload/image");
        
        return ResponseEntity.ok(info);
    }
}
