package com.pinaka.makhana.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pinaka.makhana.dto.ProductDTO;
import com.pinaka.makhana.entity.Product;
import com.pinaka.makhana.repository.ProductRepository;
import com.pinaka.makhana.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

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
	public Product createProduct(ProductDTO dto) {
		// Using default constructor and setters
		Product product = new Product();
		product.setName(dto.getName());
		product.setFlavor(dto.getFlavor());
		product.setDescription(dto.getDescription());
		product.setPrice(dto.getPrice());
		product.setImageUrl(dto.getImageUrl());
		product.setRating(dto.getRating());
		product.setAvailable(dto.isAvailable());

		return productRepository.save(product);
	}

	@Override
	public Product updateProduct(Long id, ProductDTO dto) {
		Product product = getProductById(id);
		product.setName(dto.getName());
		product.setFlavor(dto.getFlavor());
		product.setDescription(dto.getDescription());
		product.setPrice(dto.getPrice());
		product.setImageUrl(dto.getImageUrl());
		product.setRating(dto.getRating());
		product.setAvailable(dto.isAvailable());
		return productRepository.save(product);
	}

	@Override
	public void deleteProduct(Long id) {
		productRepository.deleteById(id);
	}
}