package com.pinaka.makhana.dto;

public class ProductDTO {

	private String name;
	private String flavor;
	private String description;
	private Double price;
	private String imageUrl;
	private Double rating;
	private boolean available;

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

	@Override
	public String toString() {
		return "ProductDTO [name=" + name + ", flavor=" + flavor + ", description=" + description + ", price=" + price
				+ ", imageUrl=" + imageUrl + ", rating=" + rating + ", available=" + available + "]";
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