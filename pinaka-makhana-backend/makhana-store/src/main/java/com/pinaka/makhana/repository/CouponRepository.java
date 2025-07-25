package com.pinaka.makhana.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pinaka.makhana.entity.Coupon;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    Optional<Coupon> findByCode(String code);
    
    List<Coupon> findByActiveTrue();
    
    List<Coupon> findByActiveTrueAndFirstTimeUserOnly(boolean firstTimeUserOnly);
}