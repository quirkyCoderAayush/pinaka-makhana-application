package com.pinaka.makhana.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {
    
    /**
     * Upload an image file and return the URL to access it
     * @param file The image file to upload
     * @return The URL to access the uploaded image
     */
    String uploadImage(MultipartFile file);
    
    /**
     * Delete an uploaded image file
     * @param imageUrl The URL of the image to delete
     * @return true if deleted successfully, false otherwise
     */
    boolean deleteImage(String imageUrl);
    
    /**
     * Check if the uploaded file is a valid image
     * @param file The file to validate
     * @return true if valid image, false otherwise
     */
    boolean isValidImage(MultipartFile file);
}
