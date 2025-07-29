package com.pinaka.makhana.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// @Entity
// @Table(name = "cart_items")
public class CartItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id")
	@JsonIgnore
	private User user;

	@ManyToOne(optional = false)
	@JoinColumn(name = "product_id")
	private Product product;

	private int quantity;

	public CartItem() {
	}

	public CartItem(Long id, User user, Product product, int quantity) {
		this.id = id;
		this.user = user;
		this.product = product;
		this.quantity = quantity;
	}
	
	public CartItem(User user, Product product, int quantity) {
	    this.user = user;
	    this.product = product;
	    this.quantity = quantity;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	@Override
	public String toString() {
		return "CartItem [id=" + id + ", user=" + user + ", product=" + product + ", quantity=" + quantity + "]";
	}

}
