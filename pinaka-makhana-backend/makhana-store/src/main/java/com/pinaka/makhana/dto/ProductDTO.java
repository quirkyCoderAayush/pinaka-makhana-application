package com.pinaka.makhana.dto;

public class ProductDTO {

	private String name;
	private String flavor;
	private String description;
	private String shortDescription;
	private Double price;
	private Double originalPrice;
	private String imageUrl;
	private Double rating;
	private Integer reviewCount;
	private boolean available;
	private Integer stockQuantity;
	private String weight;
	private String sku;
	private String category; // Will be converted to enum in service
	private boolean isPremium;
	private boolean isFeatured;
	private boolean isNewArrival;

	public ProductDTO() {
	}

	public ProductDTO(String name, String flavor, String description, Double price, String imageUrl, Double rating,
			boolean available) {
		this.name = name;
		this.flavor = flavor;
		this.description = description;
		this.price = price;
		this.imageUrl = imageUrl;
		this.rating = rating;
		this.available = available;
	}

	// Enhanced constructor
	public ProductDTO(String name, String flavor, String description, String shortDescription, Double price,
			Double originalPrice, String imageUrl, Double rating, Integer reviewCount, boolean available,
			Integer stockQuantity, String weight, String sku, String category, boolean isPremium,
			boolean isFeatured, boolean isNewArrival) {
		this.name = name;
		this.flavor = flavor;
		this.description = description;
		this.shortDescription = shortDescription;
		this.price = price;
		this.originalPrice = originalPrice;
		this.imageUrl = imageUrl;
		this.rating = rating;
		this.reviewCount = reviewCount;
		this.available = available;
		this.stockQuantity = stockQuantity;
		this.weight = weight;
		this.sku = sku;
		this.category = category;
		this.isPremium = isPremium;
		this.isFeatured = isFeatured;
		this.isNewArrival = isNewArrival;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getFlavor() {
		return flavor;
	}

	public void setFlavor(String flavor) {
		this.flavor = flavor;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public boolean isAvailable() {
		return available;
	}

	public void setAvailable(boolean available) {
		this.available = available;
	}

	// Getters and setters for new fields
	public String getShortDescription() {
		return shortDescription;
	}

	public void setShortDescription(String shortDescription) {
		this.shortDescription = shortDescription;
	}

	public Double getOriginalPrice() {
		return originalPrice;
	}

	public void setOriginalPrice(Double originalPrice) {
		this.originalPrice = originalPrice;
	}

	public Integer getReviewCount() {
		return reviewCount;
	}

	public void setReviewCount(Integer reviewCount) {
		this.reviewCount = reviewCount;
	}

	public Integer getStockQuantity() {
		return stockQuantity;
	}

	public void setStockQuantity(Integer stockQuantity) {
		this.stockQuantity = stockQuantity;
	}

	public String getWeight() {
		return weight;
	}

	public void setWeight(String weight) {
		this.weight = weight;
	}

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public boolean isPremium() {
		return isPremium;
	}

	public void setPremium(boolean isPremium) {
		this.isPremium = isPremium;
	}

	public boolean isFeatured() {
		return isFeatured;
	}

	public void setFeatured(boolean isFeatured) {
		this.isFeatured = isFeatured;
	}

	public boolean isNewArrival() {
		return isNewArrival;
	}

	public void setNewArrival(boolean isNewArrival) {
		this.isNewArrival = isNewArrival;
	}

	@Override
	public String toString() {
		return "ProductDTO [name=" + name + ", flavor=" + flavor + ", description=" + description + ", price=" + price
				+ ", imageUrl=" + imageUrl + ", rating=" + rating + ", available=" + available + ", stockQuantity=" + stockQuantity + "]";
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null || getClass() != obj.getClass())
			return false;

		ProductDTO that = (ProductDTO) obj;

		if (available != that.available)
			return false;
		if (name != null ? !name.equals(that.name) : that.name != null)
			return false;
		if (flavor != null ? !flavor.equals(that.flavor) : that.flavor != null)
			return false;
		if (description != null ? !description.equals(that.description) : that.description != null)
			return false;
		if (price != null ? !price.equals(that.price) : that.price != null)
			return false;
		if (imageUrl != null ? !imageUrl.equals(that.imageUrl) : that.imageUrl != null)
			return false;
		return rating != null ? rating.equals(that.rating) : that.rating == null;
	}

	@Override
	public int hashCode() {
		int result = name != null ? name.hashCode() : 0;
		result = 31 * result + (flavor != null ? flavor.hashCode() : 0);
		result = 31 * result + (description != null ? description.hashCode() : 0);
		result = 31 * result + (price != null ? price.hashCode() : 0);
		result = 31 * result + (imageUrl != null ? imageUrl.hashCode() : 0);
		result = 31 * result + (rating != null ? rating.hashCode() : 0);
		result = 31 * result + (available ? 1 : 0);
		return result;
	}
}