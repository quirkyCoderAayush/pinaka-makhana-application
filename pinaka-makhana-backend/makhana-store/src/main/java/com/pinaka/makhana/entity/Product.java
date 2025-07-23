package com.pinaka.makhana.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Product {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String name;
	private String flavor;
	private String description;
	private Double price;
	private String imageUrl;
	private Double rating;
	private boolean available;

	// Default constructor (required by JPA)
	public Product() {
	}

	// All-args constructor
	public Product(Long id, String name, String flavor, String description, Double price, String imageUrl,
			Double rating, boolean available) {
		this.id = id;
		this.name = name;
		this.flavor = flavor;
		this.description = description;
		this.price = price;
		this.imageUrl = imageUrl;
		this.rating = rating;
		this.available = available;
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
		return "Product [id=" + id + ", name=" + name + ", flavor=" + flavor + ", description=" + description
				+ ", price=" + price + ", imageUrl=" + imageUrl + ", rating=" + rating + ", available=" + available
				+ "]";
	}
}