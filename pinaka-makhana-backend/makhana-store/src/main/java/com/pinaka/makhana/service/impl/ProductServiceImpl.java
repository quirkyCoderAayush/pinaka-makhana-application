package com.pinaka.makhana.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinaka.makhana.dto.ProductDTO;
import com.pinaka.makhana.entity.Product;
import com.pinaka.makhana.repository.ProductRepository;
import com.pinaka.makhana.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

	private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);

	private final ProductRepository productRepository;

	public ProductServiceImpl(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}

	@Override
	public List<Product> getAllProducts() {
		return productRepository.findAll();
	}

	@Override
	public Product getProductById(Long id) {
		return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
	}

	@Override
	@Transactional
	public Product createProduct(ProductDTO dto) {
		logger.info("🔄 Creating new product: {}", dto.getName());
		logger.debug("📝 Product DTO: {}", dto);

		// Validate required fields
		validateProductDTO(dto);

		// Using default constructor and setters
		Product product = new Product();
		mapDTOToProduct(dto, product);

		// Log image URL length before saving
		if (product.getImageUrl() != null) {
			logger.info("🖼️ Image URL length: {} characters", product.getImageUrl().length());
			logger.debug("🔗 Image URL: {}", product.getImageUrl());
		}

		try {
			Product savedProduct = productRepository.save(product);
			logger.info("✅ Product created successfully with ID: {}", savedProduct.getId());
			return savedProduct;
		} catch (Exception e) {
			logger.error("❌ Failed to create product: {}", e.getMessage(), e);
			if (e.getMessage() != null && e.getMessage().contains("Data too long")) {
				throw new RuntimeException("Image data is too large. Please use a smaller image or reduce quality.");
			}
			throw new RuntimeException("Failed to save product: " + e.getMessage());
		}
	}

	// Helper method to validate ProductDTO
	private void validateProductDTO(ProductDTO dto) {
		if (dto.getName() == null || dto.getName().trim().isEmpty()) {
			throw new RuntimeException("Product name is required");
		}
		if (dto.getPrice() == null || dto.getPrice() <= 0) {
			throw new RuntimeException("Product price must be greater than 0");
		}
		if (dto.getDescription() == null || dto.getDescription().trim().isEmpty()) {
			throw new RuntimeException("Product description is required");
		}
	}

	// Helper method to map DTO to Product entity
	private void mapDTOToProduct(ProductDTO dto, Product product) {
		product.setName(dto.getName().trim());
		product.setFlavor(dto.getFlavor() != null ? dto.getFlavor().trim() : "Original");
		product.setDescription(dto.getDescription().trim());
		product.setShortDescription(dto.getShortDescription() != null ? dto.getShortDescription().trim() :
			(dto.getDescription().length() > 100 ? dto.getDescription().substring(0, 100) + "..." : dto.getDescription()));
		product.setPrice(dto.getPrice());
		product.setOriginalPrice(dto.getOriginalPrice());
		product.setImageUrl(dto.getImageUrl() != null ? dto.getImageUrl().trim() : "");
		product.setRating(dto.getRating() != null ? dto.getRating() : 5.0);
		product.setReviewCount(dto.getReviewCount() != null ? dto.getReviewCount() : 0);
		product.setAvailable(dto.isAvailable());
		product.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 100);
		product.setWeight(dto.getWeight() != null ? dto.getWeight().trim() : "100g");
		product.setSku(dto.getSku() != null ? dto.getSku().trim() : generateSku(dto.getName()));
		product.setCategory(getCategoryFromString(dto.getCategory()));
		product.setPremium(dto.isPremium());
		product.setFeatured(dto.isFeatured());
		product.setNewArrival(dto.isNewArrival());
	}

	// Helper method to generate SKU
	private String generateSku(String productName) {
		String cleanName = productName.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
		return "SKU-" + cleanName.substring(0, Math.min(cleanName.length(), 6)) + "-" + System.currentTimeMillis() % 10000;
	}

	// Helper method to convert string to ProductCategory enum
	private Product.ProductCategory getCategoryFromString(String category) {
		if (category == null || category.trim().isEmpty()) {
			return Product.ProductCategory.ROASTED_MAKHANA; // Default category
		}

		String upperCategory = category.toUpperCase().replace(" ", "_");

		try {
			return Product.ProductCategory.valueOf(upperCategory);
		} catch (IllegalArgumentException e) {
			// If exact match not found, try to find a partial match
			for (Product.ProductCategory cat : Product.ProductCategory.values()) {
				if (cat.name().contains(upperCategory) || upperCategory.contains(cat.name())) {
					return cat;
				}
			}
			return Product.ProductCategory.ROASTED_MAKHANA; // Default fallback
		}
	}

	@Override
	@Transactional
	public Product updateProduct(Long id, ProductDTO dto) {
		// Validate required fields
		validateProductDTO(dto);

		Product product = getProductById(id);

		// Update all fields using the helper method
		mapDTOToProduct(dto, product);

		try {
			Product savedProduct = productRepository.save(product);
			logger.info("✅ Product updated successfully with ID: {}", savedProduct.getId());
			return savedProduct;
		} catch (Exception e) {
			logger.error("❌ Failed to update product: {}", e.getMessage(), e);
			if (e.getMessage() != null && e.getMessage().contains("Data too long")) {
				throw new RuntimeException("Image data is too large. Please use a smaller image or reduce quality.");
			}
			throw new RuntimeException("Failed to update product: " + e.getMessage());
		}
	}

	@Override
	@Transactional
	public void deleteProduct(Long id) {
		productRepository.deleteById(id);
	}
}