package com.pinaka.makhana.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pinaka.makhana.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

}
