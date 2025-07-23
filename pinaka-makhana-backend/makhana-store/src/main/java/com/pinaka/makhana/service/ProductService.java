package com.pinaka.makhana.service;

import java.util.List;

import com.pinaka.makhana.dto.ProductDTO;
import com.pinaka.makhana.entity.Product;

public interface ProductService {

	List<Product> getAllProducts();

	Product getProductById(Long id);

	Product createProduct(ProductDTO dto);

	Product updateProduct(Long id, ProductDTO dto);

	void deleteProduct(Long id);
}
