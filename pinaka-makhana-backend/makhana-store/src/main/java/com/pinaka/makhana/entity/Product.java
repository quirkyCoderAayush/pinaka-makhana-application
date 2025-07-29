package com.pinaka.makhana.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Lob;
import java.util.List;
import java.time.LocalDateTime;

@Entity
public class Product {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;
	
	private String flavor;
	
	@Column(length = 1000)
	private String description;
	
	@Column(length = 500)
	private String shortDescription;
	
	@Column(nullable = false)
	private Double price;
	
	private Double originalPrice; // For displaying discounts

	@Lob
	@Column(name = "image_url")
	private String imageUrl;
	
	@ElementCollection
	private List<String> additionalImages; // Gallery images
	
	private Double rating;
	private Integer reviewCount;
	
	@Column(nullable = false)
	private boolean available = true;
	
	private Integer stockQuantity;
	private String weight;
	private String sku; // Stock Keeping Unit
	
	@Enumerated(EnumType.STRING)
	private ProductCategory category;
	
	@ElementCollection
	private List<String> tags; // For search and filtering
	
	private boolean isPremium = false;
	private boolean isFeatured = false;
	private boolean isNewArrival = false;
	
	// Nutritional information
	private Double calories; // per 100g
	private Double protein; // per 100g
	private Double carbohydrates; // per 100g
	private Double fat; // per 100g
	private Double fiber; // per 100g
	
	// SEO fields
	@Column(name = "meta_title", length = 500)
	private String metaTitle;
	@Lob
	@Column(name = "meta_description")
	private String metaDescription;
	
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	// Product variants (size, flavor, etc.)
	@ElementCollection
	private List<String> variants;
	
	// Minimum order quantity
	private Integer minOrderQuantity = 1;
	
	// Shipping information
	private Double shippingWeight;
	private String dimensions; // LxWxH in cm

	// Default constructor (required by JPA)
	public Product() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	// All-args constructor
	public Product(Long id, String name, String flavor, String description, String shortDescription,
			Double price, Double originalPrice, String imageUrl, List<String> additionalImages,
			Double rating, Integer reviewCount, boolean available, Integer stockQuantity, String weight,
			String sku, ProductCategory category, List<String> tags, boolean isPremium, boolean isFeatured,
			boolean isNewArrival, Double calories, Double protein, Double carbohydrates, Double fat,
			Double fiber, String metaTitle, String metaDescription, List<String> variants,
			Integer minOrderQuantity, Double shippingWeight, String dimensions) {
		this();
		this.id = id;
		this.name = name;
		this.flavor = flavor;
		this.description = description;
		this.shortDescription = shortDescription;
		this.price = price;
		this.originalPrice = originalPrice;
		this.imageUrl = imageUrl;
		this.additionalImages = additionalImages;
		this.rating = rating;
		this.reviewCount = reviewCount;
		this.available = available;
		this.stockQuantity = stockQuantity;
		this.weight = weight;
		this.sku = sku;
		this.category = category;
		this.tags = tags;
		this.isPremium = isPremium;
		this.isFeatured = isFeatured;
		this.isNewArrival = isNewArrival;
		this.calories = calories;
		this.protein = protein;
		this.carbohydrates = carbohydrates;
		this.fat = fat;
		this.fiber = fiber;
		this.metaTitle = metaTitle;
		this.metaDescription = metaDescription;
		this.variants = variants;
		this.minOrderQuantity = minOrderQuantity;
		this.shippingWeight = shippingWeight;
		this.dimensions = dimensions;
	}

	// Enum for product categories
	public enum ProductCategory {
		ROASTED_MAKHANA("Roasted Makhana"),
		FLAVORED_MAKHANA("Flavored Makhana"),
		VARIETY_PACK("Variety Pack"),
		GIFT_BOX("Gift Box"),
		BULK_PACK("Bulk Pack");

		private final String displayName;

		ProductCategory(String displayName) {
			this.displayName = displayName;
		}

		public String getDisplayName() {
			return displayName;
		}
	}

	// Getters and Setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
		this.updatedAt = LocalDateTime.now();
	}

	public String getFlavor() {
		return flavor;
	}

	public void setFlavor(String flavor) {
		this.flavor = flavor;
		this.updatedAt = LocalDateTime.now();
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
		this.updatedAt = LocalDateTime.now();
	}

	public String getShortDescription() {
		return shortDescription;
	}

	public void setShortDescription(String shortDescription) {
		this.shortDescription = shortDescription;
		this.updatedAt = LocalDateTime.now();
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
		this.updatedAt = LocalDateTime.now();
	}

	public Double getOriginalPrice() {
		return originalPrice;
	}

	public void setOriginalPrice(Double originalPrice) {
		this.originalPrice = originalPrice;
		this.updatedAt = LocalDateTime.now();
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
		this.updatedAt = LocalDateTime.now();
	}

	public List<String> getAdditionalImages() {
		return additionalImages;
	}

	public void setAdditionalImages(List<String> additionalImages) {
		this.additionalImages = additionalImages;
		this.updatedAt = LocalDateTime.now();
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public Integer getReviewCount() {
		return reviewCount;
	}

	public void setReviewCount(Integer reviewCount) {
		this.reviewCount = reviewCount;
	}

	public boolean isAvailable() {
		return available;
	}

	public void setAvailable(boolean available) {
		this.available = available;
		this.updatedAt = LocalDateTime.now();
	}

	public Integer getStockQuantity() {
		return stockQuantity;
	}

	public void setStockQuantity(Integer stockQuantity) {
		this.stockQuantity = stockQuantity;
		this.updatedAt = LocalDateTime.now();
	}

	public String getWeight() {
		return weight;
	}

	public void setWeight(String weight) {
		this.weight = weight;
		this.updatedAt = LocalDateTime.now();
	}

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public ProductCategory getCategory() {
		return category;
	}

	public void setCategory(ProductCategory category) {
		this.category = category;
		this.updatedAt = LocalDateTime.now();
	}

	public List<String> getTags() {
		return tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
		this.updatedAt = LocalDateTime.now();
	}

	public boolean isPremium() {
		return isPremium;
	}

	public void setPremium(boolean isPremium) {
		this.isPremium = isPremium;
		this.updatedAt = LocalDateTime.now();
	}

	public boolean isFeatured() {
		return isFeatured;
	}

	public void setFeatured(boolean isFeatured) {
		this.isFeatured = isFeatured;
		this.updatedAt = LocalDateTime.now();
	}

	public boolean isNewArrival() {
		return isNewArrival;
	}

	public void setNewArrival(boolean isNewArrival) {
		this.isNewArrival = isNewArrival;
		this.updatedAt = LocalDateTime.now();
	}

	public Double getCalories() {
		return calories;
	}

	public void setCalories(Double calories) {
		this.calories = calories;
	}

	public Double getProtein() {
		return protein;
	}

	public void setProtein(Double protein) {
		this.protein = protein;
	}

	public Double getCarbohydrates() {
		return carbohydrates;
	}

	public void setCarbohydrates(Double carbohydrates) {
		this.carbohydrates = carbohydrates;
	}

	public Double getFat() {
		return fat;
	}

	public void setFat(Double fat) {
		this.fat = fat;
	}

	public Double getFiber() {
		return fiber;
	}

	public void setFiber(Double fiber) {
		this.fiber = fiber;
	}

	public String getMetaTitle() {
		return metaTitle;
	}

	public void setMetaTitle(String metaTitle) {
		this.metaTitle = metaTitle;
	}

	public String getMetaDescription() {
		return metaDescription;
	}

	public void setMetaDescription(String metaDescription) {
		this.metaDescription = metaDescription;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public List<String> getVariants() {
		return variants;
	}

	public void setVariants(List<String> variants) {
		this.variants = variants;
		this.updatedAt = LocalDateTime.now();
	}

	public Integer getMinOrderQuantity() {
		return minOrderQuantity;
	}

	public void setMinOrderQuantity(Integer minOrderQuantity) {
		this.minOrderQuantity = minOrderQuantity;
	}

	public Double getShippingWeight() {
		return shippingWeight;
	}

	public void setShippingWeight(Double shippingWeight) {
		this.shippingWeight = shippingWeight;
	}

	public String getDimensions() {
		return dimensions;
	}

	public void setDimensions(String dimensions) {
		this.dimensions = dimensions;
	}

	// Helper methods
	public boolean hasDiscount() {
		return originalPrice != null && originalPrice > price;
	}

	public double getDiscountPercentage() {
		if (!hasDiscount()) return 0.0;
		return Math.round((1 - price / originalPrice) * 100 * 100.0) / 100.0;
	}

	public boolean isInStock() {
		return available && (stockQuantity == null || stockQuantity > 0);
	}

	@Override
	public String toString() {
		return "Product [id=" + id + ", name=" + name + ", flavor=" + flavor + ", price=" + price
				+ ", available=" + available + ", category=" + category + ", isPremium=" + isPremium + "]";
	}
}